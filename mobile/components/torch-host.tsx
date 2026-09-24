import { CameraView } from "expo-camera";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { StyleSheet } from "react-native";
import {
  photoRequested,
  photoTaken,
  subscribeTorch,
  torchActive,
  torchReady,
} from "../lib/torch";

// SOS in Morse, one entry per 200 ms unit: dot 1, dash 3, gap 1 between
// signals, 3 between letters, 7 before repeating.
const on = (units: number) => Array<boolean>(units).fill(true);
const off = (units: number) => Array<boolean>(units).fill(false);
const S = [...on(1), ...off(1), ...on(1), ...off(1), ...on(1)];
const O = [...on(3), ...off(1), ...on(3), ...off(1), ...on(3)];
const PATTERN = [...S, ...off(3), ...O, ...off(3), ...S, ...off(7)];
const UNIT_MS = 200;

/** Mounted once at the root. Renders a 1 px camera view only while the
 *  beacon wants the torch or an evidence photo is pending, because the torch
 *  belongs to the camera session. */
export function TorchHost() {
  const active = useSyncExternalStore(subscribeTorch, torchActive);
  const wantPhoto = useSyncExternalStore(subscribeTorch, photoRequested);
  const camera = useRef<CameraView>(null);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!ready || !wantPhoto) return;
    void camera.current
      ?.takePictureAsync({ quality: 0.6 })
      .then((photo) => photoTaken(photo?.uri ?? null))
      .catch(() => photoTaken(null));
  }, [ready, wantPhoto]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setStep((s) => (s + 1) % PATTERN.length), UNIT_MS);
    return () => clearInterval(id);
  }, [active]);

  if (!active && !wantPhoto) {
    if (ready) setReady(false);
    return null;
  }
  return (
    <CameraView
      ref={camera}
      style={styles.hidden}
      facing="back"
      enableTorch={active && (PATTERN[step] ?? false)}
      onCameraReady={() => {
        setReady(true);
        torchReady();
      }}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    />
  );
}

const styles = StyleSheet.create({
  hidden: { position: "absolute", width: 1, height: 1, opacity: 0.01, left: 0, top: 0 },
});
