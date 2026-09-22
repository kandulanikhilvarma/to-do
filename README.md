# Todu

**Help is one tap away.** A personal emergency SOS and safety app for India,
plus its companion website and responder console.

> Todu is not a substitute for emergency services. In an emergency, call 112.
> Offline features are best effort and depend on your device, your network and
> nearby users.

Live preview: https://todu-oxz2ap1bw-kandula.vercel.app

## What is here

| Path | What it is | State |
|---|---|---|
| `web/` | Next.js marketing site + responder console. Deployed to Vercel. | Working, deployed |
| `mobile/` | Expo app: SOS state machine, offline queue, fallback ladder, screens. | Scaffold, typechecks, unit tested |
| `supabase/migrations/` | Postgres + PostGIS schema, RLS policies, responder view. | Written, not yet applied |
| `docs/` | Architecture, offline ladder, permissions, threat model. | Written |

## The ethical constraint

The SOS path -- trigger, location broadcast, contact alert, 112 dial, beacon --
is free forever for everyone. Paid tiers cover convenience and depth only. No
existing safety feature moves behind a paywall.

## Run it

```bash
# Website
cd web && npm install && npm run dev      # http://localhost:3000

# Mobile app
cd mobile && npm install && npx expo start
cd mobile && npm run check                # SOS state machine tests
```

`web` runs without any credentials: the responder console falls back to
clearly labelled demo data. Copy `web/.env.example` to `web/.env.local` and
fill it in to connect a real Supabase project.

## What is deliberately not built

- **Satellite SOS.** No third party can integrate Apple or Google satellite
  SOS, and India direct-to-device rules are unsettled. Use the one in your phone.
- **Silent SMS.** iOS has no programmatic SMS at all; Google Play gates
  `SEND_SMS` to default SMS handlers. The app ships an intent composer instead,
  and the Android manifest deliberately does not declare `SEND_SMS`.
- **Bluetooth mesh relay.** Bridgefy is a licensed SDK and is not wired in.
  `lib/ladder.ts` reports that rung as unavailable rather than faking it.
- **24/7 human dispatch.** Needs a commercial partner.

See `docs/` for the full reasoning, and the site `Honest limits` section for
the user-facing version.

## Deviations from the source specification

- The spec targets **Expo SDK 54**. The current release is **SDK 57**, which is
  what `mobile/` uses. Revisit if a dependency needs the older line.
- The spec names **Unistyles or NativeWind** for the app; the scaffold uses
  plain `StyleSheet` with shared tokens in `mobile/lib/theme.ts`. No styling
  library is locked in yet.

## Licence

Apache-2.0. Chosen over MIT for its explicit patent grant and its warranty and
liability disclaimers, which matter for a safety application.
