import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/nav";
import { Reveal } from "@/components/motion/reveal";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { ClaimRequestForm } from "./claim-request-form";

export const dynamic = "force-dynamic";

export default async function ClaimPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/claim");

  return (
    <>
      <ScrollProgress />
      <Nav />

      <section className="relative overflow-hidden border-b border-brand-line bg-black">
        <div className="mx-auto max-w-[1296px] px-6 py-24 sm:px-10 sm:py-32">
          <Reveal as="up">
            <div className="section-index">/ Rewards</div>
          </Reveal>
          <Reveal as="up" delay={120}>
            <h1 className="mt-10 max-w-5xl font-display text-6xl font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-white sm:text-8xl md:text-[8rem]">
              Claim
              <br />
              a stay.
            </h1>
          </Reveal>
          <Reveal as="up" delay={260}>
            <div className="mt-16 grid gap-12 border-t border-brand-line pt-12 sm:grid-cols-[1fr_2fr] sm:gap-20">
              <div className="section-index">/ How it works</div>
              <p className="max-w-2xl text-base leading-[1.7] text-white/80 sm:text-lg">
                Enter the reservation code and last name on your booking. Our
                team reviews each claim by hand and credits your points by
                email - usually within a day.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-black">
        <div className="mx-auto max-w-3xl px-6 py-24 sm:px-10 sm:py-32">
          <Reveal as="up">
            <ClaimRequestForm />
          </Reveal>
          <Reveal as="up" delay={200}>
            <Link
              href="/portal"
              className="mt-12 inline-block font-display text-[11px] uppercase tracking-[0.32em] text-white/50 transition hover:text-white"
            >
              ← Back to portal
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}

export const metadata = {
  title: "Claim a stay - Lively",
  description:
    "Submit a reservation to have your stay credited toward your Lively rewards balance.",
};
