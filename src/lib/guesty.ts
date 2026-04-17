import "server-only";

/**
 * Guesty API wrapper.
 * MVP: reservation data is expected to be synced into the `reservations`
 * table (via a scheduled job / webhook) and `claim` reads from there.
 * This module is a placeholder for future direct lookups / webhook verification.
 *
 * Reference: 30-flow Guesty integration (see /Users/gussgroves/.claude/projects/-Users-gussgroves/memory/project_30flow_guesty.md).
 */

const GUESTY_API_BASE = process.env.GUESTY_API_BASE ?? "https://api.guesty.com/api/v2";

async function getAccessToken(): Promise<string> {
  const id = process.env.GUESTY_CLIENT_ID;
  const secret = process.env.GUESTY_CLIENT_SECRET;
  if (!id || !secret) throw new Error("Guesty credentials missing");

  const res = await fetch("https://open-api.guesty.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: id,
      client_secret: secret,
      scope: "open-api",
    }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Guesty auth failed: ${res.status}`);
  const json = await res.json();
  return json.access_token as string;
}

export async function fetchGuestyReservationByCode(code: string) {
  const token = await getAccessToken();
  const url = `${GUESTY_API_BASE}/reservations?q=${encodeURIComponent(code)}&limit=1`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Guesty reservation lookup failed: ${res.status}`);
  const json = await res.json();
  return json?.results?.[0] ?? null;
}
