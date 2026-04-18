import Image from "next/image";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Reveal } from "@/components/motion/reveal";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OfferPage() {
  const supabase = createClient();

  const { data: featured } = await supabase
    .from("offers")
    .select("*")
    .eq("featured", true)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let offer = featured;
  if (!offer) {
    const { data: newest } = await supabase
      .from("offers")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    offer = newest;
  }

  return (
    <>
      <ScrollProgress />
      <Nav />

      <section className="relative overflow-hidden border-b border-brand-line bg-black">
        <div className="mx-auto max-w-[1296px] px-6 py-24 sm:px-10 sm:py-32">
          <Reveal as="up">
            <div className="section-index">/ This season</div>
          </Reveal>
          <Reveal as="up" delay={120}>
            <h1 className="mt-10 max-w-5xl font-display text-6xl font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-white sm:text-8xl md:text-[8rem]">
              Featured
              <br />
              offer.
            </h1>
          </Reveal>
          <Reveal as="up" delay={260}>
            <div className="mt-16 grid gap-12 border-t border-brand-line pt-12 sm:grid-cols-[1fr_2fr] sm:gap-20">
              <div className="section-index">/ Curated quarterly</div>
              <p className="max-w-2xl text-base leading-[1.7] text-white/80 sm:text-lg">
                A single partner experience, curated for Lively guests and
                refreshed each season — from dining rooms to cellar doors to
                private moorings.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-black">
        <div className="mx-auto max-w-[1296px] px-6 py-24 sm:px-10 sm:py-32">
          {offer ? (
            <Reveal as="up">
              <article className="grid gap-px bg-white/10 md:grid-cols-[1.1fr_1fr]">
                {offer.image_url ? (
                  <div className="relative aspect-[4/3] w-full bg-black md:aspect-auto md:min-h-[560px]">
                    <Image
                      src={offer.image_url}
                      alt={offer.title}
                      fill
                      className="object-cover"
                      sizes="(min-width: 768px) 55vw, 100vw"
                    />
                  </div>
                ) : (
                  <div className="min-h-[360px] bg-white/[0.03] md:min-h-[560px]" />
                )}
                <div className="flex flex-col justify-center bg-black p-8 sm:p-12">
                  <div className="section-index">/ Partner experience</div>
                  <h2 className="mt-6 font-display text-4xl font-semibold uppercase leading-[0.98] tracking-[-0.02em] text-white sm:text-5xl md:text-6xl">
                    {offer.title}
                  </h2>
                  {offer.description && (
                    <p className="mt-8 max-w-md whitespace-pre-line text-base leading-[1.7] text-white/75">
                      {offer.description}
                    </p>
                  )}
                  {offer.cta_url && (
                    <div className="mt-10">
                      <a
                        href={offer.cta_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block rounded-[15px] border border-white bg-white px-8 py-3.5 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-black transition hover:bg-transparent hover:text-white"
                      >
                        {offer.cta_label || "Learn more"}
                      </a>
                    </div>
                  )}
                </div>
              </article>
            </Reveal>
          ) : (
            <Reveal as="up">
              <div className="rounded-[6px] border border-white/15 bg-white/[0.03] p-12 text-center">
                <div className="font-display text-[11px] uppercase tracking-[0.32em] text-brand-accent">
                  / Between seasons
                </div>
                <p className="mt-6 font-display text-3xl uppercase leading-[1.05] tracking-[-0.01em] text-white sm:text-4xl">
                  No featured offer live right now.
                </p>
                <p className="mt-6 text-sm leading-[1.7] text-white/60">
                  We curate a new partner experience each season — check back
                  soon, or browse the full rewards catalogue.
                </p>
                <div className="mt-10">
                  <Link
                    href="/experiences"
                    className="inline-block rounded-[15px] border border-white bg-white px-8 py-3.5 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-black transition hover:bg-transparent hover:text-white"
                  >
                    Browse rewards
                  </Link>
                </div>
              </div>
            </Reveal>
          )}

          <Reveal as="up" delay={200}>
            <Link
              href="/portal"
              className="mt-16 inline-block font-display text-[11px] uppercase tracking-[0.32em] text-white/50 transition hover:text-white"
            >
              ← Back to portal
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}

export const metadata = {
  title: "Featured offer — Lively",
  description:
    "The current season's featured partner experience — curated for Lively guests.",
};
