import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ListingRow = {
  id: string;
  name: string;
  slug: string | null;
  region: string | null;
  city: string | null;
  base_rate_cents: number | null;
  listing_status: "draft" | "pending_review" | "published" | "paused" | "archived";
  published_at: string | null;
  property_images: { url: string; is_hero: boolean; sort_order: number }[] | null;
};

export default async function HostListingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("host_id")
    .eq("id", user!.id)
    .single();
  const hostId = profile!.host_id!;

  const admin = createAdminClient();
  const { data } = await admin
    .from("properties")
    .select(
      "id, name, slug, region, city, base_rate_cents, listing_status, published_at, property_images(url, is_hero, sort_order)",
    )
    .eq("host_id", hostId)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as ListingRow[];

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-brand-accent">
            Listings
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-brand sm:text-5xl">
            Your collection.
          </h1>
        </div>
        <Link
          href="/host/dashboard/listings/new"
          className="rounded-sm bg-brand px-5 py-3 text-[11px] uppercase tracking-[0.22em] text-white hover:bg-black"
        >
          New listing
        </Link>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-line bg-brand-soft px-8 py-16 text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-brand-accent">
            Nothing yet
          </p>
          <h2 className="mt-4 font-display text-3xl text-brand">
            Start your first listing.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-neutral-600">
            Draft a property now — add photography and copy when you&apos;re
            ready. Nothing goes public until you publish.
          </p>
          <Link
            href="/host/dashboard/listings/new"
            className="mt-6 inline-block rounded-sm bg-brand px-5 py-3 text-[11px] uppercase tracking-[0.22em] text-white hover:bg-black"
          >
            New listing
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-brand-line overflow-hidden rounded-xl border border-brand-line bg-white">
          {rows.map((r) => {
            const hero = [...(r.property_images ?? [])].sort(
              (a, b) =>
                Number(b.is_hero) - Number(a.is_hero) ||
                a.sort_order - b.sort_order,
            )[0];
            return (
              <li key={r.id}>
                <Link
                  href={`/host/dashboard/listings/${r.id}`}
                  className="flex items-center gap-5 px-5 py-4 hover:bg-brand-soft"
                >
                  <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden bg-brand-soft">
                    {hero ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={hero.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-brand-accent">
                        No photo
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-brand">{r.name}</div>
                    <div className="mt-1 text-xs text-neutral-500">
                      {[r.city, r.region].filter(Boolean).join(" · ") || "—"}
                    </div>
                  </div>
                  <div className="hidden text-right text-sm text-neutral-700 sm:block">
                    {r.base_rate_cents
                      ? `${formatCurrency(r.base_rate_cents)} / night`
                      : "No rate"}
                  </div>
                  <StatusPill status={r.listing_status} />
                  <div className="hidden w-24 text-right text-xs text-neutral-400 md:block">
                    {r.published_at ? formatDate(r.published_at) : "Draft"}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: ListingRow["listing_status"] }) {
  const map: Record<ListingRow["listing_status"], string> = {
    draft: "bg-neutral-100 text-neutral-700",
    pending_review: "bg-yellow-100 text-yellow-800",
    published: "bg-green-100 text-green-800",
    paused: "bg-orange-100 text-orange-800",
    archived: "bg-neutral-200 text-neutral-600",
  };
  return (
    <span
      className={
        "hidden rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] sm:inline-block " +
        map[status]
      }
    >
      {status.replace("_", " ")}
    </span>
  );
}
