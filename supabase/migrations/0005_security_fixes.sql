-- Fixes from the gap audit. Each block names the hole it closes.

-- 1. A responder could insert an acknowledgement in another user name,
--    because the policy never tied responder_id to the caller.
drop policy if exists acks_insert_connection on acknowledgements;
create policy acks_insert_self on acknowledgements
  for insert with check (
    responder_id = auth.uid()
    and exists (
      select 1 from sos_events e
      where e.id = event_id and is_connected_to(e.user_id)
    )
  );

-- 2. Owners had no way to attach evidence to their own events.
create policy evidence_insert_owner on evidence_media
  for insert with check (
    exists (select 1 from sos_events e where e.id = event_id and e.user_id = auth.uid())
  );

-- 3. nearby_responders() located responders by the pings of their own SOS
--    events (which exist only if they were once in danger) and RLS stopped it
--    reading anyone else anyway. Removed until Stage 3 adds an explicit,
--    opt-in presence table for nearby dispatch.
drop function if exists nearby_responders(geography, integer);

-- 4. Connections need the contact to consent, and the two ends of a
--    connection are immutable. Before this, an owner could insert a row
--    already marked active, and either side could repoint owner_id or
--    contact_id to read a stranger events.
create or replace function enforce_connection_consent()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.status := 'pending';
    return new;
  end if;
  if new.owner_id <> old.owner_id or new.contact_id <> old.contact_id then
    raise exception 'connection endpoints cannot change';
  end if;
  if new.status = 'active' and old.status <> 'active'
     and auth.uid() is distinct from new.contact_id then
    raise exception 'only the invited contact can accept a connection';
  end if;
  return new;
end;
$$;

create trigger connections_consent
  before insert or update on connections
  for each row execute function enforce_connection_consent();

create policy connections_contact_responds on connections
  for update using (contact_id = auth.uid()) with check (contact_id = auth.uid());

-- 5. Live pings travel on private Realtime channels named sos:<event id>.
--    Only the owner may send; only the owner and active connections may read.
create policy sos_broadcast_read on realtime.messages
  for select to authenticated
  using (
    realtime.messages.extension = 'broadcast'
    and realtime.topic() like 'sos:%'
    and exists (
      select 1 from public.sos_events e
      where e.id::text = substr(realtime.topic(), 5)
        and (e.user_id = auth.uid() or public.is_connected_to(e.user_id))
    )
  );

create policy sos_broadcast_send on realtime.messages
  for insert to authenticated
  with check (
    realtime.messages.extension = 'broadcast'
    and realtime.topic() like 'sos:%'
    and exists (
      select 1 from public.sos_events e
      where e.id::text = substr(realtime.topic(), 5) and e.user_id = auth.uid()
    )
  );

-- 6. Responder coordination: who is coming, and when. Responders cannot read
--    each other profiles directly, so this returns only display names, and
--    only for events the caller is entitled to see.
create or replace function event_responders(target uuid)
returns table (name text, status responder_status, eta_minutes smallint, updated_at timestamptz)
language sql stable security definer set search_path = public as $$
  select latest.display_name, latest.status, latest.eta_minutes, latest.created_at
  from (
    select distinct on (a.responder_id)
           p.display_name, a.status, a.eta_minutes, a.created_at
    from acknowledgements a
    left join profiles p on p.id = a.responder_id
    where a.event_id = target
    order by a.responder_id, a.created_at desc
  ) latest
  where exists (
    select 1 from sos_events e
    where e.id = target and (e.user_id = auth.uid() or is_connected_to(e.user_id))
  )
  order by latest.created_at;
$$;
