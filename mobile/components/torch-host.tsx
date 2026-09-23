import { CameraView } from "expo-camera";
import { useEffect, useState, useSyncExternalStore } from "react";
import { StyleSheet } from "react-native";
import { subscribeTorch, torchActive, torchReady } from "../lib/torch";

// SOS in Morse, one entry per 200 ms unit: dot 1, dash 3, gap 1 between
// signals, 3 between letters, 7 before repeating.
const on = (units: number) => Array<boolean>(units).fill(true);
const off = (units: number) => Array<boolean>(units).fill(false);
const S = [...on(1), ...off(1), ...on(1), ...off(1), ...on(1)];
const O = [...on(3), ...off(1), ...on(3), ...off(1), ...on(3)];
const PATTERN = [...S, ...off(3), ...O, ...off(3), ...S, ...off(7)];
const UNIT_MS = 200;

/** Mounted once at the root. Renders a 1 px camera view only while the
 *  beacon wants the torch, because the torch belongs to the camera session. */
export function TorchHost() {
  const active = useSyncExternalStore(subscribeTorch, torchActive);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setStep((s) => (s + 1) % PATTERN.length), UNIT_MS);
    return () => clearInterval(id);
  }, [active]);

  if (!active) return null;
  return (
    <CameraView
      style={styles.hidden}
      facing="back"
      enableTorch={PATTERN[step] ?? false}
      onCameraReady={torchReady}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    />
  );
}

const styles = StyleSheet.create({
  hidden: { position: "absolute", width: 1, height: 1, opacity: 0.01, left: 0, top: 0 },
});
