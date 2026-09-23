import assert from "node:assert/strict";
import { test } from "node:test";
import {
  canonical,
  hmacHex,
  isFresh,
  parseRelayPayload,
  verifyRelay,
  type RelayPayload,
} from "../functions/_shared/relay.ts";

const SECRET = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
// Same vector as mobile/lib/relay-core.test.ts; computed with node:crypto.
const VECTOR_SIG = "6d2788c45bbbd001246e952631d9b63d9cab7703d54319efc595015d087502e8";

const base: Omit<RelayPayload, "sig"> = {
  v: 1,
  uid: "00000000-0000-0000-0000-00000000000a",
  cid: "11111111-1111-4111-8111-111111111111",
  lat: 17.4401,
  lng: 78.3489,
  acc: 12,
  bat: 38,
  ts: 1790000000000,
};

test("canonical form and signature match the shared vector", async () => {
  assert.equal(
    canonical(base),
    "todu-relay-v1|00000000-0000-0000-0000-00000000000a|11111111-1111-4111-8111-111111111111|17.440100|78.348900|12|38|1790000000000",
  );
  assert.equal(await hmacHex(SECRET, canonical(base)), VECTOR_SIG);
});

test("a correctly signed payload verifies", async () => {
  assert.equal(await verifyRelay({ ...base, sig: VECTOR_SIG }, SECRET), true);
});

test("tampering with any field breaks the signature", async () => {
  const changes = [{ lat: 17.44 }, { uid: "00000000-0000-0000-0000-00000000000b" }, { ts: 1 }];
  for (const change of changes) {
    assert.equal(await verifyRelay({ ...base, ...change, sig: VECTOR_SIG }, SECRET), false);
  }
});

test("the wrong secret fails", async () => {
  assert.equal(await verifyRelay({ ...base, sig: VECTOR_SIG }, "x".repeat(64)), false);
});

test("malformed payloads are rejected before any crypto", () => {
  assert.ok(parseRelayPayload({ ...base, sig: VECTOR_SIG }));
  assert.equal(parseRelayPayload({ ...base, sig: "nope" }), null);
  assert.equal(parseRelayPayload({ ...base, lat: 200, sig: VECTOR_SIG }), null);
  assert.equal(parseRelayPayload({ ...base, uid: "not-a-uuid", sig: VECTOR_SIG }), null);
  assert.equal(parseRelayPayload(null), null);
});

test("stale or future payloads are not fresh", () => {
  const p = { ...base, sig: VECTOR_SIG };
  assert.equal(isFresh(p, base.ts + 60_000), true);
  assert.equal(isFresh(p, base.ts + 25 * 3600_000), false);
  assert.equal(isFresh(p, base.ts - 10 * 60_000), false);
});
