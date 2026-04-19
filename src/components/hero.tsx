import Link from "next/link";
import { Parallax } from "@/components/motion/parallax";

/**
 * Hero - full-bleed video/image with notahotel-style editorial type.
 * Oversized condensed display headline, minimal chrome, ticker-like eyebrow.
 * Keeps the existing /public/hero.mp4 + /public/hero.jpg assets.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-black">
      {/* Full-bleed media - parallax drift + slow Ken-Burns zoom.
          Mobile gets a portrait-framed cut so the pillars + horizon don't
          crop out when object-cover fits a landscape source into a tall viewport. */}
      <Parallax speed={0.25} className="absolute inset-0">
        <div aria-hidden className="hero-media h-[120%] w-full">
          <video
            className="block h-full w-full object-cover sm:hidden"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/hero-mobile.jpg"
          >
            <source src="/hero-mobile.mp4" type="video/mp4" />
          </video>
          <video
            className="hidden h-full w-full object-cover sm:block"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/hero.jpg"
          >
            <source src="/hero.mp4" type="video/mp4" />
          </video>
        </div>
      </Parallax>

      {/* Bottom-anchored readability gradient - keeps deep black on text side */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/80"
        aria-hidden
      />

      {/* Corner hairlines - editorial framing like notahotel */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-6 top-24 h-px bg-white/20 sm:inset-x-10" />
        <div className="absolute inset-x-6 bottom-10 h-px bg-white/20 sm:inset-x-10" />
      </div>

      <div className="relative mx-auto flex min-h-[100vh] max-w-[1296px] flex-col justify-end px-6 pb-20 pt-40 text-white sm:px-10 sm:pb-24">
        {/* top eyebrow row - tracked small-caps */}
        <div
          className="hero-rise absolute left-6 right-6 top-28 flex items-center justify-between text-[11px] uppercase tracking-[0.32em] text-white/70 sm:left-10 sm:right-10"
          style={{ animationDelay: "120ms" }}
        >
          <span className="section-index">/ 00 - Collection 2026</span>
          <span className="hidden sm:inline">Victoria · Australia</span>
        </div>

        <p
          className="hero-rise font-display text-[11px] font-medium uppercase tracking-[0.34em] text-white/80"
          style={{ animationDelay: "220ms" }}
        >
          Lively - Curated Stays
        </p>
        <h1
          className="hero-rise mt-6 font-display text-[18vw] font-semibold uppercase leading-[0.86] tracking-[-0.02em] sm:text-[14vw] md:text-[min(15vw,22rem)]"
          style={{ animationDelay: "340ms" }}
        >
          <span className="block">Stay</span>
          <span className="block">Lively</span>
        </h1>
        <div
          className="hero-rise mt-10 grid max-w-4xl gap-10 sm:grid-cols-[1fr_1.2fr] sm:gap-16"
          style={{ animationDelay: "520ms" }}
        >
          <div className="section-index">/ Manifesto</div>
          <p className="max-w-lg text-base leading-[1.65] text-white/80 sm:text-lg">
            A curated marketplace of luxury short-stays across Victoria&apos;s
            quietest regions - each home personally chosen, each night earning
            points toward the next.
          </p>
        </div>
        <div
          className="hero-rise mt-12 flex flex-wrap items-center gap-4"
          style={{ animationDelay: "680ms" }}
        >
          <Link
            href="/stays"
            className="rounded-[15px] border border-white bg-white px-8 py-3.5 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-black transition hover:bg-transparent hover:text-white"
          >
            Stay with Us
          </Link>
          <Link
            href="/enquire"
            className="rounded-[15px] border border-white/60 bg-transparent px-8 py-3.5 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-white transition hover:border-white hover:bg-white hover:text-black"
          >
            List with Us
          </Link>
        </div>
      </div>
    </section>
  );
}
