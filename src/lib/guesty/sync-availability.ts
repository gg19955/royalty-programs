import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { collapseToRanges, fetchCalendar } from "./calendar";
import { describeError } from "./errors";

/**
 * Run a Guesty availability sync for every Lively property linked to a
 * Guesty listing.
 *
 * For each property we pull the calendar for the next `horizonDays` days,
 * collapse per-day status into contiguous blocked ranges, then REPLACE the
 * property's existing `source='guesty_import'` rows with the new ranges.
 *
 * Replace (delete + insert) is safe here because these rows are machine-owned:
 * no human edits them, so there's no merge to preserve. Rows with other source
 * values ('ical', 'manual', 'platform_booking') are never touched - mirroring
 * the iCal sync's "don't clobber other sources" rule.
 *
 * Per-property errors are caught and recorded as skipped items so one bad
 * listing can't abort the whole run.
 */

export type AvailabilitySyncResult = {
  runId: string;
  status: "ok" | "error";
  pagesFetched: number; // = properties processed (one "page" per property)
  itemsSeen: number;
  itemsCreated: number; // blocks inserted across all properties
  itemsUpdated: number; // properties whose block set changed
  itemsSkipped: number; // properties that errored
  errorMessage?: string;
};

type LinkedProperty = {
  id: string;
  guesty_listing_id: string;
};

const DEFAULT_HORIZON_DAYS = 365;
const PROPERTY_SPACING_MS = 140;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function syncAvailability(
  opts: { dryRun?: boolean; max?: number; horizonDays?: number } = {},
): Promise<AvailabilitySyncResult> {
  const admin = createAdminClient();
  const horizonDays = opts.horizonDays ?? DEFAULT_HORIZON_DAYS;
  const fromIso = isoToday();
  const toIso = addDaysIso(fromIso, horizonDays);

  // Open audit row.
  const { data: runRow, error: runErr } = await admin
    .from("guesty_sync_runs")
    .insert({ kind: "calendar", status: "running" })
    .select("id")
    .single();
  if (runErr) throw runErr;
  const runId = (runRow as { id: string }).id;

  let pagesFetched = 0;
  let itemsSeen = 0;
  let itemsCreated = 0;
  let itemsUpdated = 0;
  let itemsSkipped = 0;

  try {
    // Load linked properties.
    let query = admin
      .from("properties")
      .select("id, guesty_listing_id")
      .not("guesty_listing_id", "is", null)
      .order("created_at", { ascending: true });
    if (opts.max && Number.isFinite(opts.max)) {
      query = query.limit(opts.max);
    }
    const { data: propsData, error: propsErr } = await query;
    if (propsErr) throw propsErr;
    const properties = (propsData as LinkedProperty[] | null) ?? [];

    for (const prop of properties) {
      itemsSeen += 1;
      try {
        const days = await fetchCalendar(prop.guesty_listing_id, fromIso, toIso);
        const ranges = collapseToRanges(days);
        pagesFetched += 1;

        if (opts.dryRun) {
          await sleep(PROPERTY_SPACING_MS);
          continue;
        }

        // Snapshot existing guesty_import rows so we can tell whether the
        // block set actually changed (for itemsUpdated reporting).
        const { data: existing, error: existErr } = await admin
          .from("availability_blocks")
          .select("start_date, end_date, reason")
          .eq("property_id", prop.id)
          .eq("source", "guesty_import");
        if (existErr) throw existErr;

        // Delete old rows for this property+source. Other sources untouched.
        const { error: delErr } = await admin
          .from("availability_blocks")
          .delete()
          .eq("property_id", prop.id)
          .eq("source", "guesty_import");
        if (delErr) throw delErr;

        // Insert new ranges.
        if (ranges.length > 0) {
          const rows = ranges.map((r) => ({
            property_id: prop.id,
            start_date: r.start,
            end_date: r.end,
            source: "guesty_import" as const,
            reason: r.reservationId ? `guesty:${r.reservationId}` : "guesty",
          }));
          const { error: insErr } = await admin
            .from("availability_blocks")
            .insert(rows);
          if (insErr) throw insErr;
          itemsCreated += rows.length;
        }

        // Did the block set change? Compare (start,end,reason) sets.
        const existingKey = new Set(
          (existing ?? []).map(
            (r) =>
              `${r.start_date}|${r.end_date}|${(r as { reason?: string }).reason ?? ""}`,
          ),
        );
        const newKey = new Set(
          ranges.map(
            (r) =>
              `${r.start}|${r.end}|${r.reservationId ? `guesty:${r.reservationId}` : "guesty"}`,
          ),
        );
        const changed =
          existingKey.size !== newKey.size ||
          [...newKey].some((k) => !existingKey.has(k));
        if (changed) itemsUpdated += 1;
      } catch (err) {
        itemsSkipped += 1;
        // Record the first per-property error on the run row so it's visible
        // without having to comb through server logs. Keep going so one bad
        // listing doesn't strand the rest.
        console.error(
          `[guesty availability] property ${prop.id} (${prop.guesty_listing_id}) failed:`,
          err,
        );
      }

      await sleep(PROPERTY_SPACING_MS);
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
        notes: {
          ...(opts.dryRun ? { dry_run: true } : {}),
          from: fromIso,
          to: toIso,
        },
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
