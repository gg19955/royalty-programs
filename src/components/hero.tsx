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
        <p
          className="hero-rise font-display text-[17px] font-medium uppercase tracking-[0.34em] text-white/80"
          style={{ animationDelay: "220ms" }}
        >
          Lively Properties - Luxury Short Stays &amp; Property Care
        </p>
        <h1
          className="hero-rise mt-6 font-display text-[18vw] font-semibold uppercase leading-[0.86] tracking-[-0.02em] sm:text-[14vw] md:text-[min(15vw,22rem)]"
          style={{ animationDelay: "340ms" }}
        >
          <span className="block">Stay</span>
          <span className="block">Differently.</span>
        </h1>
        <div
          className="hero-rise mt-10 max-w-lg space-y-4"
          style={{ animationDelay: "520ms" }}
        >
          <p className="text-base leading-[1.65] text-white/85 sm:text-lg">
            A curated collection of exceptional Short Stays across Victoria,
            where every detail is considered, and nothing feels accidental.
          </p>
          <p className="text-sm leading-[1.7] text-white/60 sm:text-base">
            Each home is hand-selected. Each stay considered. No volume. No
            compromise.
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
