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
cancel. In covert mode the app therefore:

- shows the ordinary "Cancelled" screen, then an ordinary armed home screen;
- never opens the SMS composer, never sounds the siren, never flashes;
- never starts the Android foreground service, whose persistent notification
  would reveal the alert, so location streams only while the app is open;
- never raises a permission prompt.

The live broadcast still goes out if there is data and a signed-in session.
The user ends a covert alert with a hidden gesture: a three second press on
the SOS screen title, then the cancel PIN. Covered by
`mobile/lib/sos-machine.test.ts`.

Once a cancel PIN is set, only that PIN stands a countdown down. A missing or
wrong PIN keeps counting. This closed a hole where anyone holding the phone
could silence an alert by pressing Cancel.

## Enforced in the database

Tested as owner, invited responder and stranger in `supabase/tests/rls.test.mjs`:

- A connection is created as pending; only the invited contact can accept.
  Neither side can repoint `owner_id` or `contact_id`.
- A responder can acknowledge only as themselves (`responder_id = auth.uid()`).
- Only the owner can add pings or evidence, and only the owner can mark an
  event resolved. A compromised responder account cannot stand an alert down.
- Live pings travel on private Realtime channels `sos:<event id>`: the owner
  sends, active connections read, nobody else does.

## Bluetooth relay

A relay node carries someone else SOS to the server. Two risks, two answers:

- **Forgery.** Payloads are signed with HMAC-SHA256 using a per-user secret
  issued while online and kept in the keystore. `sos-relay` rejects anything
  that does not verify, so a relay node cannot raise an alert in another name.
- **Duplication and replay.** Every copy carries the phone generated
  `client_id`, so all relayed copies and the phone own upload become one event;
  payloads older than 24 hours are refused and a resolved event is never reopened.

Accepted weakness: the payload is signed, not encrypted. Nearby Todu phones in
Bluetooth range can read the user id and coordinates of an SOS they relay.

## Invites

`invite_contact` answers "sent" whether or not a number belongs to a Todu user,
and pending connections look identical to invites for unregistered numbers.
Otherwise the invite flow would tell a stalker whether their target uses a
safety app.

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
