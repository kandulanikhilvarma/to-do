// Applies every migration to a real Postgres (PGlite, with PostGIS) and checks
// the row level security from the point of view of three users:
//   A  owns an SOS event
//   B  is invited by A as a responder
//   C  is a stranger
// Supabase supplies auth.uid(), realtime.topic() and the API roles around a
// project; the prelude below stands those in with the same semantics.

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { before, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { uuid_ossp } from "@electric-sql/pglite/contrib/uuid_ossp";
import { postgis } from "@electric-sql/pglite-postgis";

const A = "00000000-0000-0000-0000-00000000000a";
const B = "00000000-0000-0000-0000-00000000000b";
const C = "00000000-0000-0000-0000-00000000000c";

const PRELUDE = `
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  create schema realtime;
  create table realtime.messages (
    id bigserial primary key,
    topic text not null,
    extension text not null,
    payload jsonb
  );
  alter table realtime.messages enable row level security;
  create function realtime.topic() returns text language sql stable as $$
    select current_setting('realtime.topic', true)
  $$;
`;

// Mirrors the default privileges Supabase grants to its API roles.
const GRANTS = `
  grant usage on schema public, auth, realtime to anon, authenticated;
  grant select, insert, update, delete on all tables in schema public to anon, authenticated;
  grant usage, select on all sequences in schema public to authenticated;
  grant execute on all functions in schema public, auth, realtime to anon, authenticated;
  grant select, insert on realtime.messages to authenticated;
  grant usage, select on all sequences in schema realtime to authenticated;
`;

let db;
let eventId;

/** Run one statement as a signed-in user, inside its own transaction. */
function as(uid, sql, params = [], topic = "") {
  return db.transaction(async (tx) => {
    await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [uid]);
    await tx.query("select set_config('realtime.topic', $1, true)", [topic]);
    await tx.exec("set local role authenticated");
    return tx.query(sql, params);
  });
}

before(async () => {
  db = await PGlite.create({ extensions: { postgis, uuid_ossp } });
  await db.exec(PRELUDE);

  const dir = new URL("../migrations/", import.meta.url);
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(new URL(file, dir), "utf8"));
  }
  await db.exec(GRANTS);

  await db.query("insert into auth.users values ($1), ($2), ($3)", [A, B, C]);
  await db.query(
    `insert into profiles (id, phone, display_name) values
       ($1, '+910000000001', 'Asha'),
       ($2, '+910000000002', 'Bala'),
       ($3, '+910000000003', 'Chitra')`,
    [A, B, C],
  );
  await db.query(
    "insert into medical_profiles (user_id, blood_group) values ($1, 'O positive')",
    [A],
  );

  const created = await as(
    A,
    `insert into sos_events (user_id, battery_percent) values ($1, 40) returning id`,
    [A],
  );
  eventId = created.rows[0].id;
  await as(
    A,
    `insert into location_pings (event_id, point, accuracy_metres)
     values ($1, 'SRID=4326;POINT(78.3489 17.4401)', 12)`,
    [eventId],
  );
});

test("an owner cannot enrol a contact as already active", async () => {
  await as(
    A,
    "insert into connections (owner_id, contact_id, status) values ($1, $2, 'active')",
    [A, B],
  );
  const row = await db.query("select status from connections where owner_id = $1", [A]);
  assert.equal(row.rows[0].status, "pending");
});

test("a pending contact sees nothing of the owner event", async () => {
  const seen = await as(B, "select id from sos_events");
  assert.equal(seen.rows.length, 0);
});

test("the owner cannot accept on the contact behalf", async () => {
  await assert.rejects(
    as(A, "update connections set status = 'active' where owner_id = $1", [A]),
    /only the invited contact/,
  );
});

test("the contact can accept, and then sees the event", async () => {
  await as(B, "update connections set status = 'active' where contact_id = $1", [B]);
  const seen = await as(B, "select id from sos_events");
  assert.deepEqual(
    seen.rows.map((r) => r.id),
    [eventId],
  );
});

test("a contact cannot repoint a connection at someone else", async () => {
  await assert.rejects(
    as(B, "update connections set owner_id = $1 where contact_id = $2", [C, B]),
    /endpoints cannot change/,
  );
});

