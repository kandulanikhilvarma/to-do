-- 0006: server-side alert fan-out, connection invites, Bluetooth relay.

-- ---------------------------------------------------------------- events --

-- One SOS can arrive several times: from the phone, from its offline queue
-- and from every Bluetooth relay node that heard it. client_id, generated on
-- the phone, makes all of those the same event.
alter table sos_events add column client_id uuid unique;

-- Fan-out claims. The function sets these atomically so that the database
-- trigger and the app, which both request a fan-out, send it once.
alter table sos_events add column fanned_out_at timestamptz;
alter table sos_events add column resolve_notified_at timestamptz;

-- A push token belongs to one device; re-registering must not duplicate it.
alter table devices add constraint devices_push_token_key unique (push_token);

-- ------------------------------------------------------ emergency contacts --

-- People to text who do not use Todu. Mirrors the contact list on the phone.
create table emergency_contacts (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles on delete cascade,
  name text not null,
  phone text not null,
  created_at timestamptz not null default now(),
  unique (owner_id, phone)
);

alter table emergency_contacts enable row level security;

create policy emergency_contacts_owner on emergency_contacts
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ------------------------------------------------------------ delivery log --

-- Written only by the fan-out function (service role). Recipients are stored
-- masked. The owner can read what went out for their own events.
create table notifications (
  id bigserial primary key,
  event_id uuid not null references sos_events on delete cascade,
  kind text not null check (kind in ('opened', 'resolved')),
  channel text not null check (channel in ('push', 'sms')),
  recipient text not null,
  status text not null check (status in ('sent', 'failed', 'skipped')),
  detail text,
  created_at timestamptz not null default now()
);

create index notifications_event_idx on notifications (event_id);

alter table notifications enable row level security;

create policy notifications_owner_reads on notifications
  for select using (
    exists (select 1 from sos_events e where e.id = event_id and e.user_id = auth.uid())
  );

-- ----------------------------------------------------------------- invites --

-- Invites to numbers not yet on Todu. Claimed automatically at sign up.
create table pending_invites (
  owner_id uuid not null references profiles on delete cascade,
  phone text not null,
  relationship text,
  created_at timestamptz not null default now(),
  primary key (owner_id, phone)
);

alter table pending_invites enable row level security;

create policy pending_invites_owner on pending_invites
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Invite by phone number. Always answers 'sent', whether or not the number
-- belongs to a Todu user: anything else would let a stalker test whether
-- their target has a safety app.
create or replace function invite_contact(contact_phone text, contact_relationship text default null)
returns text language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  target uuid;
begin
  if me is null then
    raise exception 'not signed in';
  end if;

  select id into target from profiles where phone = contact_phone;

  if target is null then
    insert into pending_invites (owner_id, phone, relationship)
    values (me, contact_phone, contact_relationship)
    on conflict (owner_id, phone) do update set relationship = excluded.relationship;
  elsif target <> me then
    insert into connections (owner_id, contact_id, relationship)
    values (me, target, contact_relationship)
    on conflict (owner_id, contact_id) do update
      set status = case when connections.status = 'active' then 'active'::connection_status
                        else 'pending'::connection_status end,
          relationship = coalesce(excluded.relationship, connections.relationship);
  end if;

  return 'sent';
end;
$$;

-- Owner withdraws an invite or removes someone from their circle.
create or replace function revoke_contact(contact_phone text)
returns void language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'not signed in';
  end if;
  delete from pending_invites where owner_id = me and phone = contact_phone;
  update connections c set status = 'revoked'
  from profiles p
  where p.id = c.contact_id and p.phone = contact_phone and c.owner_id = me;
end;
$$;

-- The owner view of their circle. Pending connections and invites to people
-- not yet on Todu look identical, for the same reason as above.
create or replace function my_circle()
returns table (phone text, relationship text, status text)
language sql stable security definer set search_path = public as $$
  select p.phone, c.relationship, c.status::text
  from connections c
  join profiles p on p.id = c.contact_id
  where c.owner_id = auth.uid() and c.status <> 'revoked'
  union all
  select i.phone, i.relationship, 'pending'
  from pending_invites i
  where i.owner_id = auth.uid();
