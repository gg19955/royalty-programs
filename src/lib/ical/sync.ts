import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseIcs } from "./parse";

/**
 * Pulls one iCal feed and reconciles its VEVENTs against availability_blocks.
 *
 * Reconciliation rule: for this feed's property we own rows where
 *   source = 'ical' AND ical_event_id IS NOT NULL.
 * We upsert every event by (property_id, ical_event_id) and delete any
 * existing ical row whose event_id is NOT in the current feed — that's how
 * we handle cancellations / removed bookings without the feed having to
 * announce them explicitly.
 *
 * Other-source rows (platform_booking, manual) are never touched, so a
 * host's iCal sync can't clobber a Lively-platform booking.
 */

export type FeedSyncResult = {
  feedId: string;
  status: "ok" | "error";
  eventsSeen: number;
  blocksInserted: number;
  blocksUpdated: number;
  blocksDeleted: number;
  errorMessage?: string;
};

type FeedRow = {
  id: string;
  property_id: string;
  url: string;
  label: string;
  active: boolean;
};

const FETCH_TIMEOUT_MS = 15_000;

async function fetchIcs(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    // Airbnb/VRBO serve .ics as text/calendar; some providers return
    // text/plain. We accept whatever they send and parse by content.
    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      redirect: "follow",
      headers: { accept: "text/calendar, text/plain, */*" },
    });
    if (!res.ok) {
      throw new Error(`iCal fetch failed: ${res.status} ${res.statusText}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

export async function syncOneFeed(feedId: string): Promise<FeedSyncResult> {
  const admin = createAdminClient();

  const { data: feed, error: feedErr } = await admin
    .from("ical_feeds")
    .select("id, property_id, url, label, active")
    .eq("id", feedId)
    .single();
  if (feedErr || !feed) {
    throw new Error(`iCal feed ${feedId} not found`);
  }
  const row = feed as FeedRow;

  try {
    const ics = await fetchIcs(row.url);
    const events = parseIcs(ics);

    // Pull existing ical blocks for this property so we can diff.
    const { data: existing, error: existErr } = await admin
      .from("availability_blocks")
      .select("id, ical_event_id, start_date, end_date")
      .eq("property_id", row.property_id)
      .eq("source", "ical")
      .not("ical_event_id", "is", null);
    if (existErr) throw existErr;

    const existingByUid = new Map<string, { id: string; start_date: string; end_date: string }>(
      (existing ?? []).map((r) => [
        r.ical_event_id as string,
        { id: r.id as string, start_date: r.start_date as string, end_date: r.end_date as string },
      ]),
    );

    const seenUids = new Set<string>();
    let blocksInserted = 0;
    let blocksUpdated = 0;

    for (const ev of events) {
      seenUids.add(ev.uid);
      const prior = existingByUid.get(ev.uid);
      if (!prior) {
        const { error: insErr } = await admin.from("availability_blocks").insert({
          property_id: row.property_id,
          start_date: ev.start,
          end_date: ev.end,
          source: "ical",
          ical_event_id: ev.uid,
          reason: ev.summary ?? `Imported from ${row.label}`,
        });
        if (insErr) throw insErr;
        blocksInserted += 1;
      } else if (prior.start_date !== ev.start || prior.end_date !== ev.end) {
        const { error: updErr } = await admin
          .from("availability_blocks")
          .update({
            start_date: ev.start,
            end_date: ev.end,
            reason: ev.summary ?? `Imported from ${row.label}`,
          })
          .eq("id", prior.id);
        if (updErr) throw updErr;
        blocksUpdated += 1;
      }
    }

    // Drop ical rows whose UID isn't in this feed anymore.
    const toDelete: string[] = [];
    for (const [uid, prior] of existingByUid) {
      if (!seenUids.has(uid)) toDelete.push(prior.id);
    }
    let blocksDeleted = 0;
    if (toDelete.length > 0) {
      const { error: delErr } = await admin
        .from("availability_blocks")
        .delete()
        .in("id", toDelete);
      if (delErr) throw delErr;
      blocksDeleted = toDelete.length;
    }

    await admin
      .from("ical_feeds")
      .update({
        last_synced_at: new Date().toISOString(),
        last_sync_status: "ok",
        last_sync_error: null,
        last_event_count: events.length,
      })
      .eq("id", row.id);

    return {
      feedId: row.id,
      status: "ok",
      eventsSeen: events.length,
      blocksInserted,
      blocksUpdated,
      blocksDeleted,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await admin
      .from("ical_feeds")
      .update({
        last_synced_at: new Date().toISOString(),
        last_sync_status: "error",
        last_sync_error: message,
      })
      .eq("id", row.id);

    return {
      feedId: row.id,
      status: "error",
      eventsSeen: 0,
      blocksInserted: 0,
      blocksUpdated: 0,
      blocksDeleted: 0,
      errorMessage: message,
    };
  }
}

/**
 * Sweeps every active feed. Called by the scheduled reconcile job (slice 4)
 * and by the admin "Run reconcile now" button.
 */
export async function syncAllActiveFeeds(): Promise<FeedSyncResult[]> {
  const admin = createAdminClient();
  const { data: feeds, error } = await admin
    .from("ical_feeds")
    .select("id")
    .eq("active", true);
  if (error) throw error;

  const results: FeedSyncResult[] = [];
  for (const f of feeds ?? []) {
    results.push(await syncOneFeed((f as { id: string }).id));
  }
  return results;
}
