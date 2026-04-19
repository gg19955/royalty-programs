import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Nav } from "@/components/nav";
import { PropertyCard, type PropertyCardData } from "@/components/listings/property-card";
import { regionToSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

type RawProperty = PropertyCardData & {
  id: string;
  hero_url: string | null;
  property_images: { url: string; is_hero: boolean; sort_order: number }[] | null;
};

export default async function StaysPage({
  searchParams,
}: {
  searchParams?: { region?: string; guests?: string };
}) {
  const admin = createAdminClient();

  // Base query: published listings only.
  let query = admin
    .from("properties")
    .select(
      "id, slug, name, headline, region, city, bedrooms, max_guests, base_rate_cents, hero_url, property_images(url, is_hero, sort_order)",
    )
    .eq("listing_status", "published")
    .order("published_at", { ascending: false })
    .limit(60);

  if (searchParams?.region) query = query.eq("region", searchParams.region);
  const guestsParam = Number(searchParams?.guests);
  if (Number.isFinite(guestsParam) && guestsParam > 0) {
    query = query.gte("max_guests", guestsParam);
  }

  const { data } = await query;
  const rows = (data ?? []) as unknown as RawProperty[];

  const cards: PropertyCardData[] = rows.map((r) => {
    // Gallery hero wins if the host uploaded images; otherwise fall back to
    // the Guesty-cached hero_url on the row itself.
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
      hero_url: imgs[0]?.url ?? r.hero_url ?? null,
    };
  });

  // Distinct regions for the filter chips.
  const { data: regionRows } = await admin
    .from("properties")
    .select("region")
    .eq("listing_status", "published")
    .not("region", "is", null);
  const regions = Array.from(
    new Set((regionRows ?? []).map((r) => r.region).filter((x): x is string => !!x)),
  ).sort();

  return (
    <>
      <Nav />
      <section className="border-b border-brand-line bg-brand-soft">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-10 sm:py-32">
          <p className="text-[11px] uppercase tracking-[0.32em] text-brand-accent">
            The collection
          </p>
          <h1 className="mt-6 max-w-5xl font-display text-6xl leading-[0.96] tracking-[-0.02em] text-brand sm:text-8xl md:text-[7rem]">
            Stay somewhere considered.
          </h1>
          <p className="mt-8 max-w-xl text-base leading-[1.7] text-neutral-700 sm:text-lg">
            Every property on Lively is hand-picked — for the architecture,
            the site, the host, the service. Browse the current collection.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
        {/* Region chips */}
        <div className="flex flex-wrap gap-2 text-xs">
          <FilterChip
            active={!searchParams?.region}
            href="/stays"
            label="All regions"
          />
          {regions.map((r) => (
            <FilterChip
              key={r}
              active={searchParams?.region === r}
              href={`/stays?region=${encodeURIComponent(r)}`}
              label={r}
            />
          ))}
        </div>

        {cards.length === 0 ? (
          <div className="mt-14 rounded-xl border border-dashed border-brand-line py-20 text-center text-sm text-neutral-500">
            No properties match those filters yet.
          </div>
        ) : (
          <div className="mt-12 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <PropertyCard key={c.slug} p={c} />
            ))}
          </div>
        )}

        {regions.length > 0 && (
          <div className="mt-20 border-t border-brand-line pt-10">
            <div className="text-xs uppercase tracking-[0.22em] text-brand-accent">
              By region
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {regions.map((r) => (
                <Link
                  key={r}
                  href={`/regions/${regionToSlug(r)}`}
                  className="text-brand underline-offset-4 hover:underline"
                >
                  {r}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function FilterChip({ active, href, label }: { active: boolean; href: string; label: string }) {
  return (
    <Link
      href={href}
      className={
        "rounded-sm border px-3 py-1.5 transition " +
        (active
          ? "border-brand bg-brand text-white"
          : "border-brand-line text-neutral-700 hover:border-brand hover:text-brand")
      }
    >
      {label}
    </Link>
  );
}
