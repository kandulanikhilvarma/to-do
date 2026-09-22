import { useEffect } from "react";
import * as Network from "expo-network";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { hasBackend, sendQueued } from "../lib/backend";
import { useT } from "../lib/i18n";
import { flush } from "../lib/queue";
import { theme } from "../lib/theme";

/** Anything recorded offline goes out the moment a connection returns. */
function useQueueFlusher() {
  useEffect(() => {
    if (!hasBackend()) return;
    const drain = () => void flush(sendQueued);
    drain();
    const sub = Network.addNetworkStateListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) drain();
    });
    return () => sub.remove();
  }, []);
}

export default function RootLayout() {
  const t = useT();
  useQueueFlusher();

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.bg },
          headerTintColor: theme.ink,
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: t("nav.home") }} />
        <Stack.Screen name="circle" options={{ title: t("nav.circle") }} />
        <Stack.Screen name="profile" options={{ title: t("nav.profile") }} />
        <Stack.Screen name="settings" options={{ title: t("nav.settings") }} />
      </Stack>
    </>
  );
}
