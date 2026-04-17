"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Result =
  | { ok: true; points: number }
  | { ok: false; error: string };

// 1 point per AUD spent by default. Override via POINTS_PER_AUD env.
const POINTS_PER_AUD = parseFloat(process.env.POINTS_PER_AUD ?? "1");

export async function claimStay(code: string): Promise<Result> {
  if (!code) return { ok: false, error: "Reservation code is required." };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const admin = createAdminClient();

  // Look up reservation (service role bypasses RLS)
  const { data: reservation, error: resErr } = await admin
    .from("reservations")
    .select("id, code, guest_email, total_value_cents, currency")
    .eq("code", code)
    .single();

  if (resErr || !reservation) {
    return { ok: false, error: "Reservation code not found. Check your booking email." };
  }

  // Strict email match (MVP). Admin override is a separate flow.
  if (reservation.guest_email.toLowerCase() !== (user.email ?? "").toLowerCase()) {
    return {
      ok: false,
      error:
        "This reservation is booked under a different email. Sign in with the email on your booking, or contact support.",
    };
  }

  // Already claimed?
  const { data: existing } = await admin
    .from("stay_claims")
    .select("id")
    .eq("reservation_id", reservation.id)
    .maybeSingle();

  if (existing) {
    return { ok: false, error: "This reservation has already been claimed." };
  }

  if (reservation.total_value_cents == null || reservation.total_value_cents <= 0) {
    return {
      ok: false,
      error: "Reservation value is missing. Contact support to claim this stay.",
    };
  }

  // 1 point per AUD spent — cents / 100, floored, times rate.
  const aud = Math.floor(reservation.total_value_cents / 100);
  const points = Math.max(0, Math.round(aud * POINTS_PER_AUD));

  // Insert claim
  const { data: claim, error: claimErr } = await admin
    .from("stay_claims")
    .insert({
      user_id: user.id,
      reservation_id: reservation.id,
      points_awarded: points,
    })
    .select("id")
    .single();

  if (claimErr || !claim) {
    return { ok: false, error: "Could not create claim. Please try again." };
  }

  // Ledger entry
  const { error: ledgerErr } = await admin.from("points_ledger").insert({
    user_id: user.id,
    event: "earn_stay",
    amount: points,
    stay_claim_id: claim.id,
    note: `Stay claim for reservation ${reservation.code}`,
  });

  if (ledgerErr) {
    return { ok: false, error: "Claim recorded but points failed to credit. Contact support." };
  }

  return { ok: true, points };
}
