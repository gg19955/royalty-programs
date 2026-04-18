import Link from "next/link";
import { Nav } from "@/components/nav";
import { Reveal } from "@/components/motion/reveal";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { TEAM_GROUPS, TEAM_MEMBERS } from "@/lib/content/team";

export const dynamic = "force-dynamic";

export default function TeamPage() {
  return (
    <>
      <ScrollProgress />
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-brand-line bg-black">
        <div className="mx-auto max-w-[1296px] px-6 py-28 sm:px-10 sm:py-40">
          <Reveal as="up">
            <div className="section-index">/ 00 — Our team</div>
          </Reveal>
          <Reveal as="up" delay={140}>
            <h1 className="mt-10 max-w-6xl font-display text-6xl font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-white sm:text-8xl md:text-[8.5rem]">
              The people
              <br />
              behind Lively.
            </h1>
          </Reveal>
          <Reveal as="up" delay={280}>
            <div className="mt-14 grid gap-10 border-t border-brand-line pt-10 sm:grid-cols-[1fr_2fr] sm:gap-16">
              <div className="section-index">/ Statement</div>
              <p className="max-w-2xl text-base leading-[1.7] text-white/75 sm:text-lg">
                Lively is a small, senior team — each member brings a depth
                of experience across real estate, finance, tourism and
                technology. Together, we look after premium homes as though
                they were our own, and treat every guest stay as a brand
                responsibility.
              </p>
            </div>
          </Reveal>
          <Reveal as="up" delay={420}>
            <figure className="mt-16 overflow-hidden rounded-[2px] border border-brand-line bg-brand-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/team/team-group.jpg"
                alt="The Lively team"
                className="h-full w-full object-cover"
              />
            </figure>
          </Reveal>
        </div>
      </section>

      {/* Grouped member sections */}
      {TEAM_GROUPS.map((group, gi) => {
        const members = TEAM_MEMBERS.filter((m) => m.group === group);
        if (members.length === 0) return null;
        return (
          <section
            key={group}
            className="border-b border-brand-line bg-black"
          >
            <div className="mx-auto max-w-[1296px] px-6 py-24 sm:px-10 sm:py-32">
              <Reveal as="up">
                <div className="flex items-end justify-between border-b border-brand-line pb-10">
                  <div>
                    <div className="section-index">
                      / 0{gi + 1} — {group}
                    </div>
                    <h2 className="mt-6 font-display text-4xl font-semibold uppercase leading-[0.95] tracking-[-0.01em] text-white sm:text-6xl">
                      {group}
                    </h2>
                  </div>
                </div>
              </Reveal>

              <div className="mt-12 grid gap-x-10 gap-y-16 md:grid-cols-2">
                {members.map((m, i) => (
                  <Reveal key={m.name} as="up" delay={80 + (i % 2) * 120}>
                    <article className="group">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-[2px] bg-brand-soft">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.photo}
                          alt={m.name}
                          className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute left-5 top-5 font-display text-[10px] uppercase tracking-[0.28em] text-white/80">
                          / {m.role}
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-6">
                          <div className="font-display text-4xl font-semibold uppercase leading-[0.95] tracking-[-0.01em] text-white sm:text-5xl">
                            {m.name}
                          </div>
                        </div>
                      </div>
                      <div className="pt-8">
                        <div className="section-index">{m.role}</div>
                        <p className="mt-5 max-w-xl text-base leading-[1.7] text-white/70 sm:text-[17px]">
                          {m.bio}
                        </p>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA band */}
      <section className="bg-brand-raised">
        <div className="mx-auto flex max-w-[1296px] flex-col gap-8 px-6 py-24 sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:py-28">
          <div>
            <div className="section-index text-white/60">/ Work with us</div>
            <h3 className="mt-5 font-display text-4xl font-semibold uppercase leading-[0.95] tracking-[-0.01em] text-white sm:text-6xl">
              List your property
              <br />
              with Lively.
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/host"
              className="rounded-[15px] bg-white px-8 py-3.5 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-black transition hover:bg-brand-accent"
            >
              Become a host
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
