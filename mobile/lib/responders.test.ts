import assert from "node:assert/strict";
import { test } from "node:test";
import { responderEvents, type Responder } from "./responders.ts";
import { initialContext, reduce, type SosConfig, type SosContext } from "./sos-machine.ts";

const config: SosConfig = { countdownSeconds: 1, cancelPin: "", duressPin: "" };
const r = (status: Responder["status"]): Responder => ({ name: "Asha", status, etaMinutes: null });

function live(): SosContext {
  const armed = reduce(initialContext, { type: "TRIGGER" }, config).context;
  return reduce(armed, { type: "TICK" }, config).context;
}

function apply(ctx: SosContext, responders: Responder[]): SosContext {
  return responderEvents(ctx.state, responders).reduce((c, e) => reduce(c, e, config).context, ctx);
}

test("no answer yet keeps broadcasting", () => {
  assert.equal(live().state, "broadcasting");
  assert.deepEqual(responderEvents("broadcasting", [r("notified")]), []);
});

test("an acknowledgement moves the phone to acknowledged", () => {
  assert.equal(apply(live(), [r("acknowledged")]).state, "acknowledged");
});

test("someone on the way catches up in one poll", () => {
  assert.equal(apply(live(), [r("enroute")]).state, "enroute");
  assert.equal(apply(live(), [r("arrived")]).state, "enroute");
});

test("repeating a poll changes nothing", () => {
  const once = apply(live(), [r("enroute")]);
  assert.deepEqual(apply(once, [r("enroute")]), once);
});

test("covert alerts stay covert when a responder answers", () => {
  const duress = { ...live(), covert: true };
  const out = apply(duress, [r("enroute")]);
  assert.equal(out.state, "enroute");
  assert.equal(out.covert, true);
});
