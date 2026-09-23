// Bluetooth mesh relay through the Bridgefy SDK.
//
// Active only when EXPO_PUBLIC_BRIDGEFY_API_KEY is set (a licence key from
// Bridgefy). The SDK validates that licence over the internet the first time
// it initialises, so the app starts it at launch while online; a phone that
// has never done so cannot relay offline, and the ladder says exactly that.
//
// Two roles on every phone:
//   - in trouble: broadcast its own signed SOS over the mesh;
//   - bystander:  hand SOS messages heard from others to the server, if the
//                 user allows it and this phone has a connection.

import Bridgefy, { BridgefyOperationMode, BridgefyPropagationProfile } from "bridgefy-react-native";
import { postRelay, relayIdentity } from "./backend";
import { enqueue } from "./queue";
import { decodeRelay, encodeRelay, signRelay, type RelayFields } from "./relay-core";
import { getSettings } from "./settings";

const API_KEY = process.env.EXPO_PUBLIC_BRIDGEFY_API_KEY ?? "";

export type RelayState = "unconfigured" | "idle" | "running" | "failed";
export type BroadcastResult = "sent" | "unconfigured" | "not_running" | "no_identity" | "failed";

let state: RelayState = API_KEY ? "idle" : "unconfigured";
let failure = "";
let subscribed = false;

export function relayStatus(): { state: RelayState; failure: string } {
  return { state, failure };
}

async function handleIncoming(data: string): Promise<void> {
  const payload = decodeRelay(data);
  if (!payload || !getSettings().relayForOthers) return;
  const own = await relayIdentity();
  if (own && own.uid === payload.uid) return;
  // Carry it until this phone reaches the server, then hand it over.
  if (!(await postRelay(payload))) enqueue("relay", payload);
}

export async function startRelay(): Promise<RelayState> {
  if (!API_KEY || state === "running") return state;
  try {
    if (!subscribed) {
      subscribed = true;
      Bridgefy.onStart(() => {
        state = "running";
      });
      Bridgefy.onFailToStart((error) => {
        state = "failed";
        failure = error.message;
      });
      Bridgefy.onReceiveData((event) => void handleIncoming(event.data));
    }
    if (!(await Bridgefy.isInitialized())) {
      await Bridgefy.initialize(API_KEY, false, BridgefyOperationMode.HYBRID);
    }
    if (!(await Bridgefy.isStarted())) {
      await Bridgefy.start(undefined, BridgefyPropagationProfile.REALTIME);
    }
    if (await Bridgefy.isStarted()) state = "running";
  } catch (e) {
    state = "failed";
    failure = e instanceof Error ? e.message : String(e);
  }
  return state;
}

/** Broadcast this phone own SOS. The result is what the ladder reports:
 *  "sent" means it left the phone, never that someone received it. */
export async function broadcastSos(fields: Omit<RelayFields, "uid">): Promise<BroadcastResult> {
  if (!API_KEY) return "unconfigured";
  if (state !== "running" && (await startRelay()) !== "running") return "not_running";
  const identity = await relayIdentity();
  if (!identity) return "no_identity";
  try {
    await Bridgefy.sendBroadcast(encodeRelay(signRelay({ uid: identity.uid, ...fields }, identity.secret)));
    return "sent";
  } catch {
    return "failed";
  }
}
