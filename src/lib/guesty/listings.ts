import "server-only";
import { guestyFetch } from "./client";

/**
 * Shape of a Guesty listing response. Guesty returns many more fields than we
 * care about — only the ones we actually persist are declared strictly; the
 * rest stay in `raw` so we can extend later without a migration.
 */
export type GuestyListing = {
  _id: string;
  nickname?: string;
  title?: string;
  accommodates?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  active?: boolean;
  address?: {
    full?: string;
    city?: string;
    state?: string;
    country?: string;
    lat?: number;
    lng?: number;
  };
  prices?: {
    basePrice?: number;
    cleaningFee?: number;
    currency?: string;
  };
  terms?: {
    minNights?: number;
  };
  // Guesty returns a hero picture per listing. We use `regular` for card
  // display; `thumbnail` as a fallback if absent.
  picture?: {
    thumbnail?: string;
    regular?: string;
    large?: string;
    caption?: string;
  };
  // everything else we received, for future use
  raw?: unknown;
};

type ListingsPage = {
  results: GuestyListing[];
  count: number;
  limit: number;
  skip: number;
};

const DEFAULT_PAGE_SIZE = 25;
// Rate-limit pacing: 15 req/sec hard cap. We pace at ~7 req/sec (140ms spacing)
// to stay comfortably under while still moving quickly through 100+ listings.
const REQUEST_SPACING_MS = 140;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Iterates all active listings, paginating until fully consumed or the
 * supplied limit is reached. Yields one page at a time so the caller can
 * upsert incrementally and keep memory bounded.
 */
export async function* iterateActiveListings(opts: {
  pageSize?: number;
  max?: number;
} = {}): AsyncGenerator<GuestyListing[], void, void> {
  const limit = opts.pageSize ?? DEFAULT_PAGE_SIZE;
  const hardMax = opts.max ?? Number.POSITIVE_INFINITY;
  let skip = 0;
  let seen = 0;

  while (seen < hardMax) {
    const page = await guestyFetch<ListingsPage>("/listings", {
      query: { limit, skip, active: "true" },
    });
    if (!page.results || page.results.length === 0) return;

    yield page.results;
    seen += page.results.length;
    skip += page.results.length;

    if (page.results.length < limit) return; // end of data
    await sleep(REQUEST_SPACING_MS);
  }
}
