import "server-only";

/**
 * Supabase PostgrestErrors are plain objects, not Error instances - so
 * `String(err)` produces "[object Object]". Pull the useful fields out by hand
 * so the admin UI (and guesty_sync_runs.error_message) can show what actually
 * failed. Shared between the listings and availability syncs.
 */
export function describeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object") {
    const e = err as { message?: string; details?: string; hint?: string; code?: string };
    const parts = [e.message, e.code, e.details, e.hint].filter(Boolean);
    if (parts.length > 0) return parts.join(" - ");
    try {
      return JSON.stringify(err);
    } catch {
      /* fall through */
    }
  }
  return String(err);
}
