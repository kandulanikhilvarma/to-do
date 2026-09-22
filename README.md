# Todu

**Help is one tap away.** A personal emergency SOS and safety app for India,
plus its companion website and responder console.

> Todu is not a substitute for emergency services. In an emergency, call 112.
> Offline features are best effort and depend on your device, your network and
> nearby users.

Live preview: https://todu-kandula.vercel.app

## What is here

| Path | What it is | Verified by |
|---|---|---|
| `web/` | Next.js site in English, Telugu and Hindi, plus the responder console (phone sign-in, live pings, ETA sharing). Deployed to Vercel. | `tsc`, `eslint`, `next build` |
| `mobile/` | Expo SDK 57 app: SOS state machine, cancel and duress PINs, offline queue, fallback ladder, siren, live location trail, protection check, three languages. | `tsc`, `expo lint`, `expo-doctor`, 24 unit tests |
| `supabase/` | Postgres + PostGIS schema, row level security, private Realtime channels. | 15 RLS tests against real Postgres (PGlite) |
| `docs/` | Architecture, offline ladder, permissions, threat model, source spec. | |

## Run it

```bash
cd web      && npm install && npm run dev     # http://localhost:3000
cd mobile   && npm install && npx expo start  # needs a development build
cd mobile   && npm run check                  # state machine, PINs, phone, queue
cd supabase && npm install && npm test        # RLS as owner, responder, stranger
```

Neither app needs credentials to run. Without Supabase the console shows
labelled demo data, and the phone still runs every offline rung: SMS composer,
112 and the siren. Copy `web/.env.example` and `mobile/.env.example` to connect
a real project, then apply `supabase/migrations/` in order.

The mobile app uses native modules (MMKV, background location, secure store),
so it runs in a development build, not Expo Go: `npx eas-cli build --profile development`.

## The ethical constraint

The SOS path -- trigger, location broadcast, contact alert, 112 dial, beacon --
is free forever for everyone. Paid tiers cover convenience and depth only.

## Known gaps

Stated plainly, because a safety app that oversells itself gets someone hurt:

- **No server-side alert fan-out yet.** Nothing on the server sends push, SMS or
  voice to contacts. Contacts are reached by the SMS composer on the phone,
  which is why that rung runs even when the live broadcast succeeds. The next
  piece to build is an Edge Function on `sos_events` insert using Expo Push and
  MSG91 (which needs TRAI DLT registration first).
- **Connection invites have no UI.** The schema enforces consent (the contact
  must accept), but neither app can send or accept an invite yet. Until then
  the responder console only shows events for connections created directly in
  the database.
- **Bluetooth relay is not built.** Bridgefy is a licensed SDK. The ladder
  reports the rung as unavailable; the site marks it as planned.
- **No torch in the beacon.** It needs a mounted camera view. Siren, vibration
  and screen flash are real.
- **Not tested on a device.** The mobile code typechecks, lints and passes unit
  tests, and `expo-doctor` is clean, but it has not run on a phone. The
  Stage 0 gate in `docs/PERMISSIONS.md` (24 hours of background location on
  MIUI and ColorOS) is still open.
- **Legal pages are drafts,** English only, and say so on the page.
- **Satellite SOS and silent SMS** are not buildable by any third party. See
  `docs/OFFLINE.md`.

## Deviations from the source specification

- The spec targets **Expo SDK 54**; `mobile/` uses the current **SDK 57**.
- Styling uses plain `StyleSheet` with shared tokens in `mobile/lib/theme.ts`
  rather than Unistyles or NativeWind.
- `nearby_responders()` was removed: it could not work under RLS. Nearby
  dispatch (Stage 3) needs an explicit, opt-in presence table.

## Licence

Apache-2.0. Chosen over MIT for its explicit patent grant and its warranty and
liability disclaimers, which matter for a safety application.
