// Torch beacon state. The torch needs a mounted camera view (TorchHost), so
// this module is the bridge: startTorch asks for it and resolves true only
// once the camera reports ready. The beacon never claims a torch it has not
// seen turn on.

import { Camera } from "expo-camera";

const READY_TIMEOUT_MS = 4000;

let active = false;
let pending: ((ok: boolean) => void) | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function subscribeTorch(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function torchActive(): boolean {
  return active;
}

export async function startTorch(): Promise<boolean> {
  const permission = await Camera.getCameraPermissionsAsync().catch(() => null);
  // Never prompt mid-emergency; the protection check asks in advance.
  if (!permission?.granted) return false;

  active = true;
  emit();
  return new Promise<boolean>((resolve) => {
    pending = resolve;
    setTimeout(() => {
      if (pending === resolve) {
        pending = null;
        resolve(false);
      }
    }, READY_TIMEOUT_MS);
  });
}

/** Called by TorchHost when the hidden camera view is ready. */
export function torchReady(): void {
  pending?.(true);
  pending = null;
}

// ------------------------------------------------------------- evidence --
// One still for the circle (spec S1b evidence capture). It shares the torch's
// hidden camera, because two sessions on the back camera would fight.

let photoWanted: ((uri: string | null) => void) | null = null;

export function photoRequested(): boolean {
  return photoWanted !== null;
}

/** A photo from the back camera, or null with no permission, no camera, or
 *  no picture within eight seconds. Never prompts for permission. */
export async function capturePhoto(): Promise<string | null> {
  const permission = await Camera.getCameraPermissionsAsync().catch(() => null);
  if (!permission?.granted) return null;
  return new Promise<string | null>((resolve) => {
    photoWanted = resolve;
    emit();
    setTimeout(() => {
      if (photoWanted === resolve) photoTaken(null);
    }, 8000);
  });
}

/** Called by TorchHost with the picture it took (or null). */
export function photoTaken(uri: string | null): void {
  const resolve = photoWanted;
  photoWanted = null;
  emit();
  resolve?.(uri);
}

export function stopTorch(): void {
  active = false;
  pending?.(false);
  pending = null;
  emit();
}
