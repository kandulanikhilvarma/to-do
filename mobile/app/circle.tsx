import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "expo-router";
import {
  answerInvite,
  hasBackend,
  inviteContact,
  isSignedIn,
  myCircle,
  myInvites,
  respondingFor,
  revokeContact,
  syncEmergencyContacts,
  type CircleStatus,
  type Invite,
} from "../lib/backend";
import { useT } from "../lib/i18n";
import { normalizePhone } from "../lib/phone";
import { updateSettings, useSettings, type Contact } from "../lib/settings";
import { theme } from "../lib/theme";

export default function CircleScreen() {
  const t = useT();
  const { contacts } = useSettings();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [signedIn, setSignedIn] = useState(false);
  const [circle, setCircle] = useState<CircleStatus[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [respondFor, setRespondFor] = useState<string[]>([]);

  const refresh = useCallback(() => {
    if (!hasBackend()) return;
    void isSignedIn().then(async (yes) => {
      setSignedIn(yes);
      if (!yes) return;
      const [c, i, r] = await Promise.all([myCircle(), myInvites(), respondingFor()]);
      setCircle(c);
      setInvites(i);
      setRespondFor(r);
    });
  }, []);

  useFocusEffect(refresh);

  function save(next: Contact[]) {
    updateSettings({ contacts: next });
    // The server texts these people when an SOS opens.
    void syncEmergencyContacts(next);
  }

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
    save([...contacts, { name: name.trim(), phone: normalized }]);
    setName("");
    setPhone("");
    setError(null);
  }

  async function remove(c: Contact) {
    save(contacts.filter((x) => x.phone !== c.phone));
    if (signedIn) {
      await revokeContact(c.phone);
      refresh();
    }
  }

  async function invite(c: Contact) {
    const failure = await inviteContact(c.phone);
    if (failure) setError(t("circle.inviteError", { msg: failure }));
    refresh();
  }

  async function answer(id: string, accept: boolean) {
    await answerInvite(id, accept);
    refresh();
  }

  const statusOf = (p: string) => circle.find((c) => c.phone === p)?.status;

  return (
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      {invites.length > 0 && (
        <View style={s.section}>
          <Text style={s.heading} accessibilityRole="header">
            {t("circle.incoming")}
          </Text>
          {invites.map((inv) => (
            <View key={inv.connectionId} style={s.card}>
              <Text style={s.body}>{t("circle.incomingBody", { name: inv.ownerName })}</Text>
              <View style={s.row}>
                <Pressable
                  style={[s.button, s.primary]}
                  onPress={() => void answer(inv.connectionId, true)}
                  accessibilityRole="button"
                >
                  <Text style={s.primaryLabel}>{t("circle.accept")}</Text>
                </Pressable>
                <Pressable
                  style={[s.button, s.secondary]}
                  onPress={() => void answer(inv.connectionId, false)}
                  accessibilityRole="button"
                >
                  <Text style={s.secondaryLabel}>{t("circle.decline")}</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      <Text style={s.note}>{t("circle.intro")}</Text>
      <Text style={s.hint}>
        {signedIn ? t("circle.inviteHint") : hasBackend() ? t("circle.signInToInvite") : ""}
      </Text>

      {contacts.length === 0 && <Text style={s.empty}>{t("circle.empty")}</Text>}
      {contacts.map((c) => {
        const status = statusOf(c.phone);
        return (
          <View key={c.phone} style={s.card}>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{c.name}</Text>
                <Text style={s.meta}>{c.phone}</Text>
                {status && (
                  <Text style={status === "active" ? s.ok : s.pending}>
                    {status === "active" ? t("circle.responder") : t("circle.inviteSent")}
                  </Text>
                )}
              </View>
              <Pressable
                onPress={() => void remove(c)}
                style={s.remove}
                accessibilityRole="button"
                accessibilityLabel={`${t("circle.remove")} ${c.name}`}
              >
                <Text style={s.removeLabel}>{t("circle.remove")}</Text>
              </Pressable>
            </View>
            {signedIn && !status && (
              <Pressable
                style={[s.button, s.secondary]}
                onPress={() => void invite(c)}
                accessibilityRole="button"
                accessibilityLabel={`${t("circle.invite")}: ${c.name}`}
              >
                <Text style={s.secondaryLabel}>{t("circle.invite")}</Text>
              </Pressable>
            )}
          </View>
        );
      })}

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
        <Pressable style={[s.button, s.primary]} onPress={add} accessibilityRole="button">
          <Text style={s.primaryLabel}>{t("circle.add")}</Text>
        </Pressable>
      </View>

      {respondFor.length > 0 && (
        <View style={s.section}>
          <Text style={s.heading} accessibilityRole="header">
            {t("circle.respondingFor")}
          </Text>
          {respondFor.map((who) => (
            <Text key={who} style={s.body}>
              {who}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, gap: 12, backgroundColor: theme.bg, flexGrow: 1 },
  section: { gap: 10 },
  heading: {
    color: theme.inkFaint,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 8,
  },
  note: { color: theme.inkMuted, fontSize: 14, lineHeight: 20 },
  hint: { color: theme.inkFaint, fontSize: 13, lineHeight: 19 },
  body: { color: theme.ink, fontSize: 15, lineHeight: 21 },
  empty: { color: theme.inkFaint, fontSize: 14, paddingVertical: 8 },
  card: {
    gap: 10,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 14,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  name: { color: theme.ink, fontSize: 16, fontWeight: "600" },
  meta: { color: theme.inkFaint, fontSize: 13, marginTop: 2 },
  ok: { color: theme.ok, fontSize: 13, fontWeight: "600", marginTop: 4 },
  pending: { color: theme.warn, fontSize: 13, fontWeight: "600", marginTop: 4 },
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
  button: {
    flex: 1,
    borderRadius: 12,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  primary: { backgroundColor: theme.brand },
  primaryLabel: { color: theme.bg, fontSize: 16, fontWeight: "700" },
  secondary: { borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface2 },
  secondaryLabel: { color: theme.ink, fontSize: 15, fontWeight: "600" },
});
