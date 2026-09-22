import assert from "node:assert/strict";
import { test } from "node:test";
import { validatePins } from "./pin-rules.ts";

test("no PINs at all is valid", () => {
  assert.equal(validatePins("", ""), null);
});

test("a cancel PIN alone is valid", () => {
  assert.equal(validatePins("2580", ""), null);
});

test("PINs must be 4 to 6 digits", () => {
  assert.equal(validatePins("12", ""), "format");
  assert.equal(validatePins("1234567", ""), "format");
  assert.equal(validatePins("12a4", ""), "format");
  assert.equal(validatePins("2580", "99"), "format");
});

test("a duress PIN needs a cancel PIN", () => {
  assert.equal(validatePins("", "9999"), "duressNeedsCancel");
});

test("duress and cancel PINs must differ", () => {
  assert.equal(validatePins("2580", "2580"), "same");
});

test("distinct valid PINs pass", () => {
  assert.equal(validatePins("2580", "0852"), null);
});
