import { ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "../lib/theme";

const CIRCLE = [
  { name: "Anil Reddy", relationship: "Father", status: "active" },
  { name: "Divya K", relationship: "Friend", status: "active" },
  { name: "Rahul M", relationship: "Colleague", status: "pending" },
];

export default function CircleScreen() {
  return (
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.note}>
        These contacts are alerted the moment an SOS starts. Invites are sent by
        phone number and must be accepted before a contact becomes active.
      </Text>
      {CIRCLE.map((c) => (
        <View key={c.name} style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{c.name}</Text>
            <Text style={s.meta}>{c.relationship}</Text>
          </View>
          <Text style={[s.badge, c.status === "active" ? s.ok : s.pending]}>
            {c.status}
          </Text>
        </View>
      ))}
      <Text style={s.footer}>
        Local sample data. Wiring this screen to Supabase is the next step in
        Stage 1.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, gap: 12, backgroundColor: theme.bg, flexGrow: 1 },
  note: { color: theme.inkMuted, fontSize: 14, lineHeight: 20 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface, borderRadius: 12, padding: 14 },
  name: { color: theme.ink, fontSize: 16, fontWeight: "600" },
  meta: { color: theme.inkFaint, fontSize: 13, marginTop: 2 },
  badge: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", overflow: "hidden", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  ok: { color: theme.ok, backgroundColor: "rgba(52,211,153,0.12)" },
  pending: { color: theme.warn, backgroundColor: "rgba(245,158,11,0.12)" },
  footer: { color: theme.inkFaint, fontSize: 12, marginTop: 8 },
});
