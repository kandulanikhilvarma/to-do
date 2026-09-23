// Push registration for responders. Alerts arrive on a dedicated Android
// channel at maximum importance that may bypass Do Not Disturb, so a
// responder phone wakes someone at 3am.

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { registerPushToken } from "./backend";
import { translate } from "./i18n";
import { getSettings } from "./settings";

export type PushState = "unknown" | "on" | "unavailable";

let state: PushState = "unknown";

export function pushState(): PushState {
  return state;
}

export async function ensureSosChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("sos", {
    name: translate(getSettings().locale, "track.title"),
    importance: Notifications.AndroidImportance.MAX,
    bypassDnd: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: "default",
    vibrationPattern: [0, 600, 300, 600, 300, 600],
  });
}

/** Register this device for SOS alerts. Needs notification permission, a
 *  real device and an EAS project id; without any of them push is reported
 *  as unavailable rather than silently missing. */
export async function registerForPush(): Promise<PushState> {
  try {
    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted || !Device.isDevice) {
      state = "unavailable";
      return state;
    }
    const { data } = await Notifications.getExpoPushTokenAsync();
    state = (await registerPushToken(data, Platform.OS, Device.modelName)) ? "on" : "unavailable";
  } catch {
    state = "unavailable";
  }
  return state;
}
