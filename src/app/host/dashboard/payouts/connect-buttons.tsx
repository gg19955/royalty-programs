"use client";

import { useTransition } from "react";
import type { ConnectStatus } from "@/lib/stripe/connect";
import { openStripeDashboard, startConnectOnboarding } from "./actions";

export function ConnectPrimaryButton({ status }: { status: ConnectStatus }) {
  const [pending, start] = useTransition();
  const label =
    status === "enabled"
      ? "Manage Stripe account"
      : status === "in_progress"
        ? "Continue onboarding"
        : "Set up payouts";

  const action = status === "enabled" ? openStripeDashboard : startConnectOnboarding;
  const className =
    status === "enabled"
      ? "rounded-sm border border-brand-line px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] text-neutral-700 hover:border-brand hover:text-brand disabled:opacity-50"
      : "rounded-sm bg-brand px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-white hover:bg-black disabled:opacity-50";

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => action())}
      className={className}
    >
      {pending ? "Redirecting…" : label}
    </button>
  );
}
