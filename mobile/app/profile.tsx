import { ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "../lib/theme";

const FIELDS = [
  { label: "Blood group", value: "Not set" },
  { label: "Allergies", value: "Not set" },
  { label: "Medications", value: "Not set" },
  { label: "Emergency contact", value: "Not set" },
];

export default function ProfileScreen() {
  return (
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.note}>
        Shared with responders only while an SOS is active. Mirror this into
        your phone native Medical ID so it is readable from the lock screen
        even if Todu is not running.
      </Text>
      {FIELDS.map((f) => (
        <View key={f.label} style={s.row}>
          <Text style={s.label}>{f.label}</Text>
          <Text style={s.value}>{f.value}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, gap: 12, backgroundColor: theme.bg, flexGrow: 1 },
  note: { color: theme.inkMuted, fontSize: 14, lineHeight: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface, borderRadius: 12, padding: 14 },
  label: { color: theme.inkFaint, fontSize: 14 },
  value: { color: theme.ink, fontSize: 14, fontWeight: "500" },
});
