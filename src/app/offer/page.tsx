import Image from "next/image";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { createClient } from "@/lib/supabase/server";

export default async function OfferPage() {
  const supabase = createClient();

  // Prefer the featured+active offer; fall back to newest active offer.
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
      <Nav />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.24em] text-brand-accent">
          This season
        </p>
        <h1 className="mt-4 font-serif text-4xl font-normal tracking-tightest text-brand">
          Current Season Offer
        </h1>

        {offer ? (
          <article className="mt-12 overflow-hidden rounded-sm border border-brand-line bg-white">
            {offer.image_url && (
              <div className="relative aspect-[16/7] w-full">
                <Image src={offer.image_url} alt={offer.title} fill className="object-cover" />
              </div>
            )}
            <div className="p-10">
              <h2 className="font-serif text-3xl font-normal tracking-tight text-brand">
                {offer.title}
              </h2>
              {offer.description && (
                <p className="mt-4 whitespace-pre-line text-neutral-700">
                  {offer.description}
                </p>
              )}
              {offer.cta_url && (
                <a
                  href={offer.cta_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-block rounded-sm bg-brand px-6 py-3 text-sm font-medium text-white transition hover:bg-black"
                >
                  {offer.cta_label || "Learn more"}
                </a>
              )}
            </div>
          </article>
        ) : (
          <div className="mt-12 rounded-sm border border-brand-line bg-white p-10 text-sm text-neutral-600">
            No featured offer live right now. Check back soon — we curate a new partner offer each season.
          </div>
        )}

        <Link href="/portal" className="mt-10 inline-block text-sm text-neutral-500 hover:text-brand">
          ← Back to portal
        </Link>
      </main>
    </>
  );
}
