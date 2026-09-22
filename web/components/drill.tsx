"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "@/components/lang";
import { cn } from "@/components/site";

const HOLD_MS = 700;
const COUNTDOWN_SECONDS = 5;

type Phase = "idle" | "holding" | "counting" | "sent" | "cancelled";

/**
 * A rehearsal of the real trigger, running entirely in the browser.
 *
 * Mirrors the app state machine (spec S8): Armed -> Triggered -> Countdown ->
 * FalseAlarm | Broadcasting. Hold-to-arm prevents pocket triggers; the
 * countdown gives a large, forgiving cancel target for shaking hands.
 */
export function SosDrill() {
  const { t } = useLang();
  const [phase, setPhase] = useState<Phase>("idle");
  const [remaining, setRemaining] = useState(COUNTDOWN_SECONDS);

  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (tick.current) clearInterval(tick.current);
    holdTimer.current = null;
    tick.current = null;
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const startCountdown = useCallback(() => {
    setPhase("counting");
    setRemaining(COUNTDOWN_SECONDS);
    tick.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearTimers();
          setPhase("sent");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }, [clearTimers]);

  const beginHold = useCallback(() => {
    if (phase === "counting" || phase === "sent") return;
    setPhase("holding");
    holdTimer.current = setTimeout(startCountdown, HOLD_MS);
  }, [phase, startCountdown]);

  const endHold = useCallback(() => {
    // Releasing before the hold completes simply disarms. Nothing was sent,
    // so this is not a "cancelled" alert -- it never became one.
    if (phase !== "holding") return;
    clearTimers();
    setPhase("idle");
  }, [phase, clearTimers]);

  const cancel = useCallback(() => {
    clearTimers();
    setPhase("cancelled");
  }, [clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    setRemaining(COUNTDOWN_SECONDS);
    setPhase("idle");
  }, [clearTimers]);

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex size-56 items-center justify-center sm:size-64">
          {/* Expanding rings only while genuinely broadcasting. */}
          {phase === "sent" && (
            <>
              <span className="todu-ring absolute size-40 rounded-full bg-sos/30 sm:size-48" />
              <span
                className="todu-ring absolute size-40 rounded-full bg-sos/20 sm:size-48"
                style={{ animationDelay: "0.6s" }}
              />
            </>
          )}

          {phase === "counting" ? (
            <div
              className="relative flex size-40 flex-col items-center justify-center rounded-full border-4 border-sos bg-sos/15 sm:size-48"
              role="timer"
              aria-live="assertive"
            >
              <span className="text-xs font-medium uppercase tracking-wider text-sos">
                {t("drill.counting")}
              </span>
              <span className="text-6xl font-semibold tabular-nums text-ink">
                {remaining}
              </span>
            </div>
          ) : phase === "sent" ? (
            <div className="relative flex size-40 flex-col items-center justify-center rounded-full bg-sos text-center sm:size-48">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-9 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4.5 12a7.5 7.5 0 0 1 7.5-7.5M2 12a10 10 0 0 1 10-10" />
                <path d="M19.5 12a7.5 7.5 0 0 0-7.5-7.5M22 12A10 10 0 0 0 12 2" />
                <circle cx="12" cy="15" r="2.5" />
              </svg>
              <span className="mt-2 text-sm font-semibold uppercase tracking-wider text-white">
                {t("drill.sent")}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onPointerDown={beginHold}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              onPointerCancel={endHold}
              onKeyDown={(e) => {
                if ((e.key === " " || e.key === "Enter") && !e.repeat)
                  beginHold();
              }}
              onKeyUp={(e) => {
                if (e.key === " " || e.key === "Enter") endHold();
              }}
              className={cn(
                "relative flex size-40 touch-none select-none flex-col items-center justify-center rounded-full border-4 text-center transition-colors sm:size-48",
                phase === "holding"
                  ? "border-sos bg-sos/20"
                  : "border-sos/50 bg-sos/10 hover:border-sos",
              )}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-8 text-sos"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
              >
                <path d="M12 2.5 4.5 5.8v5.6c0 4.6 3.1 8.3 7.5 10.1 4.4-1.8 7.5-5.5 7.5-10.1V5.8Z" />
                <path d="M12 8.5v4" />
                <path d="M12 15.5h.01" />
              </svg>
              <span className="mt-2 max-w-32 text-sm font-semibold leading-snug text-ink">
                {phase === "holding" ? t("drill.holding") : t("drill.arm")}
              </span>
              {phase === "holding" && (
                <span className="todu-pulse absolute inset-0 rounded-full border-4 border-sos" />
              )}
            </button>
          )}
        </div>

        <div className="min-h-24 w-full max-w-sm text-center">
          {phase === "counting" && (
            <button
              type="button"
              onClick={cancel}
              className="w-full rounded-xl border border-line bg-surface-2 px-6 py-4 text-base font-semibold text-ink transition-colors hover:border-ink-faint"
            >
              {t("drill.cancel")}
            </button>
          )}

          {phase === "sent" && (
            <div>
              <p className="text-sm leading-relaxed text-ink-muted">
                {t("drill.sentBody")}
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-4 rounded-lg border border-line bg-surface-2 px-4 py-2 text-sm font-medium text-ink hover:border-brand/60"
              >
                {t("drill.reset")}
              </button>
            </div>
          )}

          {phase === "cancelled" && (
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-medium text-ok">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
                {t("drill.cancelled")}
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-4 block w-full rounded-lg border border-line bg-surface-2 px-4 py-2 text-sm font-medium text-ink hover:border-brand/60"
              >
                {t("drill.reset")}
              </button>
            </div>
          )}

          {(phase === "idle" || phase === "holding") && (
            <p className="text-sm text-ink-faint">{t("drill.demoNote")}</p>
          )}
        </div>

        {/* Screen-reader narration for a state change that is otherwise visual. */}
        <p aria-live="polite" className="sr-only">
          {phase === "sent"
            ? t("drill.sent")
            : phase === "cancelled"
              ? t("drill.cancelled")
              : ""}
        </p>
      </div>
    </div>
  );
}
