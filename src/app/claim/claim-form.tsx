"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { claimStay } from "./actions";

export function ClaimForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ points: number } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await claimStay(code.trim().toUpperCase());
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess({ points: result.points });
      setCode("");
      router.refresh();
    });
  };

  if (success) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        Stay claimed — <strong>+{success.points} points</strong> added to your balance.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Reservation code</span>
        <input
          type="text"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. LP-48291"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono uppercase tracking-wider shadow-sm focus:border-brand-accent focus:outline-none"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-brand px-4 py-2 text-white hover:bg-black disabled:opacity-50"
      >
        {pending ? "Claiming…" : "Claim stay"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