test("a stranger sees no events, pings, medical data or profiles", async () => {
  for (const table of ["sos_events", "location_pings", "medical_profiles"]) {
    const seen = await as(C, `select 1 from ${table}`);
    assert.equal(seen.rows.length, 0, table);
  }
  const profiles = await as(C, "select id from profiles");
  assert.deepEqual(
    profiles.rows.map((r) => r.id),
    [C],
  );
});

test("the responder view gives the contact location and medical data", async () => {
  const view = await as(B, "select * from responder_events");
  assert.equal(view.rows.length, 1);
  const row = view.rows[0];
  assert.equal(row.person_name, "Asha");
  assert.equal(row.blood_group, "O positive");
  assert.ok(Math.abs(row.lat - 17.4401) < 1e-6 && Math.abs(row.lng - 78.3489) < 1e-6);

  const stranger = await as(C, "select * from responder_events");
  assert.equal(stranger.rows.length, 0);
});

test("a responder cannot acknowledge in another user name", async () => {
  await assert.rejects(
    as(
      B,
      "insert into acknowledgements (event_id, responder_id, status) values ($1, $2, 'enroute')",
      [eventId, C],
    ),
    /row-level security/,
  );
});

test("a responder can acknowledge as themselves; a stranger cannot", async () => {
  await as(
    B,
    `insert into acknowledgements (event_id, responder_id, status, eta_minutes)
     values ($1, $2, 'enroute', 7)`,
    [eventId, B],
  );
  await assert.rejects(
    as(
      C,
      "insert into acknowledgements (event_id, responder_id, status) values ($1, $2, 'enroute')",
      [eventId, C],
    ),
    /row-level security/,
  );
});

test("event_responders names who is coming, only to entitled viewers", async () => {
  const owner = await as(A, "select * from event_responders($1)", [eventId]);
  assert.deepEqual(
    owner.rows.map((r) => [r.name, r.status, r.eta_minutes]),
    [["Bala", "enroute", 7]],
  );
  const stranger = await as(C, "select * from event_responders($1)", [eventId]);
  assert.equal(stranger.rows.length, 0);
});

test("only the owner can add pings or evidence", async () => {
  await assert.rejects(
    as(
      B,
      "insert into location_pings (event_id, point) values ($1, 'SRID=4326;POINT(78 17)')",
      [eventId],
    ),
    /row-level security/,
  );
  await assert.rejects(
    as(
      B,
      "insert into evidence_media (event_id, storage_path, kind) values ($1, 'x', 'photo')",
      [eventId],
    ),
    /row-level security/,
  );
  await as(
    A,
    "insert into evidence_media (event_id, storage_path, kind) values ($1, 'a.jpg', 'photo')",
    [eventId],
  );
});

test("a responder cannot mark the owner safe", async () => {
  const updated = await as(
    B,
    "update sos_events set state = 'resolved' where id = $1 returning id",
    [eventId],
  );
  assert.equal(updated.rows.length, 0);
});

test("private realtime channel: owner sends, contact reads, stranger does not", async () => {
  const topic = `sos:${eventId}`;
  await as(
    A,
    "insert into realtime.messages (topic, extension, payload) values ($1, 'broadcast', '{}')",
    [topic],
    topic,
  );
  await assert.rejects(
    as(
      B,
      "insert into realtime.messages (topic, extension, payload) values ($1, 'broadcast', '{}')",
      [topic],
      topic,
    ),
    /row-level security/,
  );
  const contact = await as(B, "select id from realtime.messages", [], topic);
  assert.equal(contact.rows.length, 1);
  const stranger = await as(C, "select id from realtime.messages", [], topic);
  assert.equal(stranger.rows.length, 0);
});

test("the waitlist is not readable through the API", async () => {
  await db.query("insert into waitlist (email) values ('someone@example.com')");
  const seen = await as(C, "select email from waitlist");
  assert.equal(seen.rows.length, 0);
});

test("the nearby_responders function is gone", async () => {
  const found = await db.query("select 1 from pg_proc where proname = 'nearby_responders'");
  assert.equal(found.rows.length, 0);
});
