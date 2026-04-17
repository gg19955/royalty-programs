import { createAdminClient } from "@/lib/supabase/admin";

export type RateBreakdown = {
  nights: number;
  nightlyRateCents: number; // average per-night (may blend across rate plans)
  accommodationCents: number; // nights * nightly (pre-fees)
  cleaningFeeCents: number;
  totalCents: number;
  currency: string;
  minNights: number;
};

function eachNight(checkIn: Date, checkOut: Date) {
  const nights: Date[] = [];
  const d = new Date(checkIn);
  while (d < checkOut) {
    nights.push(new Date(d));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return nights;
}

/**
 * Compute a quote for a given property and date range.
 * Reads `properties.base_rate_cents` + `cleaning_fee_cents` + `min_nights`,
 * and overlays any `rate_plans` whose [start_date, end_date] covers the night.
 *
 * Returns null if the property isn't found or has no base rate configured.
 */
export async function computeRate(args: {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
}): Promise<RateBreakdown | null> {
  if (args.checkOut <= args.checkIn) return null;
  const admin = createAdminClient();

  const { data: property } = await admin
    .from("properties")
    .select("base_rate_cents, cleaning_fee_cents, min_nights")
    .eq("id", args.propertyId)
    .maybeSingle();
  if (!property?.base_rate_cents) return null;

  const { data: plans } = await admin
    .from("rate_plans")
    .select("start_date, end_date, nightly_rate_cents")
    .eq("property_id", args.propertyId);

  const base = property.base_rate_cents;
  const nights = eachNight(args.checkIn, args.checkOut);
  let accommodationCents = 0;
  for (const night of nights) {
    const iso = night.toISOString().slice(0, 10);
    const plan = (plans ?? []).find(
      (p) => p.start_date <= iso && iso <= p.end_date,
    );
    accommodationCents += plan ? plan.nightly_rate_cents : base;
  }

  const cleaningFeeCents = property.cleaning_fee_cents ?? 0;
  return {
    nights: nights.length,
    nightlyRateCents: Math.round(accommodationCents / nights.length),
    accommodationCents,
    cleaningFeeCents,
    totalCents: accommodationCents + cleaningFeeCents,
    currency: "AUD",
    minNights: property.min_nights ?? 2,
  };
}
