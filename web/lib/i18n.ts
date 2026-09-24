// Telugu + Hindi + English from launch (spec S9: tier-2 Telugu-city focus).
// `en` is the source of truth. Every other locale is typed as `Dict`, so a
// missing translation is a compile error rather than a silent English fallback.

export const locales = ["en", "te", "hi"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  te: "తెలుగు",
  hi: "हिन्दी",
};

export const en = {
  "brand.name": "Todu",
  "brand.tagline": "Help is one tap away.",

  "nav.how": "How it works",
  "nav.offline": "Offline",
  "nav.limits": "Honest limits",
  "nav.pricing": "Pricing",
  "nav.dashboard": "Responder view",
  "nav.faq": "FAQ",
  "nav.language": "Language",
  "nav.menu": "Menu",
  "theme.label": "Theme",
  "theme.system": "Match device",
  "theme.light": "Light",
  "theme.dark": "Dark",

  "hero.badge": "Built for India · works with 112",
  "hero.title": "One tap. Your people know where you are.",
  "hero.sub":
    "Todu turns a single tap into a lifeline — live location to the people you trust, a direct line to 112, and a fallback ladder that keeps working when the network does not.",
  "hero.ctaPrimary": "Try the SOS drill",
  "hero.ctaSecondary": "Read what Todu cannot do",
  "hero.note": "The SOS path is free forever. We never charge to save a life.",

  "stat.ladder": "Fallback layers when offline",
  "stat.free": "Cost of the SOS path, always",
  "stat.dial": "Direct dial, never blocked",
  "stat.langs": "Languages at launch",

  "how.eyebrow": "How it works",
  "how.title": "Designed for the worst thirty seconds of your life",
  "how.sub":
    "No reading required. No hunting for a button. It works one-handed, in the dark, with shaking hands, and while somebody is watching you.",
  "how.s1.t": "Trigger without looking",
  "how.s1.d":
    "In-app button, home screen widget, Android quick settings tile, shake, or the power button press India already taught you in 2017.",
  "how.s2.t": "A grace window, not a hair trigger",
  "how.s2.d":
    "A countdown with a large cancel target stops false alarms. Enter your duress PIN instead and Todu fakes a cancel while silently escalating.",
  "how.s3.t": "Everyone who matters, at once",
  "how.s3.d":
    "Live location and a breadcrumb trail stream to your circle. Push alerts and SMS go out together, so a missed notification is not a missed emergency.",
  "how.s4.t": "Help arrives, and you can see it",
  "how.s4.d":
    "Responders acknowledge, share an ETA, and coordinate, so three people do not drive to the same place while a fourth assumes someone else went.",

  "offline.eyebrow": "The offline core",
  "offline.title": "When there is no signal, Todu steps down a ladder",
  "offline.sub":
    "Most safety apps quietly fail without data. Todu degrades on purpose, in a fixed order, and tells you exactly which rung it reached.",
  "offline.l1.t": "Mobile data or Wi-Fi",
  "offline.l1.d":
    "Realtime location broadcast to your circle, push notifications, and evidence upload.",
  "offline.l1.tag": "Best case",
  "offline.l2.t": "SMS to your contacts",
  "offline.l2.d":
    "A pre-filled message with your coordinates, ready to send. One tap, because neither app store allows a truly silent SMS.",
  "offline.l2.tag": "One tap",
  "offline.l3.t": "Direct dial 112",
  "offline.l3.d":
    "The single most reliable path in India. On Android, Emergency Location Service sends your position at the operating system level even with location switched off.",
  "offline.l3.tag": "Always works",
  "offline.l4.t": "Bluetooth relay to nearby phones",
  "offline.l4.d":
    "Your alert hops phone to phone across roughly 100 m per hop. Any device that reaches the internet flushes it to your circle. Best effort, not a guarantee.",
  "offline.l4.tag": "In testing",
  "offline.l5.t": "Siren, torch, screen flash",
  "offline.l5.d":
    "When every radio has failed, be found by the humans who can already see and hear you.",
  "offline.l5.tag": "Last resort",
  "offline.queue":
    "Everything you trigger offline is queued on the device and flushed the instant any connection returns.",

  "limits.eyebrow": "Honest limits",
  "limits.title": "What Todu cannot do",
  "limits.sub":
    "A safety app that oversells itself gets someone hurt. Here is the list we refuse to bury in a footnote.",
  "limits.l1.t": "No satellite SOS",
  "limits.l1.d":
    "No third party can integrate Apple or Google satellite SOS, and the rules for direct-to-device satellite in India are still unsettled. Use the satellite SOS built into your phone. It is separate from Todu.",
  "limits.l2.t": "iPhone cannot send SMS silently",
  "limits.l2.d":
    "iOS has no programmatic SMS at all. On iPhone the offline SMS rung always needs your tap. Android is the stronger platform for this app, and ships first.",
  "limits.l3.t": "We are not a dispatch centre",
  "limits.l3.d":
    "Todu alerts your people and helps you reach 112. We do not employ round-the-clock human dispatchers. Todu is not a substitute for calling emergency services.",
  "limits.l4.t": "Your phone may fight us",
  "limits.l4.d":
    "Xiaomi, Realme, Oppo and Vivo kill background apps aggressively. Todu ships a setup wizard for your exact phone, and a health dashboard that nags you if protection silently lapses.",
  "limits.l5.t": "Bluetooth relay is best effort",
  "limits.l5.d":
    "It is built but not yet field tested. It needs another Todu user within about 100 m, so in an empty field at 3am it will not save you. The siren and 112 will still be there.",
  "limits.l6.t": "Permissions cannot be frictionless",
  "limits.l6.d":
    "Android and iOS deliberately gate background location and microphone access. We ask at the moment each one earns its keep, and explain why first.",

  "drill.eyebrow": "Try it",
  "drill.title": "Run the SOS drill",
  "drill.sub":
    "Onboarding makes you rehearse once, so the first time you use Todu for real is not the first time you have used Todu. Nothing here leaves your browser.",
  "drill.arm": "Hold to send SOS",
  "drill.holding": "Keep holding",
  "drill.counting": "Sending in",
  "drill.cancel": "Cancel",
  "drill.sent": "Broadcasting",
  "drill.sentBody":
    "In the real app your circle now has your live location, 112 is one tap away, and the offline ladder is already running.",
  "drill.reset": "Run it again",
  "drill.cancelled": "Cancelled. No alert sent.",
  "drill.demoNote": "Demo only. This page cannot contact anyone.",

  "pricing.eyebrow": "Pricing",
  "pricing.title": "The life-saving path is free. Forever.",
  "pricing.sub":
    "We charge for convenience and depth, never for safety. If a feature is the difference between help arriving and not, it is in the free tier.",
  "pricing.free.name": "Todu",
  "pricing.free.price": "Free",
  "pricing.free.period": "always",
  "pricing.free.f1": "One-tap SOS, countdown and duress PIN",
  "pricing.free.f2": "Live location to your circle during an event",
  "pricing.free.f3": "Direct dial 112 and SMS fallback",
  "pricing.free.f4": "Siren, torch and screen beacon",
  "pricing.free.f5": "Medical and emergency profile",
  "pricing.free.f6": "Crash detection",
  "pricing.free.cta": "Get Todu",
  "pricing.plus.name": "Todu Plus",
  "pricing.plus.price": "₹99–199",
  "pricing.plus.period": "per month",
  "pricing.plus.f1": "Everything in Todu, unchanged",
  "pricing.plus.f2": "Extended location history and breadcrumb replay",
  "pricing.plus.f3": "Unlimited connections and circles",
  "pricing.plus.f4": "Larger evidence storage",
  "pricing.plus.f5": "Priority alert routing",
  "pricing.plus.f6": "Round-the-clock human dispatch, once a partner is live",
  "pricing.plus.cta": "Join the waitlist",
  "pricing.badge": "Planned",
  "pricing.b2b.t": "Schools, fleets and employers",
  "pricing.b2b.d":
    "Student safety, duty of care, cab and fleet operators, and senior care. These programmes fund the free consumer tier.",
  "pricing.b2b.cta": "Talk to us",

  "trust.eyebrow": "Trust",
  "trust.title": "You should not have to take our word for it",
  "trust.sub":
    "A new safety app has a credibility problem, and it deserves one. Here is how we intend to earn trust instead of claiming it.",
  "trust.t1.t": "Open source core",
  "trust.t1.d":
    "The SOS path is auditable. Apache-2.0, public repository, public security policy.",
  "trust.t2.t": "Published uptime",
  "trust.t2.d":
    "Our alerting pipeline is monitored like an on-call production system, and the numbers are public.",
  "trust.t3.t": "DPDP and GDPR by design",
  "trust.t3.d":
    "Clear standalone consent, data minimisation, real erasure. Location, audio and medical data are treated as what they are.",
  "trust.t4.t": "Built around 112, not instead of it",
  "trust.t4.d":
    "India already has an emergency backbone. Todu routes you into it rather than pretending to replace it.",

  "faq.eyebrow": "FAQ",
  "faq.title": "Questions worth asking",
  "faq.q1": "Does Todu work with no internet?",
  "faq.a1":
    "Partly, and we are specific about which parts. Dialling 112 and the siren always work. The SMS rung needs one tap. The Bluetooth relay needs another Todu user nearby. Live location needs data. See the ladder above.",
  "faq.q2": "Can someone see my location all the time?",
  "faq.a2":
    "No. Continuous location streams only while an SOS event is active, or while you explicitly start a timed share. Outside that, your circle sees nothing.",
  "faq.q3": "What if I trigger it by accident?",
  "faq.a3":
    "The countdown exists for exactly that. Cancel before it elapses and nothing is sent. If you are being watched, entering your duress PIN shows a convincing cancel while quietly escalating.",
  "faq.q4": "Why does Android get features iPhone does not?",
  "faq.a4":
    "Because iOS forbids programmatic SMS and heavily restricts background Bluetooth. We would rather ship an honest Android-first app than pretend the platforms are equivalent.",
  "faq.q5": "Is my medical data safe?",
  "faq.a5":
    "It is stored encrypted, readable only by you and the connections you approve, and is covered by our DPDP and GDPR commitments. You can export or erase it at any time.",
  "faq.q6": "Is Todu a replacement for calling 112?",
  "faq.a6":
    "No, and it never will be. Todu is not a substitute for emergency services. Every path in the app ends by making it easier for you, or someone near you, to reach 112.",

  "cta.title": "Rehearse it once. Hope you never need it.",
  "cta.sub":
    "Todu is in active development, Android first. Join the list and we will tell you when the beta opens in your city.",
  "cta.placeholder": "Your email address",
  "cta.button": "Notify me",
  "cta.ok": "You are on the list. We will only email about the beta.",
  "cta.err": "That email does not look right.",
  "cta.privacy": "No spam, no resale, unsubscribe in one click.",

  "footer.disclaimer":
    "Todu is not a substitute for emergency services. In an emergency, call 112. Offline features are best effort and depend on your device, your network and nearby users.",
  "footer.product": "Product",
  "footer.company": "Company",
  "footer.legal": "Legal",
  "footer.privacy": "Privacy",
  "footer.terms": "Terms",
  "footer.security": "Security",
  "footer.rights": "All rights reserved.",
  "footer.status": "Status",

  "dash.title": "Responder console",
  "dash.sub": "Live view of active SOS events in your circles.",
  "dash.demo": "Demo data",
  "dash.live": "Live",
  "dash.demoBody":
    "No Supabase credentials are configured, so this console is showing generated sample events. Set the environment variables to connect a real project.",
  "dash.active": "Active",
  "dash.acknowledged": "Acknowledged",
  "dash.enroute": "En route",
  "dash.resolved": "Resolved",
  "dash.none": "No active events. That is the good outcome.",
  "dash.select": "Select an event to see its timeline.",
  "dash.ack": "I am on my way",
  "dash.acked": "ETA shared",
  "dash.resolve": "Mark resolved",
  "dash.timeline": "Timeline",
  "dash.medical": "Medical profile",
  "dash.blood": "Blood group",
  "dash.allergies": "Allergies",
  "dash.meds": "Medications",
  "dash.battery": "Battery",
  "dash.accuracy": "Accuracy",
  "dash.lastPing": "Last ping",
  "dash.transport": "Reached via",
  "dash.call": "Call 112",
  "dash.responders": "Responders",
  "dash.openMap": "Open in maps",
  "dash.back": "Back to site",

  "legal.updated": "Last updated",
  "legal.backHome": "Back to home",
  "hero.device.active": "SOS active",
  "hero.device.ladder": "Escalation ladder",
  "hero.device.sent": "sent",
  "hero.device.noSignal": "no signal",
  "hero.device.ready": "ready",
  "hero.device.on": "on",
  "hero.device.planned": "testing",
  "a11y.skip": "Skip to content",
  "a11y.home": "Todu home",
  "cta.previewNote": "Preview build: no database is connected, so nothing was stored.",
  "legal.draft": "This document is a working draft published for transparency while Todu is in development. It has not yet been reviewed by counsel and is not a binding agreement. Do not rely on it for legal advice.",
  "legal.englishOnly": "The document below is available in English only for now.",
  "dash.loading": "Loading events",
  "dash.noneYet": "None yet",
  "dash.noEntries": "No entries yet",
  "time.now": "just now",
  "time.min": "{n} min ago",
  "time.hr": "{n} hr ago",
  "dash.eta": "ETA {n} min",
  "status.notified": "Notified",
  "status.acknowledged": "Acknowledged",
  "status.enroute": "On the way",
  "status.arrived": "Arrived",
  "transport.realtime": "Realtime (data)",
  "transport.sms": "SMS fallback",
  "transport.ble": "Bluetooth relay",
  "transport.voice": "Voice blast",
  "transport.dial112": "112 dial",
  "dash.arrived": "I have arrived",
  "dash.arrivedDone": "Arrival shared",
  "dash.etaLabel": "Arriving in",
  "dash.minutes": "{n} min",
  "dash.signInTitle": "Sign in to see your circle",
  "dash.signInBody": "Use the phone number your contact added to their Todu circle. You only see events from people who invited you and whose invitation you accepted.",
  "dash.phone": "Mobile number",
  "dash.sendCode": "Send code",
  "dash.code": "Code from SMS",
  "dash.verify": "Verify",
  "dash.signOut": "Sign out",
  "dash.signedInAs": "Signed in as {phone}",
  "dash.authError": "That did not work: {msg}",
  "dash.pingLabel": "Location ping, accuracy {n} m",
  "dash.liveUpdate": "Live location received",
  "notFound.title": "This page does not exist",
  "notFound.body": "If you are in danger, do not look for Todu here. Call 112 now.",
  "notFound.call": "Call 112",
  "dash.you": "You",
  "dash.noValue": "Not recorded",
  "dash.invites": "Invitations",
  "dash.inviteBody": "{name} wants you as an emergency responder.",
  "dash.accept": "Accept",
  "dash.decline": "Decline",
  "dash.respondingFor": "You respond for",
  "dash.respondingNone": "Nobody yet. Ask them to invite this phone number from the Todu app.",
} as const;

