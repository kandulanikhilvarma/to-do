// The fallback ladder (spec S2).
//
// Rungs run in a fixed order and each reports whether it actually delivered.
// The point is not that every rung succeeds; it is that the user is told
// exactly which one did. Nothing here silently claims success.

import * as Linking from "expo-linking";
import * as SMS from "expo-sms";

export type Rung = "realtime" | "sms" | "dial112" | "ble" | "beacon";

export type RungResult = {
  rung: Rung;
  delivered: boolean;
  detail: string;
};

export type LadderInput = {
  contacts: string[];
  lat: number;
  lng: number;
  displayName: string;
  online: boolean;
  broadcast: (lat: number, lng: number) => Promise<boolean>;
  startBeacon: () => Promise<void>;
};

export function emergencyMessage(
  displayName: string,
  lat: number,
  lng: number,
): string {
  return [
    `${displayName} triggered an emergency SOS on Todu.`,
    `Location: https://maps.google.com/?q=${lat},${lng}`,
    "Call them, then call 112 if you cannot reach them.",
  ].join(" ");
}

export async function runLadder(input: LadderInput): Promise<RungResult[]> {
  const results: RungResult[] = [];

  if (input.online) {
    const ok = await input.broadcast(input.lat, input.lng).catch(() => false);
    results.push({
      rung: "realtime",
      delivered: ok,
      detail: ok ? "Broadcast to circle" : "Broadcast failed",
    });
    if (ok) return results;
  } else {
    results.push({
      rung: "realtime",
      delivered: false,
      detail: "No mobile data or Wi-Fi",
    });
  }

  // iOS cannot send programmatically and Play blocks SEND_SMS for non-default
  // handlers, so this opens the composer. It always needs one tap.
  const smsAvailable = await SMS.isAvailableAsync().catch(() => false);
  if (smsAvailable && input.contacts.length > 0) {
    const { result } = await SMS.sendSMSAsync(
      input.contacts,
      emergencyMessage(input.displayName, input.lat, input.lng),
    );
    results.push({
      rung: "sms",
      delivered: result === "sent",
      detail:
        result === "sent" ? "SMS composer sent" : `SMS composer ${result}`,
    });
  } else {
    results.push({
      rung: "sms",
      delivered: false,
      detail: "SMS unavailable on this device",
    });
  }

  results.push({
    rung: "dial112",
    delivered: false,
    detail: "Ready to dial. Android ELS sends location at OS level.",
  });

  // Bridgefy is a licensed SDK and is not wired in this build. Reporting it as
  // unavailable is the honest state, not a stub pretending to relay.
  results.push({
    rung: "ble",
    delivered: false,
    detail: "Bluetooth relay not enabled in this build",
  });

  await input.startBeacon();
  results.push({
    rung: "beacon",
    delivered: true,
    detail: "Siren and torch beacon active",
  });

  return results;
}

export function dial112(): Promise<void> {
  return Linking.openURL("tel:112").then(() => undefined);
}
