"use client";

import Link from "next/link";
import { useState } from "react";
import { useLang } from "@/components/lang";
import { SosDrill } from "@/components/drill";
import { Card, Section, SectionHead, cn } from "@/components/site";
import type { Key } from "@/lib/i18n";

/* ---------------------------------------------------------------- icons -- */

type IconProps = { className?: string };

const iconBase = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

const Icons = {
  tap: (p: IconProps) => (
    <svg {...iconBase} className={p.className}>
      <path d="M9 11V6.5a1.8 1.8 0 0 1 3.6 0V11" />
      <path d="M12.6 11V9.4a1.7 1.7 0 0 1 3.4 0V11" />
      <path d="M16 11v-.8a1.7 1.7 0 0 1 3.4 0V15a6 6 0 0 1-6 6h-1.6a5 5 0 0 1-3.9-1.9L5 15.3a1.7 1.7 0 0 1 2.5-2.2L9 14.6" />
    </svg>
  ),
  timer: (p: IconProps) => (
    <svg {...iconBase} className={p.className}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9.5V13l2.4 1.6M9.5 2.5h5" />
    </svg>
  ),
  people: (p: IconProps) => (
    <svg {...iconBase} className={p.className}>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M2.8 20a6.4 6.4 0 0 1 12.4 0" />
      <path d="M16.2 6a3.2 3.2 0 0 1 0 6.2M17.5 14.4A6.4 6.4 0 0 1 21.4 20" />
    </svg>
  ),
  route: (p: IconProps) => (
    <svg {...iconBase} className={p.className}>
      <circle cx="6" cy="18" r="2.6" />
      <circle cx="18" cy="6" r="2.6" />
      <path d="M8.6 18h5.2a3.6 3.6 0 0 0 0-7.2h-3.6a3.6 3.6 0 0 1 0-7.2h5.2" />
    </svg>
  ),
  wifi: (p: IconProps) => (
    <svg {...iconBase} className={p.className}>
      <path d="M2.5 9.5a14 14 0 0 1 19 0M5.8 13a9.4 9.4 0 0 1 12.4 0M9 16.4a4.8 4.8 0 0 1 6 0" />
      <path d="M12 20h.01" />
    </svg>
  ),
  message: (p: IconProps) => (
    <svg {...iconBase} className={p.className}>
      <path d="M20.5 12a7.8 7.8 0 0 1-11.3 7L4 20.5l1.6-5a7.8 7.8 0 1 1 14.9-3.5Z" />
    </svg>
  ),
  phone: (p: IconProps) => (
    <svg {...iconBase} className={p.className}>
      <path d="M6.3 3.5h3l1.5 3.8-2 1.4a12 12 0 0 0 5.5 5.5l1.4-2 3.8 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.3 5.7a2 2 0 0 1 2-2.2Z" />
    </svg>
  ),
  bluetooth: (p: IconProps) => (
    <svg {...iconBase} className={p.className}>
      <path d="m7 7.5 10 9-5 4v-17l5 4-10 9" />
    </svg>
  ),
  siren: (p: IconProps) => (
    <svg {...iconBase} className={p.className}>
      <path d="M6 18v-4.5a6 6 0 0 1 12 0V18" />
      <path d="M4 18h16v2.5H4zM12 3.5v1.6M4.4 6.6l1.2 1.1M19.6 6.6l-1.2 1.1" />
    </svg>
  ),
  lock: (p: IconProps) => (
    <svg {...iconBase} className={p.className}>
      <rect x="4.5" y="10" width="15" height="10.5" rx="2.2" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
    </svg>
  ),
  chart: (p: IconProps) => (
    <svg {...iconBase} className={p.className}>
      <path d="M4 20V4M4 20h16" />
      <path d="M8 16.5V12M12.5 16.5V8M17 16.5v-3" />
    </svg>
  ),
  shield: (p: IconProps) => (
    <svg {...iconBase} className={p.className}>
      <path d="M12 2.5 4.5 5.8v5.6c0 4.6 3.1 8.3 7.5 10.1 4.4-1.8 7.5-5.5 7.5-10.1V5.8Z" />
      <path d="m8.8 12.2 2.2 2.2 4.2-4.4" />
    </svg>
  ),
  beacon: (p: IconProps) => (
    <svg {...iconBase} className={p.className}>
      <circle cx="12" cy="12" r="2.6" />
      <path d="M7.4 7.4a6.5 6.5 0 0 0 0 9.2M16.6 16.6a6.5 6.5 0 0 0 0-9.2M4.4 4.4a10.7 10.7 0 0 0 0 15.2M19.6 19.6a10.7 10.7 0 0 0 0-15.2" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ hero -- */

function Hero() {
  const { t } = useLang();

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
      {/* Calm teal wash. Red is never used for ambience, only for live SOS. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(45,212,191,0.12),transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted">
            <span className="size-1.5 rounded-full bg-brand" />
            {t("hero.badge")}
          </p>

          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {t("hero.title")}
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink-muted">
            {t("hero.sub")}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#drill"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-base font-semibold text-bg transition-colors hover:bg-brand/90"
            >
              {t("hero.ctaPrimary")}
              <svg {...iconBase} className="size-4">
                <path d="M5 12h13M13 6.5 18.5 12 13 17.5" />
              </svg>
            </Link>
            <Link
              href="#limits"
              className="inline-flex items-center justify-center rounded-xl border border-line bg-surface px-6 py-3.5 text-base font-medium text-ink transition-colors hover:border-brand/60"
            >
              {t("hero.ctaSecondary")}
            </Link>
          </div>

          <p className="mt-6 inline-flex items-center gap-2 text-sm text-ink-faint">
            <Icons.shield className="size-4 text-ok" />
            {t("hero.note")}
          </p>
        </div>

        <HeroDevice />
      </div>

      <HeroStats />
    </section>
  );
}

/** A compact device panel showing the ladder mid-escalation. */
function HeroDevice() {
  const { t } = useLang();

  const rungs = [
    { icon: Icons.wifi, label: t("offline.l1.t"), state: "failed" },
    { icon: Icons.message, label: t("offline.l2.t"), state: "failed" },
    { icon: Icons.phone, label: t("offline.l3.t"), state: "active" },
    { icon: Icons.bluetooth, label: t("offline.l4.t"), state: "active" },
    { icon: Icons.siren, label: t("offline.l5.t"), state: "pending" },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="rounded-[2rem] border border-line bg-surface p-3 shadow-2xl shadow-black/40">
        <div className="rounded-[1.5rem] border border-line bg-bg p-5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-sos">
              <span className="todu-pulse size-2 rounded-full bg-sos" />
              SOS active
            </span>
            <span className="text-xs tabular-nums text-ink-faint">00:42</span>
          </div>

          <p className="mt-4 text-sm text-ink-muted">Escalation ladder</p>

          <ul className="mt-3 flex flex-col gap-2">
            {rungs.map((r) => (
              <li
                key={r.label}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2.5",
                  r.state === "active"
                    ? "border-ok/40 bg-ok/5"
                    : r.state === "failed"
                      ? "border-line bg-surface/60 opacity-60"
                      : "border-line bg-surface/60",
                )}
              >
                <r.icon
                  className={cn(
                    "size-4 shrink-0",
                    r.state === "active" ? "text-ok" : "text-ink-faint",
                  )}
                />
                <span className="flex-1 truncate text-xs text-ink">
                  {r.label}
                </span>
                <span
                  className={cn(
                    "shrink-0 text-[0.65rem] font-semibold uppercase tracking-wider",
                    r.state === "active" ? "text-ok" : "text-ink-faint",
                  )}
                >
                  {r.state === "active"
                    ? "sent"
                    : r.state === "failed"
                      ? "no signal"
                      : "ready"}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-4 rounded-lg border border-line bg-surface/60 p-3 text-xs leading-relaxed text-ink-faint">
            {t("offline.queue")}
          </p>
        </div>
      </div>
    </div>
  );
}

function HeroStats() {
  const { t } = useLang();

  const stats: Array<{ value: string; label: Key }> = [
    { value: "5", label: "stat.ladder" },
    { value: "₹0", label: "stat.free" },
    { value: "112", label: "stat.dial" },
    { value: "3", label: "stat.langs" },
  ];

  return (
    <dl className="relative mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:mt-20 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-surface px-5 py-6">
          <dt className="text-2xl font-semibold tabular-nums text-brand sm:text-3xl">
            {s.value}
          </dt>
          <dd className="mt-1 text-sm leading-snug text-ink-muted">
            {t(s.label)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ------------------------------------------------------------------- how -- */

function HowItWorks() {
  const { t } = useLang();

  const steps = [
    { icon: Icons.tap, t: "how.s1.t", d: "how.s1.d" },
    { icon: Icons.timer, t: "how.s2.t", d: "how.s2.d" },
    { icon: Icons.people, t: "how.s3.t", d: "how.s3.d" },
    { icon: Icons.route, t: "how.s4.t", d: "how.s4.d" },
  ] as const;

  return (
    <Section id="how">
      <SectionHead
        eyebrow={t("how.eyebrow")}
        title={t("how.title")}
        sub={t("how.sub")}
      />
      <ol className="mt-12 grid gap-4 sm:grid-cols-2">
        {steps.map((s, i) => (
          <Card key={s.t}>
            <div className="flex items-start gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand/30 bg-brand/10">
                <s.icon className="size-5 text-brand" />
              </span>
              <div>
                <h3 className="flex items-baseline gap-2 text-base font-semibold text-ink">
                  <span className="text-xs tabular-nums text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {t(s.t)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {t(s.d)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </ol>
    </Section>
  );
}

/* --------------------------------------------------------------- offline -- */

function OfflineLadder() {
  const { t } = useLang();

  const rungs = [
    {
      icon: Icons.wifi,
      t: "offline.l1.t",
      d: "offline.l1.d",
      tag: "offline.l1.tag",
      tone: "ok",
    },
    {
      icon: Icons.message,
      t: "offline.l2.t",
      d: "offline.l2.d",
      tag: "offline.l2.tag",
      tone: "brand",
    },
    {
      icon: Icons.phone,
      t: "offline.l3.t",
      d: "offline.l3.d",
      tag: "offline.l3.tag",
      tone: "ok",
    },
    {
      icon: Icons.bluetooth,
      t: "offline.l4.t",
      d: "offline.l4.d",
      tag: "offline.l4.tag",
      tone: "warn",
    },
    {
      icon: Icons.siren,
      t: "offline.l5.t",
      d: "offline.l5.d",
      tag: "offline.l5.tag",
      tone: "warn",
    },
  ] as const;

  const toneClass = {
    ok: "border-ok/40 text-ok",
    brand: "border-brand/40 text-brand",
    warn: "border-warn/40 text-warn",
  } as const;

  return (
    <Section id="offline" className="border-y border-line bg-surface/30">
      <SectionHead
        eyebrow={t("offline.eyebrow")}
        title={t("offline.title")}
        sub={t("offline.sub")}
      />

      <ol className="mt-12 flex flex-col gap-3">
        {rungs.map((r, i) => (
          <li
            key={r.t}
            className="relative flex gap-4 rounded-2xl border border-line bg-surface p-5 sm:gap-6 sm:p-6"
          >
            <div className="flex flex-col items-center">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-2">
                <r.icon className="size-5 text-ink-muted" />
              </span>
              {i < rungs.length - 1 && (
                <span aria-hidden="true" className="mt-2 w-px flex-1 bg-line" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h3 className="text-base font-semibold text-ink">{t(r.t)}</h3>
                {/* Tag carries a word, not just a colour, for colour-blind readers. */}
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider",
                    toneClass[r.tone],
                  )}
                >
                  {t(r.tag)}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {t(r.d)}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-6 flex items-start gap-3 rounded-xl border border-brand/25 bg-brand/5 p-4 text-sm leading-relaxed text-ink-muted">
        <Icons.beacon className="mt-0.5 size-4 shrink-0 text-brand" />
        {t("offline.queue")}
      </p>
    </Section>
  );
}

/* ----------------------------------------------------------------- drill -- */

function DrillSection() {
  const { t } = useLang();

  return (
    <Section id="drill">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <SectionHead
          eyebrow={t("drill.eyebrow")}
          title={t("drill.title")}
          sub={t("drill.sub")}
        />
        <SosDrill />
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------- limits -- */

function HonestLimits() {
  const { t } = useLang();

  const items = [
    "limits.l1",
    "limits.l2",
    "limits.l3",
    "limits.l4",
    "limits.l5",
    "limits.l6",
  ] as const;

  return (
    <Section id="limits" className="border-y border-line bg-surface/30">
      <SectionHead
        eyebrow={t("limits.eyebrow")}
        title={t("limits.title")}
        sub={t("limits.sub")}
      />
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((base) => (
          <Card key={base}>
            <h3 className="flex items-start gap-2.5 text-base font-semibold text-ink">
              <svg {...iconBase} className="mt-0.5 size-4 shrink-0 text-warn">
                <circle cx="12" cy="12" r="9" />
                <path d="M15 9 9 15M9 9l6 6" />
              </svg>
              {t(`${base}.t` as Key)}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              {t(`${base}.d` as Key)}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------- pricing -- */

function Pricing() {
  const { t } = useLang();

  const freeFeatures: Key[] = [
    "pricing.free.f1",
    "pricing.free.f2",
    "pricing.free.f3",
    "pricing.free.f4",
    "pricing.free.f5",
    "pricing.free.f6",
  ];
  const plusFeatures: Key[] = [
    "pricing.plus.f1",
    "pricing.plus.f2",
    "pricing.plus.f3",
    "pricing.plus.f4",
    "pricing.plus.f5",
    "pricing.plus.f6",
  ];

  return (
    <Section id="pricing">
      <SectionHead
        eyebrow={t("pricing.eyebrow")}
        title={t("pricing.title")}
        sub={t("pricing.sub")}
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border-2 border-brand/50 bg-surface p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-ink">
            {t("pricing.free.name")}
          </h3>
          <p className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-semibold text-brand">
              {t("pricing.free.price")}
            </span>
            <span className="text-sm text-ink-faint">
              {t("pricing.free.period")}
            </span>
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            {freeFeatures.map((k) => (
              <FeatureRow key={k} tone="ok">
                {t(k)}
              </FeatureRow>
            ))}
          </ul>
          <Link
            href="#waitlist"
            className="mt-8 block rounded-xl bg-brand px-5 py-3 text-center text-sm font-semibold text-bg transition-colors hover:bg-brand/90"
          >
            {t("pricing.free.cta")}
          </Link>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-ink">
              {t("pricing.plus.name")}
            </h3>
            <span className="rounded-full border border-indigo/40 px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider text-indigo">
              {t("pricing.badge")}
            </span>
          </div>
          <p className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-semibold text-ink">
              {t("pricing.plus.price")}
            </span>
            <span className="text-sm text-ink-faint">
              {t("pricing.plus.period")}
            </span>
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            {plusFeatures.map((k) => (
              <FeatureRow key={k} tone="indigo">
                {t(k)}
              </FeatureRow>
            ))}
          </ul>
          <Link
            href="#waitlist"
            className="mt-8 block rounded-xl border border-line bg-surface-2 px-5 py-3 text-center text-sm font-semibold text-ink transition-colors hover:border-indigo/60"
          >
            {t("pricing.plus.cta")}
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-ink">
            {t("pricing.b2b.t")}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
            {t("pricing.b2b.d")}
          </p>
        </div>
        <Link
          href="#waitlist"
          className="shrink-0 rounded-xl border border-line bg-surface-2 px-5 py-3 text-center text-sm font-medium text-ink hover:border-brand/60"
        >
          {t("pricing.b2b.cta")}
        </Link>
      </div>
    </Section>
  );
}

function FeatureRow({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "ok" | "indigo";
}) {
  return (
    <li className="flex items-start gap-3 text-sm text-ink-muted">
      <svg
        {...iconBase}
        className={cn(
          "mt-0.5 size-4 shrink-0",
          tone === "ok" ? "text-ok" : "text-indigo",
        )}
      >
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}

/* ----------------------------------------------------------------- trust -- */

function Trust() {
  const { t } = useLang();

  const items = [
    { icon: Icons.lock, t: "trust.t1.t", d: "trust.t1.d" },
    { icon: Icons.chart, t: "trust.t2.t", d: "trust.t2.d" },
    { icon: Icons.shield, t: "trust.t3.t", d: "trust.t3.d" },
    { icon: Icons.phone, t: "trust.t4.t", d: "trust.t4.d" },
  ] as const;

  return (
    <Section className="border-y border-line bg-surface/30">
      <SectionHead
        eyebrow={t("trust.eyebrow")}
        title={t("trust.title")}
        sub={t("trust.sub")}
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <Card key={it.t}>
            <it.icon className="size-5 text-brand" />
            <h3 className="mt-4 text-base font-semibold text-ink">{t(it.t)}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {t(it.d)}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------- faq -- */

function Faq() {
  const { t } = useLang();
  const pairs = [1, 2, 3, 4, 5, 6] as const;

  return (
    <Section id="faq">
      <SectionHead eyebrow={t("faq.eyebrow")} title={t("faq.title")} />
      <div className="mt-10 flex flex-col gap-3">
        {pairs.map((n) => (
          <details
            key={n}
            className="group rounded-xl border border-line bg-surface px-5 py-4 open:border-brand/40"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-ink">
              {t(`faq.q${n}` as Key)}
              <svg
                {...iconBase}
                className="size-4 shrink-0 text-ink-faint transition-transform group-open:rotate-45"
              >
                <path d="M12 5.5v13M5.5 12h13" />
              </svg>
            </summary>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-muted">
              {t(`faq.a${n}` as Key)}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------- waitlist */

function Waitlist() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle",
  );
  const [note, setNote] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setStatus("error");
      setNote(t("cta.err"));
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = (await res.json()) as { ok: boolean; stored: boolean };
      if (!res.ok || !body.ok) throw new Error("request failed");

      setStatus("ok");
      // Say plainly when the preview has no database behind it.
      setNote(
        body.stored
          ? t("cta.ok")
          : `${t("cta.ok")} (Preview build: no database is connected, so nothing was stored.)`,
      );
      setEmail("");
    } catch {
      setStatus("error");
      setNote(t("cta.err"));
    }
  }

  return (
    <Section id="waitlist" className="border-t border-line">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {t("cta.title")}
        </h2>
        <p className="mt-4 text-pretty text-base leading-relaxed text-ink-muted">
          {t("cta.sub")}
        </p>

        <form
          onSubmit={submit}
          className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <label className="flex-1">
            <span className="sr-only">{t("cta.placeholder")}</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              placeholder={t("cta.placeholder")}
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-xl bg-brand px-6 py-3 text-base font-semibold text-bg transition-colors hover:bg-brand/90 disabled:opacity-60"
          >
            {t("cta.button")}
          </button>
        </form>

        <p
          aria-live="polite"
          className={cn(
            "mt-4 min-h-6 text-sm",
            status === "error" ? "text-sos" : "text-ok",
          )}
        >
          {note}
        </p>

        <p className="mt-2 text-xs text-ink-faint">{t("cta.privacy")}</p>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ page -- */

export function Landing() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <OfflineLadder />
      <DrillSection />
      <HonestLimits />
      <Pricing />
      <Trust />
      <Faq />
      <Waitlist />
    </main>
  );
}