export type Key = keyof typeof en;
export type Dict = Record<Key, string>;

export const te: Dict = {
  "brand.name": "Todu",
  "brand.tagline": "సహాయం ఒక్క ట్యాప్ దూరంలో.",

  "nav.how": "ఎలా పనిచేస్తుంది",
  "nav.offline": "ఆఫ్‌లైన్",
  "nav.limits": "మా పరిమితులు",
  "nav.pricing": "ధరలు",
  "nav.dashboard": "స్పందించేవారి వ్యూ",
  "nav.faq": "ప్రశ్నలు",
  "nav.language": "భాష",
  "nav.menu": "మెనూ",
  "theme.label": "థీమ్",
  "theme.system": "పరికరం లాగే",
  "theme.light": "లైట్",
  "theme.dark": "డార్క్",

  "hero.badge": "భారతదేశం కోసం · 112తో కలిసి పనిచేస్తుంది",
  "hero.title": "ఒక్క ట్యాప్. మీరు ఎక్కడ ఉన్నారో మీవాళ్లకు తెలుస్తుంది.",
  "hero.sub":
    "Todu ఒక్క ట్యాప్‌ను ప్రాణరక్షణగా మారుస్తుంది — మీరు నమ్మేవారికి ప్రత్యక్ష లొకేషన్, 112కి నేరుగా కాల్, నెట్‌వర్క్ లేనప్పుడు కూడా పనిచేసే ఫాల్‌బ్యాక్ నిచ్చెన.",
  "hero.ctaPrimary": "SOS డ్రిల్ ప్రయత్నించండి",
  "hero.ctaSecondary": "Todu ఏమి చేయలేదో చదవండి",
  "hero.note":
    "SOS మార్గం ఎప్పటికీ ఉచితం. ప్రాణం కాపాడటానికి మేము ఎప్పుడూ డబ్బు తీసుకోము.",

  "stat.ladder": "ఆఫ్‌లైన్‌లో ఫాల్‌బ్యాక్ దశలు",
  "stat.free": "SOS మార్గం ఖర్చు, ఎప్పుడూ",
  "stat.dial": "నేరుగా డయల్, ఎప్పుడూ ఆగదు",
  "stat.langs": "ప్రారంభంలోనే భాషలు",

  "how.eyebrow": "ఎలా పనిచేస్తుంది",
  "how.title": "మీ జీవితంలోని అత్యంత కఠినమైన ముప్పై సెకన్ల కోసం రూపొందించబడింది",
  "how.sub":
    "చదవాల్సిన అవసరం లేదు. బటన్ వెతకాల్సిన అవసరం లేదు. ఒక్క చేత్తో, చీకట్లో, వణుకుతున్న చేతులతో, ఎవరైనా మిమ్మల్ని చూస్తున్నప్పుడు కూడా పనిచేస్తుంది.",
  "how.s1.t": "చూడకుండానే ట్రిగ్గర్ చేయండి",
  "how.s1.d":
    "యాప్‌లోని బటన్, హోమ్ స్క్రీన్ విడ్జెట్, ఆండ్రాయిడ్ క్విక్ సెట్టింగ్స్ టైల్, షేక్, లేదా 2017లోనే భారతదేశం మీకు నేర్పిన పవర్ బటన్ నొక్కుడు.",
  "how.s2.t": "తొందరపాటు కాదు, ఆలోచించే సమయం",
  "how.s2.d":
    "పెద్ద క్యాన్సిల్ బటన్‌తో కౌంట్‌డౌన్ తప్పుడు అలారాలను ఆపుతుంది. బదులుగా మీ డ్యురెస్ పిన్ నమోదు చేస్తే, Todu బయటకు రద్దు చేసినట్టు చూపిస్తూ లోపల నిశ్శబ్దంగా సహాయం పంపుతుంది.",
  "how.s3.t": "ముఖ్యమైన వారందరికీ, ఒకేసారి",
  "how.s3.d":
    "ప్రత్యక్ష లొకేషన్ మరియు మీ మార్గం మీ సర్కిల్‌కు చేరుతుంది. పుష్ హెచ్చరికలు, SMS కలిసి వెళ్తాయి — ఒక నోటిఫికేషన్ మిస్ అయితే అత్యవసరం మిస్ కాకూడదు.",
  "how.s4.t": "సహాయం వస్తుంది, మీరు చూడగలరు",
  "how.s4.d":
    "స్పందించేవారు అంగీకరించి, ఎప్పుడు చేరతారో తెలిపి, సమన్వయం చేసుకుంటారు — ముగ్గురు ఒకే చోటికి వెళ్లి, నాలుగో వ్యక్తి ఇంకెవరో వెళ్లారనుకోకుండా.",

  "offline.eyebrow": "ఆఫ్‌లైన్ కేంద్రం",
  "offline.title": "సిగ్నల్ లేనప్పుడు, Todu ఒక్కో మెట్టు దిగుతుంది",
  "offline.sub":
    "చాలా సేఫ్టీ యాప్‌లు డేటా లేకపోతే నిశ్శబ్దంగా విఫలమవుతాయి. Todu ఉద్దేశపూర్వకంగా, నిర్ణీత క్రమంలో దిగుతుంది, ఏ మెట్టు వరకు చేరిందో మీకు స్పష్టంగా చెబుతుంది.",
  "offline.l1.t": "మొబైల్ డేటా లేదా Wi-Fi",
  "offline.l1.d":
    "మీ సర్కిల్‌కు ప్రత్యక్ష లొకేషన్ ప్రసారం, పుష్ నోటిఫికేషన్లు, సాక్ష్యం అప్‌లోడ్.",
  "offline.l1.tag": "ఉత్తమ స్థితి",
  "offline.l2.t": "మీ కాంటాక్ట్‌లకు SMS",
  "offline.l2.d":
    "మీ కోఆర్డినేట్‌లతో ముందే సిద్ధమైన సందేశం, పంపడానికి రెడీ. ఒక్క ట్యాప్ అవసరం — ఎందుకంటే పూర్తిగా నిశ్శబ్ద SMSను ఏ యాప్ స్టోర్ అనుమతించదు.",
  "offline.l2.tag": "ఒక్క ట్యాప్",
  "offline.l3.t": "112కి నేరుగా డయల్",
  "offline.l3.d":
    "భారతదేశంలో అత్యంత నమ్మదగిన మార్గం. ఆండ్రాయిడ్‌లో, లొకేషన్ ఆఫ్ చేసి ఉన్నా Emergency Location Service మీ స్థానాన్ని ఆపరేటింగ్ సిస్టమ్ స్థాయిలో పంపుతుంది.",
  "offline.l3.tag": "ఎప్పుడూ పనిచేస్తుంది",
  "offline.l4.t": "దగ్గరలోని ఫోన్లకు బ్లూటూత్ రిలే",
  "offline.l4.d":
    "మీ హెచ్చరిక ఫోన్ నుంచి ఫోన్‌కు, ఒక్కో హాప్‌కు సుమారు 100 మీటర్లు ప్రయాణిస్తుంది. ఇంటర్నెట్ ఉన్న ఏ పరికరమైనా దాన్ని మీ సర్కిల్‌కు పంపుతుంది. ఇది ప్రయత్నం మాత్రమే, హామీ కాదు.",
  "offline.l4.tag": "పరీక్షలో",
  "offline.l5.t": "సైరన్, టార్చ్, స్క్రీన్ ఫ్లాష్",
  "offline.l5.d":
    "అన్ని రేడియోలు విఫలమైనప్పుడు, మిమ్మల్ని ఇప్పటికే చూడగల, వినగల మనుషులకు కనిపించండి.",
  "offline.l5.tag": "చివరి మార్గం",
  "offline.queue":
    "ఆఫ్‌లైన్‌లో మీరు ట్రిగ్గర్ చేసినదంతా పరికరంలో నిల్వ ఉంటుంది, కనెక్షన్ తిరిగి వచ్చిన క్షణమే పంపబడుతుంది.",

  "limits.eyebrow": "నిజాయితీగా పరిమితులు",
  "limits.title": "Todu ఏమి చేయలేదు",
  "limits.sub":
    "తన గురించి అతిగా చెప్పుకునే సేఫ్టీ యాప్ ఎవరినో గాయపరుస్తుంది. ఫుట్‌నోట్‌లో దాచడానికి మేము నిరాకరించే జాబితా ఇదే.",
  "limits.l1.t": "శాటిలైట్ SOS లేదు",
  "limits.l1.d":
    "Apple లేదా Google శాటిలైట్ SOSను ఏ థర్డ్ పార్టీ కూడా కలపలేదు, భారతదేశంలో డైరెక్ట్-టు-డివైస్ శాటిలైట్ నిబంధనలు ఇంకా స్పష్టంగా లేవు. మీ ఫోన్‌లోనే ఉన్న శాటిలైట్ SOS వాడండి. అది Toduకి వేరు.",
  "limits.l2.t": "ఐఫోన్ నిశ్శబ్దంగా SMS పంపలేదు",
  "limits.l2.d":
    "iOSలో ప్రోగ్రామ్ ద్వారా SMS పంపే వీలు అస్సలు లేదు. ఐఫోన్‌లో ఆఫ్‌లైన్ SMS దశకు ఎప్పుడూ మీ ట్యాప్ కావాలి. ఈ యాప్‌కు ఆండ్రాయిడ్ బలమైన ప్లాట్‌ఫాం, అదే ముందుగా విడుదలవుతుంది.",
  "limits.l3.t": "మేము డిస్పాచ్ కేంద్రం కాదు",
  "limits.l3.d":
    "Todu మీవాళ్లకు హెచ్చరిక పంపుతుంది, 112కి చేరడంలో సాయపడుతుంది. మేము ఇరవై నాలుగు గంటలూ మనుషులను నియమించలేదు. అత్యవసర సేవలకు Todu ప్రత్యామ్నాయం కాదు.",
  "limits.l4.t": "మీ ఫోనే అడ్డుపడవచ్చు",
  "limits.l4.d":
    "Xiaomi, Realme, Oppo, Vivo బ్యాక్‌గ్రౌండ్ యాప్‌లను కఠినంగా ఆపేస్తాయి. మీ ఫోన్‌కే ప్రత్యేకమైన సెటప్ విజార్డ్, రక్షణ నిశ్శబ్దంగా ఆగిపోతే గుర్తుచేసే హెల్త్ డాష్‌బోర్డ్ Toduలో ఉన్నాయి.",
  "limits.l5.t": "బ్లూటూత్ రిలే ప్రయత్నం మాత్రమే",
  "limits.l5.d":
    "ఇది తయారైంది కానీ ఇంకా క్షేత్రస్థాయిలో పరీక్షించలేదు. సుమారు 100 మీటర్ల లోపల మరో Todu వాడకరి ఉండాలి, కాబట్టి తెల్లవారుజామున ఖాళీ పొలంలో అది మిమ్మల్ని కాపాడలేదు. సైరన్, 112 మాత్రం అప్పుడూ ఉంటాయి.",
  "limits.l6.t": "అనుమతులు పూర్తిగా సులభం కావు",
  "limits.l6.d":
    "ఆండ్రాయిడ్, iOS బ్యాక్‌గ్రౌండ్ లొకేషన్, మైక్రోఫోన్ యాక్సెస్‌ను ఉద్దేశపూర్వకంగా నియంత్రిస్తాయి. ప్రతి అనుమతి అవసరమైన క్షణంలోనే, కారణం ముందే చెప్పి అడుగుతాం.",

  "drill.eyebrow": "ప్రయత్నించండి",
  "drill.title": "SOS డ్రిల్ చేయండి",
  "drill.sub":
    "ఒక్కసారి సాధన చేయిస్తాం — నిజంగా Todu అవసరమైన మొదటిసారి, అది మీరు Todu వాడే మొదటిసారి కాకూడదు. ఇక్కడి సమాచారం మీ బ్రౌజర్ దాటి వెళ్లదు.",
  "drill.arm": "SOS పంపడానికి నొక్కి పట్టుకోండి",
  "drill.holding": "అలాగే పట్టుకోండి",
  "drill.counting": "పంపడానికి",
  "drill.cancel": "రద్దు చేయి",
  "drill.sent": "ప్రసారం అవుతోంది",
  "drill.sentBody":
    "నిజమైన యాప్‌లో ఇప్పుడు మీ సర్కిల్‌కు మీ ప్రత్యక్ష లొకేషన్ చేరింది, 112 ఒక్క ట్యాప్ దూరంలో ఉంది, ఆఫ్‌లైన్ నిచ్చెన కూడా పనిచేస్తోంది.",
  "drill.reset": "మళ్లీ చేయండి",
  "drill.cancelled": "రద్దు చేయబడింది. ఏ హెచ్చరికా పంపలేదు.",
  "drill.demoNote": "ఇది డెమో మాత్రమే. ఈ పేజీ ఎవరినీ సంప్రదించలేదు.",

  "pricing.eyebrow": "ధరలు",
  "pricing.title": "ప్రాణం కాపాడే మార్గం ఉచితం. ఎప్పటికీ.",
  "pricing.sub":
    "మేము సౌలభ్యానికి, లోతుకు మాత్రమే డబ్బు తీసుకుంటాం, భద్రతకు కాదు. సహాయం రావడానికీ రాకపోవడానికీ మధ్య తేడా ఏ ఫీచర్ అయితే, అది ఉచిత ప్లాన్‌లోనే ఉంటుంది.",
  "pricing.free.name": "Todu",
  "pricing.free.price": "ఉచితం",
  "pricing.free.period": "ఎప్పుడూ",
  "pricing.free.f1": "ఒక్క ట్యాప్ SOS, కౌంట్‌డౌన్, డ్యురెస్ పిన్",
  "pricing.free.f2": "సంఘటన సమయంలో మీ సర్కిల్‌కు ప్రత్యక్ష లొకేషన్",
  "pricing.free.f3": "112కి నేరుగా డయల్, SMS ఫాల్‌బ్యాక్",
  "pricing.free.f4": "సైరన్, టార్చ్, స్క్రీన్ బీకన్",
  "pricing.free.f5": "వైద్య, అత్యవసర ప్రొఫైల్",
  "pricing.free.f6": "ప్రమాద గుర్తింపు",
  "pricing.free.cta": "Todu పొందండి",
  "pricing.plus.name": "Todu Plus",
  "pricing.plus.price": "₹99–199",
  "pricing.plus.period": "నెలకు",
  "pricing.plus.f1": "Toduలోని అన్నీ, ఏమీ మారకుండా",
  "pricing.plus.f2": "ఎక్కువ కాలం లొకేషన్ చరిత్ర, మార్గం రీప్లే",
  "pricing.plus.f3": "అపరిమిత కనెక్షన్లు, సర్కిల్‌లు",
  "pricing.plus.f4": "ఎక్కువ సాక్ష్యం నిల్వ",
  "pricing.plus.f5": "ప్రాధాన్యత హెచ్చరిక రూటింగ్",
  "pricing.plus.f6": "భాగస్వామి సిద్ధమైన తర్వాత, ఇరవై నాలుగు గంటల మానవ డిస్పాచ్",
  "pricing.plus.cta": "వెయిట్‌లిస్ట్‌లో చేరండి",
  "pricing.badge": "ప్రణాళికలో",
  "pricing.b2b.t": "పాఠశాలలు, ఫ్లీట్‌లు, యజమానులు",
  "pricing.b2b.d":
    "విద్యార్థుల భద్రత, సంస్థల బాధ్యత, క్యాబ్ మరియు ఫ్లీట్ ఆపరేటర్లు, వృద్ధుల సంరక్షణ. ఈ కార్యక్రమాలే ఉచిత వినియోగదారు ప్లాన్‌కు నిధులు సమకూరుస్తాయి.",
  "pricing.b2b.cta": "మమ్మల్ని సంప్రదించండి",

  "trust.eyebrow": "నమ్మకం",
  "trust.title": "మా మాట మీద మీరు నమ్మాల్సిన అవసరం లేదు",
  "trust.sub":
    "కొత్త సేఫ్టీ యాప్‌కు విశ్వసనీయత సమస్య ఉంటుంది, ఉండాల్సిందే. నమ్మకాన్ని ప్రకటించకుండా సంపాదించాలని మేము ఇలా అనుకుంటున్నాం.",
  "trust.t1.t": "ఓపెన్ సోర్స్ కేంద్రం",
  "trust.t1.d":
    "SOS మార్గాన్ని ఎవరైనా పరిశీలించవచ్చు. Apache-2.0, బహిరంగ రిపాజిటరీ, బహిరంగ భద్రతా విధానం.",
  "trust.t2.t": "బహిరంగ అప్‌టైమ్",
  "trust.t2.d":
    "మా హెచ్చరిక వ్యవస్థను ఆన్-కాల్ ప్రొడక్షన్ సిస్టమ్‌లా పర్యవేక్షిస్తాం, ఆ గణాంకాలు బహిరంగం.",
  "trust.t3.t": "DPDP, GDPR మూలం నుంచే",
  "trust.t3.d":
    "స్పష్టమైన ప్రత్యేక సమ్మతి, కనీస డేటా సేకరణ, నిజమైన తొలగింపు. లొకేషన్, ఆడియో, వైద్య డేటాను అవి ఏమిటో అలాగే చూస్తాం.",
  "trust.t4.t": "112కి బదులుగా కాదు, 112 చుట్టూ",
  "trust.t4.d":
    "భారతదేశంలో ఇప్పటికే అత్యవసర వ్యవస్థ ఉంది. దాన్ని భర్తీ చేసినట్టు నటించకుండా, Todu మిమ్మల్ని దానిలోకే చేరుస్తుంది.",

  "faq.eyebrow": "ప్రశ్నలు",
  "faq.title": "అడగదగిన ప్రశ్నలు",
  "faq.q1": "ఇంటర్నెట్ లేకుండా Todu పనిచేస్తుందా?",
  "faq.a1":
    "కొంత వరకు, ఏ భాగాలు అనేది మేము స్పష్టంగా చెబుతాం. 112 డయల్, సైరన్ ఎప్పుడూ పనిచేస్తాయి. SMS దశకు ఒక్క ట్యాప్ కావాలి. బ్లూటూత్ రిలేకు దగ్గర్లో మరో Todu వాడకరి కావాలి. ప్రత్యక్ష లొకేషన్‌కు డేటా కావాలి. పైన ఉన్న నిచ్చెన చూడండి.",
  "faq.q2": "నా లొకేషన్ ఎప్పుడూ ఎవరైనా చూడగలరా?",
  "faq.a2":
    "లేదు. SOS సంఘటన జరుగుతున్నప్పుడు మాత్రమే, లేదా మీరే స్వయంగా సమయ ఆధారిత షేర్ ప్రారంభించినప్పుడు మాత్రమే లొకేషన్ ప్రసారం అవుతుంది. అది కాకుండా మీ సర్కిల్‌కు ఏమీ కనిపించదు.",
  "faq.q3": "పొరపాటున ట్రిగ్గర్ అయితే?",
  "faq.a3":
    "కౌంట్‌డౌన్ అందుకే ఉంది. సమయం ముగియకముందే రద్దు చేస్తే ఏమీ పంపబడదు. ఎవరైనా మిమ్మల్ని చూస్తుంటే, డ్యురెస్ పిన్ నమోదు చేస్తే బయటకు రద్దు అయినట్టే కనిపిస్తుంది, లోపల నిశ్శబ్దంగా సహాయం వెళ్తుంది.",
  "faq.q4": "ఐఫోన్‌కు లేని ఫీచర్లు ఆండ్రాయిడ్‌కు ఎందుకు ఉన్నాయి?",
  "faq.a4":
    "ఎందుకంటే iOS ప్రోగ్రామ్ ద్వారా SMS పంపడాన్ని నిషేధిస్తుంది, బ్యాక్‌గ్రౌండ్ బ్లూటూత్‌ను కఠినంగా పరిమితం చేస్తుంది. రెండు ప్లాట్‌ఫాంలూ ఒకటేనని నటించే బదులు, నిజాయితీగా ఆండ్రాయిడ్ ముందుగా ఇవ్వడమే మేలని మా నమ్మకం.",
  "faq.q5": "నా వైద్య డేటా సురక్షితమేనా?",
  "faq.a5":
    "అది ఎన్‌క్రిప్ట్ చేసి నిల్వ ఉంటుంది, మీరు మరియు మీరు అంగీకరించిన కనెక్షన్లు మాత్రమే చూడగలరు, మా DPDP మరియు GDPR నిబద్ధతల పరిధిలో ఉంటుంది. ఎప్పుడైనా దాన్ని ఎగుమతి చేయవచ్చు లేదా తొలగించవచ్చు.",
  "faq.q6": "112కి కాల్ చేయడానికి Todu ప్రత్యామ్నాయమా?",
  "faq.a6":
    "కాదు, ఎప్పటికీ కాదు. అత్యవసర సేవలకు Todu ప్రత్యామ్నాయం కాదు. యాప్‌లోని ప్రతి మార్గం చివరికి మీరు గానీ, మీ దగ్గరి వారు గానీ 112కి సులభంగా చేరేలా చేస్తుంది.",

  "cta.title": "ఒక్కసారి సాధన చేయండి. ఎప్పటికీ అవసరం రాకూడదని కోరుకుంటున్నాం.",
  "cta.sub":
    "Todu చురుకైన అభివృద్ధిలో ఉంది, ముందుగా ఆండ్రాయిడ్. జాబితాలో చేరండి, మీ నగరంలో బీటా ప్రారంభమైనప్పుడు మేము చెబుతాం.",
  "cta.placeholder": "మీ ఇమెయిల్ చిరునామా",
  "cta.button": "నాకు తెలియజేయండి",
  "cta.ok": "మీరు జాబితాలో ఉన్నారు. బీటా గురించి మాత్రమే ఇమెయిల్ చేస్తాం.",
  "cta.err": "ఈ ఇమెయిల్ సరైనదిగా కనిపించడం లేదు.",
  "cta.privacy": "స్పామ్ లేదు, అమ్మకం లేదు, ఒక్క క్లిక్‌తో అన్‌సబ్‌స్క్రైబ్.",

  "footer.disclaimer":
    "అత్యవసర సేవలకు Todu ప్రత్యామ్నాయం కాదు. అత్యవసర పరిస్థితిలో 112కి కాల్ చేయండి. ఆఫ్‌లైన్ ఫీచర్లు ప్రయత్నం మాత్రమే, అవి మీ పరికరం, నెట్‌వర్క్, దగ్గరలోని వాడకరులపై ఆధారపడి ఉంటాయి.",
  "footer.product": "ఉత్పత్తి",
  "footer.company": "సంస్థ",
  "footer.legal": "చట్టపరమైనవి",
  "footer.privacy": "గోప్యత",
  "footer.terms": "నిబంధనలు",
  "footer.security": "భద్రత",
  "footer.rights": "అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.",
  "footer.status": "స్థితి",

  "dash.title": "స్పందించేవారి కన్సోల్",
  "dash.sub": "మీ సర్కిల్‌లలో జరుగుతున్న SOS సంఘటనల ప్రత్యక్ష వీక్షణ.",
  "dash.demo": "డెమో డేటా",
  "dash.live": "ప్రత్యక్షం",
  "dash.demoBody":
    "Supabase ఆధారాలు సెట్ చేయలేదు, అందుకే ఈ కన్సోల్ నమూనా సంఘటనలను చూపిస్తోంది. నిజమైన ప్రాజెక్ట్‌ను కలపడానికి ఎన్విరాన్మెంట్ వేరియబుల్స్ సెట్ చేయండి.",
  "dash.active": "చురుకుగా",
  "dash.acknowledged": "అంగీకరించారు",
  "dash.enroute": "మార్గంలో",
  "dash.resolved": "పరిష్కరించబడింది",
  "dash.none": "చురుకైన సంఘటనలు లేవు. అదే మంచి ఫలితం.",
  "dash.select": "టైమ్‌లైన్ చూడటానికి ఒక సంఘటనను ఎంచుకోండి.",
  "dash.ack": "నేను బయలుదేరుతున్నాను",
  "dash.acked": "చేరే సమయం పంచుకున్నారు",
  "dash.resolve": "పరిష్కరించినట్టు గుర్తించు",
  "dash.timeline": "టైమ్‌లైన్",
  "dash.medical": "వైద్య ప్రొఫైల్",
  "dash.blood": "రక్తం గ్రూప్",
  "dash.allergies": "అలర్జీలు",
  "dash.meds": "మందులు",
  "dash.battery": "బ్యాటరీ",
  "dash.accuracy": "ఖచ్చితత్వం",
  "dash.lastPing": "చివరి పింగ్",
  "dash.transport": "ఏ మార్గంలో వచ్చింది",
  "dash.call": "112కి కాల్ చేయి",
  "dash.responders": "స్పందించేవారు",
  "dash.openMap": "మ్యాప్‌లో తెరువు",
  "dash.back": "సైట్‌కు తిరిగి",

  "legal.updated": "చివరిగా నవీకరించినది",
  "legal.backHome": "హోమ్‌కు తిరిగి",
  "hero.device.active": "SOS చురుకుగా ఉంది",
  "hero.device.ladder": "హెచ్చరిక నిచ్చెన",
  "hero.device.sent": "పంపబడింది",
  "hero.device.noSignal": "సిగ్నల్ లేదు",
  "hero.device.ready": "సిద్ధం",
  "hero.device.on": "ఆన్",
  "hero.device.planned": "పరీక్షలో",
  "a11y.skip": "విషయానికి వెళ్ళు",
  "a11y.home": "Todu హోమ్",
  "cta.previewNote": "ప్రివ్యూ బిల్డ్: డేటాబేస్ కనెక్ట్ కాలేదు, కాబట్టి ఏదీ నిల్వ కాలేదు.",
  "legal.draft": "Todu అభివృద్ధిలో ఉన్నందున పారదర్శకత కోసం ప్రచురించిన ముసాయిదా ఇది. దీన్ని ఇంకా న్యాయవాది సమీక్షించలేదు, ఇది కట్టుబడి ఉండే ఒప్పందం కాదు. న్యాయ సలహా కోసం దీనిపై ఆధారపడవద్దు.",
  "legal.englishOnly": "కింది పత్రం ప్రస్తుతం ఇంగ్లీషులో మాత్రమే అందుబాటులో ఉంది.",
  "dash.loading": "సంఘటనలు లోడ్ అవుతున్నాయి",
  "dash.noneYet": "ఇంకా ఎవరూ లేరు",
  "dash.noEntries": "ఇంకా నమోదులు లేవు",
  "time.now": "ఇప్పుడే",
  "time.min": "{n} నిమి. క్రితం",
  "time.hr": "{n} గం. క్రితం",
  "dash.eta": "{n} నిమిషాల్లో చేరతారు",
  "status.notified": "తెలియజేశారు",
  "status.acknowledged": "అంగీకరించారు",
  "status.enroute": "దారిలో ఉన్నారు",
  "status.arrived": "చేరుకున్నారు",
  "transport.realtime": "రియల్‌టైమ్ (డేటా)",
  "transport.sms": "SMS ఫాల్‌బ్యాక్",
  "transport.ble": "బ్లూటూత్ రిలే",
  "transport.voice": "వాయిస్ కాల్",
  "transport.dial112": "112 డయల్",
  "dash.arrived": "నేను చేరుకున్నాను",
  "dash.arrivedDone": "చేరినట్టు తెలియజేశారు",
  "dash.etaLabel": "చేరే సమయం",
  "dash.minutes": "{n} నిమి.",
  "dash.signInTitle": "మీ సర్కిల్‌ను చూడటానికి సైన్ ఇన్ చేయండి",
  "dash.signInBody": "మీ కాంటాక్ట్ వారి Todu సర్కిల్‌లో చేర్చిన ఫోన్ నంబర్‌ను ఉపయోగించండి. మిమ్మల్ని ఆహ్వానించి, మీరు అంగీకరించిన వారి సంఘటనలు మాత్రమే మీకు కనిపిస్తాయి.",
  "dash.phone": "మొబైల్ నంబర్",
  "dash.sendCode": "కోడ్ పంపు",
  "dash.code": "SMSలో వచ్చిన కోడ్",
  "dash.verify": "ధృవీకరించు",
  "dash.signOut": "సైన్ అవుట్",
  "dash.signedInAs": "{phone}తో సైన్ ఇన్ అయ్యారు",
  "dash.authError": "అది పనిచేయలేదు: {msg}",
  "dash.pingLabel": "లొకేషన్ పింగ్, ఖచ్చితత్వం {n} మీ",
  "dash.liveUpdate": "ప్రత్యక్ష లొకేషన్ అందింది",
  "notFound.title": "ఈ పేజీ లేదు",
  "notFound.body": "మీరు ప్రమాదంలో ఉంటే, ఇక్కడ Todu కోసం వెతకకండి. ఇప్పుడే 112కి కాల్ చేయండి.",
  "notFound.call": "112కి కాల్ చేయి",
  "dash.you": "మీరు",
  "dash.noValue": "నమోదు చేయలేదు",
  "dash.invites": "ఆహ్వానాలు",
  "dash.inviteBody": "{name} మిమ్మల్ని అత్యవసర స్పందనకర్తగా కోరుతున్నారు.",
  "dash.accept": "అంగీకరించు",
  "dash.decline": "తిరస్కరించు",
  "dash.respondingFor": "మీరు స్పందించేది వీరి కోసం",
  "dash.respondingNone": "ఇంకా ఎవరూ లేరు. Todu యాప్ నుంచి ఈ ఫోన్ నంబర్‌ను ఆహ్వానించమని వారిని అడగండి.",
};

