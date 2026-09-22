import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#07090c" },
          headerTintColor: "#f2f5f8",
          contentStyle: { backgroundColor: "#07090c" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Todu" }} />
        <Stack.Screen name="circle" options={{ title: "Your circle" }} />
        <Stack.Screen name="profile" options={{ title: "Medical profile" }} />
      </Stack>
    </>
  );
}
