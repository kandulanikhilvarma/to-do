// The SOS lifecycle survives the app being killed. Without this, an OS kill
// mid-emergency would relaunch into "armed" while the alert is still live,
// and the user would have no way to mark themselves safe.

import { createMMKV } from "react-native-mmkv";
import type { RungResult } from "./ladder";
import { initialContext, type SosContext } from "./sos-machine";

export type SosSession = {
  context: SosContext;
  rungs: RungResult[];
  /** Covert alert whose fake "cancelled" screen was dismissed. */
  covertDismissed: boolean;
};

const kv = createMMKV({ id: "todu.sos" });
const KEY = "session";

const EMPTY: SosSession = { context: initialContext, rungs: [], covertDismissed: false };

export function loadSession(): SosSession {
  const raw = kv.getString(KEY);
  if (!raw) return EMPTY;
  try {
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<SosSession>) };
  } catch {
    return EMPTY;
  }
}

export function saveSession(session: SosSession): void {
  kv.set(KEY, JSON.stringify(session));
}
