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

export function stopTorch(): void {
  active = false;
  pending?.(false);
  pending = null;
  emit();
}
