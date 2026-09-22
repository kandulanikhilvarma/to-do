# Contributing

## Before you start

Read `CLAUDE.md`. It holds the five non-negotiables, the most important of
which is that the SOS path is never gated and a transport never claims a
delivery it did not make.

## Setup

```bash
cd web    && npm install
cd mobile && npm install
```

`web` runs with no credentials; the responder console falls back to labelled
demo data.

## Before opening a pull request

```bash
cd web    && npx tsc --noEmit && npm run lint && npm run build
cd mobile && npx tsc --noEmit && npm run check
```

All four must pass. If you touched `mobile/lib/sos-machine.ts`, add a case to
`sos-machine.test.ts` first and watch it fail before you make it pass. That file
is the only logic deciding whether help is summoned.

## Commits

Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
Subject under 60 characters, in the imperative, saying why rather than what.

## Things that will be sent back

- A user-facing string that is not an i18n key.
- A new locale string added to `en` without `te` and `hi` (it will not compile
  anyway, which is the point).
- A stub that returns success for a transport that is not wired in.
- Colour used as the only signal for a state.
- Safety-critical logic shipped as a JS-only OTA update.
- `SEND_SMS` added to the Android manifest.

## Reporting a vulnerability

Do not open a public issue. See `SECURITY.md`.
