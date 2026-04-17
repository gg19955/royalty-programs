import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Nav } from "@/components/nav";
import { PropertyCard, type PropertyCardData } from "@/components/listings/property-card";
import { regionToSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Editorial copy for known regions. Add entries here as new regions seed.
const REGION_COPY: Record<string, { tagline: string; intro: string }> = {
  "Mornington Peninsula": {
    tagline: "Beaches, vineyards, and bathhouse afternoons",
    intro:
      "An hour south of Melbourne, the Peninsula trades pace for afternoons at the hot springs, Red Hill cellar doors, and long dinners above Port Phillip Bay.",
  },
  Daylesford: {
    tagline: "Mineral springs, forest paths, long weekends",
    intro:
      "Daylesford and the Macedon Ranges are slow by design. Expect spa mornings, bakery queues, and architecture that hides in the gums.",
  },
  "Great Ocean Road": {
    tagline: "Cliffs, surf breaks, and lighthouse weather",
    intro:
      "From Aireys to Apollo Bay, Victoria's southern coast is where the state comes to be quiet. Our houses sit close to the water — because that's the point.",
  },
};

type RawProperty = PropertyCardData & {
  id: string;
  property_images: { url: string; is_hero: boolean; sort_order: number }[] | null;
};

export default async function RegionPage({
  params,
}: {
  params: { region: string };
}) {
  const admin = createAdminClient();

  // Map incoming slug to a canonical region name by scanning published rows.
  const { data: regions } = await admin
    .from("properties")
    .select("region")
    .eq("listing_status", "published")
    .not("region", "is", null);

  const uniqueRegions = Array.from(
    new Set((regions ?? []).map((r) => r.region).filter((x): x is string => !!x)),
  );
  const regionName = uniqueRegions.find((r) => regionToSlug(r) === params.region);
  if (!regionName) notFound();

  const copy = REGION_COPY[regionName] ?? {
    tagline: "A curated slice of Victoria",
    intro: "Properties we've hand-picked in this region.",
  };

  const { data } = await admin
    .from("properties")
    .select(
      "id, slug, name, headline, region, city, bedrooms, max_guests, base_rate_cents, property_images(url, is_hero, sort_order)",
    )
    .eq("listing_status", "published")
    .eq("region", regionName)
    .order("published_at", { ascending: false });

  const cards: PropertyCardData[] = ((data as unknown as RawProperty[]) ?? []).map((r) => {
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
    };
  });

  return (
    <>
      <Nav />
      <section className="border-b border-brand-line bg-brand-soft">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-10 sm:py-32">
          <Link
            href="/stays"
            className="text-[11px] uppercase tracking-[0.28em] text-brand-accent hover:text-brand"
          >
            ← All regions
          </Link>
          <p className="mt-10 text-[11px] uppercase tracking-[0.32em] text-brand-accent">
            Region
          </p>
          <h1 className="mt-4 max-w-5xl font-display text-6xl leading-[0.95] tracking-[-0.02em] text-brand sm:text-8xl md:text-[8rem]">
            {regionName}.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-[1.6] text-neutral-700">
            {copy.tagline}
          </p>
          <p className="mt-6 max-w-2xl text-base leading-[1.7] text-neutral-600">
            {copy.intro}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10">
        <div className="text-[11px] uppercase tracking-[0.28em] text-brand-accent">
          {cards.length} {cards.length === 1 ? "property" : "properties"} in {regionName}
        </div>
        <div className="mt-10 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <PropertyCard key={c.slug} p={c} />
          ))}
        </div>
      </section>
    </>
  );
}

export async function generateMetadata({ params }: { params: { region: string } }) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("properties")
    .select("region")
    .eq("listing_status", "published")
    .not("region", "is", null);
  const regions = Array.from(new Set((data ?? []).map((r) => r.region).filter(Boolean)));
  const regionName = regions.find((r) => r && regionToSlug(r) === params.region);
  if (!regionName) return { title: "Region — Lively" };
  return {
    title: `${regionName} — Lively`,
    description: `Curated luxury stays across ${regionName}.`,
  };
}
