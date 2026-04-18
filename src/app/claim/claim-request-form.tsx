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
      <div className="rounded-[6px] border border-white/15 bg-white/[0.03] p-10 text-center">
        <div className="font-display text-[11px] uppercase tracking-[0.32em] text-brand-accent">
          / Received
        </div>
        <p className="mt-6 font-display text-3xl uppercase leading-[1.05] tracking-[-0.01em] text-white sm:text-4xl">
          Your claim is with our team.
        </p>
        <p className="mt-6 text-sm leading-[1.7] text-white/60">
          We&apos;ll review your reservation and email you once it&apos;s
          confirmed. Points land in your portal after approval.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <label className="block">
        <span className="font-display text-[10px] uppercase tracking-[0.32em] text-white/60">
          Reservation code <span className="text-white/40">*</span>
        </span>
        <input
          type="text"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="From your booking confirmation"
          className="mt-3 block w-full border-0 border-b border-white/20 bg-transparent px-0 py-3 font-mono text-base uppercase tracking-wider text-white placeholder-white/30 outline-none transition focus:border-white"
        />
      </label>

      <label className="block">
        <span className="font-display text-[10px] uppercase tracking-[0.32em] text-white/60">
          Last name on booking <span className="text-white/40">*</span>
        </span>
        <input
          type="text"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="As it appears on your reservation"
          className="mt-3 block w-full border-0 border-b border-white/20 bg-transparent px-0 py-3 text-base text-white placeholder-white/30 outline-none transition focus:border-white"
        />
      </label>

      {error && (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-[15px] border border-white bg-white px-8 py-4 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-black transition hover:bg-transparent hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit claim"}
      </button>
    </form>
  );
}
