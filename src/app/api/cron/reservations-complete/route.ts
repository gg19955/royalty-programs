import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Daily cron: flip confirmed reservations whose check-out date has passed to
 * status='completed' and stamp completed_at. Drives Phase E auto-earn later.
 *
 * Auth: Vercel cron jobs set `Authorization: Bearer ${CRON_SECRET}`. We also
 * accept CRON_SECRET as a query param so an admin can trigger manually.
 */
export async function GET(req: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return new NextResponse("CRON_SECRET not set", { status: 500 });
  }
  const bearer = req.headers.get("authorization");
  const url = new URL(req.url);
  const qparam = url.searchParams.get("secret");
  if (bearer !== `Bearer ${secret}` && qparam !== secret) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("reservations")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("status", "confirmed")
    .lt("check_out", today)
    .select("id, code, check_out, host_id");

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    completedCount: data?.length ?? 0,
    completed: data ?? [],
    asOf: today,
  });
}
