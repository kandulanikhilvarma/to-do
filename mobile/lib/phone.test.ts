import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizePhone } from "./phone.ts";

test("a bare 10 digit Indian mobile gets +91", () => {
  assert.equal(normalizePhone("98765 43210"), "+919876543210");
});

test("a leading 0 trunk prefix is dropped", () => {
  assert.equal(normalizePhone("09876543210"), "+919876543210");
});

test("91 without plus is treated as the country code", () => {
  assert.equal(normalizePhone("919876543210"), "+919876543210");
});

test("an explicit international number is kept", () => {
  assert.equal(normalizePhone("+49 171 2345678"), "+491712345678");
});

test("too short is rejected", () => {
  assert.equal(normalizePhone("12345"), null);
});
