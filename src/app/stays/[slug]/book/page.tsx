import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Nav } from "@/components/nav";
import { computeRate } from "@/lib/listings/rate";
import { isAvailable } from "@/lib/listings/availability";
import { computePricingBreakdown } from "@/lib/stripe/pricing";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckoutForm } from "./checkout-form";

export const dynamic = "force-dynamic";

export default async function BookPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { checkIn?: string; checkOut?: string; guests?: string };
}) {
  const admin = createAdminClient();
  const { data: property } = await admin
    .from("properties")
    .select(
      "id, slug, name, headline, region, city, state, country, max_guests, min_nights, base_rate_cents, cleaning_fee_cents, listing_status, hosts(stripe_connect_account_id)",
    )
    .eq("slug", params.slug)
    .eq("listing_status", "published")
    .maybeSingle();
  if (!property) notFound();

  const hostsRel = property.hosts as unknown as
    | { stripe_connect_account_id: string | null }
    | { stripe_connect_account_id: string | null }[]
    | null;
  const host = Array.isArray(hostsRel) ? hostsRel[0] ?? null : hostsRel;

  const checkInStr = searchParams?.checkIn;
  const checkOutStr = searchParams?.checkOut;
  if (!checkInStr || !checkOutStr) {
    // Missing dates - send them back to the detail page to pick.
    redirect(`/stays/${property.slug}`);
  }

  const checkIn = new Date(`${checkInStr}T00:00:00Z`);
  const checkOut = new Date(`${checkOutStr}T00:00:00Z`);
  const validDates =
    !isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime()) && checkOut > checkIn;

  const rate = validDates
    ? await computeRate({ propertyId: property.id, checkIn, checkOut })
    : null;
  const available = validDates
    ? await isAvailable({ propertyId: property.id, checkIn, checkOut })
    : false;

  const canBook = !!(
    validDates &&
    rate &&
    available &&
    host?.stripe_connect_account_id
  );

  const pricing = rate
    ? computePricingBreakdown({
        accommodationCents: rate.accommodationCents,
        cleaningFeeCents: rate.cleaningFeeCents,
      })
    : null;

  const guestsParam = Number(searchParams?.guests);
  const defaultGuests =
    Number.isFinite(guestsParam) && guestsParam > 0
      ? Math.min(guestsParam, property.max_guests ?? guestsParam)
      : Math.min(2, property.max_guests ?? 2);

  return (
    <>
      <Nav />
      <article className="mx-auto max-w-5xl px-6 py-16 sm:px-10 sm:py-20">
        <nav className="text-[11px] uppercase tracking-[0.28em] text-brand-accent">
          <Link href={`/stays/${property.slug}`} className="hover:text-brand">
            ← Back to {property.name}
          </Link>
        </nav>

        <header className="mt-8">
          <p className="text-[11px] uppercase tracking-[0.32em] text-brand-accent">
            Review and pay
          </p>
          <h1 className="mt-5 font-display text-4xl leading-[1.02] tracking-[-0.02em] text-brand sm:text-6xl">
            {property.name}
          </h1>
          <div className="mt-3 text-sm text-neutral-600">
            {[property.city, property.state, property.country]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </header>

        <div className="mt-12 grid gap-10 lg:grid-cols-[3fr_2fr]">
          <section className="space-y-8">
            {canBook && pricing && rate ? (
              <CheckoutForm
                slug={property.slug!}
                checkIn={checkInStr}
                checkOut={checkOutStr}
                maxGuests={property.max_guests ?? 20}
                defaultGuests={defaultGuests}
                totalChargedCents={pricing.totalChargedCents}
                currency={rate.currency}
              />
            ) : (
              <UnavailableNotice
                reason={
                  !validDates
                    ? "invalid_dates"
                    : !available
                      ? "unavailable"
                      : !rate
                        ? "no_rate"
                        : !host?.stripe_connect_account_id
                          ? "host_not_ready"
                          : "unknown"
                }
                slug={property.slug!}
              />
            )}
          </section>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="space-y-5 rounded-xl border border-brand-line bg-white p-6 shadow-sm">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-brand-accent">
                  Your stay
                </div>
                <div className="mt-2 text-sm text-neutral-700">
                  {formatDate(checkIn)} → {formatDate(checkOut)}
                </div>
                {rate && (
                  <div className="text-xs text-neutral-500">
                    {rate.nights} night{rate.nights === 1 ? "" : "s"}
                  </div>
                )}
              </div>

              {pricing && rate && (
                <div className="space-y-2 border-t border-brand-line pt-4 text-sm text-neutral-700">
                  <Row
                    label={`${formatCurrency(rate.nightlyRateCents)} × ${rate.nights} night${rate.nights === 1 ? "" : "s"}`}
                    value={formatCurrency(pricing.accommodationCents)}
                  />
                  {pricing.cleaningFeeCents > 0 && (
                    <Row
                      label="Cleaning fee"
                      value={formatCurrency(pricing.cleaningFeeCents)}
                    />
                  )}
                  <div className="flex items-baseline justify-between border-t border-brand-line pt-3 font-display text-base text-brand">
                    <span>Total</span>
                    <span>{formatCurrency(pricing.totalChargedCents)}</span>
                  </div>
                  <p className="pt-2 text-[11px] leading-[1.5] text-neutral-500">
                    Charged in {rate.currency}. You won&apos;t be charged until
                    you confirm payment.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function UnavailableNotice({
  reason,
  slug,
}: {
  reason:
    | "invalid_dates"
    | "unavailable"
    | "no_rate"
    | "host_not_ready"
    | "unknown";
  slug: string;
}) {
  const messages: Record<typeof reason, { title: string; body: string }> = {
    invalid_dates: {
      title: "Those dates look off.",
      body: "Pick fresh dates on the listing page and we'll price it up.",
    },
    unavailable: {
      title: "These dates have just been booked.",
      body: "Try a different window - we'll happily help you find a near-miss.",
    },
    no_rate: {
      title: "We couldn't price this stay.",
      body: "Reach out to the concierge and we'll sort it manually.",
    },
    host_not_ready: {
      title: "This host is still setting up payouts.",
      body: "Hang tight - we'll open instant booking for this listing very soon.",
    },
    unknown: {
      title: "Something went sideways.",
      body: "Try again in a moment, or contact the concierge.",
    },
  };
  const m = messages[reason];
  return (
    <div className="rounded-xl border border-brand-line bg-brand-soft p-8">
      <h2 className="font-display text-2xl text-brand">{m.title}</h2>
      <p className="mt-3 text-sm text-neutral-700">{m.body}</p>
      <Link
        href={`/stays/${slug}`}
        className="mt-6 inline-block rounded-sm border border-brand-line px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] text-neutral-700 hover:border-brand hover:text-brand"
      >
        Back to the listing
      </Link>
    </div>
  );
}
