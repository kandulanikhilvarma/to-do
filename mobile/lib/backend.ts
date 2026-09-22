// Optional Supabase backend. Every SOS rung that does not need a server keeps
// working when this is unconfigured or signed out, and every function here
// reports exactly why it did not deliver.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createMMKV } from "react-native-mmkv";
import { enqueue, flush, pending, type QueuedItem } from "./queue";
import type { Settings } from "./settings";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const authKv = createMMKV({ id: "todu.auth" });

export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          storage: {
            getItem: (key) => authKv.getString(key) ?? null,
            setItem: (key, value) => authKv.set(key, value),
            removeItem: (key) => {
              authKv.remove(key);
            },
          },
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      })
    : null;

export type BackendState = "unconfigured" | "signed_out" | "ready";
export type SendReason = "sent" | "unconfigured" | "signed_out" | "rejected";
export type Fix = { lat: number; lng: number; accuracy: number | null };
export type EventDraft = {
  fix: Fix | null;
  battery: number | null;
  silent: boolean;
  duress: boolean;
};

// The active event id is persisted: the background location task can run in a
// fresh JS context after the app is killed and must still attach its pings.
const eventKv = createMMKV({ id: "todu.event" });
const EVENT_KEY = "current";

function currentEventId(): string | null {
  return eventKv.getString(EVENT_KEY) ?? null;
}

function setCurrentEventId(id: string | null): void {
  if (id) eventKv.set(EVENT_KEY, id);
  else eventKv.remove(EVENT_KEY);
}

export function hasBackend(): boolean {
  return supabase !== null;
}

async function userId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

export async function backendState(): Promise<BackendState> {
  if (!supabase) return "unconfigured";
  return (await userId()) ? "ready" : "signed_out";
}

/** A new SOS must never attach pings to a previous event. */
export function beginEvent(): void {
  setCurrentEventId(null);
}

export async function openEvent(draft: EventDraft): Promise<SendReason> {
  if (!supabase) return "unconfigured";
  const uid = await userId();
  if (!uid) return "signed_out";

  const { data, error } = await supabase
    .from("sos_events")
    .insert({
      user_id: uid,
      state: "broadcasting",
      transport: "realtime",
      battery_percent: draft.battery,
      silent: draft.silent,
      duress: draft.duress,
    })
    .select("id")
    .single<{ id: string }>();
  if (error || !data) return "rejected";

  setCurrentEventId(data.id);
  if (draft.fix) await sendPing(draft.fix, draft.battery);
  return "sent";
}

/** Durable trail row first, then a best effort live broadcast. */
export async function sendPing(
  fix: Fix,
  battery: number | null,
  eventId: string | null = currentEventId(),
): Promise<boolean> {
  if (!supabase || !eventId) return false;
  const { error } = await supabase.from("location_pings").insert({
    event_id: eventId,
    point: `SRID=4326;POINT(${fix.lng} ${fix.lat})`,
    accuracy_metres: fix.accuracy,
    battery_percent: battery,
  });
  if (error) return false;

  // Private channel: realtime.messages RLS limits it to the owner and their
  // active connections (migration 0005).
  const channel = supabase.channel(`sos:${eventId}`, { config: { private: true } });
  await channel.httpSend("ping", { ...fix, battery }).catch(() => undefined);
  void supabase.removeChannel(channel);
  return true;
}

export async function markResolved(eventId: string | null = currentEventId()): Promise<boolean> {
  if (!supabase || !eventId) return false;
  const { error } = await supabase
    .from("sos_events")
    .update({ state: "resolved", resolved_at: new Date().toISOString() })
    .eq("id", eventId);
  if (!error) setCurrentEventId(null);
  return !error;
}

/** Sender used by the offline queue flush. FIFO order means an event is
 *  created before the pings queued after it. */
export async function sendQueued(item: QueuedItem): Promise<boolean> {
  switch (item.kind) {
    case "event":
      return (await openEvent(item.payload as EventDraft)) === "sent";
    case "ping": {
      const p = item.payload as { fix: Fix; battery: number | null };
      return sendPing(p.fix, p.battery);
    }
    case "resolve":
      return markResolved();
  }
}

export async function sendOtp(phone: string): Promise<string | null> {
  if (!supabase) return "unconfigured";
  const { error } = await supabase.auth.signInWithOtp({ phone });
  return error ? error.message : null;
}

export async function verifyOtp(phone: string, token: string): Promise<string | null> {
  if (!supabase) return "unconfigured";
  const { error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
  return error ? error.message : null;
}

export async function signOut(): Promise<void> {
  await supabase?.auth.signOut();
}

/** Mirror the local profile to the server so responders see it. */
export async function syncProfile(s: Settings): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user?.phone) return false;

  const profile = await supabase.from("profiles").upsert({
    id: user.id,
    phone: `+${user.phone.replace(/^\+/, "")}`,
    display_name: s.displayName || "Todu user",
  });
  if (profile.error) return false;

  const medical = await supabase.from("medical_profiles").upsert({
    user_id: user.id,
    blood_group: s.medical.bloodGroup || null,
    allergies: s.medical.allergies || null,
    medications: s.medical.medications || null,
    updated_at: new Date().toISOString(),
  });
  return !medical.error;
}

export type BroadcastOutcome = SendReason | "offline";

/**
 * The SOS send path. The event is written to the on-device queue before any
 * network wait, then flushed through the same serialised queue the reconnect
 * listener uses, so it can neither be lost nor sent twice.
 */
export async function broadcastEvent(
  draft: EventDraft,
  online: boolean,
): Promise<BroadcastOutcome> {
  if (!supabase) return "unconfigured";
  const item = enqueue("event", draft);
  if (!online) return "offline";
  if ((await backendState()) === "signed_out") return "signed_out";

  await flush(sendQueued);
  return pending().some((queued) => queued.id === item.id) ? "rejected" : "sent";
}
