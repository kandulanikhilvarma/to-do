-- SOS events and their children.

create table sos_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles on delete cascade,
  state sos_state not null default 'broadcasting',
  transport transport not null default 'realtime',
  battery_percent smallint,
  place_label text,
  silent boolean not null default false,
  duress boolean not null default false,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index sos_events_user_open_idx
  on sos_events (user_id, created_at desc)
  where state <> 'resolved';

-- High frequency table. Live streaming rides Realtime Broadcast, NOT
-- postgres_changes: these rows are the durable trail, not the transport.
create table location_pings (
  id bigserial primary key,
  event_id uuid not null references sos_events on delete cascade,
  point geography(Point, 4326) not null,
  accuracy_metres real,
  battery_percent smallint,
  transport transport not null default 'realtime',
  ts timestamptz not null default now()
);

create index location_pings_event_ts_idx on location_pings (event_id, ts desc);
create index location_pings_point_idx on location_pings using gist (point);

create table evidence_media (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references sos_events on delete cascade,
  storage_path text not null,
  kind text not null,
  captured_at timestamptz not null default now()
);

create table acknowledgements (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references sos_events on delete cascade,
  responder_id uuid references profiles on delete set null,
  status responder_status not null default 'acknowledged',
  eta_minutes smallint,
  created_at timestamptz not null default now()
);

create index acknowledgements_event_idx on acknowledgements (event_id);

-- Nearest active responders to a point (ERSS SHOUT pattern, spec S1c).
create or replace function nearby_responders(
  origin geography, radius_metres integer default 2000
)
returns table (user_id uuid, distance_metres double precision)
language sql stable as $$
  select p.id,
         st_distance(lp.point, origin) as distance_metres
  from profiles p
  join lateral (
    select point from location_pings lp2
    join sos_events e on e.id = lp2.event_id and e.user_id = p.id
    order by lp2.ts desc limit 1
  ) lp on true
  where st_dwithin(lp.point, origin, radius_metres)
  order by distance_metres
  limit 50;
$$;
