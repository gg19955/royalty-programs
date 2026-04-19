import Link from "next/link";
import { Nav } from "@/components/nav";
import { Reveal } from "@/components/motion/reveal";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { FAQ_ITEMS } from "@/lib/content/faq";

export const dynamic = "force-dynamic";

const PILLARS = [
  {
    label: "01",
    title: "Exquisite Luxury",
    body: "Step into a world where luxury knows no bounds. Treat your friends & family to a luxury escape, where resort-style amenities, world-class design, and breathtaking views come together for an unforgettable holiday experience.",
  },
  {
    label: "02",
    title: "Prime Locations",
    body: "We hand-pick only properties in the most sought-after destinations in Victoria. We carefully consider location when selecting our Lively Properties, ensuring they're situated in prime spots just minutes away from the best places to eat, drink, and explore.",
  },
  {
    label: "03",
    title: "Exclusive Experiences",
    body: "As our guest, you gain access to exclusive experiences that enhance your stay. Enjoy exclusive local experiences at great value through Lively's partners - hot-air ballooning, fine dining, private wine tastings, gourmet chef-prepared meals, and personalised golf outings, all tailored to your every desire.",
  },
  {
    label: "04",
    title: "Fewer. Chosen carefully.",
    body: "Every property on Lively is personally selected. We look for considered architecture, exceptional sites, and hosts who take the craft of hospitality seriously. When you stay, you earn points toward your next trip.",
  },
];

export default function AboutPage() {
  return (
    <>
      <ScrollProgress />
      <Nav />

      {/* Hero strip */}
      <section className="relative overflow-hidden border-b border-brand-line bg-black">
        <div className="mx-auto max-w-[1296px] px-6 py-28 sm:px-10 sm:py-40">
          <Reveal as="up">
            <div className="section-index">/ 00 - About Lively</div>
          </Reveal>
          <Reveal as="up" delay={140}>
            <h1 className="mt-10 max-w-6xl font-display text-6xl font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-white sm:text-8xl md:text-[8.5rem]">
              Stays chosen
              <br />
              with care.
            </h1>
          </Reveal>
          <Reveal as="up" delay={280}>
            <div className="mt-14 grid gap-10 border-t border-brand-line pt-10 sm:grid-cols-[1fr_2fr] sm:gap-16">
              <div className="section-index">/ Statement</div>
              <p className="max-w-2xl text-base leading-[1.7] text-white/75 sm:text-lg">
                Lively is a curated marketplace of luxury short stays across
                Victoria - a collection of homes personally selected for their
                architecture, their sites, and the hosts behind them. When you
                stay with us, you earn points toward your next trip.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Four pillars */}
      <section className="border-b border-brand-line bg-black">
        <div className="mx-auto max-w-[1296px] px-6 py-24 sm:px-10 sm:py-32">
          <Reveal as="up">
            <div className="section-index">/ 01 - The brief</div>
          </Reveal>
          <div className="mt-12 grid gap-px bg-brand-line sm:grid-cols-2">
            {PILLARS.map((p, i) => (
              <Reveal key={p.label} as="up" delay={100 + (i % 2) * 120}>
                <div className="bg-black p-8 sm:p-12 md:p-14 h-full">
                  <div className="section-index">/ {p.label}</div>
                  <h3 className="mt-5 font-display text-3xl font-semibold uppercase leading-[0.95] tracking-[-0.01em] text-white sm:text-5xl">
                    {p.title}
                  </h3>
                  <p className="mt-6 max-w-lg text-base leading-[1.7] text-white/70">
                    {p.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ anchor */}
      <section id="faq" className="border-b border-brand-line bg-black scroll-mt-24">
        <div className="mx-auto max-w-[1296px] px-6 py-24 sm:px-10 sm:py-32">
          <Reveal as="up">
            <div className="flex items-end justify-between border-b border-brand-line pb-10">
              <div>
                <div className="section-index">/ 02 - Frequently asked</div>
                <h2 className="mt-6 font-display text-5xl font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-white sm:text-7xl">
                  The questions
                  <br />
                  we get most.
                </h2>
              </div>
              <Link
                href="/faq"
                className="link-underline hidden font-display text-[11px] uppercase tracking-[0.28em] text-white sm:inline"
              >
                Full FAQ →
              </Link>
            </div>
          </Reveal>
          <div className="mt-12 divide-y divide-brand-line border-y border-brand-line">
            {FAQ_ITEMS.map((qa, i) => (
              <Reveal key={qa.q} as="fade" delay={60 + i * 30}>
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
            <div className="section-index text-white/60">/ Ready</div>
            <h3 className="mt-5 font-display text-4xl font-semibold uppercase leading-[0.95] tracking-[-0.01em] text-white sm:text-6xl">
              Find a home.
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
              href="/experiences"
              className="rounded-[15px] border border-white/70 px-8 py-3.5 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-white transition hover:bg-white hover:text-black"
            >
              Experiences
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
