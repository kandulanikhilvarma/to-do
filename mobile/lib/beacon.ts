// Audible and tactile beacon: the last rung, for being found by people who
// can already hear you. Each part reports whether it actually started, so the
// ladder never claims a siren that is not sounding.
//
// Screen flash is driven by the SOS screen (it needs the UI). The torch is not
// wired in this build: it needs a mounted camera view, and is reported as such.

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";

export type BeaconReport = { siren: boolean; haptics: boolean };

let player: AudioPlayer | null = null;
let pulse: ReturnType<typeof setInterval> | null = null;

export async function startBeacon(): Promise<BeaconReport> {
  stopBeacon();
  const report: BeaconReport = { siren: false, haptics: false };

  try {
    // Play through the hardware silent switch: this is an emergency.
    await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true });
    player = createAudioPlayer(require("../assets/siren.wav"));
    player.loop = true;
    player.volume = 1;
    player.play();
    report.siren = true;
  } catch {
    player = null;
  }

  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    pulse = setInterval(() => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);
    }, 1200);
    report.haptics = true;
  } catch {
    pulse = null;
  }

  return report;
}

export function stopBeacon(): void {
  if (pulse) clearInterval(pulse);
  pulse = null;
  if (player) {
    player.pause();
    player.remove();
  }
  player = null;
}

export function beaconRunning(): boolean {
  return player !== null || pulse !== null;
}
