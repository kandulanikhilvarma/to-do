-- Row level security. An SOS event is readable by its owner and by the
-- owner's ACTIVE connections. Nothing else is visible to anyone.

alter table profiles          enable row level security;
alter table connections       enable row level security;
alter table medical_profiles  enable row level security;
alter table devices           enable row level security;
alter table sos_events        enable row level security;
alter table location_pings    enable row level security;
alter table evidence_media    enable row level security;
alter table acknowledgements  enable row level security;
alter table waitlist          enable row level security;

-- True when the caller is an active connection of `owner`.
create or replace function is_connected_to(owner uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from connections c
    where c.owner_id = owner
      and c.contact_id = auth.uid()
      and c.status = 'active'
  );
$$;

create policy profiles_self on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy profiles_readable_by_connections on profiles
  for select using (is_connected_to(id));

create policy connections_owner on connections
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy connections_contact_reads on connections
  for select using (contact_id = auth.uid());

create policy medical_self on medical_profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy medical_visible_to_connections on medical_profiles
  for select using (is_connected_to(user_id));

create policy devices_self on devices
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy events_owner on sos_events
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy events_visible_to_connections on sos_events
  for select using (is_connected_to(user_id));

create policy pings_via_event on location_pings
  for select using (
    exists (select 1 from sos_events e where e.id = event_id
            and (e.user_id = auth.uid() or is_connected_to(e.user_id)))
  );

create policy pings_insert_owner on location_pings
  for insert with check (
    exists (select 1 from sos_events e where e.id = event_id and e.user_id = auth.uid())
  );

create policy evidence_via_event on evidence_media
  for select using (
    exists (select 1 from sos_events e where e.id = event_id
            and (e.user_id = auth.uid() or is_connected_to(e.user_id)))
  );

create policy acks_via_event on acknowledgements
  for select using (
    exists (select 1 from sos_events e where e.id = event_id
            and (e.user_id = auth.uid() or is_connected_to(e.user_id)))
  );

create policy acks_insert_connection on acknowledgements
  for insert with check (
    exists (select 1 from sos_events e where e.id = event_id and is_connected_to(e.user_id))
  );

-- Waitlist is written only by the service role from the web API route.
create policy waitlist_no_public_access on waitlist for select using (false);
