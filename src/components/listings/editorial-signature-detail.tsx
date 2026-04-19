import Link from "next/link";
import { Nav } from "@/components/nav";
import { Reveal } from "@/components/motion/reveal";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import type { SignatureHome } from "@/lib/content/signature-homes";
import { regionToSlug } from "@/lib/utils";

/**
 * Editorial detail page used when the slug matches a curated signature home
 * (i.e. not yet a DB-backed listing). Mirrors the feel of the real property
 * detail page but acknowledges the home isn't yet bookable.
 */
export function EditorialSignatureDetail({ home }: { home: SignatureHome }) {
  return (
    <>
      <ScrollProgress />
      <Nav />

      {/* Hero - full-bleed image with the home name set over it */}
      <section className="relative overflow-hidden border-b border-brand-line bg-black">
        <div className="mx-auto max-w-[1296px] px-6 pb-10 pt-12 sm:px-10 sm:pb-14 sm:pt-16">
          <Reveal as="up">
            <nav className="flex items-center gap-3 font-display text-[11px] uppercase tracking-[0.28em] text-white/60">
              <Link href="/stays" className="link-underline text-white hover:text-white">
                Stays
              </Link>
              <span>/</span>
              <Link
                href={`/regions/${regionToSlug(home.region)}`}
                className="link-underline text-white hover:text-white"
              >
                {home.region}
              </Link>
            </nav>
          </Reveal>

          <Reveal as="up" delay={120}>
            <h1 className="mt-10 max-w-6xl font-display text-6xl font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-white sm:text-8xl md:text-[8.5rem]">
              {home.name}
            </h1>
          </Reveal>

          <Reveal as="up" delay={220}>
            <div className="mt-10 grid gap-10 border-t border-brand-line pt-10 sm:grid-cols-[1fr_2fr] sm:gap-16">
              <div className="section-index">/ {home.region}</div>
              <p className="max-w-2xl text-base leading-[1.7] text-white/75 sm:text-lg">
                {home.caption}
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal as="fade" delay={280}>
          <div className="relative h-[78vh] w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={home.src}
              alt={home.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/15" />
          </div>
        </Reveal>
      </section>

      {/* Description + facts */}
      <section className="border-b border-brand-line bg-black">
        <div className="mx-auto max-w-[1296px] px-6 py-24 sm:px-10 sm:py-32">
          <div className="grid gap-16 md:grid-cols-[1fr_2fr] md:gap-24">
            <Reveal as="up">
              <div>
                <div className="section-index">/ 01 - The stay</div>
                <h2 className="mt-6 font-display text-4xl font-semibold uppercase leading-[0.95] tracking-[-0.01em] text-white sm:text-5xl">
                  About {home.name}.
                </h2>
              </div>
            </Reveal>
            <Reveal as="up" delay={140}>
              <div className="space-y-8">
                <p className="max-w-2xl text-base leading-[1.7] text-white/80 sm:text-lg">
                  {home.description}
                </p>

                {(home.bedrooms || home.sleeps) && (
                  <dl className="grid grid-cols-2 gap-y-6 border-y border-brand-line py-8 font-display text-sm uppercase tracking-[0.18em] text-white/80 sm:grid-cols-3">
                    {home.bedrooms && (
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                          / Bedrooms
                        </dt>
                        <dd className="mt-2 text-2xl text-white">
                          {home.bedrooms}
                        </dd>
                      </div>
                    )}
                    {home.sleeps && (
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                          / Sleeps
                        </dt>
                        <dd className="mt-2 text-2xl text-white">{home.sleeps}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                        / Region
                      </dt>
                      <dd className="mt-2 text-2xl text-white">{home.region}</dd>
                    </div>
                  </dl>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Pre-launch enquiry band */}
      <section className="bg-brand-raised">
        <div className="mx-auto flex max-w-[1296px] flex-col gap-8 px-6 py-24 sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:py-28">
          <div>
            <div className="section-index text-white/60">/ Pre-launch</div>
            <h3 className="mt-5 font-display text-4xl font-semibold uppercase leading-[0.95] tracking-[-0.01em] text-white sm:text-6xl">
              Instant booking
              <br />
              opens soon.
            </h3>
            <p className="mt-6 max-w-xl text-base leading-[1.7] text-white/75">
              {home.name} is part of our founding collection. Enquire now to
              be first in line when bookings open - our concierge can organise
              a preview stay for qualifying guests.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/stays"
              className="rounded-[15px] bg-white px-8 py-3.5 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-black transition hover:bg-brand-accent"
            >
              More stays
            </Link>
            <Link
              href={`/regions/${regionToSlug(home.region)}`}
              className="rounded-[15px] border border-white/70 px-8 py-3.5 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-white transition hover:bg-white hover:text-black"
            >
              {home.region}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
