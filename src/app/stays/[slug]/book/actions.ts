"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import { computePricingBreakdown } from "@/lib/stripe/pricing";
import { computeRate } from "@/lib/listings/rate";
import { isAvailable } from "@/lib/listings/availability";

const BookingSchema = z.object({
  slug: z.string().min(1).max(200),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  numGuests: z.coerce.number().int().min(1).max(40),
  guestName: z.string().trim().min(1).max(200),
  guestEmail: z.string().trim().email().max(200),
  guestPhone: z.string().trim().max(40).optional().or(z.literal("")),
  specialRequests: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type BookingInput = z.input<typeof BookingSchema>;

export type BookingIntentResult =
  | {
      ok: true;
      reservationId: string;
      clientSecret: string;
      totalChargedCents: number;
      currency: string;
    }
  | { ok: false; error: string };

function newReservationCode(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LP-${ts}-${rand}`;
}

/**
 * Validate the booking window, create a `reservations` row in
 * `pending_payment`, and issue a Stripe PaymentIntent configured as a
 * destination charge against the host's Connect account.
 *
 * Returns the PaymentIntent client_secret for the browser's Payment Element
 * to confirm. On success the webhook flips the reservation to `confirmed` and
 * writes the `availability_blocks` row.
 */
export async function createBookingIntent(
  raw: BookingInput,
): Promise<BookingIntentResult> {
  const parsed = BookingSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const input = parsed.data;

  const checkIn = new Date(`${input.checkIn}T00:00:00Z`);
  const checkOut = new Date(`${input.checkOut}T00:00:00Z`);
  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    return { ok: false, error: "Invalid dates" };
  }
  if (checkOut <= checkIn) {
    return { ok: false, error: "Check-out must be after check-in" };
  }
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (checkIn < today) {
    return { ok: false, error: "Check-in is in the past" };
  }

  const admin = createAdminClient();

  // Load the listing + host. We need the Stripe Connect account ID for the
  // destination charge, so a listing without an onboarded host can't be booked.
  const { data: property } = await admin
    .from("properties")
    .select(
      "id, name, slug, host_id, max_guests, min_nights, base_rate_cents, cleaning_fee_cents, listing_status, hosts(id, display_name, stripe_connect_account_id)",
    )
    .eq("slug", input.slug)
    .eq("listing_status", "published")
    .maybeSingle();

  const hostsRel = property?.hosts as unknown as
    | { id: string; display_name: string; stripe_connect_account_id: string | null }
    | { id: string; display_name: string; stripe_connect_account_id: string | null }[]
    | null
    | undefined;
  const host = Array.isArray(hostsRel) ? hostsRel[0] ?? null : hostsRel ?? null;

  if (!property || !property.id) {
    return { ok: false, error: "Listing not found" };
  }
  if (!host?.stripe_connect_account_id) {
    return {
      ok: false,
      error: "This host hasn't finished setting up payouts yet.",
    };
  }
  if (property.max_guests && input.numGuests > property.max_guests) {
    return {
      ok: false,
      error: `This property sleeps ${property.max_guests}.`,
    };
  }

  // Availability + rate. computeRate handles min_nights + rate plans; we also
  // spot-check nights against the property min here for a nicer error message.
  const nights =
    Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  if (property.min_nights && nights < property.min_nights) {
    return {
      ok: false,
      error: `Minimum ${property.min_nights} nights for this stay.`,
    };
  }

  const available = await isAvailable({ propertyId: property.id, checkIn, checkOut });
  if (!available) {
    return { ok: false, error: "These dates are no longer available." };
  }

  const rate = await computeRate({ propertyId: property.id, checkIn, checkOut });
  if (!rate) {
    return { ok: false, error: "Could not price this stay." };
  }
  const pricing = computePricingBreakdown({
    accommodationCents: rate.accommodationCents,
    cleaningFeeCents: rate.cleaningFeeCents,
  });

  // Resolve the acting user (may be null for guest checkout).
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const code = newReservationCode();

  const { data: reservation, error: insertError } = await admin
    .from("reservations")
    .insert({
      code,
      guest_email: input.guestEmail,
      guest_name: input.guestName,
      check_in: input.checkIn,
      check_out: input.checkOut,
      nights,
      num_guests: input.numGuests,
      special_requests: input.specialRequests || null,
      property_id: property.id,
      host_id: host.id,
      user_id: user?.id ?? null,
      source: "platform_booking",
      status: "pending_payment",
      accommodation_cents: pricing.accommodationCents,
      cleaning_fee_cents: pricing.cleaningFeeCents,
      platform_fee_cents: pricing.platformFeeCents,
      host_payout_cents: pricing.hostPayoutCents,
      total_charged_cents: pricing.totalChargedCents,
      total_value_cents: pricing.totalChargedCents, // legacy column
      currency: rate.currency,
    })
    .select("id, code")
    .single();

  if (insertError || !reservation) {
    return {
      ok: false,
      error: insertError?.message ?? "Could not create reservation",
    };
  }

  // Create a destination-charge PaymentIntent. Lively collects the funds,
  // Stripe auto-transfers (total − application_fee) to the host's Connect
  // account when the charge is captured.
  const stripe = getStripe();
  let intent;
  try {
    intent = await stripe.paymentIntents.create({
      amount: pricing.totalChargedCents,
      currency: (rate.currency || "AUD").toLowerCase(),
      automatic_payment_methods: { enabled: true },
      application_fee_amount: pricing.platformFeeCents,
      transfer_data: {
        destination: host.stripe_connect_account_id,
      },
      receipt_email: input.guestEmail,
      description: `${property.name} · ${input.checkIn} → ${input.checkOut}`,
      metadata: {
        reservation_id: reservation.id,
        reservation_code: reservation.code,
        property_id: property.id,
        property_slug: property.slug ?? "",
        host_id: host.id,
        nights: String(nights),
        num_guests: String(input.numGuests),
      },
    });
  } catch (e: unknown) {
    // Mark the reservation cancelled so it doesn't hang around as ghost
    // pending payment.
    await admin
      .from("reservations")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: "payment_intent_create_failed",
      })
      .eq("id", reservation.id);
    const message = e instanceof Error ? e.message : "Stripe error";
    return { ok: false, error: message };
  }

  if (!intent.client_secret) {
    return { ok: false, error: "Stripe did not return a client secret" };
  }

  await admin
    .from("reservations")
    .update({ stripe_payment_intent_id: intent.id })
    .eq("id", reservation.id);

  return {
    ok: true,
    reservationId: reservation.id,
    clientSecret: intent.client_secret,
    totalChargedCents: pricing.totalChargedCents,
    currency: rate.currency,
  };
}
