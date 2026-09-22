# Todu - agent rules

Personal emergency SOS app (Expo) + companion website (Next.js on Vercel).
Read `docs/ARCHITECTURE.md` before changing anything structural.

## Non-negotiables

1. **Never gate the SOS path.** Trigger, location broadcast, contact alert, 112
   dial and beacon are free for everyone, forever. No paywall, no login wall,
   no feature flag that can switch them off.
2. **Never over-promise a transport.** Every rung of the fallback ladder
   reports whether it actually delivered. No stub may return success. If a
   capability is not wired in, say so in the returned detail string.
3. **Never OTA safety logic.** JS-only OTA updates are for cosmetic and content
   fixes. Anything touching the state machine, the ladder, the queue or
   permissions ships through a full store build with device testing.
4. **Never declare `SEND_SMS`** in the Android manifest. Google Play gates it to
   default SMS handlers; declaring it risks rejection. Use the intent composer.
5. **Never commit secrets.** `SUPABASE_SERVICE_ROLE_KEY` is server only and must
   never reach a `NEXT_PUBLIC_` variable or the mobile bundle.

## Stack

- `web/`: Next.js 16 App Router, React 19, Tailwind v4, TypeScript strict.
- `mobile/`: Expo SDK 57, expo-router, React Native 0.86, TypeScript strict.
- Backend: Supabase (Postgres + PostGIS + Realtime + RLS).
- Live location rides Realtime **Broadcast**, never `postgres_changes`.

## Conventions

- TypeScript strict everywhere. No `any`; prefer a narrow type or `unknown`.
- i18n: every user-facing string is a key in `web/lib/i18n.ts`. `en` is the
  source of truth and `te`/`hi` are typed `Dict`, so a missing translation is a
  compile error. Never hardcode a visible string.
- Colour: deep red (`--color-sos`) is reserved for the live SOS state only. The
  resting app is teal so opening it does not induce panic. Never signal state
  with colour alone; pair it with an icon or a word.
- Time in the responder read model is carried as integer minute offsets, not
  timestamps, so server and client render identically.
- Accessibility is not optional here: screen reader labels on every control,
  large hit areas, works without sound.

## Verify before claiming done

```bash
cd web    && npx tsc --noEmit && npm run build
cd mobile && npx tsc --noEmit && npm run check
```

`mobile/lib/sos-machine.ts` is pure and must stay that way; it is the only
logic deciding whether help is summoned, and it is covered by
`mobile/lib/sos-machine.test.ts`. Add a case there before changing it.

## Honesty rule

This project is judged on trust. If something cannot be built (satellite SOS,
silent iOS SMS, human dispatch), the answer is to document the limit in
`docs/` and surface it in the site `Honest limits` section -- never to ship a
convincing-looking stub.
