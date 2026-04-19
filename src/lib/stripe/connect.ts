import type Stripe from "stripe";
import { getStripe } from "./server";

/**
 * Create a Stripe Connect Express account for a Lively host.
 *
 * Lively is the merchant of record - guests pay the platform; we transfer the
 * host's share to the connected account after check-in. So the connected
 * account only needs `transfers`; we don't request `card_payments`.
 */
export async function createExpressAccount(opts: {
  contactEmail: string;
  displayName: string;
  hostId: string;
}): Promise<Stripe.Account> {
  const stripe = getStripe();
  return stripe.accounts.create({
    type: "express",
    country: "AU",
    email: opts.contactEmail,
    business_profile: {
      name: opts.displayName,
      product_description: "Luxury short-stay accommodation",
    },
    capabilities: {
      transfers: { requested: true },
    },
    metadata: {
      host_id: opts.hostId,
    },
  });
}

export async function createAccountLink(opts: {
  accountId: string;
  returnUrl: string;
  refreshUrl: string;
}): Promise<Stripe.AccountLink> {
  const stripe = getStripe();
  return stripe.accountLinks.create({
    account: opts.accountId,
    return_url: opts.returnUrl,
    refresh_url: opts.refreshUrl,
    type: "account_onboarding",
  });
}

/**
 * Login link to the Stripe-hosted Express dashboard. Use this for
 * "Manage Stripe account" once onboarding is complete.
 */
export async function createLoginLink(accountId: string): Promise<Stripe.LoginLink> {
  const stripe = getStripe();
  return stripe.accounts.createLoginLink(accountId);
}

export async function getAccount(accountId: string): Promise<Stripe.Account> {
  const stripe = getStripe();
  return stripe.accounts.retrieve(accountId);
}

export type ConnectStatus = "not_started" | "in_progress" | "enabled" | "error";

export function deriveConnectStatus(account: Stripe.Account | null): {
  status: ConnectStatus;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
} {
  if (!account) {
    return {
      status: "not_started",
      payoutsEnabled: false,
      detailsSubmitted: false,
      chargesEnabled: false,
    };
  }
  const payoutsEnabled = !!account.payouts_enabled;
  const detailsSubmitted = !!account.details_submitted;
  const chargesEnabled = !!account.charges_enabled;
  const status: ConnectStatus =
    payoutsEnabled && detailsSubmitted ? "enabled" : "in_progress";
  return { status, payoutsEnabled, detailsSubmitted, chargesEnabled };
}
