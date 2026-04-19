import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ListingForm } from "./listing-form";
import { ImageManager } from "./image-manager";
import { ListingActions } from "./listing-actions";

export const dynamic = "force-dynamic";

export default async function EditListingPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, host_id")
    .eq("id", user.id)
    .single();
  if (!profile || (profile.role !== "host" && profile.role !== "admin")) {
    redirect("/portal");
  }

  const admin = createAdminClient();
  const { data: listing } = await admin
    .from("properties")
    .select(
      "id, host_id, name, slug, headline, description, region, city, state, country, property_type, bedrooms, bathrooms, max_guests, min_nights, amenities, base_rate_cents, cleaning_fee_cents, cancellation_policy, check_in_time, check_out_time, house_rules, listing_status, published_at",
    )
    .eq("id", params.id)
    .single();
  if (!listing) notFound();
  if (profile.role !== "admin" && listing.host_id !== profile.host_id) {
    redirect("/host/dashboard/listings");
  }

  const { data: images } = await admin
    .from("property_images")
    .select("id, url, is_hero, sort_order")
    .eq("property_id", listing.id)
    .order("sort_order", { ascending: true });

  const { data: host } = await admin
    .from("hosts")
    .select("agreement_accepted_at, legal_name, abn, kyc_status")
    .eq("id", listing.host_id!)
    .single();
  const onboardingReady =
    !!host?.agreement_accepted_at &&
    !!host?.legal_name &&
    !!host?.abn &&
    (host.kyc_status === "pending" || host.kyc_status === "verified");

  return (
    <div className="space-y-10">
      <header className="flex items-start justify-between gap-6">
        <div>
          <Link
            href="/host/dashboard/listings"
            className="text-[11px] uppercase tracking-[0.22em] text-brand-accent hover:text-brand"
          >
            ← Listings
          </Link>
          <h1 className="mt-4 font-display text-4xl leading-tight text-brand sm:text-5xl">
            {listing.name}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <StatusPill status={listing.listing_status} />
            {listing.slug ? (
              <span className="text-xs text-neutral-500">/stays/{listing.slug}</span>
            ) : null}
          </div>
        </div>
        <ListingActions
          propertyId={listing.id}
          status={listing.listing_status}
          onboardingReady={onboardingReady}
        />
      </header>

      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-[0.22em] text-brand-accent">
          Photography
        </h2>
        <ImageManager
          propertyId={listing.id}
          images={images ?? []}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-[0.22em] text-brand-accent">
          Details
        </h2>
        <ListingForm
          propertyId={listing.id}
          initial={{
            name: listing.name,
            headline: listing.headline,
            description: listing.description,
            region: listing.region,
            city: listing.city,
            state: listing.state,
            country: listing.country,
            property_type: listing.property_type,
            bedrooms: listing.bedrooms,
            bathrooms: listing.bathrooms,
            max_guests: listing.max_guests,
            min_nights: listing.min_nights,
            amenities: listing.amenities ?? [],
            base_rate_cents: listing.base_rate_cents,
            cleaning_fee_cents: listing.cleaning_fee_cents,
            cancellation_policy: listing.cancellation_policy,
            check_in_time: listing.check_in_time,
            check_out_time: listing.check_out_time,
            house_rules: listing.house_rules,
          }}
        />
      </section>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-700",
    pending_review: "bg-yellow-100 text-yellow-800",
    published: "bg-green-100 text-green-800",
    paused: "bg-orange-100 text-orange-800",
    archived: "bg-neutral-200 text-neutral-600",
  };
  return (
    <span
      className={
        "rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] " +
        (map[status] ?? "bg-neutral-100 text-neutral-700")
      }
    >
      {status.replace("_", " ")}
    </span>
  );
}
