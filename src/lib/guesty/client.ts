import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Guesty Open API client.
 *
 * Key constraints (from open-api-docs.guesty.com):
 *   - OAuth2 client_credentials grant. Tokens TTL = 24h.
 *   - HARD CAP: 5 token issuances per 24h per client. Persist, don't re-issue.
 *   - Rate limits: 15 req/sec, 120/min, 5000/hr.
 *
 * Token is cached in public.guesty_tokens (single-row table). We refresh a
 * few minutes before expiry so concurrent callers don't race into the 5/24h cap.
 */

const TOKEN_URL = "https://open-api.guesty.com/oauth2/token";
const API_BASE = "https://open-api.guesty.com/v1";
const TOKEN_REFRESH_LEAD_MS = 5 * 60 * 1000; // refresh 5 min before expiry

type CachedToken = {
  access_token: string;
  expires_at: string; // ISO
};

let inMemoryTokenPromise: Promise<string> | null = null;

async function fetchNewToken(): Promise<{ access_token: string; expires_in: number }> {
  const clientId = process.env.GUESTY_CLIENT_ID;
  const clientSecret = process.env.GUESTY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GUESTY_CLIENT_ID / GUESTY_CLIENT_SECRET missing");
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "open-api",
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Guesty token request failed: ${res.status} ${text}`);
  }
  return (await res.json()) as { access_token: string; expires_in: number };
}

async function loadCachedToken(): Promise<CachedToken | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("guesty_tokens")
    .select("access_token, expires_at")
    .eq("id", "default")
    .maybeSingle();
  if (error) throw error;
  return (data as CachedToken | null) ?? null;
}

async function persistToken(accessToken: string, expiresInSeconds: number): Promise<void> {
  const admin = createAdminClient();
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
  const { error } = await admin
    .from("guesty_tokens")
    .upsert(
      {
        id: "default",
        access_token: accessToken,
        token_type: "Bearer",
        expires_at: expiresAt,
        issued_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
  if (error) throw error;
}

/**
 * Returns a valid access token, fetching a new one only if the cached token is
 * expired (or within the refresh lead-time). Guards concurrent callers with a
 * single in-flight promise to avoid burning through the 5/24h cap.
 */
export async function getAccessToken(): Promise<string> {
  if (inMemoryTokenPromise) return inMemoryTokenPromise;

  inMemoryTokenPromise = (async () => {
    try {
      const cached = await loadCachedToken();
      if (cached) {
        const expiresAtMs = new Date(cached.expires_at).getTime();
        if (expiresAtMs - Date.now() > TOKEN_REFRESH_LEAD_MS) {
          return cached.access_token;
        }
      }
      const fresh = await fetchNewToken();
      await persistToken(fresh.access_token, fresh.expires_in);
      return fresh.access_token;
    } finally {
      // release the lock so next call can re-check cache
      inMemoryTokenPromise = null;
    }
  })();

  return inMemoryTokenPromise;
}

type GuestyFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  query?: Record<string, string | number | undefined>;
  body?: unknown;
};

/**
 * Authenticated fetch to the Guesty API. Caller is responsible for rate-limit
 * pacing across many calls — see `lib/guesty/listings.ts` for paginated flow.
 */
export async function guestyFetch<T>(path: string, opts: GuestyFetchOptions = {}): Promise<T> {
  const token = await getAccessToken();
  const url = new URL(API_BASE + path);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url.toString(), {
    method: opts.method ?? "GET",
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/json",
      ...(opts.body ? { "content-type": "application/json" } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Guesty ${opts.method ?? "GET"} ${path} failed: ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}
