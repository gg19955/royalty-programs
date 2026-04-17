import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HostDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("host_id")
    .eq("id", user!.id)
    .single();
  const hostId = profile!.host_id!;

  const admin = createAdminClient();

  const [{ data: listings }, { data: upcoming }, { count: totalListings }] =
    await Promise.all([
      admin
        .from("properties")
        .select("id, name, slug, listing_status, base_rate_cents, region")
        .eq("host_id", hostId)
        .order("created_at", { ascending: false })
        .limit(6),
      admin
        .from("reservations")
        .select("id, code, guest_name, check_in, check_out, status, host_payout_cents")
        .eq("host_id", hostId)
        .gte("check_in", new Date().toISOString().slice(0, 10))
        .order("check_in", { ascending: true })
        .limit(5),
      admin
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("host_id", hostId),
    ]);

  return (
    <div className="space-y-10">
      <header>
        <p className="text-[11px] uppercase tracking-[0.28em] text-brand-accent">
          Welcome back
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-brand sm:text-5xl">
          Your collection at a glance.
        </h1>
      </header>

      <div className="grid gap-6 sm:grid-cols-3">
        <Stat label="Listings" value={String(totalListings ?? 0)} />
        <Stat label="Upcoming stays" value={String(upcoming?.length ?? 0)} />
        <Stat label="Status" value="Approved" />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-[0.22em] text-brand-accent">
            Listings
          </h2>
          <Link
            href="/host/dashboard/listings"
            className="text-xs uppercase tracking-[0.22em] text-brand-accent hover:text-brand"
          >
            Manage all →
          </Link>
        </div>
        {listings && listings.length > 0 ? (
          <div className="divide-y divide-brand-line rounded-xl border border-brand-line bg-white">
            {listings.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between px-4 py-4"
              >
                <div>
                  <div className="font-medium text-brand">{l.name}</div>
                  <div className="text-xs text-gray-500">
                    {l.region ?? "—"} · {l.listing_status}
                  </div>
                </div>
                <div className="text-sm text-neutral-700">
                  {l.base_rate_cents
                    ? `${formatCurrency(l.base_rate_cents)} / night`
                    : "Rate TBD"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No listings yet"
            body="Your curator will build your first listing with you. Reach out if you haven't heard from us."
          />
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-[0.22em] text-brand-accent">
          Upcoming bookings
        </h2>
        {upcoming && upcoming.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-brand-line bg-white">
            <table className="w-full text-sm">
              <thead className="bg-brand-soft text-left text-xs uppercase tracking-wide text-brand-accent">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {upcoming.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-mono text-xs">{r.code}</td>
                    <td className="px-4 py-3">{r.guest_name ?? "—"}</td>
                    <td className="px-4 py-3 text-neutral-700">
                      {r.check_in} → {r.check_out}
                    </td>
                    <td className="px-4 py-3">
                      {r.host_payout_cents
                        ? formatCurrency(r.host_payout_cents)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No upcoming bookings"
            body="Once your listings go live, new bookings will appear here."
          />
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-brand-line bg-white px-5 py-6">
      <div className="text-[11px] uppercase tracking-[0.28em] text-brand-accent">
        {label}
      </div>
      <div className="mt-3 font-display text-4xl text-brand">{value}</div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-brand-line bg-brand-soft px-6 py-10 text-center">
      <div className="font-display text-xl text-brand">{title}</div>
      <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">{body}</p>
    </div>
  );
}
