import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/nav";
import { Tile } from "@/components/tile";
import { formatDate, formatPoints } from "@/lib/utils";

const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL ?? "https://livelyproperties.com.au";

export default async function PortalPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/portal");

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
  const greetingName = profile?.full_name || profile?.email?.split("@")[0] || "there";

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <header>
          <p className="text-xs uppercase tracking-[0.24em] text-brand-accent">
            Your portal
          </p>
          <h1 className="mt-4 font-serif text-4xl font-normal tracking-tightest text-brand">
            Welcome, {greetingName}.
          </h1>
        </header>

        <section className="mt-12 grid gap-6 md:grid-cols-3">
          <Tile
            href="/claim"
            eyebrow="Rewards"
            title="Claim a stay"
            description="Submit your reservation code and last name. Our team verifies and credits your points."
          />
          <Tile
            href="/offer"
            eyebrow="This season"
            title="Current Season Offer"
            description="Our featured partner experience for the season — curated for Lively guests."
          />
          <Tile
            href={BOOKING_URL}
            external
            eyebrow="Stay with us"
            title="Book a stay"
            description="Browse our high-end short-stay properties across Victoria."
          />
        </section>

        <section className="mt-20 grid gap-8 md:grid-cols-[1fr_2fr]">
          <div className="rounded-sm border border-brand-line bg-white p-8">
            <div className="text-xs uppercase tracking-[0.18em] text-brand-accent">
              Points balance
            </div>
            <div className="mt-3 font-serif text-5xl tracking-tightest text-brand">
              {formatPoints(balance)}
            </div>
            <p className="mt-4 text-sm text-neutral-600">
              Points land after our team confirms your stay claim.
            </p>
          </div>

          <div className="space-y-10">
            <div>
              <h2 className="text-xs uppercase tracking-[0.18em] text-brand-accent">
                Your stays
              </h2>
              {claims && claims.length > 0 ? (
                <ul className="mt-3 divide-y divide-brand-line rounded-sm border border-brand-line bg-white">
                  {claims.map((c: any) => (
                    <li key={c.id} className="flex items-center justify-between p-4">
                      <div>
                        <div className="font-medium text-brand">
                          Reservation {c.reservations?.code}
                        </div>
                        <div className="text-sm text-neutral-600">
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
                <p className="mt-3 text-sm text-neutral-600">No stays credited yet.</p>
              )}
            </div>

            <div>
              <h2 className="text-xs uppercase tracking-[0.18em] text-brand-accent">
                Your redemptions
              </h2>
              {redemptions && redemptions.length > 0 ? (
                <ul className="mt-3 divide-y divide-brand-line rounded-sm border border-brand-line bg-white">
                  {redemptions.map((r: any) => (
                    <li key={r.id} className="flex items-center justify-between p-4">
                      <div>
                        <div className="font-medium text-brand">{r.experiences?.title}</div>
                        <div className="text-sm text-neutral-600">
                          Code <span className="font-mono">{r.confirmation_code}</span> ·{" "}
                          {r.status}
                        </div>
                      </div>
                      <div className="text-sm text-neutral-600">
                        -{formatPoints(r.points_spent)} pts
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-neutral-600">No redemptions yet.</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
