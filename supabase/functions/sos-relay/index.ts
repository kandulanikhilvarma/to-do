// sos-relay: accepts an SOS that reached the internet through another phone.
//
// A phone with no signal broadcasts a signed payload over the Bluetooth mesh.
// Any Todu phone that hears it and has a connection posts it here. The relay
// node must be signed in; the payload must carry a valid HMAC from the origin
// user, so a relay node can carry an alert but never forge one.
//
// Idempotent: client_id makes every relayed copy, and the origin phone own
// later upload, the same event. A resolved event is never reopened.

import { createClient } from "npm:@supabase/supabase-js@2";
import { isFresh, parseRelayPayload, verifyRelay } from "../_shared/relay.ts";

const env = (key: string): string => Deno.env.get(key) ?? "";
const SUPABASE_URL = env("SUPABASE_URL");
const SERVICE_KEY = env("SUPABASE_SERVICE_ROLE_KEY");

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: "invalid JSON" }, 400);
  }
  const payload = parseRelayPayload(raw);
  if (!payload) return json({ error: "malformed payload" }, 400);
  if (!isFresh(payload, Date.now())) return json({ error: "payload too old" }, 422);

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: relayUser } = await admin.auth.getUser(token);
  if (!relayUser.user) return json({ error: "relay node must be signed in" }, 401);

  const { data: secretRow } = await admin
    .from("relay_secrets")
    .select("secret")
    .eq("user_id", payload.uid)
    .maybeSingle<{ secret: string }>();
  if (!secretRow || !(await verifyRelay(payload, secretRow.secret))) {
    return json({ error: "signature rejected" }, 403);
  }

  const raisedAt = new Date(payload.ts).toISOString();
  const { error: upsertError } = await admin.from("sos_events").upsert(
    {
      user_id: payload.uid,
      client_id: payload.cid,
      state: "broadcasting",
      transport: "ble",
      battery_percent: payload.bat,
      created_at: raisedAt,
    },
    { onConflict: "client_id", ignoreDuplicates: true },
  );
  if (upsertError) return json({ error: upsertError.message }, 500);

  const { data: event } = await admin
    .from("sos_events")
    .select("id, state, user_id")
    .eq("client_id", payload.cid)
    .maybeSingle<{ id: string; state: string; user_id: string }>();
  // A client_id that belongs to another user cannot be attached to this one.
  if (!event || event.user_id !== payload.uid) return json({ error: "event mismatch" }, 409);
  if (event.state === "resolved") return json({ ok: true, event_id: event.id, resolved: true });

  const { count } = await admin
    .from("location_pings")
    .select("id", { count: "exact", head: true })
    .eq("event_id", event.id)
    .eq("ts", raisedAt);
  if ((count ?? 0) === 0 && payload.lat !== null && payload.lng !== null) {
    await admin.from("location_pings").insert({
      event_id: event.id,
      point: `SRID=4326;POINT(${payload.lng} ${payload.lat})`,
      accuracy_metres: payload.acc,
      battery_percent: payload.bat,
      transport: "ble",
      ts: raisedAt,
    });
  }

  // The database trigger also requests this; sos-fanout sends once either way.
  await fetch(`${SUPABASE_URL}/functions/v1/sos-fanout`, {
    method: "POST",
    headers: { authorization: `Bearer ${SERVICE_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ event_id: event.id, kind: "opened" }),
  }).catch(() => undefined);

  return json({ ok: true, event_id: event.id });
});