export const hi: Dict = {
  "brand.name": "Todu",
  "brand.tagline": "मदद बस एक टैप दूर है।",

  "nav.how": "यह कैसे काम करता है",
  "nav.offline": "ऑफ़लाइन",
  "nav.limits": "हमारी सीमाएँ",
  "nav.pricing": "कीमत",
  "nav.dashboard": "रेस्पॉन्डर व्यू",
  "nav.faq": "सवाल-जवाब",
  "nav.language": "भाषा",
  "nav.menu": "मेन्यू",
  "theme.label": "थीम",
  "theme.system": "डिवाइस जैसा",
  "theme.light": "लाइट",
  "theme.dark": "डार्क",

  "hero.badge": "भारत के लिए बना · 112 के साथ काम करता है",
  "hero.title": "एक टैप। आपके अपनों को पता चल जाएगा आप कहाँ हैं।",
  "hero.sub":
    "Todu एक टैप को जीवनरेखा बना देता है — जिन पर आप भरोसा करते हैं उन्हें लाइव लोकेशन, 112 से सीधा संपर्क, और एक फ़ॉलबैक सीढ़ी जो नेटवर्क न होने पर भी काम करती रहती है।",
  "hero.ctaPrimary": "SOS ड्रिल आज़माएँ",
  "hero.ctaSecondary": "पढ़ें Todu क्या नहीं कर सकता",
  "hero.note":
    "SOS का रास्ता हमेशा मुफ़्त है। जान बचाने के लिए हम कभी पैसे नहीं लेते।",

  "stat.ladder": "ऑफ़लाइन होने पर फ़ॉलबैक चरण",
  "stat.free": "SOS रास्ते की कीमत, हमेशा",
  "stat.dial": "सीधा डायल, कभी नहीं रुकता",
  "stat.langs": "लॉन्च पर भाषाएँ",

  "how.eyebrow": "यह कैसे काम करता है",
  "how.title": "आपके जीवन के सबसे कठिन तीस सेकंड के लिए बनाया गया",
  "how.sub":
    "कुछ पढ़ने की ज़रूरत नहीं। बटन ढूँढ़ने की ज़रूरत नहीं। यह एक हाथ से, अंधेरे में, काँपते हाथों से, और तब भी काम करता है जब कोई आपको देख रहा हो।",
  "how.s1.t": "बिना देखे चालू करें",
  "how.s1.d":
    "ऐप का बटन, होम स्क्रीन विजेट, एंड्रॉयड क्विक सेटिंग्स टाइल, फ़ोन हिलाना, या वही पावर बटन दबाना जो भारत ने आपको 2017 में सिखाया था।",
  "how.s2.t": "जल्दबाज़ी नहीं, सोचने का समय",
  "how.s2.d":
    "बड़े कैंसिल बटन वाला काउंटडाउन ग़लत अलार्म रोकता है। इसके बजाय अपना ड्यूरेस पिन डालें और Todu ऊपर से रद्द दिखाते हुए चुपचाप मदद भेज देता है।",
  "how.s3.t": "जो मायने रखते हैं, सब एक साथ",
  "how.s3.d":
    "लाइव लोकेशन और आपका रास्ता आपके सर्कल तक पहुँचता है। पुश अलर्ट और SMS साथ जाते हैं, ताकि एक छूटा नोटिफ़िकेशन छूटी हुई इमरजेंसी न बने।",
  "how.s4.t": "मदद आती है, और आप देख सकते हैं",
  "how.s4.d":
    "रेस्पॉन्डर पुष्टि करते हैं, पहुँचने का समय बताते हैं और आपस में तालमेल रखते हैं, ताकि तीन लोग एक ही जगह न पहुँचें और चौथा यह न मान ले कि कोई और चला गया।",

  "offline.eyebrow": "ऑफ़लाइन कोर",
  "offline.title": "जब सिग्नल नहीं होता, Todu एक-एक सीढ़ी उतरता है",
  "offline.sub":
    "ज़्यादातर सेफ़्टी ऐप डेटा के बिना चुपचाप फ़ेल हो जाते हैं। Todu जानबूझकर, एक तय क्रम में नीचे उतरता है और आपको साफ़ बताता है कि वह किस सीढ़ी तक पहुँचा।",
  "offline.l1.t": "मोबाइल डेटा या Wi-Fi",
  "offline.l1.d":
    "आपके सर्कल को रियलटाइम लोकेशन, पुश नोटिफ़िकेशन, और सबूत अपलोड।",
  "offline.l1.tag": "सबसे अच्छी स्थिति",
  "offline.l2.t": "आपके संपर्कों को SMS",
  "offline.l2.d":
    "आपके कोऑर्डिनेट के साथ पहले से तैयार संदेश, भेजने के लिए तैयार। एक टैप चाहिए, क्योंकि पूरी तरह ख़ामोश SMS की इजाज़त कोई ऐप स्टोर नहीं देता।",
  "offline.l2.tag": "एक टैप",
  "offline.l3.t": "112 पर सीधा डायल",
  "offline.l3.d":
    "भारत में सबसे भरोसेमंद रास्ता। एंड्रॉयड पर, लोकेशन बंद होने पर भी Emergency Location Service आपकी स्थिति ऑपरेटिंग सिस्टम के स्तर पर भेज देती है।",
  "offline.l3.tag": "हमेशा काम करता है",
  "offline.l4.t": "आसपास के फ़ोन तक ब्लूटूथ रिले",
  "offline.l4.d":
    "आपकी चेतावनी फ़ोन से फ़ोन तक, हर छलाँग में लगभग 100 मीटर जाती है। जिस भी डिवाइस को इंटरनेट मिलता है, वह उसे आपके सर्कल तक पहुँचा देता है। यह कोशिश है, गारंटी नहीं।",
  "offline.l4.tag": "परीक्षण में",
  "offline.l5.t": "सायरन, टॉर्च, स्क्रीन फ़्लैश",
  "offline.l5.d":
    "जब हर रेडियो फ़ेल हो जाए, तो उन लोगों को दिखें जो आपको पहले से देख और सुन सकते हैं।",
  "offline.l5.tag": "आख़िरी रास्ता",
  "offline.queue":
    "ऑफ़लाइन में आप जो भी चालू करते हैं वह डिवाइस पर सुरक्षित रहता है और कनेक्शन लौटते ही तुरंत भेज दिया जाता है।",

  "limits.eyebrow": "ईमानदार सीमाएँ",
  "limits.title": "Todu क्या नहीं कर सकता",
  "limits.sub":
    "अपने बारे में बढ़ा-चढ़ाकर कहने वाला सेफ़्टी ऐप किसी को चोट पहुँचाता है। यह वह सूची है जिसे हम फ़ुटनोट में दबाने से इनकार करते हैं।",
  "limits.l1.t": "सैटेलाइट SOS नहीं",
  "limits.l1.d":
    "Apple या Google के सैटेलाइट SOS को कोई थर्ड पार्टी नहीं जोड़ सकती, और भारत में डायरेक्ट-टू-डिवाइस सैटेलाइट के नियम अभी तय नहीं हैं। अपने फ़ोन में मौजूद सैटेलाइट SOS का इस्तेमाल करें। वह Todu से अलग है।",
  "limits.l2.t": "आईफ़ोन चुपचाप SMS नहीं भेज सकता",
  "limits.l2.d":
    "iOS में प्रोग्राम से SMS भेजने की सुविधा है ही नहीं। आईफ़ोन पर ऑफ़लाइन SMS चरण के लिए हमेशा आपका टैप चाहिए। इस ऐप के लिए एंड्रॉयड मज़बूत प्लेटफ़ॉर्म है, और वही पहले आएगा।",
  "limits.l3.t": "हम डिस्पैच सेंटर नहीं हैं",
  "limits.l3.d":
    "Todu आपके लोगों को सूचित करता है और 112 तक पहुँचने में मदद करता है। हम चौबीसों घंटे मानव डिस्पैचर नहीं रखते। Todu आपातकालीन सेवाओं का विकल्प नहीं है।",
  "limits.l4.t": "आपका फ़ोन ही अड़चन बन सकता है",
  "limits.l4.d":
    "Xiaomi, Realme, Oppo और Vivo बैकग्राउंड ऐप्स को सख़्ती से बंद कर देते हैं। Todu आपके फ़ोन के लिए ख़ास सेटअप विज़ार्ड देता है, और एक हेल्थ डैशबोर्ड जो सुरक्षा चुपचाप बंद होने पर टोकता रहता है।",
  "limits.l5.t": "ब्लूटूथ रिले सिर्फ़ कोशिश है",
  "limits.l5.d":
    "यह बन चुका है पर अभी मैदान में परखा नहीं गया। इसके लिए लगभग 100 मीटर के भीतर कोई दूसरा Todu उपयोगकर्ता चाहिए, इसलिए रात तीन बजे सुनसान मैदान में यह आपको नहीं बचाएगा। सायरन और 112 तब भी मौजूद रहेंगे।",
  "limits.l6.t": "अनुमतियाँ पूरी तरह आसान नहीं हो सकतीं",
  "limits.l6.d":
    "एंड्रॉयड और iOS बैकग्राउंड लोकेशन और माइक्रोफ़ोन को जानबूझकर सीमित रखते हैं। हम हर अनुमति ठीक उसी समय माँगते हैं जब उसकी ज़रूरत बनती है, और पहले कारण बताते हैं।",

  "drill.eyebrow": "आज़माएँ",
  "drill.title": "SOS ड्रिल चलाएँ",
  "drill.sub":
    "हम एक बार अभ्यास करवाते हैं, ताकि जिस दिन सचमुच Todu की ज़रूरत पड़े वह आपका पहला इस्तेमाल न हो। यहाँ का कुछ भी आपके ब्राउज़र से बाहर नहीं जाता।",
  "drill.arm": "SOS भेजने के लिए दबाए रखें",
  "drill.holding": "दबाए रखें",
  "drill.counting": "भेजा जाएगा",
  "drill.cancel": "रद्द करें",
  "drill.sent": "प्रसारित हो रहा है",
  "drill.sentBody":
    "असली ऐप में अब आपके सर्कल के पास आपकी लाइव लोकेशन है, 112 एक टैप दूर है, और ऑफ़लाइन सीढ़ी पहले से चल रही है।",
  "drill.reset": "फिर से चलाएँ",
  "drill.cancelled": "रद्द कर दिया गया। कोई चेतावनी नहीं भेजी गई।",
  "drill.demoNote": "सिर्फ़ डेमो। यह पेज किसी से संपर्क नहीं कर सकता।",

  "pricing.eyebrow": "कीमत",
  "pricing.title": "जान बचाने वाला रास्ता मुफ़्त है। हमेशा के लिए।",
  "pricing.sub":
    "हम सुविधा और गहराई के पैसे लेते हैं, सुरक्षा के कभी नहीं। अगर कोई सुविधा मदद पहुँचने और न पहुँचने का फ़र्क़ है, तो वह मुफ़्त प्लान में है।",
  "pricing.free.name": "Todu",
  "pricing.free.price": "मुफ़्त",
  "pricing.free.period": "हमेशा",
  "pricing.free.f1": "एक टैप SOS, काउंटडाउन और ड्यूरेस पिन",
  "pricing.free.f2": "घटना के दौरान आपके सर्कल को लाइव लोकेशन",
  "pricing.free.f3": "112 पर सीधा डायल और SMS फ़ॉलबैक",
  "pricing.free.f4": "सायरन, टॉर्च और स्क्रीन बीकन",
  "pricing.free.f5": "मेडिकल और आपातकालीन प्रोफ़ाइल",
  "pricing.free.f6": "दुर्घटना पहचान",
  "pricing.free.cta": "Todu पाएँ",
  "pricing.plus.name": "Todu Plus",
  "pricing.plus.price": "₹99–199",
  "pricing.plus.period": "प्रति माह",
  "pricing.plus.f1": "Todu का सब कुछ, ज्यों का त्यों",
  "pricing.plus.f2": "लंबा लोकेशन इतिहास और रास्ते का रीप्ले",
  "pricing.plus.f3": "असीमित कनेक्शन और सर्कल",
  "pricing.plus.f4": "ज़्यादा सबूत स्टोरेज",
  "pricing.plus.f5": "प्राथमिकता वाली अलर्ट रूटिंग",
  "pricing.plus.f6": "साझेदार आने पर, चौबीसों घंटे मानव डिस्पैच",
  "pricing.plus.cta": "वेटलिस्ट में शामिल हों",
  "pricing.badge": "योजना में",
  "pricing.b2b.t": "स्कूल, फ़्लीट और नियोक्ता",
  "pricing.b2b.d":
    "छात्र सुरक्षा, संस्थागत ज़िम्मेदारी, कैब और फ़्लीट ऑपरेटर, और बुज़ुर्गों की देखभाल। यही कार्यक्रम मुफ़्त उपभोक्ता प्लान को चलाते हैं।",
  "pricing.b2b.cta": "हमसे बात करें",

  "trust.eyebrow": "भरोसा",
  "trust.title": "आपको हमारी बात यूँ ही नहीं माननी चाहिए",
  "trust.sub":
    "नए सेफ़्टी ऐप पर भरोसे का सवाल उठता है, और उठना भी चाहिए। भरोसा जताने के बजाय कमाने का हमारा तरीक़ा यह है।",
  "trust.t1.t": "ओपन सोर्स कोर",
  "trust.t1.d":
    "SOS का रास्ता कोई भी जाँच सकता है। Apache-2.0, सार्वजनिक रिपॉज़िटरी, सार्वजनिक सुरक्षा नीति।",
  "trust.t2.t": "सार्वजनिक अपटाइम",
  "trust.t2.d":
    "हमारी अलर्ट पाइपलाइन की निगरानी ऑन-कॉल प्रोडक्शन सिस्टम की तरह होती है, और आँकड़े सार्वजनिक हैं।",
  "trust.t3.t": "DPDP और GDPR, शुरू से",
  "trust.t3.d":
    "साफ़ और अलग सहमति, कम से कम डेटा, सचमुच मिटाना। लोकेशन, ऑडियो और मेडिकल डेटा को वही मानकर रखा जाता है जो वे हैं।",
  "trust.t4.t": "112 की जगह नहीं, 112 के साथ",
  "trust.t4.d":
    "भारत में आपातकालीन ढाँचा पहले से मौजूद है। उसकी जगह लेने का दिखावा करने के बजाय Todu आपको उसी तक पहुँचाता है।",

  "faq.eyebrow": "सवाल-जवाब",
  "faq.title": "पूछने लायक़ सवाल",
  "faq.q1": "क्या Todu बिना इंटरनेट के काम करता है?",
  "faq.a1":
    "कुछ हद तक, और हम साफ़ बताते हैं कि कौन-से हिस्से। 112 डायल और सायरन हमेशा काम करते हैं। SMS चरण के लिए एक टैप चाहिए। ब्लूटूथ रिले के लिए पास में कोई दूसरा Todu उपयोगकर्ता चाहिए। लाइव लोकेशन के लिए डेटा चाहिए। ऊपर दी सीढ़ी देखें।",
  "faq.q2": "क्या कोई हर समय मेरी लोकेशन देख सकता है?",
  "faq.a2":
    "नहीं। लोकेशन लगातार सिर्फ़ तब जाती है जब कोई SOS घटना चालू हो, या जब आप ख़ुद एक तय समय के लिए शेयर शुरू करें। इसके अलावा आपके सर्कल को कुछ नहीं दिखता।",
  "faq.q3": "अगर ग़लती से चालू हो जाए तो?",
  "faq.a3":
    "काउंटडाउन इसीलिए है। समय पूरा होने से पहले रद्द करें और कुछ नहीं भेजा जाता। अगर कोई आपको देख रहा है, तो ड्यूरेस पिन डालने पर ऊपर से रद्द दिखता है और अंदर चुपचाप मदद चली जाती है।",
  "faq.q4": "एंड्रॉयड को वे सुविधाएँ क्यों मिलती हैं जो आईफ़ोन को नहीं?",
  "faq.a4":
    "क्योंकि iOS प्रोग्राम से SMS भेजने पर रोक लगाता है और बैकग्राउंड ब्लूटूथ को बहुत सीमित करता है। दोनों प्लेटफ़ॉर्म को बराबर दिखाने के बजाय हम ईमानदारी से एंड्रॉयड पहले देना बेहतर मानते हैं।",
  "faq.q5": "क्या मेरा मेडिकल डेटा सुरक्षित है?",
  "faq.a5":
    "वह एन्क्रिप्टेड रूप में रखा जाता है, सिर्फ़ आप और आपके मंज़ूर किए गए कनेक्शन उसे देख सकते हैं, और वह हमारी DPDP तथा GDPR प्रतिबद्धताओं के दायरे में है। आप उसे कभी भी निर्यात या मिटा सकते हैं।",
  "faq.q6": "क्या Todu 112 पर कॉल करने का विकल्प है?",
  "faq.a6":
    "नहीं, और कभी नहीं होगा। Todu आपातकालीन सेवाओं का विकल्प नहीं है। ऐप का हर रास्ता आख़िर में यही करता है कि आप या आपके पास मौजूद कोई व्यक्ति 112 तक आसानी से पहुँच सके।",

  "cta.title": "एक बार अभ्यास करें। उम्मीद है कभी ज़रूरत न पड़े।",
  "cta.sub":
    "Todu सक्रिय विकास में है, पहले एंड्रॉयड। सूची में शामिल हों और आपके शहर में बीटा खुलते ही हम आपको बताएँगे।",
  "cta.placeholder": "आपका ईमेल पता",
  "cta.button": "मुझे सूचित करें",
  "cta.ok": "आप सूची में हैं। हम सिर्फ़ बीटा के बारे में ईमेल करेंगे।",
  "cta.err": "यह ईमेल सही नहीं लग रहा।",
  "cta.privacy": "कोई स्पैम नहीं, कोई बिक्री नहीं, एक क्लिक में अनसब्सक्राइब।",

  "footer.disclaimer":
    "Todu आपातकालीन सेवाओं का विकल्प नहीं है। आपात स्थिति में 112 पर कॉल करें। ऑफ़लाइन सुविधाएँ सिर्फ़ कोशिश हैं और आपके डिवाइस, नेटवर्क तथा आसपास के उपयोगकर्ताओं पर निर्भर करती हैं।",
  "footer.product": "उत्पाद",
  "footer.company": "कंपनी",
  "footer.legal": "क़ानूनी",
  "footer.privacy": "गोपनीयता",
  "footer.terms": "शर्तें",
  "footer.security": "सुरक्षा",
  "footer.rights": "सर्वाधिकार सुरक्षित।",
  "footer.status": "स्थिति",

  "dash.title": "रेस्पॉन्डर कंसोल",
  "dash.sub": "आपके सर्कल में चल रही SOS घटनाओं का लाइव दृश्य।",
  "dash.demo": "डेमो डेटा",
  "dash.live": "लाइव",
  "dash.demoBody":
    "Supabase क्रेडेंशियल सेट नहीं हैं, इसलिए यह कंसोल नमूना घटनाएँ दिखा रहा है। असली प्रोजेक्ट जोड़ने के लिए एनवायरनमेंट वेरिएबल सेट करें।",
  "dash.active": "सक्रिय",
  "dash.acknowledged": "स्वीकार किया",
  "dash.enroute": "रास्ते में",
  "dash.resolved": "सुलझ गया",
  "dash.none": "कोई सक्रिय घटना नहीं। यही अच्छी ख़बर है।",
  "dash.select": "टाइमलाइन देखने के लिए कोई घटना चुनें।",
  "dash.ack": "मैं रास्ते में हूँ",
  "dash.acked": "पहुँचने का समय बताया",
  "dash.resolve": "सुलझा हुआ चिह्नित करें",
  "dash.timeline": "टाइमलाइन",
  "dash.medical": "मेडिकल प्रोफ़ाइल",
  "dash.blood": "ब्लड ग्रुप",
  "dash.allergies": "एलर्जी",
  "dash.meds": "दवाएँ",
  "dash.battery": "बैटरी",
  "dash.accuracy": "सटीकता",
  "dash.lastPing": "आख़िरी पिंग",
  "dash.transport": "किस रास्ते से आया",
  "dash.call": "112 पर कॉल करें",
  "dash.responders": "रेस्पॉन्डर",
  "dash.openMap": "मैप में खोलें",
  "dash.back": "साइट पर वापस",

  "legal.updated": "आख़िरी बार अपडेट",
  "legal.backHome": "होम पर वापस",
  "hero.device.active": "SOS सक्रिय है",
  "hero.device.ladder": "चेतावनी की सीढ़ी",
  "hero.device.sent": "भेजा गया",
  "hero.device.noSignal": "सिग्नल नहीं",
  "hero.device.ready": "तैयार",
  "hero.device.on": "चालू",
  "hero.device.planned": "परीक्षण में",
  "a11y.skip": "सामग्री पर जाएँ",
  "a11y.home": "Todu होम",
  "cta.previewNote": "प्रीव्यू बिल्ड: कोई डेटाबेस जुड़ा नहीं है, इसलिए कुछ भी सहेजा नहीं गया।",
  "legal.draft": "Todu के विकास के दौरान पारदर्शिता के लिए प्रकाशित यह एक मसौदा है। इसकी अभी किसी वकील ने समीक्षा नहीं की है और यह बाध्यकारी समझौता नहीं है। क़ानूनी सलाह के लिए इस पर निर्भर न रहें।",
  "legal.englishOnly": "नीचे दिया दस्तावेज़ अभी सिर्फ़ अंग्रेज़ी में उपलब्ध है।",
  "dash.loading": "घटनाएँ लोड हो रही हैं",
  "dash.noneYet": "अभी कोई नहीं",
  "dash.noEntries": "अभी कोई प्रविष्टि नहीं",
  "time.now": "अभी-अभी",
  "time.min": "{n} मिनट पहले",
  "time.hr": "{n} घंटे पहले",
  "dash.eta": "{n} मिनट में पहुँचेंगे",
  "status.notified": "सूचित",
  "status.acknowledged": "स्वीकार किया",
  "status.enroute": "रास्ते में",
  "status.arrived": "पहुँच गए",
  "transport.realtime": "रियलटाइम (डेटा)",
  "transport.sms": "SMS फ़ॉलबैक",
  "transport.ble": "ब्लूटूथ रिले",
  "transport.voice": "वॉइस कॉल",
  "transport.dial112": "112 डायल",
  "dash.arrived": "मैं यहाँ हूँ",
  "dash.arrivedDone": "पहुँचने की सूचना दी गई",
  "dash.etaLabel": "पहुँचने में",
  "dash.minutes": "{n} मिनट",
  "dash.signInTitle": "अपना सर्कल देखने के लिए साइन इन करें",
  "dash.signInBody": "वही फ़ोन नंबर इस्तेमाल करें जिसे आपके संपर्क ने अपने Todu सर्कल में जोड़ा है। आपको सिर्फ़ उन्हीं की घटनाएँ दिखती हैं जिन्होंने आपको आमंत्रित किया और जिनका आमंत्रण आपने स्वीकार किया।",
  "dash.phone": "मोबाइल नंबर",
  "dash.sendCode": "कोड भेजें",
  "dash.code": "SMS में आया कोड",
  "dash.verify": "पुष्टि करें",
  "dash.signOut": "साइन आउट",
  "dash.signedInAs": "{phone} से साइन इन",
  "dash.authError": "यह नहीं हुआ: {msg}",
  "dash.pingLabel": "लोकेशन पिंग, सटीकता {n} मी",
  "dash.liveUpdate": "लाइव लोकेशन मिली",
  "notFound.title": "यह पेज मौजूद नहीं है",
  "notFound.body": "अगर आप ख़तरे में हैं, तो यहाँ Todu न खोजें। अभी 112 पर कॉल करें।",
  "notFound.call": "112 पर कॉल करें",
  "dash.you": "आप",
  "dash.noValue": "दर्ज नहीं",
  "dash.invites": "आमंत्रण",
  "dash.inviteBody": "{name} आपको आपातकालीन रेस्पॉन्डर बनाना चाहते हैं।",
  "dash.accept": "स्वीकार करें",
  "dash.decline": "अस्वीकार करें",
  "dash.respondingFor": "आप इनके लिए रेस्पॉन्डर हैं",
  "dash.respondingNone": "अभी कोई नहीं। उनसे कहें कि Todu ऐप से इस फ़ोन नंबर को आमंत्रित करें।",
};

export const dictionaries: Record<Locale, Dict> = { en, te, hi };
