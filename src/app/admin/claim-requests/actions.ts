"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Result = { ok: true } | { ok: false; error: string };

const POINTS_PER_AUD = parseFloat(process.env.POINTS_PER_AUD ?? "1");

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return { ok: false as const, error: "Admin only." };
  return { ok: true as const, userId: user.id };
}

export async function approveClaimRequest(requestId: string): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const admin = createAdminClient();

  const { data: request, error: reqErr } = await admin
    .from("claim_requests")
    .select("id, user_id, reservation_code, status")
    .eq("id", requestId)
    .single();
  if (reqErr || !request) return { ok: false, error: "Claim request not found." };
  if (request.status !== "pending") {
    return { ok: false, error: `Already ${request.status}.` };
  }

  const { data: reservation } = await admin
    .from("reservations")
    .select("id, code, total_value_cents")
    .eq("code", request.reservation_code)
    .maybeSingle();

  if (!reservation) {
    return { ok: false, error: "No reservation matches that code." };
  }
  if (!reservation.total_value_cents || reservation.total_value_cents <= 0) {
    return { ok: false, error: "Reservation has no stored value - add it first." };
  }

  const { data: existingClaim } = await admin
    .from("stay_claims")
    .select("id")
    .eq("reservation_id", reservation.id)
    .maybeSingle();
  if (existingClaim) {
    return { ok: false, error: "This reservation has already been claimed." };
  }

  const aud = Math.floor(reservation.total_value_cents / 100);
  const points = Math.max(0, Math.round(aud * POINTS_PER_AUD));

  const { data: claim, error: claimErr } = await admin
    .from("stay_claims")
    .insert({
      user_id: request.user_id,
      reservation_id: reservation.id,
      points_awarded: points,
    })
    .select("id")
    .single();
  if (claimErr || !claim) {
    return { ok: false, error: "Could not create stay claim." };
  }

  const { error: ledgerErr } = await admin.from("points_ledger").insert({
    user_id: request.user_id,
    event: "earn_stay",
    amount: points,
    stay_claim_id: claim.id,
    note: `Stay claim approved for reservation ${reservation.code}`,
  });
  if (ledgerErr) {
    return { ok: false, error: "Claim created but ledger write failed." };
  }

  const { error: updateErr } = await admin
    .from("claim_requests")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: auth.userId,
    })
    .eq("id", requestId);
  if (updateErr) {
    return { ok: false, error: "Points credited but request status update failed." };
  }

  revalidatePath("/admin/claim-requests");
  revalidatePath("/admin");
  return { ok: true };
}

export async function rejectClaimRequest(
  requestId: string,
  reason: string,
): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const trimmed = reason.trim();
  if (!trimmed) return { ok: false, error: "Reason is required when rejecting." };

  const admin = createAdminClient();
  const { data: request } = await admin
    .from("claim_requests")
    .select("status")
    .eq("id", requestId)
    .single();
  if (!request) return { ok: false, error: "Claim request not found." };
  if (request.status !== "pending") {
    return { ok: false, error: `Already ${request.status}.` };
  }

  const { error } = await admin
    .from("claim_requests")
    .update({
      status: "rejected",
      reviewer_note: trimmed,
      reviewed_at: new Date().toISOString(),
      reviewed_by: auth.userId,
    })
    .eq("id", requestId);
  if (error) return { ok: false, error: "Could not reject claim request." };

  revalidatePath("/admin/claim-requests");
  revalidatePath("/admin");
  return { ok: true };
}
