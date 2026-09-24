// Post-incident timeline (spec S1a): what happened, when, and what reached
// whom, as plain text the person can share with family, police or a lawyer.
// Pure so the format is tested without a device.

export type Entry = { t: number; text: string };

const pad = (n: number) => String(n).padStart(2, "0");

/** Local wall-clock time, HH:MM:SS. */
export function clock(t: number): string {
  const d = new Date(t);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function formatIncident(title: string, entries: Entry[]): string {
  const lines = [...entries].sort((a, b) => a.t - b.t).map((e) => `${clock(e.t)}  ${e.text}`);
  return [title, "", ...lines].join("\n");
}
