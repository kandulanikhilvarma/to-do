import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ponytail: per-instance memory, so the ceiling is per serverless instance,
// not global. Move to a KV or Upstash limiter if signups ever attract abuse.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

/**
 * Beta waitlist signup.
 *
 * `stored: false` means the deployment has no database attached, so the
 * address was accepted but not persisted. The UI says so rather than implying
 * a signup that did not happen.
 */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, stored: false, error: "too many requests" },
      { status: 429 },
    );
  }

  let body: { email?: unknown; company?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { ok: false, stored: false, error: "invalid JSON body" },
      { status: 400 },
    );
  }

  // Honeypot field is invisible to people. Answer like a success so bots
  // learn nothing, but store nothing.
  if (typeof body.company === "string" && body.company !== "") {
    return NextResponse.json({ ok: true, stored: false });
  }

  const { email } = body;
  if (typeof email !== "string" || email.length > 254 || !EMAIL.test(email)) {
    return NextResponse.json(
      { ok: false, stored: false, error: "invalid email" },
      { status: 400 },
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ ok: true, stored: false });
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
  const { error } = await supabase
    .from("waitlist")
    .upsert({ email: email.toLowerCase() }, { onConflict: "email" });

  if (error) {
    return NextResponse.json(
      { ok: false, stored: false, error: "could not store signup" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, stored: true });
}
