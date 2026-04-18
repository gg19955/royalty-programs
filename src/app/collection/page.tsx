import Link from "next/link";
import { Nav } from "@/components/nav";
import { Reveal } from "@/components/motion/reveal";
import { ScrollProgress } from "@/components/motion/scroll-progress";

export const dynamic = "force-dynamic";

const PRINCIPLES = [
  {
    index: "01",
    title: "Carefully selected.",
    body: "Collection homes are invited, not onboarded. Each property is reviewed against a private standard for architecture, site, and craft before it is considered — and most are declined.",
  },
  {
    index: "02",
    title: "Positioned for the right guest.",
    body: "Collection homes are presented to a narrower audience of discerning travellers. Editorial tone, photography, and placement are held to a higher benchmark than general inventory.",
  },
  {
    index: "03",
    title: "Operated with stronger protection.",
    body: "Guest screening, wear-and-tear frameworks, and concierge oversight are tighter by design. The operating posture is to protect the asset, not maximise occupancy at any cost.",
  },
  {
    index: "04",
    title: "A quieter brand standard.",
    body: "Collection properties inherit a consistent visual and service language. Owners participate in a shared positioning that lifts how every home in the group is perceived.",
  },
];

export default function CollectionPage() {
  return (
    <>
      <ScrollProgress />
      <Nav />

      <div className="theme-light">
      {/* Hero — inverted: white canvas, black type */}
      <section className="relative overflow-hidden border-b border-black/10 bg-white text-black">
        <div className="mx-auto max-w-[1296px] px-6 py-28 sm:px-10 sm:py-40">
          <Reveal as="up">
            <div className="font-display text-[11px] uppercase tracking-[0.32em] text-black/50">
              / The Lively Collection
            </div>
          </Reveal>
          <Reveal as="up" delay={140}>
            <h1 className="mt-10 max-w-5xl font-display text-6xl font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-black sm:text-8xl md:text-[8.5rem]">
              Invitation
              <br />
              only.
            </h1>
          </Reveal>
          <Reveal as="up" delay={260}>
            <div className="mt-16 grid gap-12 border-t border-black/10 pt-12 sm:grid-cols-[1fr_2fr] sm:gap-20">
              <div className="font-display text-[11px] uppercase tracking-[0.32em] text-black/50">
                / Manifesto
              </div>
              <div className="max-w-2xl space-y-6 text-base leading-[1.7] text-black/80 sm:text-lg">
                <p>
                  The Lively Collection is an invite-only platform for
                  exceptional homes within the Lively portfolio.
                </p>
                <p>
                  It is not just a higher tier of management. It is a different
                  level of representation, positioning, and protection for
                  architecturally strong, premium properties.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Principles — white canvas, quiet grid */}
      <section className="bg-white text-black">
        <div className="mx-auto max-w-[1296px] px-6 py-24 sm:px-10 sm:py-32">
          <Reveal as="up">
            <div className="flex flex-col gap-4 border-b border-black/10 pb-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="font-display text-[11px] uppercase tracking-[0.32em] text-black/50">
                  / 01 — What it means
                </div>
                <h2 className="mt-6 max-w-3xl font-display text-5xl font-semibold uppercase leading-[0.92] tracking-[-0.02em] text-black sm:text-7xl">
                  A different standard
                  <br />
                  of representation.
                </h2>
              </div>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-px bg-black/10 sm:grid-cols-2">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.index} as="up" delay={i * 80}>
                <div className="flex h-full flex-col bg-white p-8 sm:p-12">
                  <div className="font-display text-[11px] uppercase tracking-[0.32em] text-black/40">
                    / {p.index}
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-semibold uppercase leading-[1.02] tracking-[-0.01em] text-black sm:text-3xl">
                    {p.title}
                  </h3>
                  <p className="mt-5 max-w-md text-base leading-[1.7] text-black/70">
                    {p.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Focus strip */}
      <section className="border-t border-black/10 bg-white text-black">
        <div className="mx-auto max-w-[1296px] px-6 py-24 sm:px-10 sm:py-32">
          <div className="grid gap-12 md:grid-cols-[1fr_2fr] md:gap-20">
            <Reveal as="up">
              <div className="font-display text-[11px] uppercase tracking-[0.32em] text-black/50">
                / 02 — The focus
              </div>
            </Reveal>
            <Reveal as="up" delay={140}>
              <div className="space-y-6 text-base leading-[1.7] text-black/80 sm:text-lg">
                <p>
                  The focus is not on volume or occupancy alone.
                </p>
                <p>
                  It is on protecting the asset, elevating how the home is
                  perceived, and delivering a more considered ownership
                  experience.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Pull-quote */}
      <section className="border-y border-black/10 bg-white text-black">
        <div className="mx-auto max-w-[1296px] px-6 py-28 sm:px-10 sm:py-40">
          <Reveal as="up">
            <blockquote className="max-w-5xl font-display text-3xl font-medium uppercase leading-[1.05] tracking-[-0.01em] text-black sm:text-5xl md:text-6xl">
              &ldquo;The Lively Collection is a curated, invite-only platform
              where exceptional homes are represented, protected, and
              positioned at a higher standard.&rdquo;
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* CTA band — kept quiet on white */}
      <section className="bg-white text-black">
        <div className="mx-auto flex max-w-[1296px] flex-col gap-8 px-6 py-24 sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:py-28">
          <div>
            <div className="font-display text-[11px] uppercase tracking-[0.32em] text-black/50">
              / Enquire
            </div>
            <h3 className="mt-5 max-w-2xl font-display text-4xl font-semibold uppercase leading-[0.98] tracking-[-0.01em] text-black sm:text-6xl">
              A private
              <br />
              conversation.
            </h3>
            <p className="mt-6 max-w-xl text-base leading-[1.7] text-black/70">
              Owners are introduced to the Collection by invitation or
              referral. If you believe your property belongs in the group, we
              are happy to open a private conversation.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/host"
              className="rounded-[15px] border border-black bg-black px-8 py-3.5 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-white transition hover:bg-transparent hover:text-black"
            >
              Request an introduction
            </Link>
            <Link
              href="/about"
              className="rounded-[15px] border border-black/60 bg-transparent px-8 py-3.5 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-black transition hover:border-black hover:bg-black hover:text-white"
            >
              About Lively
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}

export const metadata = {
  title: "The Lively Collection — Lively",
  description:
    "An invite-only platform for exceptional homes within the Lively portfolio — represented, protected, and positioned at a higher standard.",
};
