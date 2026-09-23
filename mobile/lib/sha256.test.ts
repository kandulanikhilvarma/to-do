import assert from "node:assert/strict";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { test } from "node:test";
import { hmacHex, hmacSha256, sha256, toHex } from "./sha256.ts";

test("sha256 matches node:crypto across block boundaries", () => {
  for (const len of [0, 1, 55, 56, 63, 64, 65, 119, 120, 1000]) {
    const data = randomBytes(len);
    assert.equal(toHex(sha256(data)), createHash("sha256").update(data).digest("hex"), `len ${len}`);
  }
});

test("hmac matches node:crypto, including keys longer than a block", () => {
  for (const keyLen of [0, 16, 64, 65, 200]) {
    const key = randomBytes(keyLen);
    const msg = randomBytes(77);
    assert.equal(toHex(hmacSha256(key, msg)), createHmac("sha256", key).update(msg).digest("hex"));
  }
});

test("hmacHex handles text the way the server does", () => {
  const secret = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  const msg = "todu-relay-v1|Asha|తెలుగు|हिंदी";
  assert.equal(hmacHex(secret, msg), createHmac("sha256", secret).update(msg).digest("hex"));
});
