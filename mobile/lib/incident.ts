// Keeps the latest incident's timeline on the phone only. It never leaves
// unless the person shares it.

import { createMMKV } from "react-native-mmkv";
import type { Entry } from "./incident-core";

const kv = createMMKV({ id: "todu.incident" });

export function incidentEntries(): Entry[] {
  const raw = kv.getString("entries");
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Entry[];
  } catch {
    return [];
  }
}

/** A new SOS replaces the previous timeline. */
export function beginIncident(text: string): void {
  kv.set("entries", JSON.stringify([{ t: Date.now(), text }]));
}

export function logIncident(text: string): void {
  kv.set("entries", JSON.stringify([...incidentEntries(), { t: Date.now(), text }]));
}
