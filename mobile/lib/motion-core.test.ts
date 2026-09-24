import assert from "node:assert/strict";
import { test } from "node:test";
import { fallDetector, shakeDetector, type Sample } from "./motion-core.ts";

// 20 Hz, as the app samples. g is the magnitude; direction does not matter.
function run(detect: (s: Sample) => boolean, gs: number[]): boolean {
  return gs.some((g, i) => detect({ x: 0, y: 0, z: g, t: i * 50 }));
}

const walking = Array.from({ length: 200 }, (_, i) => 1 + 0.6 * Math.sin(i / 3));

test("walking never counts as a shake or a fall", () => {
  assert.equal(run(shakeDetector(), walking), false);
  assert.equal(run(fallDetector(), walking), false);
});

test("three hard jolts in a second and a half are a shake", () => {
  assert.equal(run(shakeDetector(), [1, 3, 1, 1, 1, 3, 1, 1, 1, 3, 1]), true);
});

test("two jolts are not a shake", () => {
  assert.equal(run(shakeDetector(), [1, 3, 1, 1, 1, 3, 1, 1, 1, 1, 1]), false);
});

test("jolts spread over several seconds are not a shake", () => {
  const slow = [3, ...Array(20).fill(1), 3, ...Array(20).fill(1), 3];
  assert.equal(run(shakeDetector(), slow), false);
});

test("free fall then a hard impact is a fall", () => {
  assert.equal(run(fallDetector(), [1, 1, 0.1, 0.1, 0.1, 0.2, 3.5, 1]), true);
});

test("a hard bump without free fall is not a fall", () => {
  assert.equal(run(fallDetector(), [1, 1, 4, 1, 1]), false);
});

test("a drop onto something soft is not a fall", () => {
  assert.equal(run(fallDetector(), [1, 0.1, 0.1, 0.1, 1.4, 1, 1]), false);
});

test("an impact long after the free fall does not count", () => {
  assert.equal(run(fallDetector(), [0.1, 0.1, 0.1, ...Array(30).fill(1), 4]), false);
});
