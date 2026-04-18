import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { HeroSearch } from "@/components/listings/hero-search";
import { PropertyCard, type PropertyCardData } from "@/components/listings/property-card";
import {
  SignatureShowcase,
  SignatureRegions,
} from "@/components/listings/signature-showcase";
import { Reveal } from "@/components/motion/reveal";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { regionToSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

type RawProperty = PropertyCardData & {
  id: string;
  property_images: { url: string; is_hero: boolean; sort_order: number }[] | null;
};

async function regionStrip() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("properties")
    .select("region, property_images(url, is_hero, sort_order)")
    .eq("listing_status", "published")
    .not("region", "is", null)
    .order("published_at", { ascending: false });
  const seen = new Set<string>();
  const strip: { region: string; hero: string | null }[] = [];
  for (const row of (data ?? []) as unknown as {
    region: string | null;
    property_images: { url: string; is_hero: boolean; sort_order: number }[] | null;
  }[]) {
    if (!row.region || seen.has(row.region)) continue;
    seen.add(row.region);
    const imgs = [...(row.property_images ?? [])].sort(
      (a, b) => Number(b.is_hero) - Number(a.is_hero) || a.sort_order - b.sort_order,
    );
    strip.push({ region: row.region, hero: imgs[0]?.url ?? null });
  }
  return strip;
}

async function featured() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("properties")
    .select(
      "id, slug, name, headline, region, city, bedrooms, max_guests, base_rate_cents, property_images(url, is_hero, sort_order)",
    )
    .eq("listing_status", "published")
    .order("published_at", { ascending: false })
    .limit(7);
  return ((data as unknown as RawProperty[]) ?? []).map((r) => {
    const imgs = [...(r.property_images ?? [])].sort(
      (a, b) => Number(b.is_hero) - Number(a.is_hero) || a.sort_order - b.sort_order,
    );
    return {
      slug: r.slug,
      name: r.name,
      headline: r.headline,
      region: r.region,
      city: r.city,
      bedrooms: r.bedrooms,
      max_guests: r.max_guests,
      base_rate_cents: r.base_rate_cents,
      hero_url: imgs[0]?.url ?? null,
    } satisfies PropertyCardData;
  });
}

