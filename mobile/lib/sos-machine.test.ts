import assert from "node:assert/strict";
import { test } from "node:test";
import { initialContext, reduce, type SosConfig, type SosContext, type SosEvent } from "./sos-machine.ts";

const config: SosConfig = {
  countdownSeconds: 3,
  cancelPin: "1234",
  duressPin: "9999",
};

function run(events: SosEvent[], from: SosContext = initialContext) {
  return events.reduce(
    (acc, e) => {
      const next = reduce(acc.context, e, config);
      return { context: next.context, effects: [...acc.effects, ...next.effects] };
    },
    { context: from, effects: [] as string[] },
  );
}

test("countdown elapsing broadcasts and runs the ladder", () => {
  const out = run([{ type: "TRIGGER" }, { type: "TICK" }, { type: "TICK" }, { type: "TICK" }]);
  assert.equal(out.context.state, "broadcasting");
  assert.ok(out.effects.includes("run_ladder"));
  assert.equal(out.context.covert, false);
});

test("correct PIN cancels before the countdown elapses", () => {
  const out = run([{ type: "TRIGGER" }, { type: "TICK" }, { type: "CANCEL", pin: "1234" }]);
  assert.equal(out.context.state, "false_alarm");
  assert.ok(!out.effects.includes("run_ladder"));
});

test("duress PIN fakes a cancel but escalates covertly", () => {
  const out = run([{ type: "TRIGGER" }, { type: "CANCEL", pin: "9999" }]);
  assert.equal(out.context.state, "broadcasting");
  assert.equal(out.context.covert, true);
  assert.ok(out.effects.includes("run_ladder"));
});

test("a wrong PIN never stands the alert down", () => {
  const out = run([{ type: "TRIGGER" }, { type: "CANCEL", pin: "0000" }]);
  assert.equal(out.context.state, "countdown");
});

test("resolving stops the ladder and can rearm", () => {
  const broadcasting = run([{ type: "TRIGGER" }, { type: "TICK" }, { type: "TICK" }, { type: "TICK" }]);
  const out = run([{ type: "SAFE" }, { type: "REARM" }], broadcasting.context);
  assert.equal(out.context.state, "armed");
  assert.ok(out.effects.includes("stop_ladder"));
});

test("an empty PIN with no duress PIN set keeps counting, never covert", () => {
  // Found on the emulator: "" === "" made an empty Confirm a hidden alert
  // behind a "Cancelled" screen.
  const noDuress = { ...config, duressPin: "" };
  const armed = reduce(initialContext, { type: "TRIGGER" }, noDuress).context;
  const out = reduce(armed, { type: "CANCEL", pin: "" }, noDuress);
  assert.equal(out.context.state, "countdown");
  assert.equal(out.context.covert, false);
  assert.ok(!out.effects.includes("run_ladder"));
});

test("with a cancel PIN set, cancelling without it keeps counting", () => {
  const out = run([{ type: "TRIGGER" }, { type: "CANCEL" }]);
  assert.equal(out.context.state, "countdown");
  assert.ok(!out.effects.includes("cancel_countdown"));
});

test("with no cancel PIN set, a plain cancel stands down", () => {
  const open = { ...config, cancelPin: "" };
  const armed = reduce(initialContext, { type: "TRIGGER" }, open).context;
  const out = reduce(armed, { type: "CANCEL" }, open);
  assert.equal(out.context.state, "false_alarm");
});

test("countdown elapsing after a failed PIN still broadcasts", () => {
  const out = run([
    { type: "TRIGGER" },
    { type: "CANCEL", pin: "0000" },
    { type: "TICK" },
    { type: "TICK" },
    { type: "TICK" },
  ]);
  assert.equal(out.context.state, "broadcasting");
});
