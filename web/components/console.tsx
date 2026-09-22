"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LanguageSwitcher, useLang } from "@/components/lang";
import { Logo, cn } from "@/components/site";
import {
  getSupabase,
  loadEvents,
  transportLabels,
  type EventSource,
  type SosEvent,
  type SosState,
} from "@/lib/data";
import type { Key } from "@/lib/i18n";

const STATE_KEY: Record<SosState, Key> = {
  broadcasting: "dash.active",
  acknowledged: "dash.acknowledged",
  enroute: "dash.enroute",
  resolved: "dash.resolved",
};

/** Colour plus a word, never colour alone. */
const STATE_STYLE: Record<SosState, string> = {
  broadcasting: "border-sos/50 bg-sos/10 text-sos",
  acknowledged: "border-warn/50 bg-warn/10 text-warn",
  enroute: "border-indigo/50 bg-indigo/10 text-indigo",
  resolved: "border-ok/50 bg-ok/10 text-ok",
};

function minutesLabel(m: number): string {
  if (m <= 0) return "just now";
  if (m === 1) return "1 min ago";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  return h === 1 ? "1 hr ago" : `${h} hr ago`;
}

export function ResponderConsole() {
  const { t } = useLang();
  const [events, setEvents] = useState<SosEvent[]>([]);
  const [source, setSource] = useState<EventSource>("demo");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadEvents()
      .then((data) => {
        if (cancelled) return;
        setEvents(data.events);
        setSource(data.source);
        setSelectedId(data.events[0]?.id ?? null);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = useMemo(
    () => events.find((e) => e.id === selectedId) ?? null,
    [events, selectedId],
  );

  function patch(id: string, next: Partial<SosEvent>) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...next } : e)));
  }

  async function acknowledge(event: SosEvent) {
    patch(event.id, { state: "enroute" });
    const supabase = getSupabase();
    if (!supabase) return;
    const { error: writeError } = await supabase
      .from("acknowledgements")
      .insert({ event_id: event.id, status: "enroute", eta_minutes: null });
    if (writeError) setError(writeError.message);
  }

  async function resolve(event: SosEvent) {
    patch(event.id, { state: "resolved" });
    const supabase = getSupabase();
    if (!supabase) return;
    const { error: writeError } = await supabase
      .from("sos_events")
      .update({ state: "resolved" })
      .eq("id", event.id);
    if (writeError) setError(writeError.message);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line bg-surface/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/" aria-label="Todu home">
            <Logo />
          </Link>
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider",
              source === "live"
                ? "border-ok/50 bg-ok/10 text-ok"
                : "border-warn/50 bg-warn/10 text-warn",
            )}
          >
            {source === "live" ? t("dash.live") : t("dash.demo")}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <Link
              href="/"
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink hover:border-brand/60"
            >
              {t("dash.back")}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {t("dash.title")}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">{t("dash.sub")}</p>
        </div>

        {source === "demo" && (
          <p className="mt-4 rounded-xl border border-warn/30 bg-warn/5 p-4 text-sm leading-relaxed text-ink-muted">
            {t("dash.demoBody")}
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-xl border border-sos/40 bg-sos/10 p-4 text-sm text-sos">
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-10 text-sm text-ink-faint">Loading events</p>
        ) : events.length === 0 ? (
          <p className="mt-10 rounded-xl border border-line bg-surface p-6 text-sm text-ink-muted">
            {t("dash.none")}
          </p>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-[22rem_1fr]">
            <ul className="flex flex-col gap-2">
              {events.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(e.id)}
                    aria-current={e.id === selectedId}
                    className={cn(
                      "w-full rounded-xl border p-4 text-left transition-colors",
                      e.id === selectedId
                        ? "border-brand/60 bg-surface-2"
                        : "border-line bg-surface hover:border-ink-faint/40",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2 text-xs font-semibold text-ink-muted">
                        {e.personInitials}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {e.personName}
                        </span>
                        <span className="block truncate text-xs text-ink-faint">
                          {e.placeLabel}
                        </span>
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider",
                          STATE_STYLE[e.state],
                        )}
                      >
                        {t(STATE_KEY[e.state])}
                      </span>
                      <span className="text-xs text-ink-faint">
                        {minutesLabel(e.openedMinutesAgo)}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            {selected ? (
              <EventDetail
                event={selected}
                onAcknowledge={() => acknowledge(selected)}
                onResolve={() => resolve(selected)}
              />
            ) : (
              <p className="rounded-xl border border-line bg-surface p-6 text-sm text-ink-muted">
                {t("dash.select")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EventDetail({
  event,
  onAcknowledge,
  onResolve,
}: {
  event: SosEvent;
  onAcknowledge: () => void;
  onResolve: () => void;
}) {
  const { t } = useLang();
  const acked = event.state === "enroute" || event.state === "resolved";

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              {event.personName}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">{event.placeLabel}</p>
            <p className="mt-1 font-mono text-xs text-ink-faint">
              {event.lat.toFixed(4)}, {event.lng.toFixed(4)}
            </p>
          </div>
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider",
              STATE_STYLE[event.state],
            )}
          >
            {t(STATE_KEY[event.state])}
          </span>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
          <Stat
            label={t("dash.battery")}
            value={`${event.batteryPercent}%`}
            alert={event.batteryPercent < 15}
          />
          <Stat label={t("dash.accuracy")} value={`${event.accuracyMetres} m`} />
          <Stat
            label={t("dash.lastPing")}
            value={minutesLabel(event.lastPingMinutesAgo)}
          />
          <Stat
            label={t("dash.transport")}
            value={transportLabels[event.transport]}
          />
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href="tel:112"
            className="rounded-lg bg-sos px-4 py-2.5 text-sm font-semibold text-white hover:bg-sos/90"
          >
            {t("dash.call")}
          </a>
          <button
            type="button"
            onClick={onAcknowledge}
            disabled={acked}
            className="rounded-lg border border-line bg-surface-2 px-4 py-2.5 text-sm font-medium text-ink hover:border-brand/60 disabled:opacity-50"
          >
            {acked ? t("dash.acked") : t("dash.ack")}
          </button>
          <button
            type="button"
            onClick={onResolve}
            disabled={event.state === "resolved"}
            className="rounded-lg border border-line bg-surface-2 px-4 py-2.5 text-sm font-medium text-ink hover:border-ok/60 disabled:opacity-50"
          >
            {t("dash.resolve")}
          </button>
          <a
            href={`https://www.openstreetmap.org/?mlat=${event.lat}&mlon=${event.lng}#map=17/${event.lat}/${event.lng}`}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-lg border border-line bg-surface-2 px-4 py-2.5 text-sm font-medium text-ink hover:border-brand/60"
          >
            {t("dash.openMap")}
          </a>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">
            {t("dash.medical")}
          </h3>
          <dl className="mt-4 flex flex-col gap-3 text-sm">
            <Row label={t("dash.blood")} value={event.medical.bloodGroup} />
            <Row label={t("dash.allergies")} value={event.medical.allergies} />
            <Row label={t("dash.meds")} value={event.medical.medications} />
          </dl>

          <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-ink-faint">
            {t("dash.responders")}
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            {event.responders.map((r) => (
              <li
                key={r.name}
                className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm text-ink">
                    {r.name}
                  </span>
                  <span className="block text-xs text-ink-faint">
                    {r.relationship}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-ink-muted">
                  {r.status === "enroute" && r.etaMinutes !== undefined
                    ? `ETA ${r.etaMinutes} min`
                    : r.status}
                </span>
              </li>
            ))}
            {event.responders.length === 0 && (
              <li className="text-sm text-ink-faint">None yet</li>
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">
            {t("dash.timeline")}
          </h3>
          <ol className="mt-4 flex flex-col gap-3">
            {event.timeline.map((entry, i) => (
              <li key={`${entry.minutesAgo}-${i}`} className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                <span className="min-w-0">
                  <span className="block text-sm text-ink">{entry.label}</span>
                  <span className="block text-xs text-ink-faint">
                    {minutesLabel(entry.minutesAgo)}
                    {entry.transport
                      ? ` - ${transportLabels[entry.transport]}`
                      : ""}
                  </span>
                </span>
              </li>
            ))}
            {event.timeline.length === 0 && (
              <li className="text-sm text-ink-faint">No entries yet</li>
            )}
          </ol>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div className="bg-surface px-3 py-3">
      <dt className="text-[0.7rem] uppercase tracking-wider text-ink-faint">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 text-sm font-medium",
          alert ? "text-warn" : "text-ink",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
