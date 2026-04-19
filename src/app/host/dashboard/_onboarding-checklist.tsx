import Link from "next/link";
import type { Database } from "@/types/db";

type KycStatus = Database["public"]["Enums"]["host_kyc_status"];

export function OnboardingChecklist({
  agreementDone,
  businessDone,
  kycStatus,
}: {
  agreementDone: boolean;
  businessDone: boolean;
  kycStatus: KycStatus;
}) {
  const kycCleared = kycStatus === "pending" || kycStatus === "verified";
  const allDone = agreementDone && businessDone && kycCleared;
  if (allDone) return null;

  const items = [
    {
      key: "agreement",
      label: "Accept host agreement",
      done: agreementDone,
      state: agreementDone ? "Complete" : "Not started",
    },
    {
      key: "business",
      label: "Legal name + ABN",
      done: businessDone,
      state: businessDone ? "Complete" : "Not started",
    },
    {
      key: "kyc",
      label: "Upload ID document",
      done: kycCleared,
      state:
        kycStatus === "verified"
          ? "Verified"
          : kycStatus === "pending"
            ? "Pending review"
            : kycStatus === "rejected"
              ? "Rejected"
              : "Not started",
    },
  ];

  const doneCount = items.filter((i) => i.done).length;

  return (
    <section className="rounded-xl border border-brand-line bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-brand-accent">
            Getting started - {doneCount}/3
          </p>
          <h2 className="mt-2 font-display text-2xl text-brand">
            Finish onboarding to publish.
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            These three steps only need to be done once and unlock publishing
            for every listing you add.
          </p>
        </div>
        <Link
          href="/host/dashboard/onboarding"
          className="rounded-sm bg-brand px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] text-white hover:bg-black"
        >
          Continue
        </Link>
      </div>
      <ul className="mt-6 divide-y divide-brand-line border-t border-brand-line">
        {items.map((i) => (
          <li
            key={i.key}
            className="flex items-center justify-between py-3 text-sm"
          >
            <span
              className={
                i.done ? "text-neutral-500 line-through" : "text-neutral-800"
              }
            >
              {i.label}
            </span>
            <span className="text-xs uppercase tracking-[0.18em] text-brand-accent">
              {i.state}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
