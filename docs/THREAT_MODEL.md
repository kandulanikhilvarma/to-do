# Threat model

Todu holds location, emergency contacts and medical data for people who may be
in danger from someone who knows them. The attacker is often not remote.

## Adversaries

| Adversary | Capability | Mitigation |
|---|---|---|
| Abusive partner with device access | Can watch the screen, may know the unlock code | Duress PIN, silent mode, no visible SOS confirmation in covert state |
| Attacker holding the phone | Can force a cancel | Wrong PIN never cancels; duress PIN fakes a cancel and escalates |
| Someone who adds themselves to a circle | Would see live location | Connections require acceptance; `status = 'active'` gates every RLS policy |
| Network attacker | Can observe traffic | TLS everywhere; no personal data in URLs or query strings |
| Compromised responder account | Sees events of its connections only | RLS scopes to active connections; no global read anywhere |
| Us | Could over-collect | Continuous location only during an active event or an explicit timed share |

## The duress path

The single most safety-critical branch. When the duress PIN is entered during
the countdown, the interface must be indistinguishable from a successful
cancel: no toast, no sound, no lingering indicator, no haptic that differs from
the real cancel. The `covert` flag lives in the state machine context so the UI
layer can render the lie while the ladder keeps running. Covered by
`mobile/lib/sos-machine.test.ts`.

## Data handling

- Medical data is minimised to what a first responder acts on: blood group,
  allergies, medications. Nothing diagnostic.
- Location trails have a retention limit and are deleted on account deletion.
- `SUPABASE_SERVICE_ROLE_KEY` is server side only. It must never be exposed
  through a `NEXT_PUBLIC_` variable or bundled into the mobile app.
- Breach handling: notify affected individuals and the Data Protection Board,
  and report qualifying cyber incidents to CERT-In within the required window.

## Known weaknesses

- **Bluetooth relay, when enabled, leaks presence.** A relayed alert reveals
  that a Todu user is nearby. Accepted: the alternative is no offline path.
- **Manufacturer battery managers can silently disarm the app.** Detected by
  the health dashboard, not preventable in code. See `PERMISSIONS.md`.
- **A responder console session on a shared computer** exposes an active
  event. Sessions should be short lived; the console is `noindex` and excluded
  in `robots.ts`.
- **This repository is public.** That is deliberate, so the SOS path is
  auditable. It also means a threat actor can read the escalation logic, which
  is the accepted trade for verifiable trust.
