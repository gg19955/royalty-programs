import Link from "next/link";
import { Nav } from "@/components/nav";
import { Reveal } from "@/components/motion/reveal";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { FAQ_ITEMS } from "@/lib/content/faq";

export const dynamic = "force-dynamic";

export default function FAQPage() {
  return (
    <>
      <ScrollProgress />
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-brand-line bg-black">
        <div className="mx-auto max-w-[1296px] px-6 py-28 sm:px-10 sm:py-40">
          <Reveal as="up">
            <div className="section-index">/ 00 — FAQ</div>
          </Reveal>
          <Reveal as="up" delay={140}>
            <h1 className="mt-10 max-w-6xl font-display text-6xl font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-white sm:text-8xl md:text-[8.5rem]">
              Questions,
              <br />
              answered.
            </h1>
          </Reveal>
          <Reveal as="up" delay={280}>
            <div className="mt-14 grid gap-10 border-t border-brand-line pt-10 sm:grid-cols-[1fr_2fr] sm:gap-16">
              <div className="section-index">/ Before you book</div>
              <p className="max-w-2xl text-base leading-[1.7] text-white/75 sm:text-lg">
                The things guests ask most, collected in one place. If anything
                here is unclear, our concierge team is a message away.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Full FAQ list */}
      <section className="border-b border-brand-line bg-black">
        <div className="mx-auto max-w-[1296px] px-6 py-24 sm:px-10 sm:py-32">
          <div className="divide-y divide-brand-line border-y border-brand-line">
            {FAQ_ITEMS.map((qa, i) => (
              <Reveal key={qa.q} as="fade" delay={40 + i * 25}>
                <details className="group py-8">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-8">
                    <span className="font-display text-xl font-medium uppercase tracking-[-0.005em] text-white sm:text-2xl">
                      {qa.q}
                    </span>
                    <span
                      aria-hidden
                      className="mt-1 shrink-0 font-display text-xl text-white/60 transition-transform duration-300 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-5 max-w-3xl text-base leading-[1.7] text-white/70 sm:text-lg">
                    {qa.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-brand-raised">
        <div className="mx-auto flex max-w-[1296px] flex-col gap-8 px-6 py-24 sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:py-28">
          <div>
            <div className="section-index text-white/60">/ Still curious?</div>
            <h3 className="mt-5 font-display text-4xl font-semibold uppercase leading-[0.95] tracking-[-0.01em] text-white sm:text-6xl">
              Talk to a concierge.
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/stays"
              className="rounded-[15px] bg-white px-8 py-3.5 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-black transition hover:bg-brand-accent"
            >
              Browse stays
            </Link>
            <Link
              href="/about"
              className="rounded-[15px] border border-white/70 px-8 py-3.5 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-white transition hover:bg-white hover:text-black"
            >
              About Lively
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
