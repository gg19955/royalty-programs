import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Nav } from "@/components/nav";
import { getStripe } from "@/lib/stripe/server";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type StripeRedirectStatus =
  | "succeeded"
  | "processing"
  | "requires_payment_method"
  | "requires_action"
  | "canceled";

export default async function BookConfirmationPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: {
    payment_intent?: string;
    payment_intent_client_secret?: string;
    redirect_status?: StripeRedirectStatus;
  };
}) {
  const admin = createAdminClient();
  const { data: property } = await admin
    .from("properties")
    .select("id, slug, name, headline, city, state, country")
    .eq("slug", params.slug)
    .eq("listing_status", "published")
    .maybeSingle();
  if (!property) notFound();

  const paymentIntentId = searchParams?.payment_intent;
  const redirectStatus = searchParams?.redirect_status;

  // Look up the reservation for the PaymentIntent Stripe just confirmed.
  // The webhook is the source of truth for status; this page is UI only,
  // and re-fetches the PaymentIntent to reflect near-real-time state if the
  // webhook lags behind the redirect (which is rare but possible).
  let reservation:
    | {
        id: string;
        code: string;
        check_in: string;
        check_out: string;
        num_guests: number | null;
        total_charged_cents: number | null;
        currency: string | null;
        status: string;
      }
    | null = null;

  if (paymentIntentId) {
    const { data } = await admin
      .from("reservations")
      .select(
        "id, code, check_in, check_out, num_guests, total_charged_cents, currency, status",
      )
      .eq("stripe_payment_intent_id", paymentIntentId)
      .maybeSingle();
    reservation = data ?? null;
  }

  // Resolve the Stripe-side state. If the DB reservation is still
  // `pending_payment` but Stripe says `succeeded`, we show "confirmed" -
  // the webhook will catch up shortly.
  let liveStatus: StripeRedirectStatus | null = redirectStatus ?? null;
  if (paymentIntentId && !liveStatus) {
    try {
      const intent = await getStripe().paymentIntents.retrieve(paymentIntentId);
      liveStatus = intent.status as StripeRedirectStatus;
    } catch {
      liveStatus = null;
    }
  }

  const succeeded =
    liveStatus === "succeeded" ||
    liveStatus === "processing" ||
    reservation?.status === "confirmed";

  return (
    <>
      <Nav />
      <article className="mx-auto max-w-3xl px-6 py-24 sm:px-10">
        {succeeded ? (
          <>
            <p className="text-[11px] uppercase tracking-[0.32em] text-brand-accent">
              Confirmed
            </p>
            <h1 className="mt-5 font-display text-5xl leading-[1.02] tracking-[-0.02em] text-brand sm:text-7xl">
              You&apos;re in.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-[1.7] text-neutral-700">
              Your stay at <strong>{property.name}</strong> is booked. A
              confirmation email is on its way.
            </p>

            {reservation && (
              <div className="mt-10 rounded-xl border border-brand-line bg-white p-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Detail label="Reservation code" value={reservation.code} />
                  <Detail
                    label="Guests"
                    value={
                      reservation.num_guests
                        ? String(reservation.num_guests)
                        : "-"
                    }
                  />
                  <Detail
                    label="Check-in"
                    value={formatDate(reservation.check_in)}
                  />
                  <Detail
                    label="Check-out"
                    value={formatDate(reservation.check_out)}
                  />
                  <Detail
                    label="Total"
                    value={
                      reservation.total_charged_cents
                        ? formatCurrency(reservation.total_charged_cents)
                        : "-"
                    }
                  />
                  <Detail label="Status" value={reservation.status} />
                </div>
              </div>
            )}

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/portal"
                className="rounded-sm bg-brand px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-white hover:bg-black"
              >
                View in portal
              </Link>
              <Link
                href="/stays"
                className="rounded-sm border border-brand-line px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-neutral-700 hover:border-brand hover:text-brand"
              >
                Browse more stays
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-[11px] uppercase tracking-[0.32em] text-brand-accent">
              Payment didn&apos;t go through
            </p>
            <h1 className="mt-5 font-display text-4xl leading-[1.05] tracking-[-0.02em] text-brand sm:text-5xl">
              Let&apos;s try that again.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-[1.7] text-neutral-700">
              {liveStatus === "requires_payment_method"
                ? "Your card was declined - pick another payment method and retry."
                : liveStatus === "canceled"
                  ? "The payment was cancelled before it completed."
                  : "We couldn't confirm the payment. Try again, or reach out to the concierge."}
            </p>
            <Link
              href={`/stays/${property.slug}`}
              className="mt-8 inline-block rounded-sm bg-brand px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-white hover:bg-black"
            >
              Back to the listing
            </Link>
          </>
        )}
      </article>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.22em] text-brand-accent">
        {label}
      </div>
      <div className="mt-1 font-medium text-brand">{value}</div>
    </div>
  );
}
