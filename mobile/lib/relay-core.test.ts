import assert from "node:assert/strict";
import { test } from "node:test";
import { canonical, decodeRelay, encodeRelay, signRelay } from "./relay-core.ts";

const SECRET = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
// Same vector as supabase/tests/relay.test.ts, which the server verifies.
const VECTOR_SIG = "6d2788c45bbbd001246e952631d9b63d9cab7703d54319efc595015d087502e8";

const fields = {
  uid: "00000000-0000-0000-0000-00000000000a",
  cid: "11111111-1111-4111-8111-111111111111",
  lat: 17.4401,
  lng: 78.3489,
  acc: 12,
  bat: 38,
  ts: 1790000000000,
};

test("the phone signs exactly what the server verifies", () => {
  const signed = signRelay(fields, SECRET);
  assert.equal(
    canonical(signed),
    "todu-relay-v1|00000000-0000-0000-0000-00000000000a|11111111-1111-4111-8111-111111111111|17.440100|78.348900|12|38|1790000000000",
  );
  assert.equal(signed.sig, VECTOR_SIG);
});

test("encode then decode round-trips", () => {
  const signed = signRelay(fields, SECRET);
  assert.deepEqual(decodeRelay(encodeRelay(signed)), signed);
});

test("foreign or malformed mesh messages are ignored", () => {
  assert.equal(decodeRelay("hello"), null);
  assert.equal(decodeRelay("todu1:{not json"), null);
  assert.equal(decodeRelay(`todu1:${JSON.stringify({ ...fields, v: 1, sig: "x" })}`), null);
});
