// Bluetooth relay payloads. A phone in trouble broadcasts one over the mesh;
// any Todu phone that hears it and has a connection posts it to sos-relay.
//
// The payload is signed with the origin user relay secret (HMAC-SHA256), so
// a relay node can carry an alert but cannot forge one in another user name.
// The canonical string below must match mobile/lib/relay-core.ts exactly;
// both test suites check the same vector.

export type RelayPayload = {
  v: 1;
  /** Origin user id. */
  uid: string;
  /** Client id of the SOS, shared with the phone own submission. */
  cid: string;
  /** Null when the phone has no fix: the alert still matters. */
  lat: number | null;
  lng: number | null;
  acc: number | null;
  bat: number | null;
  /** Milliseconds since epoch when the phone raised the SOS. */
  ts: number;
  sig: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const MAX_SKEW_MS = 5 * 60 * 1000;

export function canonical(p: Omit<RelayPayload, "sig">): string {
  return [
    "todu-relay-v1",
    p.uid.toLowerCase(),
    p.cid.toLowerCase(),
    p.lat === null ? "" : p.lat.toFixed(6),
    p.lng === null ? "" : p.lng.toFixed(6),
    p.acc === null ? "" : String(Math.round(p.acc)),
    p.bat === null ? "" : String(Math.round(p.bat)),
    String(p.ts),
  ].join("|");
}

function isNum(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

/** Shape and range checks only. Signature and freshness are separate. */
export function parseRelayPayload(input: unknown): RelayPayload | null {
  if (typeof input !== "object" || input === null) return null;
  const p = input as Record<string, unknown>;
  if (p.v !== 1) return null;
  if (typeof p.uid !== "string" || !UUID.test(p.uid)) return null;
  if (typeof p.cid !== "string" || !UUID.test(p.cid)) return null;
  if (!(p.lat === null || (isNum(p.lat) && p.lat >= -90 && p.lat <= 90))) return null;
  if (!(p.lng === null || (isNum(p.lng) && p.lng >= -180 && p.lng <= 180))) return null;
  if ((p.lat === null) !== (p.lng === null)) return null;
  if (!(p.acc === null || (isNum(p.acc) && p.acc >= 0))) return null;
  if (!(p.bat === null || (isNum(p.bat) && p.bat >= 0 && p.bat <= 100))) return null;
  if (!isNum(p.ts)) return null;
  if (typeof p.sig !== "string" || !/^[0-9a-f]{64}$/.test(p.sig)) return null;
  return p as unknown as RelayPayload;
}

export function isFresh(p: RelayPayload, now: number): boolean {
  return p.ts <= now + MAX_SKEW_MS && now - p.ts <= MAX_AGE_MS;
}

export async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(message)));
  return [...mac].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyRelay(p: RelayPayload, secret: string): Promise<boolean> {
  const { sig, ...rest } = p;
  return constantTimeEqual(await hmacHex(secret, canonical(rest)), sig);
}
