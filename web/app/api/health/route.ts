import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Heartbeat for the external uptime monitor (spec S4).
 * Reports which downstream dependencies are wired, without leaking values.
 */
export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "todu-web",
    dependencies: {
      supabase: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      ),
      waitlistStore: Boolean(
        process.env.SUPABASE_SERVICE_ROLE_KEY &&
          process.env.NEXT_PUBLIC_SUPABASE_URL,
      ),
    },
  });
}
