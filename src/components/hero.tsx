import Link from "next/link";

// Drop a file at public/hero.mp4 (video) and/or public/hero.jpg (poster / fallback).
// If hero.mp4 is present it autoplays muted and loops; hero.jpg shows under it as poster
// (and is the sole background when there's no video).
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-black">
      {/* Full-bleed media */}
      <div className="absolute inset-0" aria-hidden>
        <video
          className="h-full w-full object-cover"
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

      {/* Quiet gradient — readable, not heavy */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-6 pb-24 pt-40 text-white sm:px-10 sm:pb-28">
        <p className="text-[11px] uppercase tracking-[0.32em] text-white/75">
          Victoria · The collection
        </p>
        <h1 className="mt-5 max-w-5xl font-display text-6xl leading-[0.95] tracking-[-0.02em] sm:text-8xl md:text-[8.5rem]">
          Stay somewhere considered.
        </h1>
        <p className="mt-8 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">
          A curated marketplace of luxury short stays across Victoria&apos;s
          quietest regions — earn points on every night.
        </p>
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link
            href="/stays"
            className="rounded-sm bg-white px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-brand transition hover:bg-brand-soft"
          >
            Browse stays
          </Link>
          <Link
            href="/experiences"
            className="rounded-sm border border-white/60 bg-transparent px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:bg-white/10"
          >
            Rewards
          </Link>
        </div>
      </div>
    </section>
  );
}
