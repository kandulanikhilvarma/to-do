// SOS lifecycle (spec S8 state machine).
//
// Pure and synchronous on purpose: the one piece of logic that decides whether
// help is summoned must be testable without a device, a network or a clock.
// Side effects (SMS, dialling, BLE, beacon) are driven by the caller from the
// returned effects list.

export type SosState =
  | "armed"
  | "countdown"
  | "false_alarm"
  | "broadcasting"
  | "acknowledged"
  | "enroute"
  | "resolved";

export type SosEffect =
  | "start_countdown"
  | "cancel_countdown"
  | "run_ladder"
  | "stop_ladder"
  | "notify_resolved";

export type SosEvent =
  | { type: "TRIGGER" }
  | { type: "TICK" }
  | { type: "CANCEL"; pin?: string }
  | { type: "ACK" }
  | { type: "ENROUTE" }
  | { type: "SAFE" }
  | { type: "REARM" };

export type SosContext = {
  state: SosState;
  secondsRemaining: number;
  /** True when escalation was triggered by a duress PIN: the UI shows a
   *  convincing cancel while the ladder keeps running. */
  covert: boolean;
};

export type SosConfig = {
  countdownSeconds: number;
  cancelPin: string;
  duressPin: string;
};

export type Transition = { context: SosContext; effects: SosEffect[] };

export const initialContext: SosContext = {
  state: "armed",
  secondsRemaining: 0,
  covert: false,
};

export function reduce(
  context: SosContext,
  event: SosEvent,
  config: SosConfig,
): Transition {
  const stay: Transition = { context, effects: [] };

  switch (context.state) {
    case "armed":
      if (event.type === "TRIGGER") {
        return {
          context: {
            state: "countdown",
            secondsRemaining: config.countdownSeconds,
            covert: false,
          },
          effects: ["start_countdown"],
        };
      }
      return stay;

    case "countdown": {
      if (event.type === "TICK") {
        const secondsRemaining = context.secondsRemaining - 1;
        if (secondsRemaining > 0) {
          return { context: { ...context, secondsRemaining }, effects: [] };
        }
        return {
          context: { state: "broadcasting", secondsRemaining: 0, covert: false },
          effects: ["run_ladder"],
        };
      }

      if (event.type === "CANCEL") {
        // Duress PIN looks identical to a successful cancel, but escalates.
        if (event.pin === config.duressPin) {
          return {
            context: {
              state: "broadcasting",
              secondsRemaining: 0,
              covert: true,
            },
            effects: ["run_ladder"],
          };
        }
        // Once a cancel PIN is configured, only that exact PIN stands the
        // alert down. A missing or wrong PIN keeps counting: otherwise anyone
        // holding the phone could silence an emergency by pressing Cancel.
        if (config.cancelPin !== "" && event.pin !== config.cancelPin) {
          return stay;
        }
        return {
          context: { state: "false_alarm", secondsRemaining: 0, covert: false },
          effects: ["cancel_countdown"],
        };
      }
      return stay;
    }

    case "broadcasting":
      if (event.type === "ACK") {
        return { context: { ...context, state: "acknowledged" }, effects: [] };
      }
      if (event.type === "SAFE") {
        return {
          context: { ...context, state: "resolved" },
          effects: ["stop_ladder", "notify_resolved"],
        };
      }
      return stay;

    case "acknowledged":
      if (event.type === "ENROUTE") {
        return { context: { ...context, state: "enroute" }, effects: [] };
      }
      if (event.type === "SAFE") {
        return {
          context: { ...context, state: "resolved" },
          effects: ["stop_ladder", "notify_resolved"],
        };
      }
      return stay;

    case "enroute":
      if (event.type === "SAFE") {
        return {
          context: { ...context, state: "resolved" },
          effects: ["stop_ladder", "notify_resolved"],
        };
      }
      return stay;

    case "false_alarm":
    case "resolved":
      if (event.type === "REARM") {
        return { context: initialContext, effects: [] };
      }
      return stay;
  }
}
