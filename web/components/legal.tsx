"use client";

import Link from "next/link";
import { useLang } from "@/components/lang";
import { SiteFooter, SiteHeader } from "@/components/site";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  const { t } = useLang();

  return (
    <>
      <SiteHeader />
      <main id="main" className="px-4 py-16 sm:px-6 sm:py-20">
        <article className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-ink-faint">
            {t("legal.updated")}: {updated}
          </p>

          <p className="mt-6 rounded-xl border border-warn/30 bg-warn/5 p-4 text-sm leading-relaxed text-ink-muted">
            This document is a working draft published for transparency while
            Todu is in development. It has not yet been reviewed by counsel and
            is not a binding agreement. Do not rely on it for legal advice.
          </p>

          <div className="mt-10 flex flex-col gap-8">{children}</div>

          <Link
            href="/"
            className="mt-12 inline-block rounded-lg border border-line bg-surface px-4 py-2 text-sm text-ink hover:border-brand/60"
          >
            {t("legal.backHome")}
          </Link>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

export function Clause({
  id,
  heading,
  children,
}: {
  id?: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-xl font-semibold tracking-tight text-ink">
        {heading}
      </h2>
      <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-ink-muted">
        {children}
      </div>
    </section>
  );
}
