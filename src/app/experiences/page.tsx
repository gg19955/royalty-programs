import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/nav";
import { Reveal } from "@/components/motion/reveal";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { formatPoints } from "@/lib/utils";
import { PARTNER_EXPERIENCES } from "@/lib/content/experiences";

export const dynamic = "force-dynamic";

const CATEGORIES = ["Food & Drink", "Tours & Activities", "Wellness"] as const;

export default async function ExperiencesPage() {
  const supabase = createClient();
  const [{ data: experiences }, { data: offers }] = await Promise.all([
    supabase
      .from("experiences")
      .select("id, title, description, image_url, region, points_cost, partners(name)")
      .eq("active", true)
      .order("points_cost", { ascending: true }),
    supabase.from("offers").select("*").eq("active", true),
  ]);

  const hasRewards = (experiences?.length ?? 0) > 0;
  const hasOffers = (offers?.length ?? 0) > 0;

  return (
    <>
      <ScrollProgress />
      <Nav />

      {/* Hero - full-bleed looping video behind the editorial overlay */}
      <section className="relative overflow-hidden border-b border-brand-line bg-black">
        <video
          aria-hidden
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/video/experiences-hero.mp4" type="video/mp4" />
        </video>
        {/* Readability gradient over the video so the type stays legible. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/80"
        />
        <div className="relative mx-auto max-w-[1296px] px-6 py-28 sm:px-10 sm:py-40">
          <Reveal as="up">
            <div className="section-index">/ 00 - Experiences</div>
          </Reveal>
          <Reveal as="up" delay={140}>
            <h1 className="mt-10 max-w-6xl font-display text-6xl font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-white sm:text-8xl md:text-[8.5rem]">
              What to do
              <br />
              when you&apos;re here.
            </h1>
          </Reveal>
          <Reveal as="up" delay={280}>
            <div className="mt-14 grid gap-10 border-t border-white/20 pt-10 sm:grid-cols-[1fr_2fr] sm:gap-16">
              <div className="section-index">/ Partners</div>
              <p className="max-w-2xl text-base leading-[1.7] text-white/80 sm:text-lg">
                Lively guests unlock a curated network of Victorian partners -
                private chefs, cellar-door hosts, ballooning pilots, and
                bathhouse therapists. Exclusive rates and preferred access,
                arranged by our concierge.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Category sections - full-bleed photo tiles */}
      {CATEGORIES.map((category, ci) => {
        const items = PARTNER_EXPERIENCES.filter((p) => p.category === category);
        if (items.length === 0) return null;
        return (
          <section
            key={category}
            className="border-b border-brand-line bg-black"
          >
            <div className="px-0 py-24 sm:py-32">
              <div className="mx-auto mb-12 max-w-[1600px] px-6 sm:mb-16 sm:px-10">
                <Reveal as="up">
                  <div className="flex items-end justify-between border-b border-brand-line pb-10">
                    <div>
                      <div className="section-index">
                        / 0{ci + 1} - {category}
                      </div>
                      <h2 className="mt-6 font-display text-5xl font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-white sm:text-7xl">
                        {category === "Food & Drink" && "Eat, drink, linger."}
                        {category === "Tours & Activities" &&
                          "Move through the day."}
                        {category === "Wellness" && "Slow right down."}
                      </h2>
                    </div>
                  </div>
                </Reveal>
              </div>
              <div className="grid grid-cols-1 gap-px bg-brand-line sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p, i) => (
                  <Reveal
                    key={p.name}
                    as="up"
                    delay={80 + (i % 3) * 100}
                  >
                    <article className="group relative flex h-full min-h-[480px] flex-col overflow-hidden bg-black sm:min-h-[560px]">
                      {p.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-black to-black" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10 transition-opacity duration-700 group-hover:from-black/95" />
                      <div className="relative flex h-full flex-col justify-between gap-6 p-8 sm:p-10">
                        <div className="section-index text-white/80">
                          / {p.category}
                        </div>
                        <div>
                          <h3 className="font-display text-3xl font-semibold uppercase leading-[0.95] tracking-[-0.01em] text-white sm:text-4xl">
                            {p.name}
                          </h3>
                          <p className="mt-5 max-w-md text-sm leading-[1.6] text-white/80 sm:text-base">
                            {p.blurb}
                          </p>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Rewards redemption - if catalogue has items */}
      {(hasRewards || hasOffers) && (
        <section className="border-b border-brand-line bg-brand-raised">
          <div className="mx-auto max-w-[1296px] px-6 py-24 sm:px-10 sm:py-32">
            <Reveal as="up">
              <div className="flex items-end justify-between border-b border-white/10 pb-10">
                <div>
                  <div className="section-index text-white/60">
                    / Lively Rewards
                  </div>
                  <h2 className="mt-6 font-display text-5xl font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-white sm:text-7xl">
                    Redeem your points.
                  </h2>
                </div>
                <Link
                  href="/portal"
                  className="link-underline hidden font-display text-[11px] uppercase tracking-[0.28em] text-white sm:inline"
                >
                  My portal →
                </Link>
              </div>
            </Reveal>

            {hasOffers && (
              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                {offers!.map((o: any) => (
                  <Reveal key={o.id} as="up">
                    <div className="h-full rounded-[2px] border border-white/10 bg-black/20 p-7">
                      <div className="section-index text-white/60">
                        / Featured offer
                      </div>
                      <h3 className="mt-4 font-display text-2xl font-semibold uppercase leading-[1.05] tracking-[-0.005em] text-white sm:text-3xl">
                        {o.title}
                      </h3>
                      {o.description && (
                        <p className="mt-4 text-sm leading-[1.6] text-white/70 sm:text-base">
                          {o.description}
                        </p>
                      )}
                      {o.cta_url && (
                        <a
                          href={o.cta_url}
                          target="_blank"
                          rel="noreferrer"
                          className="link-underline mt-6 inline-block font-display text-[11px] uppercase tracking-[0.28em] text-white"
                        >
                          {o.cta_label || "Learn more →"}
                        </a>
                      )}
                    </div>
                  </Reveal>
                ))}
              </div>
            )}

            {hasRewards && (
              <div className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
                {experiences!.map((e: any) => (
                  <Link
                    key={e.id}
                    href={`/experiences/${e.id}`}
                    className="group block bg-brand-raised p-7 transition hover:bg-black"
                  >
                    <div className="section-index text-white/60">
                      / {e.partners?.name || "Partner"}
                    </div>
                    <h3 className="mt-4 font-display text-2xl font-semibold uppercase leading-[1.05] tracking-[-0.005em] text-white sm:text-3xl">
                      <span className="link-underline">{e.title}</span>
                    </h3>
                    {e.region && (
                      <div className="mt-3 text-xs uppercase tracking-[0.22em] text-white/60">
                        {e.region}
                      </div>
                    )}
                    <div className="mt-6 border-t border-white/10 pt-4 font-display text-sm text-white">
                      {formatPoints(e.points_cost)}{" "}
                      <span className="text-white/60">points</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA band */}
      <section className="bg-black">
        <div className="mx-auto flex max-w-[1296px] flex-col gap-8 px-6 py-24 sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:py-28">
          <div>
            <div className="section-index">/ Plan your stay</div>
            <h3 className="mt-5 font-display text-4xl font-semibold uppercase leading-[0.95] tracking-[-0.01em] text-white sm:text-6xl">
              Let the concierge
              <br />
              arrange it.
            </h3>
            <p className="mt-6 max-w-xl text-base leading-[1.7] text-white/70">
              Tell us the shape of the trip you want - we&apos;ll book the
              partners, the table, the tee time, the ride. One message, one
              answer.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/stays"
              className="rounded-[15px] bg-white px-8 py-3.5 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-black transition hover:bg-brand-accent"
            >
              Browse stays
            </Link>
            <Link
              href="/about"
              className="rounded-[15px] border border-white/70 px-8 py-3.5 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-white transition hover:bg-white hover:text-black"
            >
              About Lively
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
