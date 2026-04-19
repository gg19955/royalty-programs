import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Nav } from "@/components/nav";
import { HeroSearch } from "@/components/listings/hero-search";
import { PropertyCard, type PropertyCardData } from "@/components/listings/property-card";
import { regionToSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Map region slugs back to display labels for DB filtering. */
const REGION_SLUG_MAP: Record<string, string> = {
  "mornington-peninsula": "Mornington Peninsula",
  "yarra-valley": "Yarra Valley",
  "melbourne-surrounds": "Melbourne & Surrounds",
  "bellarine-peninsula": "Bellarine Peninsula",
};

type RawProperty = PropertyCardData & {
  id: string;
  hero_url: string | null;
  property_images: { url: string; is_hero: boolean; sort_order: number }[] | null;
};

export default async function StaysPage({
  searchParams,
}: {
  searchParams?: {
    region?: string | string[];
    guests?: string;
    check_in?: string;
    check_out?: string;
  };
}) {
  const admin = createAdminClient();

  // Normalise region param (single or multi-value) to label array.
  const rawRegions = searchParams?.region
    ? Array.isArray(searchParams.region)
      ? searchParams.region
      : [searchParams.region]
    : [];
  // Accept either slugs (from HeroSearch) or raw labels (from filter chips).
  const regionLabels = rawRegions
    .map((r) => REGION_SLUG_MAP[r] ?? r)
    .filter(Boolean);

  const guestsParam = Number(searchParams?.guests);
  const checkIn = searchParams?.check_in ?? "";
  const checkOut = searchParams?.check_out ?? "";
  const hasDateRange = /^\d{4}-\d{2}-\d{2}$/.test(checkIn) && /^\d{4}-\d{2}-\d{2}$/.test(checkOut);

  // If a date range was requested, find property IDs that have an overlapping
  // availability block - these will be excluded from results.
  let blockedPropertyIds: string[] = [];
  if (hasDateRange) {
    const { data: blocked } = await admin
      .from("availability_blocks")
      .select("property_id")
      .lt("start_date", checkOut) // block starts before checkout
      .gt("end_date", checkIn);  // block ends after checkin
    blockedPropertyIds = Array.from(
      new Set((blocked ?? []).map((r) => r.property_id)),
    );
  }

  // Base query: published listings only.
  let query = admin
    .from("properties")
    .select(
      "id, slug, name, headline, region, city, bedrooms, max_guests, base_rate_cents, hero_url, property_images(url, is_hero, sort_order)",
    )
    .eq("listing_status", "published")
    .order("published_at", { ascending: false })
    .limit(60);

  if (regionLabels.length === 1) {
    query = query.eq("region", regionLabels[0]);
  } else if (regionLabels.length > 1) {
    query = query.in("region", regionLabels);
  }
  if (Number.isFinite(guestsParam) && guestsParam > 0) {
    query = query.gte("max_guests", guestsParam);
  }
  if (blockedPropertyIds.length > 0) {
    // PostgREST "not in" - exclude unavailable properties.
    query = query.not("id", "in", `(${blockedPropertyIds.join(",")})`);
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

  // Slug versions of selected regions for passing back to HeroSearch defaults.
  const selectedSlugs = rawRegions.filter((r) => REGION_SLUG_MAP[r] || regionLabels.includes(r));

  return (
    <>
      <Nav />
      <HeroSearch
        defaults={{
          checkIn: checkIn || undefined,
          checkOut: checkOut || undefined,
          regions: selectedSlugs.length ? selectedSlugs : undefined,
          guests: guestsParam > 0 ? guestsParam : undefined,
        }}
      />

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
        {hasDateRange && (
          <p className="mb-6 text-sm text-neutral-500">
            Showing properties available {checkIn} &rarr; {checkOut}
          </p>
        )}

        {/* Region chips */}
        <div className="flex flex-wrap gap-2 text-xs">
          <FilterChip
            active={regionLabels.length === 0}
            href="/stays"
            label="All regions"
          />
          {regions.map((r) => (
            <FilterChip
              key={r}
              active={regionLabels.includes(r)}
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