export default async function HomePage() {
  const [regions, properties] = await Promise.all([regionStrip(), featured()]);

  const featuredOne = properties[0];
  const rest = properties.slice(1, 7);

  return (
    <>
      <ScrollProgress />
      <Nav transparent />
      <Hero />

      {/* Region ticker — horizontal moving strip of regions we operate in */}
      <div className="relative overflow-hidden border-y border-brand-line bg-black py-6">
        <div className="marquee-track flex whitespace-nowrap">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex shrink-0 items-center gap-10 pr-10">
              {[
                "Mornington Peninsula",
                "Daylesford",
                "Great Ocean Road",
                "High Country",
                "Yarra Valley",
                "Gippsland",
                "Phillip Island",
                "Macedon Ranges",
              ].map((r) => (
                <span
                  key={`${dup}-${r}`}
                  className="font-display text-3xl font-semibold uppercase tracking-[0.06em] text-white/80"
                >
                  {r}
                  <span aria-hidden className="mx-10 text-white/30">
                    ●
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Search bar — dates + region + dependent suburb, posts to /stays */}
      <HeroSearch />

      {/* Featured on — press / partner logos marquee (uniform fixed-box sizing so every logo reads at equal weight) */}
      <div className="relative overflow-hidden border-y border-brand-line bg-black py-10">
        <div className="mx-auto mb-6 max-w-[1296px] px-6 sm:px-10">
          <div className="section-index text-white/50">/ As featured on</div>
        </div>
        <div className="marquee-track flex whitespace-nowrap">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex shrink-0 items-center gap-16 pr-16 sm:gap-24 sm:pr-24">
              {[
                { src: "/press/broadsheet.png", alt: "Broadsheet" },
                { src: "/press/drive.png", alt: "Drive" },
                { src: "/press/hunter-folk.webp", alt: "Hunter & Folk" },
                { src: "/press/boss-hunting.svg", alt: "Boss Hunting" },
                { src: "/press/mfw.png", alt: "Melbourne Fashion Week" },
                { src: "/press/airbnb.png", alt: "Airbnb" },
                { src: "/press/urban-list.png", alt: "Urban List" },
              ].map((logo) => (
                <div
                  key={`${dup}-${logo.alt}`}
                  className="flex h-10 w-36 shrink-0 items-center justify-center sm:h-12 sm:w-44"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="max-h-full max-w-full object-contain opacity-70 brightness-0 invert transition hover:opacity-100"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Editorial manifesto — massive condensed headline on pure black */}
      <section className="relative border-b border-brand-line bg-black">
        <div className="mx-auto max-w-[1296px] px-6 py-32 sm:px-10 sm:py-44">
          <Reveal as="up">
            <div className="section-index">/ 01 — The brief</div>
          </Reveal>
          <Reveal as="up" delay={120}>
            <h2 className="mt-10 max-w-6xl font-display text-6xl font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-white sm:text-8xl md:text-[8rem]">
              Fewer houses.
              <br />
              Chosen carefully.
            </h2>
          </Reveal>
          <Reveal as="up" delay={260}>
            <div className="mt-16 grid gap-10 border-t border-brand-line pt-10 sm:grid-cols-[1fr_2fr] sm:gap-16">
              <div className="section-index">/ Statement</div>
              <p className="max-w-2xl text-base leading-[1.7] text-white/70 sm:text-lg">
                Every property on Lively is personally selected. We look for
                considered architecture, exceptional sites, and hosts who take
                the craft of hospitality seriously — across Victoria&apos;s
                quietest regions. When you stay, you earn points toward your
                next trip.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Curated editorial showcase */}
      <SignatureShowcase />

      {/* Region strip */}
      {regions.length > 0 ? (
        <section className="border-b border-brand-line bg-black">
          <div className="mx-auto max-w-[1296px] px-6 py-24 sm:px-10 sm:py-32">
            <Reveal as="up">
              <div className="flex items-end justify-between border-b border-brand-line pb-10">
                <div>
                  <div className="section-index">/ 02 — By region</div>
                  <h2 className="mt-6 font-display text-5xl font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-white sm:text-7xl">
                    Where Lively goes.
                  </h2>
                </div>
                <Link
                  href="/stays"
                  className="link-underline hidden font-display text-[11px] uppercase tracking-[0.28em] text-white sm:inline"
                >
                  All stays →
                </Link>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-4 sm:grid-cols-3 sm:gap-6">
              {regions.map((r, i) => (
                <Reveal key={r.region} as="up" delay={100 + i * 120}>
                  <Link
                    href={`/regions/${regionToSlug(r.region)}`}
                    className="group relative block aspect-[3/4] overflow-hidden rounded-[2px] bg-brand-soft"
                  >
                    {r.hero && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={r.hero}
                        alt={r.region}
                        className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30 transition-opacity duration-700 group-hover:from-black/90" />
                    <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                      <div className="section-index">/ Region</div>
                      <div className="mt-4 font-display text-4xl font-semibold uppercase leading-[0.95] tracking-[-0.01em] sm:text-5xl">
                        <span className="link-underline">{r.region}</span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <SignatureRegions />
      )}

      {/* Featured property */}
      {featuredOne && (
        <section className="border-b border-brand-line bg-brand-soft">
          <div className="mx-auto max-w-[1296px] px-6 py-24 sm:px-10 sm:py-32">
            <Reveal as="up">
              <div className="flex items-end justify-between border-b border-brand-line pb-10">
                <div className="section-index">/ 03 — Featured this month</div>
                <Link
                  href="/stays"
                  className="link-underline hidden font-display text-[11px] uppercase tracking-[0.28em] text-white sm:inline"
                >
                  View all →
                </Link>
              </div>
            </Reveal>
            <Reveal as="scale" delay={140}>
              <div className="mt-10">
                <PropertyCard p={featuredOne} featured />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* The rest */}
      {rest.length > 0 && (
        <section className="bg-black">
          <div className="mx-auto max-w-[1296px] px-6 py-24 sm:px-10 sm:py-32">
            <Reveal as="up">
              <div className="flex items-end justify-between border-b border-brand-line pb-10">
                <div>
                  <div className="section-index">/ 04 — The collection</div>
                  <h2 className="mt-6 font-display text-5xl font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-white sm:text-7xl">
                    New this season.
                  </h2>
                </div>
                <Link
                  href="/stays"
                  className="link-underline hidden font-display text-[11px] uppercase tracking-[0.28em] text-white sm:inline"
                >
                  View all →
                </Link>
              </div>
            </Reveal>
            <div className="mt-14 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p, i) => (
                <Reveal key={p.slug} as="up" delay={(i % 3) * 120}>
                  <PropertyCard p={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Rewards — inverted: cream surface on dark page for contrast */}
      <section className="relative overflow-hidden border-t border-brand-line bg-brand-raised text-white">
        <div className="mx-auto max-w-[1296px] px-6 py-28 sm:px-10 sm:py-36">
          <Reveal as="up">
            <div className="section-index text-white/50">/ 05 — Lively Rewards</div>
          </Reveal>
          <div className="mt-10 grid gap-12 md:grid-cols-[1.1fr_1fr] md:items-end md:gap-20">
            <Reveal as="up" delay={140}>
              <h2 className="font-display text-6xl font-semibold uppercase leading-[0.9] tracking-[-0.02em] sm:text-8xl md:text-[8rem]">
                Points that
                <br />
                actually
                <br />
                buy something.
              </h2>
            </Reveal>
            <Reveal as="up" delay={280}>
              <div className="space-y-8 pb-4 text-base leading-[1.7] text-white/75 sm:text-lg">
                <p>
                  Earn one point per Australian dollar on every stay. Redeem
                  toward your next booking, or spend on curated partner
                  experiences — cellar-door tastings, hot-springs afternoons,
                  private kayak tours.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/experiences"
                    className="rounded-[15px] border border-white/70 px-7 py-3.5 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-white transition hover:bg-white hover:text-black"
                  >
                    Browse rewards
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-[15px] bg-white px-7 py-3.5 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-black transition hover:bg-brand-accent"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Footer band */}
      <footer className="border-t border-brand-line bg-black">
        <div className="mx-auto flex max-w-[1296px] flex-col gap-8 px-6 py-16 text-white/60 sm:flex-row sm:items-end sm:justify-between sm:px-10">
          <div>
            <div className="font-display text-5xl font-semibold uppercase tracking-[-0.01em] text-white sm:text-7xl">
              Lively
            </div>
            <div className="mt-4 section-index">/ Victoria — Australia</div>
          </div>
          <div className="grid gap-2 text-[11px] uppercase tracking-[0.28em] sm:text-right">
            <Link href="/stays" className="hover:text-white">Stays</Link>
            <Link href="/experiences" className="hover:text-white">Rewards</Link>
            <Link href="/host" className="hover:text-white">List a property</Link>
            <Link href="/login" className="hover:text-white">Sign in</Link>
          </div>
        </div>
        <div className="border-t border-brand-line">
          <div className="mx-auto flex max-w-[1296px] items-center justify-between px-6 py-6 text-[10px] uppercase tracking-[0.28em] text-white/40 sm:px-10">
            <span>© {new Date().getFullYear()} Lively Properties</span>
            <span>— End of feed —</span>
          </div>
        </div>
      </footer>
    </>
  );
}
