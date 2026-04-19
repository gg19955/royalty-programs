"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  deleteListing,
  publishListing,
  unpublishListing,
} from "../actions";

type Status = "draft" | "pending_review" | "published" | "paused" | "archived";

export function ListingActions({
  propertyId,
  status,
  onboardingReady,
}: {
  propertyId: string;
  status: Status;
  onboardingReady: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error);
    });
  }

  function onDelete() {
    if (!confirm("Delete this listing and all its photos? This cannot be undone.")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await deleteListing(propertyId);
      if (!res.ok) setError(res.error);
      else router.push("/host/dashboard/listings");
    });
  }

  const canPublish = status !== "published";
  const canPause = status === "published";

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        {canPublish ? (
          onboardingReady ? (
            <button
              type="button"
              onClick={() => run(() => publishListing(propertyId))}
              disabled={isPending}
              className="rounded-sm bg-brand px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white hover:bg-black disabled:opacity-50"
            >
              {status === "paused" ? "Resume" : "Publish"}
            </button>
          ) : (
            <Link
              href="/host/dashboard/onboarding"
              className="rounded-sm border border-brand-line px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-neutral-500 hover:border-brand hover:text-brand"
              title="Finish onboarding before publishing"
            >
              Finish onboarding to publish
            </Link>
          )
        ) : null}
        {canPause ? (
          <button
            type="button"
            onClick={() => run(() => unpublishListing(propertyId))}
            disabled={isPending}
            className="rounded-sm border border-brand-line px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-brand hover:bg-brand-soft disabled:opacity-50"
          >
            Pause
          </button>
        ) : null}
        <button
          type="button"
          onClick={onDelete}
          disabled={isPending}
          className="rounded-sm border border-red-200 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
      {error ? <div className="text-xs text-red-700">{error}</div> : null}
    </div>
  );
}
