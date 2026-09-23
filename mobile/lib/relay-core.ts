// Bluetooth relay payload: build, sign, encode and decode. Pure, so it runs
// under node tests. The canonical string must match
// supabase/functions/_shared/relay.ts exactly; both suites assert one vector.

import { hmacHex } from "./sha256.ts";

export type RelayPayload = {
  v: 1;
  uid: string;
  cid: string;
  /** Null when the phone has no fix: the alert still matters. */
  lat: number | null;
  lng: number | null;
  acc: number | null;
  bat: number | null;
  ts: number;
  sig: string;
};

export type RelayFields = Omit<RelayPayload, "v" | "sig">;

const PREFIX = "todu1:";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

export function signRelay(fields: RelayFields, secret: string): RelayPayload {
  const unsigned = { v: 1 as const, ...fields };
  return { ...unsigned, sig: hmacHex(secret, canonical(unsigned)) };
}

export function encodeRelay(p: RelayPayload): string {
  return PREFIX + JSON.stringify(p);
}

const isNum = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);

/** Shape check only; the server verifies the signature. Anything that is
 *  not a Todu relay message decodes to null and is ignored. */
export function decodeRelay(message: string): RelayPayload | null {
  if (!message.startsWith(PREFIX)) return null;
  let p: Record<string, unknown>;
  try {
    p = JSON.parse(message.slice(PREFIX.length)) as Record<string, unknown>;
  } catch {
    return null;
  }
  const ok =
    p.v === 1 &&
    typeof p.uid === "string" &&
    UUID.test(p.uid) &&
    typeof p.cid === "string" &&
    UUID.test(p.cid) &&
    (p.lat === null || isNum(p.lat)) &&
    (p.lng === null || isNum(p.lng)) &&
    (p.acc === null || isNum(p.acc)) &&
    (p.bat === null || isNum(p.bat)) &&
    isNum(p.ts) &&
    typeof p.sig === "string" &&
    /^[0-9a-f]{64}$/.test(p.sig);
  return ok ? (p as unknown as RelayPayload) : null;
}
