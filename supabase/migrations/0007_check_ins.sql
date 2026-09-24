-- Check-in timer (spec S1b, the Kitestring pattern): "if I have not checked
-- in by 10 pm, alert my circle". The deadline lives on the server so the
-- alert still goes out when the phone is dead, lost or taken.
--
-- A missed check-in opens an ordinary SOS event, so the circle hears about it
-- through the same push and SMS fan-out and sees it in the console.

create table check_ins (
  user_id uuid primary key references profiles on delete cascade,
  deadline timestamptz not null,
  created_at timestamptz not null default now()
);

alter table check_ins enable row level security;

create policy check_ins_owner on check_ins
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table sos_events add column from_check_in boolean not null default false;

-- Security invoker on purpose. pg_cron runs it as postgres and fires every
-- overdue check-in; a signed-in caller is held to their own rows by RLS, so
-- the worst they can do is raise their own alert early.
create or replace function fire_missed_check_ins()
returns integer language plpgsql set search_path = public as $$
declare
  fired integer;
begin
  with due as (
    delete from check_ins where deadline <= now() returning user_id
  )
  insert into sos_events (user_id, from_check_in)
  select due.user_id, true
  from due
  -- Someone already in a live SOS does not need a second one.
  where not exists (
    select 1 from sos_events e
    where e.user_id = due.user_id
      and e.state in ('broadcasting', 'acknowledged', 'enroute')
  );
  get diagnostics fired = row_count;
  return fired;
end;
$$;

-- Every minute where pg_cron exists (it does on Supabase). Elsewhere, such as
-- the test database, call fire_missed_check_ins() directly.
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.schedule('todu-missed-check-ins', '* * * * *', 'select public.fire_missed_check_ins()');
  end if;
end;
$$;
