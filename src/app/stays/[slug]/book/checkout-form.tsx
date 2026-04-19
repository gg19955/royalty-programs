"use client";

import { useMemo, useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { getStripeClient } from "@/lib/stripe/client";
import { createBookingIntent, type BookingInput } from "./actions";

type Props = {
  slug: string;
  checkIn: string;
  checkOut: string;
  maxGuests: number;
  defaultGuests: number;
  totalChargedCents: number;
  currency: string;
};

export function CheckoutForm(props: Props) {
  const stripePromise = useMemo(() => getStripeClient(), []);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  if (!clientSecret) {
    return (
      <BookingDetails
        {...props}
        onReady={(cs) => setClientSecret(cs)}
      />
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#111111",
        fontFamily: "Inter, system-ui, sans-serif",
        borderRadius: "2px",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PayStep slug={props.slug} totalChargedCents={props.totalChargedCents} currency={props.currency} />
    </Elements>
  );
}

function BookingDetails({
  slug,
  checkIn,
  checkOut,
  maxGuests,
  defaultGuests,
  onReady,
}: Props & { onReady: (clientSecret: string) => void }) {
  const [state, setState] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    numGuests: defaultGuests,
    specialRequests: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const input: BookingInput = {
      slug,
      checkIn,
      checkOut,
      numGuests: state.numGuests,
      guestName: state.guestName,
      guestEmail: state.guestEmail,
      guestPhone: state.guestPhone,
      specialRequests: state.specialRequests,
    };
    const result = await createBookingIntent(input);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onReady(result.clientSecret);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Full name">
        <input
          required
          value={state.guestName}
          onChange={(e) => setState({ ...state, guestName: e.target.value })}
          className="w-full rounded-sm border border-brand-line bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email">
          <input
            required
            type="email"
            value={state.guestEmail}
            onChange={(e) => setState({ ...state, guestEmail: e.target.value })}
            className="w-full rounded-sm border border-brand-line bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </Field>
        <Field label="Phone (optional)">
          <input
            type="tel"
            value={state.guestPhone}
            onChange={(e) => setState({ ...state, guestPhone: e.target.value })}
            className="w-full rounded-sm border border-brand-line bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </Field>
      </div>
      <Field label="Guests">
        <input
          required
          type="number"
          min={1}
          max={maxGuests}
          value={state.numGuests}
          onChange={(e) =>
            setState({ ...state, numGuests: Number(e.target.value) })
          }
          className="w-24 rounded-sm border border-brand-line bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </Field>
      <Field label="Anything we should know? (optional)">
        <textarea
          rows={3}
          value={state.specialRequests}
          onChange={(e) =>
            setState({ ...state, specialRequests: e.target.value })
          }
          className="w-full rounded-sm border border-brand-line bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </Field>

      {error && (
        <div className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-sm bg-brand px-6 py-3.5 text-[11px] uppercase tracking-[0.22em] text-white hover:bg-black disabled:opacity-50"
      >
        {submitting ? "Preparing payment…" : "Continue to payment"}
      </button>
    </form>
  );
}

function PayStep({
  slug,
  totalChargedCents,
  currency,
}: {
  slug: string;
  totalChargedCents: number;
  currency: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatted = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currency || "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(totalChargedCents / 100);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const returnUrl = `${window.location.origin}/stays/${encodeURIComponent(
      slug,
    )}/book/confirmation`;
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });
    setSubmitting(false);
    if (stripeError) {
      setError(stripeError.message ?? "Payment failed");
    }
  };

  return (
    <form onSubmit={handle} className="space-y-5">
      <PaymentElement />
      {error && (
        <div className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="w-full rounded-sm bg-brand px-6 py-3.5 text-[11px] uppercase tracking-[0.22em] text-white hover:bg-black disabled:opacity-50"
      >
        {submitting ? "Confirming…" : `Pay ${formatted}`}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <div className="text-[11px] uppercase tracking-[0.22em] text-brand-accent">
        {label}
      </div>
      {children}
    </label>
  );
}
