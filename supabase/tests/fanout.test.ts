import assert from "node:assert/strict";
import { test } from "node:test";
import {
  EXPO_PUSH_URL,
  MSG91_FLOW_URL,
  maskPhone,
  planDeliveries,
  sendPush,
  sendSms,
  type FetchLike,
} from "../functions/_shared/fanout.ts";

const event = { id: "evt-1", personName: "Asha", lat: 17.4401, lng: 78.3489 };
const TOKEN_A = "ExponentPushToken[aaaa]";
const TOKEN_B = "ExponentPushToken[bbbb]";
const MSG91 = { authKey: "k", templateId: "tpl", nameVar: "name", linkVar: "link" };

type Call = { url: string; headers: Record<string, string>; body: unknown };

function fakeFetch(reply: (body: unknown) => { status?: number; json: unknown }) {
  const calls: Call[] = [];
  const impl: FetchLike = async (url, init) => {
    const body: unknown = JSON.parse(init.body);
    calls.push({ url, headers: init.headers, body });
    const r = reply(body);
    const status = r.status ?? 200;
    return { ok: status < 400, status, json: async () => r.json };
  };
  return { impl, calls };
}

test("each device and each number is alerted exactly once", () => {
  const plan = planDeliveries(
    "opened",
    event,
    [
      { name: "Bala", phone: "+919876543210", pushTokens: [TOKEN_A, TOKEN_A, "garbage"] },
      { name: "Bala again", phone: "919876543210", pushTokens: [TOKEN_B] },
      { name: "Amma", phone: "+919999999999", pushTokens: [] },
    ],
    "https://todu.example/dashboard",
  );
  assert.deepEqual(
    plan.push.map((m) => m.to),
    [TOKEN_A, TOKEN_B],
  );
  assert.deepEqual(
    plan.sms.map((s) => s.mobile),
    ["919876543210", "919999999999"],
  );
  assert.match(plan.push[0]!.body, /maps\.google\.com\/\?q=17\.44010,78\.34890/);
  assert.equal(plan.push[0]!.channelId, "sos");
  assert.equal(plan.push[0]!.priority, "high");
});

test("with no location the message says so instead of linking nowhere", () => {
  const plan = planDeliveries(
    "opened",
    { ...event, lat: null, lng: null },
    [{ name: "B", phone: null, pushTokens: [TOKEN_A] }],
    "u",
  );
  assert.match(plan.push[0]!.body, /not shared yet/);
  assert.doesNotMatch(plan.push[0]!.body, /maps/);
});

test("push uses the Expo endpoint and reports dead tokens", async () => {
  const { impl, calls } = fakeFetch(() => ({
    json: {
      data: [
        { status: "ok", id: "1" },
        { status: "error", message: "gone", details: { error: "DeviceNotRegistered" } },
      ],
    },
  }));
  const plan = planDeliveries(
    "opened",
    event,
    [{ name: "B", phone: null, pushTokens: [TOKEN_A, TOKEN_B] }],
    "u",
  );
  const out = await sendPush(plan.push, impl, "secret-token");
  assert.equal(calls[0]!.url, EXPO_PUSH_URL);
  assert.equal(calls[0]!.headers.authorization, "Bearer secret-token");
  assert.deepEqual(
    out.deliveries.map((d) => d.status),
    ["sent", "failed"],
  );
  assert.deepEqual(out.deadTokens, [TOKEN_B]);
});

test("push batches at 100 messages", async () => {
  const { impl, calls } = fakeFetch((body) => ({
    json: { data: (body as unknown[]).map(() => ({ status: "ok" })) },
  }));
  const tokens = Array.from({ length: 150 }, (_, i) => `ExponentPushToken[t${i}]`);
  const plan = planDeliveries("opened", event, [{ name: "x", phone: null, pushTokens: tokens }], "u");
  const out = await sendPush(plan.push, impl);
  assert.equal(calls.length, 2);
  assert.equal(out.deliveries.filter((d) => d.status === "sent").length, 150);
});

test("a push outage marks every message failed, never sent", async () => {
  const impl: FetchLike = async () => {
    throw new Error("network down");
  };
  const plan = planDeliveries("opened", event, [{ name: "x", phone: null, pushTokens: [TOKEN_A] }], "u");
  const out = await sendPush(plan.push, impl);
  assert.deepEqual(
    out.deliveries.map((d) => [d.status, d.detail]),
    [["failed", "network down"]],
  );
});

test("SMS goes out as one MSG91 flow request with template variables", async () => {
  const { impl, calls } = fakeFetch(() => ({ json: { type: "success", message: "req-1" } }));
  const plan = planDeliveries(
    "opened",
    event,
    [
      { name: "B", phone: "+919876543210", pushTokens: [] },
      { name: "C", phone: "+919999999999", pushTokens: [] },
    ],
    "u",
  );
  const out = await sendSms(plan.sms, MSG91, { name: "Asha", link: "https://maps.google.com/?q=1,2" }, impl);
  assert.equal(calls.length, 1);
  assert.equal(calls[0]!.url, MSG91_FLOW_URL);
  assert.equal(calls[0]!.headers.authkey, "k");
  assert.deepEqual(calls[0]!.body, {
    template_id: "tpl",
    short_url: "0",
    recipients: [
      { mobiles: "919876543210", name: "Asha", link: "https://maps.google.com/?q=1,2" },
      { mobiles: "919999999999", name: "Asha", link: "https://maps.google.com/?q=1,2" },
    ],
  });
  assert.deepEqual(
    out.map((d) => d.status),
    ["sent", "sent"],
  );
  assert.equal(out[0]!.recipient, maskPhone("919876543210"));
});

test("an MSG91 error is reported as failed with its message", async () => {
  const { impl } = fakeFetch(() => ({ json: { type: "error", message: "Invalid template" } }));
  const out = await sendSms([{ mobile: "919876543210", masked: "m" }], MSG91, { name: "A", link: "l" }, impl);
  assert.deepEqual(
    out.map((d) => [d.status, d.detail]),
    [["failed", "Invalid template"]],
  );
});

test("without MSG91 configured, SMS is skipped and says why", async () => {
  const impl: FetchLike = async () => {
    throw new Error("must not be called");
  };
  const out = await sendSms([{ mobile: "919876543210", masked: "m" }], null, { name: "A", link: "l" }, impl);
  assert.deepEqual(
    out.map((d) => [d.status, d.detail]),
    [["skipped", "MSG91 not configured"]],
  );
});

test("phone numbers are masked in logs", () => {
  assert.equal(maskPhone("+919876543210"), "+91******3210");
});
