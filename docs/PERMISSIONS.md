# Permissions

"All permissions granted easily, no blocks" is not achievable and would get the
app rejected. Android and iOS deliberately gate exactly what this app wants.
The winning strategy is staged, primed requests plus an OEM autostart wizard.

## Order of asking

1. Notifications
2. Location while using the app
3. Background location, primed with a screen explaining why first
4. Microphone and camera, only at first evidence capture
5. Battery optimisation exemption

Never a wall of prompts on first launch. Each request is preceded by a screen
that states the consequence in one sentence, for example: "To summon help when
you cannot speak, Todu needs to see your location even when the app is closed."

## Store review realities

| Permission | Reality |
|---|---|
| `ACCESS_BACKGROUND_LOCATION` | Separate prompt; Play requires a declaration form **and a video demo** |
| Typed foreground services | Must be declared on Android 14+ |
| `SEND_SMS` | Gated to default SMS handlers. **Not declared.** |
| `CALL_PHONE` | Fine for dialling |
| iOS Critical Alerts | Needs an Apple entitlement, reviewed manually, frequently bounced. Apply early. |

## The OEM problem

Xiaomi, Realme, Oppo and Vivo dominate India and kill background apps
aggressively, through per-OEM autostart toggles that have no API and no
documentation. For an app whose background service must survive, this is the
single largest engineering risk -- larger than any code in this repository.

Mitigations, in order of value:

1. A setup wizard that detects the manufacturer and deep-links into that
   vendor autostart and battery screens, with screenshots.
2. A protection health dashboard that re-checks permissions and autostart and
   nags when an OEM has silently revoked them.
3. Degrading loudly: if background location cannot survive, the app must say so
   rather than presenting itself as armed.

**Stage 0 gate:** background location plus a typed foreground service survives
24 hours on MIUI and ColorOS with the wizard applied. If it cannot, the premise
of the product is at risk and that needs to be known before feature work.
