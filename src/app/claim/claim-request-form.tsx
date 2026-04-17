"use client";

import { useState, useTransition } from "react";
import { submitClaimRequest } from "./actions";

export function ClaimRequestForm() {
  const [code, setCode] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitClaimRequest(code.trim(), lastName.trim());
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSubmitted(true);
      setCode("");
      setLastName("");
    });
  };

  if (submitted) {
    return (
      <div className="rounded-sm border border-brand-line bg-brand-soft p-6 text-sm text-brand">
        <p className="font-medium">Thank you — your claim is with our team.</p>
        <p className="mt-2 text-neutral-700">
          We&apos;ll review your reservation and email you once it&apos;s confirmed.
          Points land in your portal after approval.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block">
        <span className="text-xs uppercase tracking-[0.18em] text-brand-accent">
          Reservation code
        </span>
        <input
          type="text"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="From your booking confirmation"
          className="mt-2 block w-full rounded-sm border border-brand-line bg-white px-3 py-2.5 text-sm font-mono uppercase tracking-wider focus:border-brand-accent focus:outline-none"
        />
      </label>
      <label className="block">
        <span className="text-xs uppercase tracking-[0.18em] text-brand-accent">
          Last name on booking
        </span>
        <input
          type="text"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="As it appears on your reservation"
          className="mt-2 block w-full rounded-sm border border-brand-line bg-white px-3 py-2.5 text-sm focus:border-brand-accent focus:outline-none"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm bg-brand px-4 py-3 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit claim"}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </form>
  );
}
