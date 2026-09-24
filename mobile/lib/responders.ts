// Turns what responders reported on the server into state-machine events.
// Pure so it can be tested without a device.

import type { SosEvent, SosState } from "./sos-machine.ts";

export type ResponderStatus = "notified" | "acknowledged" | "enroute" | "arrived";
export type Responder = { name: string; status: ResponderStatus; etaMinutes: number | null };

/** Events to dispatch, in order, so the phone's state catches up with the
 *  furthest any responder has got. The machine ignores events that do not
 *  apply, so repeating them on every poll is harmless. */
export function responderEvents(state: SosState, responders: Responder[]): SosEvent[] {
  const seen = responders.some((r) => r.status !== "notified");
  const coming = responders.some((r) => r.status === "enroute" || r.status === "arrived");
  const events: SosEvent[] = [];
  if (seen && state === "broadcasting") events.push({ type: "ACK" });
  if (coming && (state === "broadcasting" || state === "acknowledged")) {
    events.push({ type: "ENROUTE" });
  }
  return events;
}
