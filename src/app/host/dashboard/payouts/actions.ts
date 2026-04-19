"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createAccountLink,
  createExpressAccount,
  createLoginLink,
} from "@/lib/stripe/connect";

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

async function resolveHost() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/host/dashboard/payouts");

  const { data: profile } = await supabase
    .from("profiles")
    .select("host_id")
    .eq("id", user.id)
    .single();
  if (!profile?.host_id) redirect("/host?not-linked=1");

  const admin = createAdminClient();
  const { data: host } = await admin
    .from("hosts")
    .select("id, display_name, contact_email, stripe_connect_account_id")
    .eq("id", profile.host_id)
    .single();
  if (!host) redirect("/host?not-linked=1");

  return { host, admin };
}

/**
 * Create the Connect account if missing, then hand the host off to the
 * Stripe-hosted onboarding flow. Idempotent - safe to call again after the
 * onboarding link expires.
 */
export async function startConnectOnboarding(): Promise<void> {
  const { host, admin } = await resolveHost();

  let accountId = host.stripe_connect_account_id;
  if (!accountId) {
    const acct = await createExpressAccount({
      contactEmail: host.contact_email,
      displayName: host.display_name,
      hostId: host.id,
    });
    accountId = acct.id;
    const { error } = await admin
      .from("hosts")
      .update({ stripe_connect_account_id: accountId })
      .eq("id", host.id);
    if (error) throw new Error(`Failed to persist Connect account: ${error.message}`);
  }

  const link = await createAccountLink({
    accountId,
    returnUrl: `${siteUrl()}/host/dashboard/payouts?connect=returned`,
    refreshUrl: `${siteUrl()}/host/dashboard/payouts?connect=refresh`,
  });

  redirect(link.url);
}

/**
 * Stripe Express hosted dashboard link. Used once onboarding is complete so
 * hosts can update their banking details, view transfers, etc.
 */
export async function openStripeDashboard(): Promise<void> {
  const { host } = await resolveHost();
  if (!host.stripe_connect_account_id) {
    redirect("/host/dashboard/payouts");
  }
  const link = await createLoginLink(host.stripe_connect_account_id);
  redirect(link.url);
}
