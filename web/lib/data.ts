// Data layer for the responder console.
//
// Called by: components/console.tsx (only consumer).
// When Supabase env vars are present we read the real `responder_events` view;
// otherwise the console renders deterministic sample events and labels itself
// as demo. The demo path exists so the public preview works without
// credentials -- it is never silently substituted for a configured project.
//
// Time is carried as integer minute offsets rather than timestamps so server
// and client render identical markup (no hydration mismatch, no clock skew).

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SosState = "broadcasting" | "acknowledged" | "enroute" | "resolved";

/** Which rung of the offline ladder actually delivered this event. */
export type Transport = "realtime" | "sms" | "ble" | "voice" | "dial112";

export type TimelineEntry = {
  minutesAgo: number;
  label: string;
  transport?: Transport;
};

export type Responder = {
  name: string;
  relationship: string;
  status: "notified" | "acknowledged" | "enroute";
  etaMinutes?: number;
};

export type MedicalProfile = {
  bloodGroup: string;
  allergies: string;
  medications: string;
};

export type SosEvent = {
  id: string;
  personName: string;
  personInitials: string;
  state: SosState;
  openedMinutesAgo: number;
  lastPingMinutesAgo: number;
  batteryPercent: number;
  accuracyMetres: number;
  lat: number;
  lng: number;
  placeLabel: string;
  transport: Transport;
  medical: MedicalProfile;
  responders: Responder[];
  timeline: TimelineEntry[];
};

export type EventSource = "live" | "demo";

export type ConsoleData = {
  source: EventSource;
  events: SosEvent[];
};

