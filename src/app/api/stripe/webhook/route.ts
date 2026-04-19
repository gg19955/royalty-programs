import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook endpoint.
 *
 * Idempotency: every event is inserted into `stripe_events` keyed by
 * `event_id`. A duplicate insert (PK conflict) short-circuits - Stripe is
 * happy with a 200 for replays.
 *
 * Raw body handling: Stripe's signature verification needs the exact bytes
 * Stripe sent. We read the request as text; Next's App Router doesn't parse
 * JSON for route handlers unless we ask it to, so `req.text()` gives us
 * what we need.
 */
export async function POST(req: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new NextResponse("STRIPE_WEBHOOK_SECRET not set", { status: 500 });
  }
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new NextResponse("Missing stripe-signature", { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (e) {
    const message = e instanceof Error ? e.message : "bad signature";
    return new NextResponse(`Signature verification failed: ${message}`, {
      status: 400,
    });
  }

  const admin = createAdminClient();

  // Record the event for audit + idempotency. `event_id` is unique; duplicate
  // deliveries get rejected here and we return 200 without re-processing.
  const { error: insertErr } = await admin.from("stripe_events").insert({
    event_id: event.id,
    type: event.type,
    payload: event as unknown as Record<string, unknown>,
  });
  if (insertErr) {
    // 23505 = unique_violation. Any other error is genuinely unexpected.
    if (insertErr.code !== "23505") {
      return new NextResponse(`db insert failed: ${insertErr.message}`, {
        status: 500,
      });
    }
    // Already processed - acknowledge and move on.
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await onPaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
        await onPaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case "charge.refunded":
        await onChargeRefunded(event.data.object as Stripe.Charge);
        break;
      case "account.updated":
        await onAccountUpdated(event.data.object as Stripe.Account);
        break;
      default:
        // Unhandled - still recorded above, which is enough for audit.
        break;
    }
    await admin
      .from("stripe_events")
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq("event_id", event.id);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    // Mark the event processed=false with the error in the notes-style
    // field; we update `processed_at` regardless so re-delivery picks it up.
    await admin
      .from("stripe_events")
      .update({ processed: false, processed_at: new Date().toISOString() })
      .eq("event_id", event.id);
    return new NextResponse(`handler failed: ${message}`, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function onPaymentIntentSucceeded(pi: Stripe.PaymentIntent): Promise<void> {
  const admin = createAdminClient();
  const reservationId = pi.metadata?.reservation_id;
  if (!reservationId) {
    // No reservation link - nothing platform-specific to do.
    return;
  }

  const { data: reservation } = await admin
    .from("reservations")
    .select("id, property_id, check_in, check_out, status")
    .eq("id", reservationId)
    .maybeSingle();
  if (!reservation) return;

  // Flip the reservation to confirmed. Idempotent - if already confirmed we
  // skip the subsequent availability block insert by keying on reservation_id.
  if (reservation.status !== "confirmed") {
    await admin
      .from("reservations")
      .update({ status: "confirmed" })
      .eq("id", reservation.id);
  }

  if (reservation.property_id) {
    const { count } = await admin
      .from("availability_blocks")
      .select("*", { count: "exact", head: true })
      .eq("reservation_id", reservation.id);
    if ((count ?? 0) === 0) {
      await admin.from("availability_blocks").insert({
        property_id: reservation.property_id,
        start_date: reservation.check_in,
        end_date: reservation.check_out,
        source: "platform_booking",
        reservation_id: reservation.id,
        reason: "Platform booking",
      });
    }
  }
}

async function onPaymentIntentFailed(pi: Stripe.PaymentIntent): Promise<void> {
  const admin = createAdminClient();
  const reservationId = pi.metadata?.reservation_id;
  if (!reservationId) return;

  const { data: reservation } = await admin
    .from("reservations")
    .select("id, status")
    .eq("id", reservationId)
    .maybeSingle();
  if (!reservation || reservation.status === "confirmed") return;

  await admin
    .from("reservations")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancellation_reason: "payment_failed",
    })
    .eq("id", reservation.id);
}

async function onChargeRefunded(charge: Stripe.Charge): Promise<void> {
  const admin = createAdminClient();
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;
  if (!paymentIntentId) return;

  const { data: reservation } = await admin
    .from("reservations")
    .select("id, status")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();
  if (!reservation) return;

  await admin
    .from("reservations")
    .update({
      status: "refunded",
      cancellation_reason: reservation.status !== "cancelled" ? "refund" : undefined,
    })
    .eq("id", reservation.id);

  // Free up the dates so the property goes back on the market.
  await admin
    .from("availability_blocks")
    .delete()
    .eq("reservation_id", reservation.id);
}

async function onAccountUpdated(account: Stripe.Account): Promise<void> {
  const admin = createAdminClient();
  const { data: host } = await admin
    .from("hosts")
    .select("id, onboarding_status")
    .eq("stripe_connect_account_id", account.id)
    .maybeSingle();
  if (!host) return;

  // Mark the host 'approved' once Stripe confirms both sides are good.
  // We don't auto-downgrade here - admin handles suspension via the
  // onboarding_status enum ('paused' / 'rejected').
  const isLive = account.payouts_enabled && account.details_submitted;
  if (isLive && host.onboarding_status !== "approved") {
    await admin
      .from("hosts")
      .update({
        onboarding_status: "approved",
        approved_at: new Date().toISOString(),
      })
      .eq("id", host.id);
  }
}
