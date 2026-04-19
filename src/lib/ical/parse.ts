import "server-only";

/**
 * Minimal RFC 5545 VEVENT parser.
 *
 * Airbnb / VRBO / Stayz / Guesty all emit the same narrow subset - we only
 * need UID, DTSTART, DTEND, SUMMARY, STATUS to build availability_blocks.
 * Full iCal support (recurrence, timezones, alarms) is intentionally out of
 * scope: vacation-rental calendars don't use those features.
 *
 * Supports:
 *   - Line unfolding (RFC 5545 §3.1) - continuation lines start with whitespace.
 *   - DATE (YYYYMMDD) and DATE-TIME (YYYYMMDDTHHMMSSZ) values. Times are
 *     collapsed to the date component since availability is day-granular.
 *   - VEVENT blocks; VCALENDAR wrapper is accepted but not required.
 *   - STATUS=CANCELLED events are filtered out.
 *
 * Explicitly ignored (returns events as-is):
 *   - RRULE / RDATE / EXDATE - no recurrence expansion.
 *   - VTIMEZONE - we treat all dates as calendar dates, no TZ math needed.
 */

export type ParsedEvent = {
  uid: string;
  start: string; // ISO date 'YYYY-MM-DD'
  end: string;   // ISO date 'YYYY-MM-DD' (exclusive per RFC 5545)
  summary: string | null;
};

export function parseIcs(raw: string): ParsedEvent[] {
  const lines = unfold(raw).split(/\r?\n/);
  const events: ParsedEvent[] = [];

  let inEvent = false;
  let current: Partial<ParsedEvent> & { status?: string } = {};

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (
        inEvent &&
        current.uid &&
        current.start &&
        current.end &&
        current.status !== "CANCELLED"
      ) {
        events.push({
          uid: current.uid,
          start: current.start,
          end: current.end,
          summary: current.summary ?? null,
        });
      }
      inEvent = false;
      current = {};
      continue;
    }
    if (!inEvent) continue;

    // Split key (with optional params) from value. "DTSTART;VALUE=DATE:20260101"
    const colonIdx = line.indexOf(":");
    if (colonIdx < 0) continue;
    const keyPart = line.slice(0, colonIdx);
    const value = line.slice(colonIdx + 1).trim();
    const key = keyPart.split(";")[0].toUpperCase();

    switch (key) {
      case "UID":
        current.uid = value;
        break;
      case "DTSTART":
        current.start = toIsoDate(value);
        break;
      case "DTEND":
        current.end = toIsoDate(value);
        break;
      case "SUMMARY":
        current.summary = unescapeText(value);
        break;
      case "STATUS":
        current.status = value.toUpperCase();
        break;
    }
  }

  return events;
}

/**
 * RFC 5545 line-unfolding: a line that starts with a space or tab is a
 * continuation of the previous line. We collapse those before splitting.
 */
function unfold(raw: string): string {
  return raw.replace(/\r?\n[\t ]/g, "");
}

/**
 * Accepts 'YYYYMMDD' (DATE) or 'YYYYMMDDTHHMMSSZ' (DATE-TIME) and normalises
 * to 'YYYY-MM-DD'. We drop the time part because availability is day-level.
 */
function toIsoDate(value: string): string {
  const dateOnly = value.slice(0, 8);
  if (!/^\d{8}$/.test(dateOnly)) {
    throw new Error(`iCal DTSTART/DTEND not a recognisable date: ${value}`);
  }
  return `${dateOnly.slice(0, 4)}-${dateOnly.slice(4, 6)}-${dateOnly.slice(6, 8)}`;
}

/**
 * RFC 5545 text escaping: \n, \N, \\, \;, \, → their literal counterparts.
 */
function unescapeText(value: string): string {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}
