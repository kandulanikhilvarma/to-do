import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useT } from "../lib/i18n";
import { normalizePhone } from "../lib/phone";
import { updateSettings, useSettings } from "../lib/settings";
import { theme } from "../lib/theme";

export default function CircleScreen() {
  const t = useT();
  const { contacts } = useSettings();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  function add() {
    const normalized = normalizePhone(phone);
    if (!name.trim() || !normalized) {
      setError(t("circle.invalid"));
      return;
    }
    if (contacts.some((c) => c.phone === normalized)) {
      setError(t("circle.duplicate"));
      return;
    }
    updateSettings({ contacts: [...contacts, { name: name.trim(), phone: normalized }] });
    setName("");
    setPhone("");
    setError(null);
  }

  return (
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      <Text style={s.note}>{t("circle.intro")}</Text>

      {contacts.length === 0 && <Text style={s.empty}>{t("circle.empty")}</Text>}
      {contacts.map((c) => (
        <View key={c.phone} style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{c.name}</Text>
            <Text style={s.meta}>{c.phone}</Text>
          </View>
          <Pressable
            onPress={() => updateSettings({ contacts: contacts.filter((x) => x.phone !== c.phone) })}
            style={s.remove}
            accessibilityRole="button"
            accessibilityLabel={`${t("circle.remove")} ${c.name}`}
          >
            <Text style={s.removeLabel}>{t("circle.remove")}</Text>
          </Pressable>
        </View>
      ))}

      <View style={s.form}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t("circle.name")}
          placeholderTextColor={theme.inkFaint}
          accessibilityLabel={t("circle.name")}
          autoComplete="name"
          style={s.input}
        />
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder={t("circle.phone")}
          placeholderTextColor={theme.inkFaint}
          accessibilityLabel={t("circle.phone")}
          keyboardType="phone-pad"
          autoComplete="tel"
          style={s.input}
          onSubmitEditing={add}
        />
        {error && (
          <Text style={s.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        )}
        <Pressable style={s.primary} onPress={add} accessibilityRole="button">
          <Text style={s.primaryLabel}>{t("circle.add")}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, gap: 12, backgroundColor: theme.bg, flexGrow: 1 },
  note: { color: theme.inkMuted, fontSize: 14, lineHeight: 20 },
  empty: { color: theme.inkFaint, fontSize: 14, paddingVertical: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 14,
  },
  name: { color: theme.ink, fontSize: 16, fontWeight: "600" },
  meta: { color: theme.inkFaint, fontSize: 13, marginTop: 2 },
  remove: { minHeight: 44, justifyContent: "center", paddingHorizontal: 8 },
  removeLabel: { color: theme.warn, fontSize: 14, fontWeight: "600" },
  form: { gap: 10, marginTop: 12 },
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
  error: { color: theme.warn, fontSize: 14 },
  primary: {
    backgroundColor: theme.brand,
    borderRadius: 12,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryLabel: { color: theme.bg, fontSize: 16, fontWeight: "700" },
});
