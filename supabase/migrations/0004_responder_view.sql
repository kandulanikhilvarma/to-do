-- Flattened read model backing the web responder console.
-- Inherits RLS from the underlying tables via security_invoker, so a viewer
-- only ever sees events belonging to their active connections.

create or replace view responder_events
with (security_invoker = true) as
select
  e.id,
  p.display_name                                        as person_name,
  e.state,
  floor(extract(epoch from (now() - e.created_at)) / 60)::int  as opened_minutes_ago,
  coalesce(
    floor(extract(epoch from (now() - lp.ts)) / 60)::int, 0
  )                                                     as last_ping_minutes_ago,
  coalesce(lp.battery_percent, e.battery_percent, 0)::int as battery_percent,
  coalesce(lp.accuracy_metres, 0)::int                  as accuracy_metres,
  coalesce(st_y(lp.point::geometry), 0)                 as lat,
  coalesce(st_x(lp.point::geometry), 0)                 as lng,
  e.place_label,
  e.transport,
  m.blood_group,
  m.allergies,
  m.medications
from sos_events e
join profiles p on p.id = e.user_id
left join medical_profiles m on m.user_id = e.user_id
left join lateral (
  select point, accuracy_metres, battery_percent, ts
  from location_pings
  where event_id = e.id
  order by ts desc
  limit 1
) lp on true
where e.state <> 'false_alarm';
