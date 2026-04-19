import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";
import { describeError } from "./errors";
import { iterateActiveListings, type GuestyListing } from "./listings";

/**
 * Run a Guesty listings sync for the Lively host.
 *
 * Upserts into public.properties keyed on guesty_listing_id. Existing rows are
 * updated in place; new rows are created as draft listings so an admin can
 * review before publishing. An audit row is written to guesty_sync_runs.
 *
 * Pass `{ dryRun: true }` to fetch and count without writing - useful for the
 * very first smoke test against the live API.
 */

export type SyncResult = {
  runId: string;
  status: "ok" | "error";
  pagesFetched: number;
  itemsSeen: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsSkipped: number;
  errorMessage?: string;
};

type PropertyRow = {
  id: string;
  guesty_listing_id: string | null;
};

function mapPropertyType(g: string | undefined): string {
  if (!g) return "other";
  const v = g.toLowerCase();
  if (v.includes("apartment")) return "apartment";
  if (v.includes("villa")) return "villa";
  if (v.includes("beach")) return "beach_house";
  if (v.includes("chalet")) return "chalet";
  if (v.includes("farm")) return "farm_stay";
  if (v.includes("cottage")) return "cottage";
  if (v.includes("penthouse")) return "penthouse";
  return "other";
}

function toCents(v: number | undefined): number | null {
  if (v === undefined || v === null) return null;
  return Math.round(v * 100);
}

function buildRow(listing: GuestyListing, livelyHostId: string) {
  // Prefer the marketing `title` for the public card/detail UI. Fall back to
  // the internal `nickname` (always set in Guesty) and ultimately the _id.
  const name = listing.title || listing.nickname || listing._id;
  // `nickname` is a Guesty-unique short code (e.g. "10POINT", "11-13BRAD") so
  // slugifying it gives us a URL that's guaranteed collision-free across the
  // portfolio without an ugly UUID suffix. Hosts/admins can edit the slug
  // later in the admin UI if they want something prettier per listing.
  const slug = slugify(listing.nickname || listing._id);
  const hero_url =
    listing.picture?.regular ||
    listing.picture?.large ||
    listing.picture?.thumbnail ||
    null;
  return {
    guesty_listing_id: listing._id,
    host_id: livelyHostId,
    name,
    slug,
    hero_url,
    address: listing.address?.full ?? null,
    city: listing.address?.city ?? null,
    state: listing.address?.state ?? null,
    country: listing.address?.country ?? null,
    latitude: listing.address?.lat ?? null,
    longitude: listing.address?.lng ?? null,
    bedrooms: listing.bedrooms ?? null,
    bathrooms: listing.bathrooms ?? null,
    max_guests: listing.accommodates ?? null,
    property_type: mapPropertyType(listing.propertyType),
    base_rate_cents: toCents(listing.prices?.basePrice),
    cleaning_fee_cents: toCents(listing.prices?.cleaningFee),
    min_nights: listing.terms?.minNights ?? null,
    active: listing.active ?? true,
    // New rows start as drafts. Existing rows keep their current listing_status
    // (see update path below).
  };
}

export async function syncListings(opts: { dryRun?: boolean; max?: number } = {}): Promise<SyncResult> {
  const admin = createAdminClient();

  // Resolve the Lively host id (seeded in migration 0007).
  const { data: hostRow, error: hostErr } = await admin
    .from("hosts")
    .select("id")
    .eq("display_name", "Lively")
    .maybeSingle();
  if (hostErr) throw hostErr;
  if (!hostRow) throw new Error('Lively host row missing - was migration 0007 applied?');
  const livelyHostId = (hostRow as { id: string }).id;

  // Open an audit row.
  const { data: runRow, error: runErr } = await admin
    .from("guesty_sync_runs")
    .insert({ kind: "listings", status: "running" })
    .select("id")
    .single();
  if (runErr) throw runErr;
  const runId = (runRow as { id: string }).id;

  let pagesFetched = 0;
  let itemsSeen = 0;
  let itemsCreated = 0;
  let itemsUpdated = 0;
  const itemsSkipped = 0;

  try {
    for await (const page of iterateActiveListings({ max: opts.max })) {
      pagesFetched += 1;
      itemsSeen += page.length;

      if (opts.dryRun) continue;

      // Determine which ids already exist so we can split create/update counts.
      const ids = page.map((l) => l._id);
      const { data: existingRows, error: existErr } = await admin
        .from("properties")
        .select("id, guesty_listing_id")
        .in("guesty_listing_id", ids);
      if (existErr) throw existErr;
      const existingIds = new Set(
        (existingRows as PropertyRow[] | null ?? [])
          .map((r) => r.guesty_listing_id)
          .filter((v): v is string => v !== null),
      );

      const upsertRows = page.map((l) => {
        const row = buildRow(l, livelyHostId);
        // New rows default to draft; upsert() can't conditionally set a column
        // only on insert, so we set listing_status='draft' here and rely on
        // the onConflict clause NOT updating it for existing rows (handled
        // below via two-step create/update).
        return row;
      });

      // Two-step: insert new rows as drafts, update existing rows without
      // touching listing_status / published_at.
      const newRows = upsertRows.filter((r) => !existingIds.has(r.guesty_listing_id));
      const updateRows = upsertRows.filter((r) => existingIds.has(r.guesty_listing_id));

      if (newRows.length > 0) {
        const { error: insErr } = await admin
          .from("properties")
          .insert(
            newRows.map((r) => ({ ...r, listing_status: "draft" })),
          );
        if (insErr) throw insErr;
        itemsCreated += newRows.length;
      }

      for (const row of updateRows) {
        const { error: updErr } = await admin
          .from("properties")
          .update(row)
          .eq("guesty_listing_id", row.guesty_listing_id);
        if (updErr) throw updErr;
        itemsUpdated += 1;
      }
    }

    await admin
      .from("guesty_sync_runs")
      .update({
        status: "ok",
        finished_at: new Date().toISOString(),
        pages_fetched: pagesFetched,
        items_seen: itemsSeen,
        items_created: itemsCreated,
        items_updated: itemsUpdated,
        items_skipped: itemsSkipped,
        notes: opts.dryRun ? { dry_run: true } : {},
      })
      .eq("id", runId);

    return {
      runId,
      status: "ok",
      pagesFetched,
      itemsSeen,
      itemsCreated,
      itemsUpdated,
      itemsSkipped,
    };
  } catch (err) {
    const message = describeError(err);
    await admin
      .from("guesty_sync_runs")
      .update({
        status: "error",
        finished_at: new Date().toISOString(),
        pages_fetched: pagesFetched,
        items_seen: itemsSeen,
        items_created: itemsCreated,
        items_updated: itemsUpdated,
        items_skipped: itemsSkipped,
        error_message: message,
      })
      .eq("id", runId);

    return {
      runId,
      status: "error",
      pagesFetched,
      itemsSeen,
      itemsCreated,
      itemsUpdated,
      itemsSkipped,
      errorMessage: message,
    };
  }
}
