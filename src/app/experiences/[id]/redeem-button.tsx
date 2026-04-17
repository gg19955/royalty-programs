"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { redeemExperience } from "./actions";
import { formatPoints } from "@/lib/utils";

export function RedeemButton({
  experienceId,
  pointsCost,
  balance,
}: {
  experienceId: string;
  pointsCost: number;
  balance: number;
}) {
  const [result, setResult] = useState<
    { ok: true; code: string } | { ok: false; error: string } | null
  >(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const canRedeem = balance >= pointsCost;

  const redeem = () => {
    startTransition(async () => {
      const r = await redeemExperience(experienceId);
      setResult(r);
      if (r.ok) router.refresh();
    });
  };

  if (result?.ok) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        Redeemed. Your confirmation code:{" "}
        <span className="font-mono font-semibold">{result.code}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 text-sm text-gray-600">
        Your balance: <strong>{formatPoints(balance)} pts</strong>
      </div>
      <button
        disabled={!canRedeem || pending}
        onClick={redeem}
        className="rounded-md bg-brand px-5 py-2.5 text-white hover:bg-black disabled:opacity-50"
      >
        {pending
          ? "Redeeming…"
          : canRedeem
            ? `Redeem for ${formatPoints(pointsCost)} pts`
            : `Need ${formatPoints(pointsCost - balance)} more pts`}
      </button>
      {result && !result.ok && (
        <p className="mt-2 text-sm text-red-600">{result.error}</p>
      )}
    </div>
  );
}
