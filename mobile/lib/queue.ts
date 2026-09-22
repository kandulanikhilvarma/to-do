// Store-and-forward queue (spec S8 offline diagram).
//
// Anything triggered without connectivity is written here first and flushed
// the instant any transport reports success. MMKV is synchronous, which
// matters: an SOS must be durably recorded before the UI advances, not after
// an await that a dying battery may never resolve.

import { createMMKV } from "react-native-mmkv";

const storage = createMMKV({ id: "todu.queue" });
const KEY = "pending";

export type QueuedItem = {
  id: string;
  kind: "event" | "ping" | "ack";
  payload: Record<string, unknown>;
  queuedAt: number;
  attempts: number;
};

function readAll(): QueuedItem[] {
  const raw = storage.getString(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueuedItem[];
  } catch {
    // A corrupt queue must not brick the SOS path. Drop it and carry on.
    storage.remove(KEY);
    return [];
  }
}

function writeAll(items: QueuedItem[]): void {
  storage.set(KEY, JSON.stringify(items));
}

export function enqueue(
  kind: QueuedItem["kind"],
  payload: Record<string, unknown>,
): QueuedItem {
  const item: QueuedItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    payload,
    queuedAt: Date.now(),
    attempts: 0,
  };
  writeAll([...readAll(), item]);
  return item;
}

export function pending(): QueuedItem[] {
  return readAll();
}

export function size(): number {
  return readAll().length;
}

/**
 * Flush every queued item through `send`. Items that fail stay queued with an
 * incremented attempt count so the caller can back off; a local copy is always
 * retained for the post-incident timeline.
 */
export async function flush(
  send: (item: QueuedItem) => Promise<boolean>,
): Promise<{ sent: number; remaining: number }> {
  const items = readAll();
  const keep: QueuedItem[] = [];
  let sent = 0;

  for (const item of items) {
    let ok = false;
    try {
      ok = await send(item);
    } catch {
      ok = false;
    }
    if (ok) sent += 1;
    else keep.push({ ...item, attempts: item.attempts + 1 });
  }

  writeAll(keep);
  return { sent, remaining: keep.length };
}

export function backoffMs(attempts: number): number {
  return Math.min(30_000, 1_000 * 2 ** Math.min(attempts, 5));
}
