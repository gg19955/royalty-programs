"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Result = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return { ok: false as const, error: "Admin only." };
  }
  return { ok: true as const, userId: user.id };
}

export async function approveHostApplication(
  applicationId: string,
): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const admin = createAdminClient();

  const { data: app, error: appErr } = await admin
    .from("host_applications")
    .select(
      "id, status, display_name, contact_email, contact_name, phone, host_id",
    )
    .eq("id", applicationId)
    .single();
  if (appErr || !app) return { ok: false, error: "Application not found." };
  if (app.status !== "submitted" && app.status !== "reviewing") {
    return { ok: false, error: `Already ${app.status}.` };
  }

  // Create the host record (or reuse if approval is being retried).
  let hostId = app.host_id;
  if (!hostId) {
    const { data: host, error: hostErr } = await admin
      .from("hosts")
      .insert({
        display_name: app.display_name,
        contact_email: app.contact_email,
        phone: app.phone,
        onboarding_status: "approved",
        approved_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (hostErr || !host) {
      return { ok: false, error: "Could not create host record." };
    }
    hostId = host.id;
  }

  // Best-effort: invite the applicant by email so they can sign in and land
  // on the host dashboard. If the user already exists, this errors - we
  // still want to mark the application approved, so swallow it.
  try {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://livelyproperties.com.au";
    await admin.auth.admin.inviteUserByEmail(app.contact_email, {
      redirectTo: `${siteUrl}/host/dashboard`,
      data: { full_name: app.contact_name, host_id: hostId },
    });
  } catch {
    // Non-fatal - admin can resend the invite later.
  }

  // If a profile already exists for this email, link it to the host and flip
  // the role so the dashboard is reachable immediately.
  {
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id, role")
      .eq("email", app.contact_email)
      .maybeSingle();
    if (existingProfile) {
      await admin
        .from("profiles")
        .update({
          host_id: hostId,
          role: existingProfile.role === "admin" ? "admin" : "host",
        })
        .eq("id", existingProfile.id);
    }
  }

  const { error: updErr } = await admin
    .from("host_applications")
    .update({
      status: "approved",
      host_id: hostId,
      reviewed_at: new Date().toISOString(),
      reviewed_by: auth.userId,
    })
    .eq("id", applicationId);
  if (updErr) {
    return { ok: false, error: "Host created but application update failed." };
  }

  revalidatePath("/admin/hosts");
  revalidatePath("/admin");
  return { ok: true };
}

export async function rejectHostApplication(
  applicationId: string,
  reason: string,
): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const trimmed = reason.trim();
  if (!trimmed) return { ok: false, error: "Reason is required when rejecting." };

  const admin = createAdminClient();
  const { data: app } = await admin
    .from("host_applications")
    .select("status")
    .eq("id", applicationId)
    .single();
  if (!app) return { ok: false, error: "Application not found." };
  if (app.status !== "submitted" && app.status !== "reviewing") {
    return { ok: false, error: `Already ${app.status}.` };
  }

  const { error } = await admin
    .from("host_applications")
    .update({
      status: "rejected",
      review_notes: trimmed,
      reviewed_at: new Date().toISOString(),
      reviewed_by: auth.userId,
    })
    .eq("id", applicationId);
  if (error) return { ok: false, error: "Could not reject application." };

  revalidatePath("/admin/hosts");
  revalidatePath("/admin");
  return { ok: true };
}

export async function markHostApplicationReviewing(
  applicationId: string,
): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("host_applications")
    .update({ status: "reviewing" })
    .eq("id", applicationId)
    .eq("status", "submitted");
  if (error) return { ok: false, error: "Could not update status." };

  revalidatePath("/admin/hosts");
  return { ok: true };
}

export async function verifyHostKyc(hostId: string): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("hosts")
    .update({
      kyc_status: "verified",
      kyc_verified_at: new Date().toISOString(),
      kyc_verified_by: auth.userId,
      kyc_rejection_reason: null,
    })
    .eq("id", hostId);
  if (error) return { ok: false, error: "Could not verify." };

  revalidatePath("/admin/hosts");
  revalidatePath("/host/dashboard/onboarding");
  revalidatePath("/host/dashboard");
  return { ok: true };
}

export async function rejectHostKyc(
  hostId: string,
  reason: string,
): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const trimmed = reason.trim();
  if (!trimmed) return { ok: false, error: "Reason is required." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("hosts")
    .update({
      kyc_status: "rejected",
      kyc_rejection_reason: trimmed,
      kyc_verified_at: null,
      kyc_verified_by: null,
    })
    .eq("id", hostId);
  if (error) return { ok: false, error: "Could not reject." };

  revalidatePath("/admin/hosts");
  revalidatePath("/host/dashboard/onboarding");
  revalidatePath("/host/dashboard");
  return { ok: true };
}
