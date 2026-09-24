import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { isSignedIn } from "../lib/backend";
import { checkIn, setCheckIn, startCheckIn, useCheckIn } from "../lib/checkin";
import { useT } from "../lib/i18n";
import { useTheme, type Palette } from "../lib/theme";

const DURATIONS = [15, 30, 60, 120, 240];

export default function CheckInScreen() {
  const theme = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const t = useT();
  const deadline = useCheckIn();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    void isSignedIn().then(setSignedIn);
  }, []);

  const label = (minutes: number) =>
    minutes < 60 ? t("checkin.minutes", { n: minutes }) : t("checkin.hours", { n: minutes / 60 });

  return (
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.body}>{t("checkin.intro")}</Text>
      <Text style={s.hint}>{signedIn ? t("checkin.server") : t("checkin.localOnly")}</Text>

      {deadline === null ? (
        <View style={s.chips}>
          {DURATIONS.map((m) => (
            <Pressable
              key={m}
              style={s.chip}
              onPress={() => void startCheckIn(m, t)}
              accessibilityRole="button"
              accessibilityLabel={t("checkin.startA11y", { d: label(m) })}
            >
              <Text style={s.chipLabel}>{label(m)}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={s.card} accessibilityLiveRegion="polite">
          <Text style={s.due}>
            {t("checkin.due", {
              time: new Date(deadline).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            })}
          </Text>
          <Pressable style={[s.button, s.primary]} onPress={() => void checkIn()} accessibilityRole="button">
            <Text style={s.primaryLabel}>{t("checkin.ok")}</Text>
          </Pressable>
          <Pressable
            style={[s.button, s.secondary]}
            onPress={() => void setCheckIn(deadline + 30 * 60_000, t)}
            accessibilityRole="button"
          >
            <Text style={s.secondaryLabel}>{t("checkin.extend")}</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

function makeStyles(theme: Palette) {
  return StyleSheet.create({
    page: { padding: 20, gap: 14, backgroundColor: theme.bg, flexGrow: 1 },
    body: { color: theme.ink, fontSize: 16, lineHeight: 23 },
    hint: { color: theme.inkMuted, fontSize: 14, lineHeight: 20 },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 6 },
    chip: {
      minHeight: 52,
      minWidth: 88,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.line,
      backgroundColor: theme.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    chipLabel: { color: theme.ink, fontSize: 17, fontWeight: "600" },
    card: {
      gap: 12,
      borderWidth: 1,
      borderColor: theme.line,
      backgroundColor: theme.surface,
      borderRadius: 14,
      padding: 16,
    },
    due: { color: theme.ink, fontSize: 22, fontWeight: "700" },
    button: { borderRadius: 12, minHeight: 52, alignItems: "center", justifyContent: "center" },
    primary: { backgroundColor: theme.brand },
    primaryLabel: { color: theme.bg, fontSize: 17, fontWeight: "700" },
    secondary: { borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface2 },
    secondaryLabel: { color: theme.ink, fontSize: 16, fontWeight: "600" },
  });
}
