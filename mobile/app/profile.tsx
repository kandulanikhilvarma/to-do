import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { hasBackend, syncProfile } from "../lib/backend";
import { useT, type Key } from "../lib/i18n";
import { getSettings, updateSettings, useSettings, type Medical } from "../lib/settings";
import { theme } from "../lib/theme";

const FIELDS: { key: keyof Medical; label: Key }[] = [
  { key: "bloodGroup", label: "profile.blood" },
  { key: "allergies", label: "profile.allergies" },
  { key: "medications", label: "profile.meds" },
];

export default function ProfileScreen() {
  const t = useT();
  const saved = useSettings();
  const [displayName, setDisplayName] = useState(saved.displayName);
  const [medical, setMedical] = useState<Medical>(saved.medical);
  const [status, setStatus] = useState<Key | null>(null);

  async function save() {
    updateSettings({ displayName: displayName.trim(), medical });
    setStatus("profile.saved");
    if (hasBackend() && (await syncProfile(getSettings()))) setStatus("profile.synced");
  }

  return (
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      <Text style={s.note}>{t("profile.intro")}</Text>

      <View style={s.field}>
        <Text style={s.label}>{t("profile.name")}</Text>
        <TextInput
          value={displayName}
          onChangeText={(v) => {
            setDisplayName(v);
            setStatus(null);
          }}
          accessibilityLabel={t("profile.name")}
          autoComplete="name"
          style={s.input}
        />
      </View>

      {FIELDS.map((f) => (
        <View key={f.key} style={s.field}>
          <Text style={s.label}>{t(f.label)}</Text>
          <TextInput
            value={medical[f.key]}
            onChangeText={(v) => {
              setMedical((m) => ({ ...m, [f.key]: v }));
              setStatus(null);
            }}
            accessibilityLabel={t(f.label)}
            multiline={f.key !== "bloodGroup"}
            style={s.input}
          />
        </View>
      ))}

      <Pressable style={s.primary} onPress={() => void save()} accessibilityRole="button">
        <Text style={s.primaryLabel}>{t("profile.save")}</Text>
      </Pressable>
      {status && (
        <Text style={s.ok} accessibilityLiveRegion="polite">
          {t(status)}
        </Text>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, gap: 14, backgroundColor: theme.bg, flexGrow: 1 },
  note: { color: theme.inkMuted, fontSize: 14, lineHeight: 20 },
  field: { gap: 6 },
  label: { color: theme.inkFaint, fontSize: 13, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.surface,
    color: theme.ink,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  primary: {
    backgroundColor: theme.brand,
    borderRadius: 12,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  primaryLabel: { color: theme.bg, fontSize: 16, fontWeight: "700" },
  ok: { color: theme.ok, fontSize: 14, textAlign: "center" },
});
