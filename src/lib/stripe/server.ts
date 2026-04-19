import Stripe from "stripe";

// Lazy singleton so missing env vars don't blow up on import in environments
// where Stripe isn't exercised (e.g. `next build` without secrets). Only the
// first real call throws.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env.local before using Stripe.",
    );
  }
  _stripe = new Stripe(key, {
    // Pin the SDK's default for this major version so behaviour is stable
    // across minor upgrades.
    apiVersion: "2025-03-31.basil" as Stripe.LatestApiVersion,
  });
  return _stripe;
}