$$;

-- Invites waiting for the caller to accept, with the name of who sent them.
-- Accepting or declining is a plain update, allowed by the policy in 0005.
create or replace function my_invites()
returns table (connection_id uuid, owner_name text, relationship text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select c.id, p.display_name, c.relationship, c.created_at
  from connections c
  join profiles p on p.id = c.owner_id
  where c.contact_id = auth.uid() and c.status = 'pending'
  order by c.created_at desc;
$$;

-- People the caller has agreed to respond for.
create or replace function responding_for()
returns table (connection_id uuid, owner_name text, relationship text)
language sql stable security definer set search_path = public as $$
  select c.id, p.display_name, c.relationship
  from connections c
  join profiles p on p.id = c.owner_id
  where c.contact_id = auth.uid() and c.status = 'active'
  order by p.display_name;
$$;

create or replace function claim_pending_invites()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into connections (owner_id, contact_id, relationship)
  select i.owner_id, new.id, i.relationship
  from pending_invites i
  where i.phone = new.phone and i.owner_id <> new.id
  on conflict (owner_id, contact_id) do nothing;

  delete from pending_invites where phone = new.phone;
  return new;
end;
$$;

create trigger profiles_claim_invites
  after insert on profiles
  for each row execute function claim_pending_invites();

-- ----------------------------------------------------------- relay secrets --

-- Per-user key for signing Bluetooth relay payloads, so a relay node cannot
-- forge an SOS in someone else name. No policies: only the owner (through
-- issue_relay_secret) and the service role can read it.
create table relay_secrets (
  user_id uuid primary key references profiles on delete cascade,
  secret text not null,
  created_at timestamptz not null default now()
);

alter table relay_secrets enable row level security;

create or replace function issue_relay_secret()
returns text language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  existing text;
begin
  if me is null then
    raise exception 'not signed in';
  end if;
  select secret into existing from relay_secrets where user_id = me;
  if existing is not null then
    return existing;
  end if;
  -- Two v4 UUIDs: 244 bits from the server CSPRNG, no extension needed.
  existing := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  insert into relay_secrets (user_id, secret) values (me, existing);
  return existing;
end;
$$;

-- ------------------------------------------------------- fan-out trigger --

-- Asks the sos-fanout Edge Function to alert the circle when an event opens
-- and when it is resolved. Uses pg_net with the project URL and service role
-- key stored in Vault as project_url and service_role_key.
--
-- Deliberately a no-op when pg_net or those secrets are missing, so an SOS is
-- never rejected because notification plumbing is unconfigured. The app also
-- invokes the function directly; the claim columns make that send once.
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_net') then
    create extension if not exists pg_net;
  end if;
end;
$$;

create or replace function request_fanout()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base_url text;
  service_key text;
begin
  if to_regclass('vault.decrypted_secrets') is null
     or to_regprocedure('net.http_post(text,jsonb,jsonb,jsonb,integer)') is null then
    return new;
  end if;

  execute 'select decrypted_secret from vault.decrypted_secrets where name = $1'
    into base_url using 'project_url';
  execute 'select decrypted_secret from vault.decrypted_secrets where name = $1'
    into service_key using 'service_role_key';
  if base_url is null or service_key is null then
    return new;
  end if;

  execute 'select net.http_post(url := $1, body := $2, headers := $3)'
    using base_url || '/functions/v1/sos-fanout',
          jsonb_build_object(
            'event_id', new.id,
            'kind', case when tg_op = 'INSERT' then 'opened' else 'resolved' end
          ),
          jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_key
          );
  return new;
end;
$$;

create trigger sos_events_fanout_opened
  after insert on sos_events
  for each row execute function request_fanout();

create trigger sos_events_fanout_resolved
  after update of state on sos_events
  for each row
  when (new.state = 'resolved' and old.state is distinct from 'resolved')
  execute function request_fanout();
