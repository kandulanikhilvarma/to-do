// Fake incoming call: a way out of an uncomfortable situation (spec S1b).
// Works while Todu is open. Ringing over the lock screen would need
// USE_FULL_SCREEN_INTENT, which Android 14 reserves for real calling and alarm
// apps, so it is not claimed here.
//
// The call screen copies a phone dialer rather than the Todu theme, so it
// looks like a call to anyone watching. Decline is grey, not red: red stays
// reserved for the live SOS state.

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import { Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, Vibration, View } from "react-native";
import { useT } from "../lib/i18n";
import { useTheme, type Palette } from "../lib/theme";

type Phase = "setup" | "waiting" | "ringing" | "incall";
const DELAYS = [0, 10, 30, 60];

export default function FakeCallScreen() {
  const theme = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const t = useT();
  const [name, setName] = useState(() => t("fake.defaultName"));
  const [phase, setPhase] = useState<Phase>("setup");
  const [left, setLeft] = useState(0);
  const [talk, setTalk] = useState(0);

  const start = (delay: number) => {
    setLeft(delay);
    setPhase(delay === 0 ? "ringing" : "waiting");
  };

  useEffect(() => {
    if (phase !== "waiting") return;
    const ring = setTimeout(() => setPhase("ringing"), left * 1000);
    const tick = setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000);
    return () => {
      clearTimeout(ring);
      clearInterval(tick);
    };
    // Only the phase starts the wait; `left` is the display countdown.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== "ringing") return;
    let player: AudioPlayer | null = null;
    let stopped = false;
    void setAudioModeAsync({ playsInSilentMode: true }).then(() => {
      if (stopped) return;
      player = createAudioPlayer(require("../assets/ring.wav"));
      player.loop = true;
      player.play();
    });
    Vibration.vibrate([0, 400, 200, 400, 2000], true);
    return () => {
      stopped = true;
      Vibration.cancel();
      player?.remove();
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "incall") return;
    const id = setInterval(() => setTalk((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  if (phase === "ringing" || phase === "incall") {
    const clock = `${Math.floor(talk / 60)}:${String(talk % 60).padStart(2, "0")}`;
    return (
      <View style={s.call}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={s.callState}>{phase === "ringing" ? t("fake.incoming") : clock}</Text>
        <Text style={s.callName}>{name}</Text>
        <Text style={s.callState}>{t("fake.mobile")}</Text>
        <View style={s.callButtons}>
          <Pressable
            style={s.callAction}
            onPress={() => setPhase("setup")}
            accessibilityRole="button"
            accessibilityLabel={phase === "ringing" ? t("fake.decline") : t("fake.end")}
          >
            <View style={[s.round, s.decline]}>
              <Text style={s.roundIcon}>✕</Text>
            </View>
            <Text style={s.callLabel}>{phase === "ringing" ? t("fake.decline") : t("fake.end")}</Text>
          </Pressable>
          {phase === "ringing" && (
            <Pressable
              style={s.callAction}
              onPress={() => {
                setTalk(0);
                setPhase("incall");
              }}
              accessibilityRole="button"
              accessibilityLabel={t("fake.accept")}
            >
              <View style={[s.round, s.accept]}>
                <Text style={s.roundIcon}>✓</Text>
              </View>
              <Text style={s.callLabel}>{t("fake.accept")}</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ headerShown: true }} />
      <Text style={s.body}>{t("fake.intro")}</Text>
      {phase === "waiting" ? (
        <View style={s.card} accessibilityLiveRegion="polite">
          <Text style={s.label}>{t("fake.waiting", { n: left })}</Text>
          <Pressable style={s.secondary} onPress={() => setPhase("setup")} accessibilityRole="button">
            <Text style={s.secondaryLabel}>{t("fake.cancel")}</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={s.label}>{t("fake.caller")}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            accessibilityLabel={t("fake.caller")}
            placeholderTextColor={theme.inkFaint}
            style={s.input}
          />
          <Text style={s.label}>{t("fake.delay")}</Text>
          <View style={s.chips}>
            {DELAYS.map((d) => (
              <Pressable key={d} style={s.chip} onPress={() => start(d)} accessibilityRole="button">
                <Text style={s.chipLabel}>
                  {d === 0 ? t("fake.now") : d < 60 ? t("fake.seconds", { n: d }) : t("fake.minute")}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function makeStyles(theme: Palette) {
  return StyleSheet.create({
    page: { padding: 20, gap: 12, backgroundColor: theme.bg, flexGrow: 1 },
    body: { color: theme.inkMuted, fontSize: 15, lineHeight: 22 },
    label: { color: theme.ink, fontSize: 16, fontWeight: "600", marginTop: 6 },
    input: {
      borderWidth: 1,
      borderColor: theme.line,
      backgroundColor: theme.surface,
      color: theme.ink,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 17,
    },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    chip: {
      minHeight: 52,
      minWidth: 80,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.line,
      backgroundColor: theme.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    chipLabel: { color: theme.ink, fontSize: 16, fontWeight: "600" },
    card: {
      gap: 12,
      borderWidth: 1,
      borderColor: theme.line,
      backgroundColor: theme.surface,
      borderRadius: 14,
      padding: 16,
    },
    secondary: {
      borderRadius: 12,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.line,
      backgroundColor: theme.surface2,
    },
    secondaryLabel: { color: theme.ink, fontSize: 16, fontWeight: "600" },
    // Dialer look, deliberately not themed.
    call: {
      flex: 1,
      backgroundColor: "#202124",
      alignItems: "center",
      paddingTop: 120,
      paddingBottom: 72,
    },
    callState: { color: "#bdc1c6", fontSize: 16 },
    callName: { color: "#ffffff", fontSize: 36, fontWeight: "400", marginVertical: 10 },
    callButtons: {
      marginTop: "auto",
      flexDirection: "row",
      width: "100%",
      justifyContent: "space-evenly",
    },
    callAction: { alignItems: "center", gap: 10, minWidth: 96 },
    round: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
    decline: { backgroundColor: "#5f6368" },
    accept: { backgroundColor: "#1e8e3e" },
    roundIcon: { color: "#ffffff", fontSize: 30, fontWeight: "700" },
    callLabel: { color: "#e8eaed", fontSize: 14 },
  });
}
