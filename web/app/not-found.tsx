"use client";

import Link from "next/link";
import { useLang } from "@/components/lang";
import { SiteFooter, SiteHeader } from "@/components/site";

// A lost visitor on a safety site might be in trouble. Point at 112 first.
export default function NotFound() {
  const { t } = useLang();

  return (
    <>
      <SiteHeader />
      <main id="main" className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">404</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {t("notFound.title")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">{t("notFound.body")}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="tel:112"
              className="rounded-xl bg-sos px-6 py-3.5 text-base font-semibold text-white hover:bg-sos/90"
            >
              {t("notFound.call")}
            </a>
            <Link
              href="/"
              className="rounded-xl border border-line bg-surface px-6 py-3.5 text-base font-medium text-ink hover:border-brand/60"
            >
              {t("legal.backHome")}
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
