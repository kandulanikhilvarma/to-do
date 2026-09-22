import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { Link } from "expo-router";
import { dial112, runLadder, type RungResult } from "../lib/ladder";
import { enqueue } from "../lib/queue";
import { initialContext, reduce, type SosConfig, type SosContext } from "../lib/sos-machine";
import { theme } from "../lib/theme";

const config: SosConfig = { countdownSeconds: 8, cancelPin: "", duressPin: "9999" };

export default function SosScreen() {
  const [ctx, setCtx] = useState<SosContext>(initialContext);
  const [rungs, setRungs] = useState<RungResult[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => stopTimer, [stopTimer]);

  const broadcast = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const position =
      status === "granted"
        ? await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
        : null;
    const lat = position?.coords.latitude ?? 0;
    const lng = position?.coords.longitude ?? 0;

    // Durable first, network second: the record must survive a dying battery.
    enqueue("event", { lat, lng, at: Date.now() });

    const results = await runLadder({
      contacts: [],
      lat,
      lng,
      displayName: "Your contact",
      online: false,
      broadcast: async () => false,
      startBeacon: async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      },
    });
    setRungs(results);
  }, []);

  const trigger = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCtx((c) => reduce(c, { type: "TRIGGER" }, config).context);
    stopTimer();
    timer.current = setInterval(() => {
      setCtx((current) => {
        const next = reduce(current, { type: "TICK" }, config);
        if (next.effects.includes("run_ladder")) {
          stopTimer();
          void broadcast();
        }
        return next.context;
      });
    }, 1000);
  }, [broadcast, stopTimer]);

  const cancel = useCallback(() => {
    stopTimer();
    setCtx((c) => reduce(c, { type: "CANCEL" }, config).context);
  }, [stopTimer]);

  const markSafe = useCallback(() => {
    setCtx((c) => reduce(c, { type: "SAFE" }, config).context);
    setRungs([]);
  }, []);

  const rearm = useCallback(() => {
    setCtx((c) => reduce(c, { type: "REARM" }, config).context);
    setRungs([]);
  }, []);

  const live = ctx.state === "broadcasting" || ctx.state === "acknowledged" || ctx.state === "enroute";

  return (
    <ScrollView contentContainerStyle={s.page}>
      {ctx.state === "armed" && (
        <>
          <Text style={s.title}>Help is one tap away</Text>
          <Text style={s.sub}>
            Hold the button. You get {config.countdownSeconds} seconds to cancel.
          </Text>
          <Pressable style={[s.big, s.bigIdle]} onLongPress={trigger} delayLongPress={600}>
            <Text style={s.bigLabel}>Hold to send SOS</Text>
          </Pressable>
        </>
      )}

      {ctx.state === "countdown" && (
        <>
          <Text style={s.title}>Sending in {ctx.secondsRemaining}</Text>
          <View style={[s.big, s.bigLive]}>
            <Text style={s.count}>{ctx.secondsRemaining}</Text>
          </View>
          <Pressable style={s.cancel} onPress={cancel}>
            <Text style={s.cancelLabel}>Cancel</Text>
          </Pressable>
        </>
      )}

      {ctx.state === "false_alarm" && (
        <>
          <Text style={s.title}>Cancelled</Text>
          <Text style={s.sub}>No alert was sent.</Text>
          <Pressable style={s.cancel} onPress={rearm}>
            <Text style={s.cancelLabel}>Back</Text>
          </Pressable>
        </>
      )}

      {live && (
        <>
          <Text style={[s.title, { color: theme.sos }]}>SOS active</Text>
          <Text style={s.sub}>Escalation ladder</Text>
          {rungs.map((r) => (
            <View key={r.rung} style={s.rung}>
              <Text style={s.rungName}>{r.rung}</Text>
              <Text style={[s.rungDetail, { color: r.delivered ? theme.ok : theme.inkFaint }]}>
                {r.detail}
              </Text>
            </View>
          ))}
          <Pressable style={s.dial} onPress={() => void dial112()}>
            <Text style={s.dialLabel}>Call 112</Text>
          </Pressable>
          <Pressable style={s.cancel} onPress={markSafe}>
            <Text style={s.cancelLabel}>I am safe</Text>
          </Pressable>
        </>
      )}

      {ctx.state === "resolved" && (
        <>
          <Text style={s.title}>Marked safe</Text>
          <Pressable style={s.cancel} onPress={rearm}>
            <Text style={s.cancelLabel}>Rearm</Text>
          </Pressable>
        </>
      )}

      <View style={s.links}>
        <Link href="/circle" style={s.link}>Your circle</Link>
        <Link href="/profile" style={s.link}>Medical profile</Link>
        <Pressable onPress={() => Alert.alert("Todu", "Todu is not a substitute for emergency services. In an emergency, call 112.")}>
          <Text style={s.link}>Limits</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 24, gap: 16, alignItems: "center", backgroundColor: theme.bg, flexGrow: 1 },
  title: { color: theme.ink, fontSize: 26, fontWeight: "600", textAlign: "center", marginTop: 12 },
  sub: { color: theme.inkMuted, fontSize: 15, textAlign: "center" },
  big: { width: 220, height: 220, borderRadius: 110, alignItems: "center", justifyContent: "center", borderWidth: 4, marginVertical: 16 },
  bigIdle: { borderColor: "rgba(239,68,68,0.5)", backgroundColor: "rgba(239,68,68,0.1)" },
  bigLive: { borderColor: theme.sos, backgroundColor: "rgba(239,68,68,0.15)" },
  bigLabel: { color: theme.ink, fontSize: 18, fontWeight: "600", textAlign: "center", paddingHorizontal: 24 },
  count: { color: theme.ink, fontSize: 72, fontWeight: "600" },
  cancel: { borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface2, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32, width: "100%", alignItems: "center" },
  cancelLabel: { color: theme.ink, fontSize: 17, fontWeight: "600" },
  dial: { backgroundColor: theme.sos, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32, width: "100%", alignItems: "center" },
  dialLabel: { color: "#fff", fontSize: 17, fontWeight: "700" },
  rung: { width: "100%", borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface, borderRadius: 12, padding: 12, gap: 4 },
  rungName: { color: theme.ink, fontSize: 14, fontWeight: "600", textTransform: "uppercase" },
  rungDetail: { fontSize: 13 },
  links: { flexDirection: "row", gap: 20, marginTop: "auto", paddingTop: 24, flexWrap: "wrap", justifyContent: "center" },
  link: { color: theme.brand, fontSize: 15 },
});
