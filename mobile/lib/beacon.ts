// Audible and tactile beacon: the last rung, for being found by people who
// can already hear you. Each part reports whether it actually started, so the
// ladder never claims a siren that is not sounding.
//
// Screen flash is driven by the SOS screen (it needs the UI). The torch runs
// through TorchHost and counts only once the camera reports ready.

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { startTorch, stopTorch } from "./torch";

export type BeaconReport = { siren: boolean; haptics: boolean; torch: boolean };

let player: AudioPlayer | null = null;
let pulse: ReturnType<typeof setInterval> | null = null;

export async function startBeacon(): Promise<BeaconReport> {
  stopBeacon();
  const report: BeaconReport = { siren: false, haptics: false, torch: false };

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

  report.torch = await startTorch();
  return report;
}

export function stopBeacon(): void {
  stopTorch();
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
