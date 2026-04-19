// Platform economics for Lively's OTA.
//
// Commission: 15% of accommodation (cleaning fee passes through to the host).
// GST: 10% applied to the commission itself (Lively is GST-registered, the
// platform service is a taxable supply). Effective platform fee = 16.5% of
// accommodation.
//
// All math is in integer cents to avoid FP drift.

export const COMMISSION_RATE = 0.15;
export const GST_RATE = 0.10;

export type PricingInput = {
  /** Sum of nightly rates for the reservation, before any discounts. */
  accommodationCents: number;
  /** One-time cleaning fee passed through to the host. */
  cleaningFeeCents: number;
};

export type PricingBreakdown = {
  accommodationCents: number;
  cleaningFeeCents: number;
  /** Commission (15% of accommodation) plus GST (10% of commission). */
  platformFeeCents: number;
  /** Cents transferred to the host's Connect account after the platform fee. */
  hostPayoutCents: number;
  /** What the guest pays at checkout. */
  totalChargedCents: number;
};

export function computePricingBreakdown(input: PricingInput): PricingBreakdown {
  const accommodationCents = Math.max(0, Math.round(input.accommodationCents));
  const cleaningFeeCents = Math.max(0, Math.round(input.cleaningFeeCents));

  const commission = Math.round(accommodationCents * COMMISSION_RATE);
  const gstOnCommission = Math.round(commission * GST_RATE);
  const platformFeeCents = commission + gstOnCommission;

  const totalChargedCents = accommodationCents + cleaningFeeCents;
  const hostPayoutCents = totalChargedCents - platformFeeCents;

  return {
    accommodationCents,
    cleaningFeeCents,
    platformFeeCents,
    hostPayoutCents,
    totalChargedCents,
  };
}
