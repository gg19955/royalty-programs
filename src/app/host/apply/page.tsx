import Link from "next/link";
import { Nav } from "@/components/nav";
import { HostApplyForm } from "./apply-form";

export const metadata = {
  title: "Apply to list — Lively",
  description:
    "Apply for your property to join the Lively collection of curated luxury short-stays.",
};

export default function HostApplyPage() {
  return (
    <>
      <Nav />
      <section className="border-b border-brand-line bg-brand-soft">
        <div className="mx-auto max-w-4xl px-6 py-24 sm:px-10 sm:py-32">
          <Link
            href="/host"
            className="text-[11px] uppercase tracking-[0.28em] text-brand-accent hover:text-brand"
          >
            ← List your property
          </Link>
          <p className="mt-10 text-[11px] uppercase tracking-[0.32em] text-brand-accent">
            Apply
          </p>
          <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-[-0.02em] text-brand sm:text-7xl">
            Tell us about the house.
          </h1>
          <p className="mt-8 max-w-xl text-base leading-[1.7] text-neutral-700">
            Five minutes. Every field goes to the curation team — not a bot,
            not a CRM. We&apos;ll come back to you within a week.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 sm:px-10">
        <HostApplyForm />
      </section>
    </>
  );
}
