import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPoints } from "@/lib/utils";

export default async function AdminDashboard() {
  const admin = createAdminClient();

  const [
    { count: totalUsers },
    { count: totalClaims },
    { count: totalRedemptions },
    { count: pendingRequests },
    signups,
    claims,
    redemptions,
    ledger,
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("stay_claims").select("*", { count: "exact", head: true }),
    admin.from("redemptions").select("*", { count: "exact", head: true }),
    admin
      .from("claim_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    admin.from("v_admin_daily_signups").select("*").limit(14),
    admin.from("v_admin_daily_claims").select("*").limit(14),
    admin.from("v_admin_daily_redemptions").select("*").limit(14),
    admin.from("points_ledger").select("amount"),
  ]);

  const ledgerRows = (ledger.data ?? []) as { amount: number }[];
  const pointsIssued = ledgerRows
    .filter((r) => r.amount > 0)
    .reduce((s, r) => s + r.amount, 0);
  const pointsSpent = ledgerRows
    .filter((r) => r.amount < 0)
    .reduce((s, r) => s + Math.abs(r.amount), 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Users" value={totalUsers ?? 0} />
        <Stat label="Stays claimed" value={totalClaims ?? 0} />
        <Stat label="Redemptions" value={totalRedemptions ?? 0} />
        <Stat
          label="Points net"
          value={`${formatPoints(pointsIssued - pointsSpent)}`}
          sub={`${formatPoints(pointsIssued)} issued · ${formatPoints(pointsSpent)} spent`}
        />
      </div>

      {(pendingRequests ?? 0) > 0 && (
        <Link
          href="/admin/claim-requests"
          className="mt-6 flex items-center justify-between rounded-xl border border-brand-accent bg-brand-soft p-5 hover:border-brand"
        >
          <div>
            <div className="text-sm font-semibold text-brand">
              {pendingRequests} claim request{pendingRequests === 1 ? "" : "s"} awaiting review
            </div>
            <div className="text-xs text-gray-600">
              Approve to credit points to the guest.
            </div>
          </div>
          <span className="text-sm text-brand-accent">Review →</span>
        </Link>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <DailyList title="Signups (14d)" rows={signups.data ?? []} field="count" />
        <DailyList title="Claims (14d)" rows={claims.data ?? []} field="count" />
        <DailyList title="Redemptions (14d)" rows={redemptions.data ?? []} field="count" />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">
        {typeof value === "number" ? formatPoints(value) : value}
      </div>
      {sub && <div className="mt-1 text-xs text-gray-500">{sub}</div>}
    </div>
  );
}

function DailyList({
  title,
  rows,
  field,
}: {
  title: string;
  rows: any[];
  field: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="text-sm font-semibold">{title}</div>
      <ul className="mt-3 divide-y text-sm">
        {rows.length === 0 && <li className="py-2 text-gray-500">No activity yet.</li>}
        {rows.map((r) => (
          <li key={r.day} className="flex justify-between py-2">
            <span className="text-gray-600">{r.day}</span>
            <span className="font-medium">{r[field]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
