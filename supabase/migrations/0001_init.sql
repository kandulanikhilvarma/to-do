-- Todu core schema (spec S8 data model).
-- Location uses PostGIS geography so distance maths is metres, not degrees.

create extension if not exists postgis;
create extension if not exists "uuid-ossp";

create type sos_state as enum (
  'armed', 'triggered', 'countdown', 'false_alarm',
  'broadcasting', 'acknowledged', 'enroute', 'resolved'
);

create type transport as enum ('realtime', 'sms', 'ble', 'voice', 'dial112');

create type connection_status as enum ('pending', 'active', 'revoked');

create type responder_status as enum ('notified', 'acknowledged', 'enroute', 'arrived');

-- Mirrors auth.users; holds only what the SOS path needs.
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  phone text unique not null,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table connections (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles on delete cascade,
  contact_id uuid not null references profiles on delete cascade,
  relationship text,
  status connection_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (owner_id, contact_id),
  check (owner_id <> contact_id)
);

create index connections_contact_active_idx
  on connections (contact_id) where status = 'active';

create table medical_profiles (
  user_id uuid primary key references profiles on delete cascade,
  blood_group text,
  allergies text,
  medications text,
  updated_at timestamptz not null default now()
);

create table devices (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles on delete cascade,
  platform text not null,
  model text,
  push_token text,
  last_seen_at timestamptz
);

create table waitlist (
  email text primary key,
  created_at timestamptz not null default now()
);
