import { createAdminClient } from "@/lib/supabase/admin";
import { runListingsSync } from "./actions";

export const dynamic = "force-dynamic";

type SyncRun = {
  id: string;
  kind: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  pages_fetched: number;
  items_seen: number;
  items_created: number;
  items_updated: number;
  items_skipped: number;
  error_message: string | null;
  notes: Record<string, unknown>;
};

export default async function AdminGuestyPage() {
  const admin = createAdminClient();

  const [{ count: guestyPropCount }, { count: totalPropCount }, runsRes, tokenRes] =
    await Promise.all([
      admin
        .from("properties")
        .select("*", { count: "exact", head: true })
        .not("guesty_listing_id", "is", null),
      admin.from("properties").select("*", { count: "exact", head: true }),
      admin
        .from("guesty_sync_runs")
        .select(
          "id, kind, status, started_at, finished_at, pages_fetched, items_seen, items_created, items_updated, items_skipped, error_message, notes",
        )
        .order("started_at", { ascending: false })
        .limit(10),
      admin
        .from("guesty_tokens")
        .select("expires_at, issued_at")
        .eq("id", "default")
        .maybeSingle(),
    ]);

  const runs = (runsRes.data as SyncRun[] | null) ?? [];
  const token = tokenRes.data as { expires_at: string; issued_at: string } | null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Guesty sync</h1>
        <p className="mt-1 text-sm text-gray-600">
          Pull the current list of active Lively listings from Guesty and
          upsert them into the properties table. New rows land as drafts —
          publish them from the listing detail page.
        </p>
      </div>

      <section className="rounded border border-gray-200 bg-white p-5">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <Stat label="Linked to Guesty" value={guestyPropCount ?? 0} />
          <Stat label="Total properties" value={totalPropCount ?? 0} />
          <Stat
            label="Token expires"
            value={token ? new Date(token.expires_at).toLocaleString() : "—"}
          />
        </div>
      </section>

      <section className="rounded border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
          Run sync
        </h2>
        <form action={runListingsSync} className="mt-4 flex flex-wrap items-end gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="dryRun" defaultChecked />
            Dry run (fetch only, no DB writes)
          </label>
          <label className="flex flex-col text-sm">
            <span className="text-xs uppercase tracking-wide text-gray-500">Max listings</span>
            <input
              type="number"
              name="max"
              min={1}
              defaultValue={10}
              className="mt-1 w-32 rounded border border-gray-300 px-2 py-1"
            />
          </label>
          <button
            type="submit"
            className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Start sync
          </button>
        </form>
        <p className="mt-3 text-xs text-gray-500">
          First run: keep dry-run on with max=10. Review the counts, then
          re-run with dry-run off and max cleared for the full pull.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
          Recent runs
        </h2>
        {runs.length === 0 ? (
          <p className="text-sm text-gray-500">No sync runs yet.</p>
        ) : (
          <div className="overflow-hidden rounded border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-3 py-2">Started</th>
                  <th className="px-3 py-2">Kind</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Seen</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Updated</th>
                  <th className="px-3 py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-gray-700">
                      {new Date(r.started_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">{r.kind}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-3 py-2">{r.items_seen}</td>
                    <td className="px-3 py-2">{r.items_created}</td>
                    <td className="px-3 py-2">{r.items_updated}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">
                      {r.error_message
                        ? <span className="text-red-600">{r.error_message}</span>
                        : (r.notes as { dry_run?: boolean })?.dry_run
                          ? "dry run"
                          : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colour =
    status === "ok"
      ? "bg-green-100 text-green-800"
      : status === "error"
        ? "bg-red-100 text-red-800"
        : "bg-gray-100 text-gray-800";
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${colour}`}>
      {status}
    </span>
  );
}
