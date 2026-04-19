import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const POINTS_PER_AUD = parseFloat(process.env.POINTS_PER_AUD ?? "1");

type AutoEarnResult =
  | { ok: true; stay_claim_id: string; points: number }
  | { ok: "skipped"; reason: string }
  | { ok: false; error: string };

/**
 * Daily cron: flip confirmed reservations whose check-out date has passed to
 * status='completed' and stamp completed_at. For platform bookings with a
 * linked user and a non-zero accommodation charge, also auto-credit loyalty
 * points (Phase E) by creating a stay_claim + points_ledger row - mirroring
 * the manual claim path that legacy OTA imports still use.
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
    .select(
      "id, code, check_out, host_id, source, user_id, accommodation_cents",
    );

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  const rows = data ?? [];
  const earns: Array<{
    reservation_id: string;
    code: string;
    result: AutoEarnResult;
  }> = [];

  // Auto-earn only for platform bookings with a linked user. Legacy/OTA
  // imports keep the manual claim path in /admin/claim-requests.
  for (const r of rows) {
    if (r.source !== "platform_booking") continue;
    if (!r.user_id) continue;
    const result = await autoEarn(admin, {
      reservationId: r.id,
      userId: r.user_id,
      accommodationCents: r.accommodation_cents,
      code: r.code,
    });
    earns.push({ reservation_id: r.id, code: r.code, result });
  }

  return NextResponse.json({
    ok: true,
    completedCount: rows.length,
    completed: rows.map((r) => ({
      id: r.id,
      code: r.code,
      check_out: r.check_out,
    })),
    autoEarnCount: earns.filter((e) => e.result.ok === true).length,
    earns,
    asOf: today,
  });
}

async function autoEarn(
  admin: ReturnType<typeof createAdminClient>,
  opts: {
    reservationId: string;
    userId: string;
    accommodationCents: number | null;
    code: string;
  },
): Promise<AutoEarnResult> {
  const cents = opts.accommodationCents ?? 0;
  if (cents <= 0) {
    return { ok: "skipped", reason: "no accommodation value" };
  }
  const aud = Math.floor(cents / 100);
  const points = Math.max(0, Math.round(aud * POINTS_PER_AUD));
  if (points <= 0) return { ok: "skipped", reason: "zero points" };

  // stay_claims.reservation_id is unique - we rely on the 23505 error to
  // make re-runs idempotent. If the claim already exists for this
  // reservation (manual path, or a prior cron run), skip silently.
  const { data: claim, error: claimErr } = await admin
    .from("stay_claims")
    .insert({
      user_id: opts.userId,
      reservation_id: opts.reservationId,
      points_awarded: points,
    })
    .select("id")
    .single();
  if (claimErr) {
    if (claimErr.code === "23505") {
      return { ok: "skipped", reason: "already claimed" };
    }
    return { ok: false, error: `stay_claims insert: ${claimErr.message}` };
  }

  const { error: ledgerErr } = await admin.from("points_ledger").insert({
    user_id: opts.userId,
    event: "earn_stay",
    amount: points,
    stay_claim_id: claim.id,
    reservation_id: opts.reservationId,
    note: `Auto-credited on stay completion (${opts.code})`,
  });
  if (ledgerErr) {
    return { ok: false, error: `points_ledger insert: ${ledgerErr.message}` };
  }

  return { ok: true, stay_claim_id: claim.id, points };
}
