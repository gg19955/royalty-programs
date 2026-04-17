import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/nav";
import { formatDate, formatPoints } from "@/lib/utils";

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: balanceRow }, { data: claims }, { data: redemptions }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("v_user_points").select("balance").eq("user_id", user.id).single(),
      supabase
        .from("stay_claims")
        .select("id, points_awarded, claimed_at, reservations(code, check_in, check_out)")
        .eq("user_id", user.id)
        .order("claimed_at", { ascending: false }),
      supabase
        .from("redemptions")
        .select("id, points_spent, status, created_at, confirmation_code, experiences(title)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

  const balance = balanceRow?.balance ?? 0;

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold">
                {profile?.full_name || profile?.email}
              </h1>
              <p className="text-sm text-gray-600">{profile?.email}</p>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wide text-gray-500">Points balance</div>
              <div className="text-3xl font-semibold text-brand-accent">
                {formatPoints(balance)}
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Link
              href="/claim"
              className="rounded-md bg-brand px-4 py-2 text-sm text-white hover:bg-black"
            >
              Claim a stay
            </Link>
            <Link
              href="/experiences"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:border-gray-400"
            >
              Redeem experiences
            </Link>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Your claimed stays</h2>
          {claims && claims.length > 0 ? (
            <ul className="mt-3 divide-y rounded-xl border bg-white">
              {claims.map((c: any) => (
                <li key={c.id} className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium">Reservation {c.reservations?.code}</div>
                    <div className="text-sm text-gray-600">
                      {c.reservations?.check_in && formatDate(c.reservations.check_in)} →{" "}
                      {c.reservations?.check_out && formatDate(c.reservations.check_out)}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-brand-accent">
                    +{formatPoints(c.points_awarded)} pts
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-gray-600">No stays claimed yet.</p>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Your redemptions</h2>
          {redemptions && redemptions.length > 0 ? (
            <ul className="mt-3 divide-y rounded-xl border bg-white">
              {redemptions.map((r: any) => (
                <li key={r.id} className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium">{r.experiences?.title}</div>
                    <div className="text-sm text-gray-600">
                      Code <span className="font-mono">{r.confirmation_code}</span> · {r.status}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    -{formatPoints(r.points_spent)} pts
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-gray-600">No redemptions yet.</p>
          )}
        </section>
      </main>
    </>
  );
}