export const transportLabels: Record<Transport, string> = {
  realtime: "Realtime (data)",
  sms: "SMS fallback",
  ble: "Bluetooth relay",
  voice: "Voice blast",
  dial112: "112 dial",
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function hasSupabaseConfig(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  client ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return client;
}

/**
 * Row shape of the `responder_events` view. Kept narrow on purpose: row level
 * security restricts it to events owned by one of the viewer active
 * connections, so the view never exposes a wider column set than a responder
 * is entitled to see.
 */
type EventRow = {
  id: string;
  person_name: string;
  state: SosState;
  opened_minutes_ago: number;
  last_ping_minutes_ago: number;
  battery_percent: number;
  accuracy_metres: number;
  lat: number;
  lng: number;
  place_label: string | null;
  transport: Transport;
  blood_group: string | null;
  allergies: string | null;
  medications: string | null;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function rowToEvent(row: EventRow): SosEvent {
  return {
    id: row.id,
    personName: row.person_name,
    personInitials: initials(row.person_name),
    state: row.state,
    openedMinutesAgo: row.opened_minutes_ago,
    lastPingMinutesAgo: row.last_ping_minutes_ago,
    batteryPercent: row.battery_percent,
    accuracyMetres: row.accuracy_metres,
    lat: row.lat,
    lng: row.lng,
    placeLabel: row.place_label ?? "Unknown location",
    transport: row.transport,
    medical: {
      bloodGroup: row.blood_group ?? "Not recorded",
      allergies: row.allergies ?? "None recorded",
      medications: row.medications ?? "None recorded",
    },
    responders: [],
    timeline: [],
  };
}

export async function loadEvents(): Promise<ConsoleData> {
  const supabase = getSupabase();
  if (!supabase) return { source: "demo", events: demoEvents() };

  const { data, error } = await supabase
    .from("responder_events")
    .select("*")
    .order("opened_minutes_ago", { ascending: true });

  // A configured project that errors must surface as an error, never as demo
  // data dressed up as live data.
  if (error) throw new Error(`Supabase query failed: ${error.message}`);

  return { source: "live", events: (data as EventRow[]).map(rowToEvent) };
}

export function demoEvents(): SosEvent[] {
  return [
    {
      id: "evt_7f31a2",
      personName: "Sravani Reddy",
      personInitials: "SR",
      state: "enroute",
      openedMinutesAgo: 6,
      lastPingMinutesAgo: 0,
      batteryPercent: 38,
      accuracyMetres: 12,
      lat: 17.4401,
      lng: 78.3489,
      placeLabel: "Near Hitec City MMTS, Hyderabad",
      transport: "realtime",
      medical: {
        bloodGroup: "O positive",
        allergies: "Penicillin",
        medications: "Salbutamol inhaler",
      },
      responders: [
        {
          name: "Anil Reddy",
          relationship: "Father",
          status: "enroute",
          etaMinutes: 7,
        },
        { name: "Divya K", relationship: "Friend", status: "acknowledged" },
        { name: "Rahul M", relationship: "Colleague", status: "notified" },
      ],
      timeline: [
        { minutesAgo: 6, label: "SOS triggered from home screen widget" },
        { minutesAgo: 6, label: "Countdown elapsed, broadcasting" },
        { minutesAgo: 5, label: "Circle notified", transport: "realtime" },
        {
          minutesAgo: 5,
          label: "SMS delivered to 3 contacts",
          transport: "sms",
        },
        { minutesAgo: 4, label: "Anil Reddy acknowledged" },
        { minutesAgo: 3, label: "Anil Reddy en route, ETA 7 min" },
        {
          minutesAgo: 0,
          label: "Location ping, accuracy 12 m",
          transport: "realtime",
        },
      ],
    },
    {
      id: "evt_2c90b4",
      personName: "Meera Nair",
      personInitials: "MN",
      state: "broadcasting",
      openedMinutesAgo: 2,
      lastPingMinutesAgo: 2,
      batteryPercent: 9,
      accuracyMetres: 65,
      lat: 17.3616,
      lng: 78.4747,
      placeLabel: "Charminar area, Hyderabad",
      transport: "ble",
      medical: {
        bloodGroup: "A negative",
        allergies: "None recorded",
        medications: "None recorded",
      },
      responders: [
        { name: "Priya Nair", relationship: "Sister", status: "notified" },
        { name: "Vikram S", relationship: "Neighbour", status: "notified" },
      ],
      timeline: [
        { minutesAgo: 2, label: "SOS triggered, no mobile data" },
        { minutesAgo: 2, label: "Event queued on device" },
        {
          minutesAgo: 2,
          label: "Relayed by a nearby Todu device",
          transport: "ble",
        },
        { minutesAgo: 2, label: "Relay node flushed event to server" },
        { minutesAgo: 2, label: "Low battery, last known location pinned" },
      ],
    },
    {
      id: "evt_a18e55",
      personName: "Karthik Rao",
      personInitials: "KR",
      state: "acknowledged",
      openedMinutesAgo: 14,
      lastPingMinutesAgo: 1,
      batteryPercent: 72,
      accuracyMetres: 8,
      lat: 17.4239,
      lng: 78.4738,
      placeLabel: "Necklace Road, Hyderabad",
      transport: "realtime",
      medical: {
        bloodGroup: "B positive",
        allergies: "Sulfa drugs",
        medications: "Metformin",
      },
      responders: [
        { name: "Sunita Rao", relationship: "Mother", status: "acknowledged" },
      ],
      timeline: [
        { minutesAgo: 14, label: "Crash detected, SOS auto-armed" },
        { minutesAgo: 14, label: "Countdown elapsed, broadcasting" },
        {
          minutesAgo: 13,
          label: "Voice blast placed to 2 contacts",
          transport: "voice",
        },
        { minutesAgo: 11, label: "Sunita Rao acknowledged" },
        {
          minutesAgo: 1,
          label: "Location ping, accuracy 8 m",
          transport: "realtime",
        },
      ],
    },
    {
      id: "evt_53dd10",
      personName: "Fatima Begum",
      personInitials: "FB",
      state: "resolved",
      openedMinutesAgo: 51,
      lastPingMinutesAgo: 38,
      batteryPercent: 55,
      accuracyMetres: 20,
      lat: 17.4486,
      lng: 78.3908,
      placeLabel: "Jubilee Hills, Hyderabad",
      transport: "sms",
      medical: {
        bloodGroup: "AB positive",
        allergies: "Latex",
        medications: "None recorded",
      },
      responders: [
        {
          name: "Imran Begum",
          relationship: "Brother",
          status: "enroute",
          etaMinutes: 0,
        },
      ],
      timeline: [
        { minutesAgo: 51, label: "SOS triggered from quick settings tile" },
        { minutesAgo: 50, label: "SMS sent to 2 contacts", transport: "sms" },
        { minutesAgo: 44, label: "Imran Begum arrived" },
        { minutesAgo: 38, label: "Marked safe by Fatima Begum" },
      ],
    },
  ];
}
