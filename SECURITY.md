# Security policy

Todu handles location, emergency contact and medical data for people who may be
in danger. We take reports seriously and will not take legal action against
good-faith research.

## Reporting a vulnerability

Open a private security advisory through this repository Security tab. Please
do not open a public issue for an unpatched vulnerability.

Include: what you found, how to reproduce it, and what an attacker could do
with it. If you have a suggested fix, even better.

## What we consider high severity

- Any read of an SOS event, location trail or medical profile by someone who is
  not the owner or one of the owner active connections.
- Anything that stops an SOS from being delivered, or that cancels one without
  the correct PIN.
- Anything that reveals the duress state to an observer looking at the screen.
- Exposure of the Supabase service role key.

## Response

We aim to acknowledge within 72 hours. Fixes for the categories above ship
through a full store build with device testing, never a JS-only OTA update.

## Scope

In scope: this repository, the deployed website and responder console, and the
Supabase schema and policies here.

Out of scope: the 112 ERSS service, Android Emergency Location Service, and
anything belonging to Apple, Google or a mobile network operator.
