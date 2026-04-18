import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Nav } from "@/components/nav";
import { PropertyGallery, type GalleryImage } from "@/components/listings/property-gallery";
import { RatePreview } from "@/components/listings/rate-preview";
import { AvailabilityCalendar } from "@/components/listings/availability-calendar";
import { EditorialSignatureDetail } from "@/components/listings/editorial-signature-detail";
import { computeRate } from "@/lib/listings/rate";
import { getBlockedRanges } from "@/lib/listings/availability";
import { getSignatureHomeBySlug } from "@/lib/content/signature-homes";
import { formatCurrency, regionToSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PropertyRow = {
  id: string;
  slug: string;
  name: string;
  headline: string | null;
  description: string | null;
  address: string | null;
  region: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  max_guests: number | null;
  amenities: string[] | null;
  base_rate_cents: number | null;
  cleaning_fee_cents: number | null;
  min_nights: number | null;
  check_in_time: string | null;
  check_out_time: string | null;
  cancellation_policy: string | null;
  house_rules: string | null;
  property_images: { url: string; alt_text: string | null; is_hero: boolean; sort_order: number }[] | null;
  hosts: { display_name: string } | null;
};

function parseDate(s?: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export default async function PropertyDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { checkIn?: string; checkOut?: string };
}) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("properties")
    .select(
      "id, slug, name, headline, description, address, region, city, state, country, bedrooms, bathrooms, max_guests, amenities, base_rate_cents, cleaning_fee_cents, min_nights, check_in_time, check_out_time, cancellation_policy, house_rules, property_images(url, alt_text, is_hero, sort_order), hosts(display_name)",
    )
    .eq("slug", params.slug)
    .eq("listing_status", "published")
    .maybeSingle();
  const property = data as unknown as PropertyRow | null;
  if (!property) {
    const signature = getSignatureHomeBySlug(params.slug);
    if (signature) {
      return <EditorialSignatureDetail home={signature} />;
    }
    notFound();
  }

  const gallery: GalleryImage[] = [...(property.property_images ?? [])]
    .sort(
      (a, b) => Number(b.is_hero) - Number(a.is_hero) || a.sort_order - b.sort_order,
    )
    .map((i) => ({ url: i.url, alt_text: i.alt_text }));

  const checkIn = parseDate(searchParams?.checkIn);
  const checkOut = parseDate(searchParams?.checkOut);
  const rate =
    checkIn && checkOut && checkOut > checkIn
      ? await computeRate({ propertyId: property.id, checkIn, checkOut })
      : null;

  const blocks = await getBlockedRanges(property.id);

  return (
    <>
      <Nav />
      <article className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20">
        <nav className="text-[11px] uppercase tracking-[0.28em] text-brand-accent">
          <Link href="/stays" className="hover:text-brand">
            Stays
          </Link>
          {property.region && (
            <>
              <span className="mx-2 text-neutral-300">/</span>
              <Link
                href={`/regions/${regionToSlug(property.region)}`}
                className="hover:text-brand"
              >
                {property.region}
              </Link>
            </>
          )}
        </nav>

        <header className="mt-8">
          <h1 className="max-w-5xl font-display text-5xl leading-[0.98] tracking-[-0.02em] text-brand sm:text-7xl md:text-8xl">
            {property.name}
          </h1>
          {property.headline && (
            <p className="mt-6 max-w-2xl text-lg leading-[1.6] text-neutral-700">
              {property.headline}
            </p>
          )}
          <div className="mt-6 text-[11px] uppercase tracking-[0.24em] text-brand-accent">
            {[property.city, property.state, property.country].filter(Boolean).join(" · ")}
          </div>
        </header>

        <div className="mt-12">
          <PropertyGallery images={gallery} />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-10">
            <FactRow property={property} />

            {property.description && (
              <section>
                <h2 className="text-xs uppercase tracking-[0.22em] text-brand-accent">
                  About the stay
                </h2>
                <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-neutral-700">
                  {property.description}
                </p>
              </section>
            )}

            {property.amenities && property.amenities.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-[0.22em] text-brand-accent">
                  Amenities
                </h2>
                <ul className="mt-3 grid grid-cols-2 gap-y-2 text-sm text-neutral-700 sm:grid-cols-3">
                  {property.amenities.map((a) => (
                    <li key={a} className="flex items-center gap-2 before:text-brand-accent before:content-['—']">
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h2 className="text-xs uppercase tracking-[0.22em] text-brand-accent">
                Availability
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Dates struck through are already booked.
              </p>
              <div className="mt-4">
                <AvailabilityCalendar blocks={blocks} />
              </div>
            </section>

            {property.house_rules && (
              <section>
                <h2 className="text-xs uppercase tracking-[0.22em] text-brand-accent">
                  House rules
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm text-neutral-700">
                  {property.house_rules}
                </p>
              </section>
            )}

            {property.hosts && (
              <section className="rounded-xl border border-brand-line bg-brand-soft p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-brand-accent">
                  Hosted by
                </div>
                <div className="mt-1 font-display text-xl text-brand">
                  {property.hosts.display_name}
                </div>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-xl border border-brand-line bg-white p-6 shadow-sm">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-2xl text-brand">
                  {property.base_rate_cents
                    ? formatCurrency(property.base_rate_cents)
                    : "POA"}
                </span>
                <span className="text-xs text-neutral-500">/ night</span>
              </div>
              <div className="mt-5">
                <RatePreview
                  rate={rate}
                  checkIn={searchParams?.checkIn}
                  checkOut={searchParams?.checkOut}
                />
              </div>
              <Link
                href={`/stays/${property.slug}/book${
                  searchParams?.checkIn && searchParams?.checkOut
                    ? `?checkIn=${searchParams.checkIn}&checkOut=${searchParams.checkOut}`
                    : ""
                }`}
                className="mt-6 block rounded-sm bg-brand px-5 py-3 text-center text-sm font-medium uppercase tracking-[0.18em] text-white hover:bg-black"
              >
                Enquire
              </Link>
              <p className="mt-3 text-center text-[11px] uppercase tracking-[0.16em] text-brand-accent">
                Instant booking opens soon
              </p>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}

function FactRow({ property }: { property: PropertyRow }) {
  const items = [
    property.bedrooms ? `${property.bedrooms} bedroom${property.bedrooms === 1 ? "" : "s"}` : null,
    property.bathrooms ? `${property.bathrooms} bath${property.bathrooms === 1 ? "" : "s"}` : null,
    property.max_guests ? `sleeps ${property.max_guests}` : null,
    property.min_nights ? `${property.min_nights}-night min` : null,
    property.check_in_time && property.check_out_time
      ? `${property.check_in_time.slice(0, 5)} / ${property.check_out_time.slice(0, 5)}`
      : null,
  ].filter(Boolean);
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-2 border-y border-brand-line py-4 text-sm text-neutral-700">
      {items.map((x, i) => (
        <span key={i}>{x}</span>
      ))}
    </div>
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("properties")
    .select("name, headline, region, city")
    .eq("slug", params.slug)
    .eq("listing_status", "published")
    .maybeSingle();
  if (!data) {
    const signature = getSignatureHomeBySlug(params.slug);
    if (signature) {
      return {
        title: `${signature.name} — Lively`,
        description: signature.caption,
      };
    }
    return { title: "Stay — Lively" };
  }
  const loc = [data.city, data.region].filter(Boolean).join(", ");
  return {
    title: `${data.name} — Lively`,
    description: data.headline ?? `A curated Lively stay in ${loc}.`,
  };
}
