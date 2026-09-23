// Pure core of the SOS fan-out: who to alert, what to say, and how to talk
// to each provider. No Deno or Node APIs here, so the Edge Function wraps it
// and node tests exercise it directly with an injected fetch.
//
// Provider formats were checked against their docs (Sept 2026):
//   Expo Push  POST https://exp.host/--/api/v2/push/send, up to 100 messages
//   MSG91 SMS  POST https://control.msg91.com/api/v5/flow, DLT template
// Voice calls are not implemented: MSG91 does not publish its voice API
// publicly, and a guessed request would fail silently in an emergency.

export type Kind = "opened" | "resolved";

export type EventBrief = {
  id: string;
  personName: string;
  lat: number | null;
  lng: number | null;
};

export type Recipient = {
  name: string;
  /** E.164, for example +919876543210. */
  phone: string | null;
  pushTokens: string[];
};

export type PushMessage = {
  to: string;
  title: string;
  body: string;
  sound: "default";
  priority: "high";
  channelId: "sos";
  interruptionLevel: "time-sensitive";
  data: { eventId: string; kind: Kind; url: string };
};

export type SmsTarget = { mobile: string; masked: string };

export type Plan = { push: PushMessage[]; sms: SmsTarget[] };

export type Delivery = {
  channel: "push" | "sms";
  recipient: string;
  status: "sent" | "failed" | "skipped";
  detail?: string;
};

export type FetchLike = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string },
) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

export const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
export const MSG91_FLOW_URL = "https://control.msg91.com/api/v5/flow";
const EXPO_BATCH = 100;

export function mapsLink(event: EventBrief): string | null {
  if (event.lat === null || event.lng === null) return null;
  return `https://maps.google.com/?q=${event.lat.toFixed(5)},${event.lng.toFixed(5)}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6) return "***";
  return `+${digits.slice(0, 2)}${"*".repeat(digits.length - 6)}${digits.slice(-4)}`;
}

export function maskToken(token: string): string {
  return `${token.slice(0, 22)}...`;
}

/** MSG91 wants the country code and number as digits, without a plus. */
export function toMsg91Mobile(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

export function isExpoToken(token: string): boolean {
  return /^Expo(nent)?PushToken\[[^\]]+\]$/.test(token);
}

export function pushText(kind: Kind, event: EventBrief): { title: string; body: string } {
  const name = event.personName || "Someone in your circle";
  if (kind === "resolved") {
    return { title: `${name} is safe`, body: `${name} marked themselves safe on Todu.` };
  }
  const link = mapsLink(event);
  return {
    title: `SOS: ${name} needs help`,
    body: link
      ? `Location: ${link} . Call them now, and call 112 if you cannot reach them.`
      : "Their location is not shared yet. Call them now, and call 112 if you cannot reach them.",
  };
}

/** Everyone reachable, each device and each number exactly once. */
export function planDeliveries(
  kind: Kind,
  event: EventBrief,
  recipients: Recipient[],
  consoleUrl: string,
): Plan {
  const text = pushText(kind, event);
  const tokens = new Set<string>();
  const mobiles = new Map<string, SmsTarget>();

  for (const r of recipients) {
    for (const token of r.pushTokens) if (isExpoToken(token)) tokens.add(token);
    const mobile = r.phone ? toMsg91Mobile(r.phone) : null;
    if (mobile && !mobiles.has(mobile)) {
      mobiles.set(mobile, { mobile, masked: maskPhone(mobile) });
    }
  }

  const push: PushMessage[] = [...tokens].map((to) => ({
    to,
    ...text,
    sound: "default",
    priority: "high",
    channelId: "sos",
    interruptionLevel: "time-sensitive",
    data: { eventId: event.id, kind, url: consoleUrl },
  }));

  return { push, sms: [...mobiles.values()] };
}

type ExpoTicket = { status: "ok" | "error"; message?: string; details?: { error?: string } };

/** Sends in batches of 100 and reports every token, plus the ones Expo says
 *  are no longer registered so the caller can forget them. */
export async function sendPush(
  messages: PushMessage[],
  fetchImpl: FetchLike,
  accessToken?: string,
): Promise<{ deliveries: Delivery[]; deadTokens: string[] }> {
  const deliveries: Delivery[] = [];
  const deadTokens: string[] = [];

  for (let i = 0; i < messages.length; i += EXPO_BATCH) {
    const batch = messages.slice(i, i + EXPO_BATCH);
    const headers: Record<string, string> = {
      accept: "application/json",
      "content-type": "application/json",
    };
    if (accessToken) headers.authorization = `Bearer ${accessToken}`;

    let tickets: ExpoTicket[] = [];
    let failure: string | null = null;
    try {
      const res = await fetchImpl(EXPO_PUSH_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(batch),
      });
      const payload = (await res.json()) as { data?: ExpoTicket[]; errors?: { message: string }[] };
      if (!res.ok || !Array.isArray(payload.data)) {
        failure = payload.errors?.[0]?.message ?? `HTTP ${res.status}`;
      } else {
        tickets = payload.data;
      }
    } catch (e) {
      failure = e instanceof Error ? e.message : String(e);
    }

    batch.forEach((message, index) => {
      const ticket = tickets[index];
      if (failure || !ticket) {
        deliveries.push({
          channel: "push",
          recipient: maskToken(message.to),
          status: "failed",
          detail: failure ?? "no ticket returned",
        });
        return;
      }
      if (ticket.status === "ok") {
        deliveries.push({ channel: "push", recipient: maskToken(message.to), status: "sent" });
        return;
      }
      if (ticket.details?.error === "DeviceNotRegistered") deadTokens.push(message.to);
      deliveries.push({
        channel: "push",
        recipient: maskToken(message.to),
        status: "failed",
        detail: ticket.details?.error ?? ticket.message ?? "error",
      });
    });
  }

  return { deliveries, deadTokens };
}

export type Msg91Config = {
  authKey: string;
  /** DLT-registered template for this kind of message. */
  templateId: string;
  /** Variable names exactly as defined in the template (case sensitive). */
  nameVar: string;
  linkVar: string;
};

/** One flow request for every number; MSG91 accepts a recipients array. */
export async function sendSms(
  targets: SmsTarget[],
  config: Msg91Config | null,
  vars: { name: string; link: string },
  fetchImpl: FetchLike,
): Promise<Delivery[]> {
  if (targets.length === 0) return [];
  if (!config) {
    return targets.map((t) => ({
      channel: "sms",
      recipient: t.masked,
      status: "skipped",
      detail: "MSG91 not configured",
    }));
  }

  let failure: string | null = null;
  try {
    const res = await fetchImpl(MSG91_FLOW_URL, {
      method: "POST",
      headers: {
        authkey: config.authKey,
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        template_id: config.templateId,
        short_url: "0",
        recipients: targets.map((t) => ({
          mobiles: t.mobile,
          [config.nameVar]: vars.name,
          [config.linkVar]: vars.link,
        })),
      }),
    });
    const payload = (await res.json()) as { type?: string; message?: string };
    if (!res.ok || payload.type !== "success") {
      failure = payload.message ?? `HTTP ${res.status}`;
    }
  } catch (e) {
    failure = e instanceof Error ? e.message : String(e);
  }

  return targets.map((t) =>
    failure
      ? { channel: "sms", recipient: t.masked, status: "failed", detail: failure }
      : { channel: "sms", recipient: t.masked, status: "sent" },
  );
}
