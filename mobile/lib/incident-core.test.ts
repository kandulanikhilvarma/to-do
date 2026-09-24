import assert from "node:assert/strict";
import { test } from "node:test";
import { clock, formatIncident } from "./incident-core.ts";

const at = (h: number, m: number, s: number) => new Date(2026, 8, 24, h, m, s).getTime();

test("times are local HH:MM:SS", () => {
  assert.equal(clock(at(2, 3, 41)), "02:03:41");
  assert.equal(clock(at(23, 59, 5)), "23:59:05");
});

test("the timeline is in time order under its title", () => {
  const text = formatIncident("Todu incident", [
    { t: at(2, 3, 49), text: "SOS sent" },
    { t: at(2, 3, 41), text: "SOS started" },
  ]);
  assert.equal(text, "Todu incident\n\n02:03:41  SOS started\n02:03:49  SOS sent");
});
