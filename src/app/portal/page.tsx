import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/nav";
import { Reveal } from "@/components/motion/reveal";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { formatDate, formatPoints } from "@/lib/utils";

export const dynamic = "force-dynamic";

const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL ?? "https://livelyproperties.com.au";

type PortalTile = {
  index: string;
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  external?: boolean;
  cta: string;
};

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

  const tiles: PortalTile[] = [
    {
      index: "01",
      eyebrow: "Rewards",
      title: "Claim a stay.",
      body:
        "Submit your reservation code and last name. Our team verifies every claim and credits your points once confirmed.",
      href: "/claim",
      cta: "Enter claim →",
    },
    {
      index: "02",
      eyebrow: "This season",
      title: "Featured offer.",
      body:
        "Our featured partner experience for the season - curated for Lively guests and refreshed each quarter.",
      href: "/offer",
      cta: "View offer →",
    },
    {
      index: "03",
      eyebrow: "Stay with us",
      title: "Book a stay.",
      body:
        "Browse Lively's curated collection of luxury short-stays across Victoria - each home personally chosen.",
      href: "/stays",
      cta: "Browse stays →",
    },
  ];

  return (
    <>
      <ScrollProgress />
      <Nav />

      {/* Hero - member greeting */}
      <section className="relative overflow-hidden border-b border-brand-line bg-black">
        <div className="mx-auto max-w-[1296px] px-6 py-24 sm:px-10 sm:py-32">
          <Reveal as="up">
            <div className="section-index">/ Your portal</div>
          </Reveal>
          <Reveal as="up" delay={120}>
            <h1 className="mt-10 max-w-5xl font-display text-6xl font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-white sm:text-8xl md:text-[8rem]">
              Welcome,
              <br />
              {greetingName}.
            </h1>
          </Reveal>
          <Reveal as="up" delay={260}>
            <div className="mt-16 grid gap-12 border-t border-brand-line pt-12 sm:grid-cols-[1fr_2fr] sm:gap-20">
              <div className="section-index">/ Overview</div>
              <p className="max-w-2xl text-base leading-[1.7] text-white/80 sm:text-lg">
                Every stay earns points toward the next - redeemable against a
                curated catalogue of partner experiences. Submit a claim, watch
                your balance build, then choose how to spend it.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Three entry-point tiles - editorial grid, no rounded cards */}
      <section className="border-b border-brand-line bg-black">
        <div className="mx-auto max-w-[1296px] px-6 py-24 sm:px-10 sm:py-32">
          <Reveal as="up">
            <div className="flex flex-col gap-4 border-b border-brand-line pb-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="section-index">/ 01 - Three paths</div>
                <h2 className="mt-6 max-w-3xl font-display text-5xl font-semibold uppercase leading-[0.92] tracking-[-0.02em] text-white sm:text-7xl">
                  What would you
                  <br />
                  like to do?
                </h2>
              </div>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-px bg-white/10 sm:grid-cols-3">
            {tiles.map((t, i) => (
              <Reveal key={t.index} as="up" delay={i * 80}>
                {t.external ? (
                  <a
                    href={t.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex h-full flex-col bg-black p-8 transition hover:bg-white/[0.03] sm:p-12"
                  >
                    <TileBody tile={t} />
                  </a>
                ) : (
                  <Link
                    href={t.href}
                    className="group flex h-full flex-col bg-black p-8 transition hover:bg-white/[0.03] sm:p-12"
                  >
                    <TileBody tile={t} />
                  </Link>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Points + activity */}
      <section className="bg-black">
        <div className="mx-auto max-w-[1296px] px-6 py-24 sm:px-10 sm:py-32">
          <Reveal as="up">
            <div className="flex flex-col gap-4 border-b border-brand-line pb-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="section-index">/ 02 - Your ledger</div>
                <h2 className="mt-6 max-w-3xl font-display text-5xl font-semibold uppercase leading-[0.92] tracking-[-0.02em] text-white sm:text-7xl">
                  Points &
                  <br />
                  activity.
                </h2>
              </div>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-px bg-white/10 md:grid-cols-[1fr_2fr]">
            {/* Balance panel */}
            <Reveal as="up">
              <div className="flex h-full flex-col bg-black p-8 sm:p-12">
                <div className="section-index">/ Balance</div>
                <div className="mt-10 font-display text-[96px] font-semibold uppercase leading-[0.86] tracking-[-0.02em] text-white sm:text-[128px]">
                  {formatPoints(balance)}
                </div>
                <div className="mt-2 font-display text-[11px] uppercase tracking-[0.32em] text-white/50">
                  Points
                </div>
                <p className="mt-8 max-w-xs text-sm leading-[1.7] text-white/60">
                  Points land after our team confirms your stay claim - usually
                  within a day.
                </p>
              </div>
            </Reveal>

            {/* Activity column */}
            <Reveal as="up" delay={120}>
              <div className="flex h-full flex-col gap-12 bg-black p-8 sm:p-12">
                <div>
                  <div className="section-index">/ Your stays</div>
                  {claims && claims.length > 0 ? (
                    <ul className="mt-6 divide-y divide-brand-line border-t border-brand-line">
                      {claims.map((c: any) => (
                        <li
                          key={c.id}
                          className="flex items-center justify-between py-5"
                        >
                          <div>
                            <div className="font-display text-lg uppercase tracking-[-0.005em] text-white">
                              Reservation {c.reservations?.code}
                            </div>
                            <div className="mt-1 font-display text-[11px] uppercase tracking-[0.28em] text-white/50">
                              {c.reservations?.check_in &&
                                formatDate(c.reservations.check_in)}{" "}
                              →{" "}
                              {c.reservations?.check_out &&
                                formatDate(c.reservations.check_out)}
                            </div>
                          </div>
                          <div className="font-display text-[11px] uppercase tracking-[0.28em] text-brand-accent">
                            +{formatPoints(c.points_awarded)} pts
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-6 text-sm leading-[1.7] text-white/60">
                      No stays credited yet. Submit a claim to get your first
                      reservation on the ledger.
                    </p>
                  )}
                </div>

                <div>
                  <div className="section-index">/ Your redemptions</div>
                  {redemptions && redemptions.length > 0 ? (
                    <ul className="mt-6 divide-y divide-brand-line border-t border-brand-line">
                      {redemptions.map((r: any) => (
                        <li
                          key={r.id}
                          className="flex items-center justify-between py-5"
                        >
                          <div>
                            <div className="font-display text-lg uppercase tracking-[-0.005em] text-white">
                              {r.experiences?.title}
                            </div>
                            <div className="mt-1 font-display text-[11px] uppercase tracking-[0.28em] text-white/50">
                              Code{" "}
                              <span className="font-mono normal-case tracking-normal">
                                {r.confirmation_code}
                              </span>{" "}
                              · {r.status}
                            </div>
                          </div>
                          <div className="font-display text-[11px] uppercase tracking-[0.28em] text-white/60">
                            −{formatPoints(r.points_spent)} pts
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-6 text-sm leading-[1.7] text-white/60">
                      No redemptions yet. Explore the rewards catalogue to spend
                      your balance.
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

function TileBody({ tile }: { tile: PortalTile }) {
  return (
    <>
      <div className="section-index">/ {tile.index} - {tile.eyebrow}</div>
      <h3 className="mt-6 font-display text-2xl font-semibold uppercase leading-[1.02] tracking-[-0.01em] text-white sm:text-3xl">
        {tile.title}
      </h3>
      <p className="mt-5 max-w-md text-base leading-[1.7] text-white/70">
        {tile.body}
      </p>
      <span className="mt-auto pt-10 font-display text-[11px] uppercase tracking-[0.32em] text-white/70 transition group-hover:text-white">
        {tile.cta}
      </span>
    </>
  );
}

export const metadata = {
  title: "Portal - Lively",
  description:
    "Your Lively rewards portal - points balance, stays, and redemptions.",
};
