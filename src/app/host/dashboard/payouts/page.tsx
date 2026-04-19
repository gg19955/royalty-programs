import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deriveConnectStatus, getAccount, type ConnectStatus } from "@/lib/stripe/connect";
import { formatCurrency } from "@/lib/utils";
import { ConnectPrimaryButton } from "./connect-buttons";

export const dynamic = "force-dynamic";

async function loadConnectStatus(accountId: string | null): Promise<ReturnType<typeof deriveConnectStatus>> {
  if (!accountId) return deriveConnectStatus(null);
  try {
    const acct = await getAccount(accountId);
    return deriveConnectStatus(acct);
  } catch {
    return {
      status: "error",
      payoutsEnabled: false,
      detailsSubmitted: false,
      chargesEnabled: false,
    };
  }
}

export default async function PayoutsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("host_id")
    .eq("id", user!.id)
    .single();
  const hostId = profile!.host_id!;

  const admin = createAdminClient();
  const [{ data: host }, { data: payouts }] = await Promise.all([
    admin
      .from("hosts")
      .select("display_name, stripe_connect_account_id")
      .eq("id", hostId)
      .single(),
    admin
      .from("payouts")
      .select("id, amount_cents, status, scheduled_for, paid_at, created_at, reservation_id")
      .eq("host_id", hostId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const connect = await loadConnectStatus(host?.stripe_connect_account_id ?? null);

  return (
    <div className="space-y-10">
      <header>
        <p className="text-[11px] uppercase tracking-[0.28em] text-brand-accent">
          Payouts
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-brand sm:text-5xl">
          Get paid.
        </h1>
      </header>

      <section className="rounded-xl border border-brand-line bg-white p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <h2 className="text-xs uppercase tracking-[0.22em] text-brand-accent">
              Stripe Connect
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Lively uses Stripe Connect Express to pay you out. One-time setup
              takes about five minutes. Payouts land 24&nbsp;hours after your
              guest checks in.
            </p>
            <div className="mt-4">
              <ConnectStatusPill status={connect.status} />
            </div>
            {connect.status === "in_progress" && (
              <p className="mt-3 text-xs text-neutral-500">
                Stripe still needs a few details before you can receive
                payouts. Pick up where you left off below.
              </p>
            )}
          </div>
          <ConnectPrimaryButton status={connect.status} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-[0.22em] text-brand-accent">
          Payouts
        </h2>
        {payouts && payouts.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-brand-line bg-white">
            <table className="w-full text-sm">
              <thead className="bg-brand-soft text-left text-xs uppercase tracking-wide text-brand-accent">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payouts.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-neutral-700">
                      {new Date(p.created_at).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(p.amount_cents)}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-brand-line bg-brand-soft px-6 py-10 text-center text-sm text-neutral-600">
            No payouts yet. Once your first guest checks in, your first payout
            will appear here.
          </div>
        )}
      </section>
    </div>
  );
}

function ConnectStatusPill({ status }: { status: ConnectStatus }) {
  const styles: Record<ConnectStatus, string> = {
    not_started: "bg-neutral-100 text-neutral-700",
    in_progress: "bg-yellow-100 text-yellow-800",
    enabled: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
  };
  const labels: Record<ConnectStatus, string> = {
    not_started: "Not started",
    in_progress: "Onboarding in progress",
    enabled: "Payouts enabled",
    error: "Could not reach Stripe",
  };
  return (
    <span
      className={`inline-block rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
