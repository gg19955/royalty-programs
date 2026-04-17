"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Result =
  | { ok: true; code: string }
  | { ok: false; error: string };

export async function redeemExperience(experienceId: string): Promise<Result> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const admin = createAdminClient();

  const { data: exp } = await admin
    .from("experiences")
    .select("id, title, points_cost, active, stock")
    .eq("id", experienceId)
    .single();

  if (!exp || !exp.active) return { ok: false, error: "Experience is not available." };

  if (exp.stock !== null && exp.stock <= 0) {
    return { ok: false, error: "Sold out." };
  }

  const { data: balRow } = await admin
    .from("v_user_points")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  const balance = balRow?.balance ?? 0;
  if (balance < exp.points_cost) {
    return { ok: false, error: "Insufficient points." };
  }

  const { data: redemption, error: redErr } = await admin
    .from("redemptions")
    .insert({
      user_id: user.id,
      experience_id: exp.id,
      points_spent: exp.points_cost,
    })
    .select("id, confirmation_code")
    .single();

  if (redErr || !redemption) {
    return { ok: false, error: "Could not create redemption. Try again." };
  }

  const { error: ledgerErr } = await admin.from("points_ledger").insert({
    user_id: user.id,
    event: "spend_redemption",
    amount: -exp.points_cost,
    redemption_id: redemption.id,
    note: `Redeemed ${exp.title}`,
  });

  if (ledgerErr) {
    return { ok: false, error: "Redemption created but points failed to debit. Contact support." };
  }

  if (exp.stock !== null) {
    await admin
      .from("experiences")
      .update({ stock: exp.stock - 1 })
      .eq("id", exp.id);
  }

  return { ok: true, code: redemption.confirmation_code };
}
