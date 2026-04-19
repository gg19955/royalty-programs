import "server-only";
import { guestyFetch } from "./client";

/**
 * Guesty calendar fetcher.
 *
 * Guesty's Open API exposes per-listing, per-day availability at:
 *   GET /availability-pricing/api/calendar/listings/{id}?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 *
 * Each day has a `status` and, when booked, a `reservationId`. We normalise
 * to an internal shape and treat everything except 'available' as blocked
 * (covers 'booked', 'reserved', 'unavailable', owner stays, etc.).
 *
 * Guesty caps a single calendar response at ~31 days, so we loop in 30-day
 * windows across the requested horizon. Pacing matches listings.ts (~7 req/s)
 * to stay well under the 15 req/s hard cap.
 */

export type CalendarDay = {
  date: string; // ISO date YYYY-MM-DD
  status: "available" | "blocked";
  reservationId?: string;
};

type GuestyCalendarEntry = {
  date?: string;
  status?: string;
  reservationId?: string | null;
  listing?: unknown;
  listingId?: string;
};

type GuestyCalendarResponse =
  | GuestyCalendarEntry[]
  | {
      data?: GuestyCalendarEntry[] | { days?: GuestyCalendarEntry[] };
      results?: GuestyCalendarEntry[];
      days?: GuestyCalendarEntry[];
    };

const WINDOW_DAYS = 30;
const REQUEST_SPACING_MS = 140;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDate(d);
}

function extractEntries(resp: GuestyCalendarResponse): GuestyCalendarEntry[] {
  if (Array.isArray(resp)) return resp;
  if (!resp || typeof resp !== "object") return [];
  const r = resp as {
    data?: unknown;
    results?: unknown;
    days?: unknown;
  };
  if (Array.isArray(r.data)) return r.data as GuestyCalendarEntry[];
  if (r.data && typeof r.data === "object" && Array.isArray((r.data as { days?: unknown }).days)) {
    return (r.data as { days: GuestyCalendarEntry[] }).days;
  }
  if (Array.isArray(r.results)) return r.results as GuestyCalendarEntry[];
  if (Array.isArray(r.days)) return r.days as GuestyCalendarEntry[];
  return [];
}

function normaliseStatus(raw: string | undefined): "available" | "blocked" {
  // Treat anything that isn't an explicit 'available' as blocked. This covers
  // 'booked', 'reserved', 'unavailable', 'blocked', owner stays, and any new
  // status Guesty adds later - safer default than silently showing a blocked
  // day as available.
  if (!raw) return "blocked";
  return raw.toLowerCase() === "available" ? "available" : "blocked";
}

/**
 * Fetch the calendar for one listing over [fromIso, toIso] inclusive.
 * Returns one CalendarDay per date in the window.
 */
export async function fetchCalendar(
  listingId: string,
  fromIso: string,
  toIso: string,
): Promise<CalendarDay[]> {
  const out: CalendarDay[] = [];
  let cursor = fromIso;

  while (cursor <= toIso) {
    const windowEnd = addDays(cursor, WINDOW_DAYS - 1);
    const endIso = windowEnd > toIso ? toIso : windowEnd;

    const resp = await guestyFetch<GuestyCalendarResponse>(
      `/availability-pricing/api/calendar/listings/${listingId}`,
      { query: { startDate: cursor, endDate: endIso } },
    );

    for (const entry of extractEntries(resp)) {
      if (!entry.date) continue;
      out.push({
        date: entry.date,
        status: normaliseStatus(entry.status),
        reservationId: entry.reservationId ?? undefined,
      });
    }

    if (endIso === toIso) break;
    cursor = addDays(endIso, 1);
    await sleep(REQUEST_SPACING_MS);
  }

  return out;
}

/**
 * Collapse a day-by-day calendar into contiguous blocked ranges with
 * half-open semantics `[start, end)` - matches the convention used by the
 * iCal sync and the detail-page calendar component.
 *
 * Consecutive blocked days sharing the same reservationId (or both missing one)
 * merge into a single range. A change in reservationId starts a new range so
 * two back-to-back different bookings remain distinguishable in the `reason`
 * column.
 */
export type BlockedRange = {
  start: string; // inclusive YYYY-MM-DD
  end: string; // exclusive YYYY-MM-DD
  reservationId?: string;
};

export function collapseToRanges(days: CalendarDay[]): BlockedRange[] {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const ranges: BlockedRange[] = [];
  let current: { start: string; lastDate: string; reservationId?: string } | null = null;

  for (const day of sorted) {
    if (day.status === "available") {
      if (current) {
        ranges.push({
          start: current.start,
          end: addDays(current.lastDate, 1),
          reservationId: current.reservationId,
        });
        current = null;
      }
      continue;
    }

    // blocked day
    if (!current) {
      current = { start: day.date, lastDate: day.date, reservationId: day.reservationId };
      continue;
    }

    const isContiguous = addDays(current.lastDate, 1) === day.date;
    const sameReservation = current.reservationId === day.reservationId;
    if (isContiguous && sameReservation) {
      current.lastDate = day.date;
    } else {
      ranges.push({
        start: current.start,
        end: addDays(current.lastDate, 1),
        reservationId: current.reservationId,
      });
      current = { start: day.date, lastDate: day.date, reservationId: day.reservationId };
    }
  }

  if (current) {
    ranges.push({
      start: current.start,
      end: addDays(current.lastDate, 1),
      reservationId: current.reservationId,
    });
  }

  return ranges;
}
