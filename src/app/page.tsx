import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { PropertyCard, type PropertyCardData } from "@/components/listings/property-card";
import {
  SignatureShowcase,
  SignatureRegions,
} from "@/components/listings/signature-showcase";
import { regionToSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

type RawProperty = PropertyCardData & {
  id: string;
  property_images: { url: string; is_hero: boolean; sort_order: number }[] | null;
};

// Hero image per region (first published property's hero).
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
      <Nav transparent />
      <Hero />

      {/* Editorial manifesto — oversized type, lots of air */}
      <section className="border-b border-brand-line bg-white">
        <div className="mx-auto max-w-7xl px-6 py-28 sm:px-10 sm:py-40">
          <p className="text-[11px] uppercase tracking-[0.32em] text-brand-accent">
            Curated by Lively
          </p>
          <h2 className="mt-8 max-w-5xl font-display text-5xl leading-[0.98] tracking-[-0.02em] text-brand sm:text-7xl md:text-[6rem]">
            Fewer houses. Chosen carefully. For people who notice the difference.
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-[1fr_2fr] sm:gap-16">
            <div className="text-[11px] uppercase tracking-[0.28em] text-brand-accent">
              — The brief
            </div>
            <p className="max-w-2xl text-base leading-[1.7] text-neutral-700 sm:text-lg">
              Every property on Lively is personally selected. We look for
              considered architecture, exceptional sites, and hosts who take
              the craft of hospitality seriously — across Victoria&apos;s
              quietest regions. When you stay, you earn points toward your
              next trip.
            </p>
          </div>
        </div>
      </section>

      {/* Curated editorial showcase — always rendered, uses local hi-res stills */}
      <SignatureShowcase />

      {/* Region strip — prefer live DB regions, fall back to curated list */}
      {regions.length > 0 ? (
        <section className="border-b border-brand-line bg-white">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:px-10 sm:py-32">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-brand-accent">
                  By region
                </p>
                <h2 className="mt-5 font-display text-5xl leading-[0.98] tracking-[-0.02em] text-brand sm:text-7xl">
                  Where Lively goes.
                </h2>
              </div>
              <Link
                href="/stays"
                className="hidden text-[11px] uppercase tracking-[0.24em] text-brand hover:underline sm:inline"
              >
                All stays →
              </Link>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-3 sm:gap-6">
              {regions.map((r) => (
                <Link
                  key={r.region}
                  href={`/regions/${regionToSlug(r.region)}`}
                  className="group relative block aspect-[3/4] overflow-hidden bg-neutral-200"
                >
                  {r.hero && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={r.hero}
                      alt={r.region}
                      className="h-full w-full object-cover transition duration-[1200ms] ease-out group-hover:scale-[1.05]"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
                  <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                    <div className="text-[10px] uppercase tracking-[0.28em] opacity-80">
                      Region
                    </div>
                    <div className="mt-3 font-display text-4xl leading-[1.05] tracking-[-0.01em] sm:text-5xl">
                      {r.region}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <SignatureRegions />
      )}

      {/* Featured property — hero card, full-bleed imagery */}
      {featuredOne && (
        <section className="border-b border-brand-line bg-brand-soft">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:px-10 sm:py-32">
            <div className="flex items-end justify-between">
              <p className="text-[11px] uppercase tracking-[0.32em] text-brand-accent">
                Featured this month
              </p>
              <Link
                href="/stays"
                className="hidden text-[11px] uppercase tracking-[0.24em] text-brand hover:underline sm:inline"
              >
                View all →
              </Link>
            </div>
            <div className="mt-10">
              <PropertyCard p={featuredOne} featured />
            </div>
          </div>
        </section>
      )}

      {/* The rest of the collection */}
      {rest.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:px-10 sm:py-32">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-brand-accent">
                  The collection
                </p>
                <h2 className="mt-5 font-display text-5xl leading-[0.98] tracking-[-0.02em] text-brand sm:text-7xl">
                  New this season.
                </h2>
              </div>
              <Link
                href="/stays"
                className="hidden text-[11px] uppercase tracking-[0.24em] text-brand hover:underline sm:inline"
              >
                View all →
              </Link>
            </div>
            <div className="mt-14 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => (
                <PropertyCard key={p.slug} p={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Rewards — full-bleed dark */}
      <section className="relative overflow-hidden border-t border-brand-line bg-brand text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-28 sm:px-10 sm:py-36 md:grid-cols-[1fr_1fr] md:items-center md:gap-20">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-white/60">
              Lively Rewards
            </p>
            <h2 className="mt-6 font-display text-5xl leading-[0.98] tracking-[-0.02em] sm:text-6xl md:text-7xl">
              Points that actually buy something.
            </h2>
          </div>
          <div className="space-y-6 text-base leading-[1.7] text-white/80 sm:text-lg">
            <p>
              Earn one point per Australian dollar on every stay. Redeem toward
              your next booking, or spend on curated partner experiences —
              cellar-door tastings, hot-springs afternoons, private kayak
              tours.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/experiences"
                className="rounded-sm border border-white/70 px-7 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-white hover:bg-white hover:text-brand"
              >
                Browse rewards
              </Link>
              <Link
                href="/login"
                className="rounded-sm bg-white px-7 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-brand hover:bg-brand-soft"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
