"use client";

import { loadStripe, type Stripe } from "@stripe/stripe-js";

let _stripePromise: Promise<Stripe | null> | null = null;

/**
 * Lazy-load the client-side Stripe SDK. Returns a cached promise so the
 * script only loads once per session. Fails loudly if the publishable key
 * is missing.
 */
export function getStripeClient(): Promise<Stripe | null> {
  if (_stripePromise) return _stripePromise;
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Add it to .env.local.",
    );
  }
  _stripePromise = loadStripe(key);
  return _stripePromise;
}
