"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Result =
  | { ok: true }
  | { ok: false; error: string };

export async function submitClaimRequest(
  code: string,
  lastName: string,
): Promise<Result> {
  const reservationCode = code.trim();
  const last = lastName.trim();

  if (!reservationCode) return { ok: false, error: "Reservation code is required." };
  if (!last) return { ok: false, error: "Last name is required." };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const admin = createAdminClient();
  const { error } = await admin.from("claim_requests").insert({
    user_id: user.id,
    reservation_code: reservationCode,
    last_name: last,
  });

  if (error) {
    return { ok: false, error: "Could not submit your claim. Please try again." };
  }

  return { ok: true };
}
