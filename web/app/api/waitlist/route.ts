import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Beta waitlist signup.
 *
 * `stored: false` means the deployment has no database attached, so the
 * address was accepted but not persisted. The UI says so rather than implying
 * a signup that did not happen.
 */
export async function POST(request: Request) {
  let email: unknown;
  try {
    ({ email } = (await request.json()) as { email?: unknown });
  } catch {
    return NextResponse.json(
      { ok: false, stored: false, error: "invalid JSON body" },
      { status: 400 },
    );
  }

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
