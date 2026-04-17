import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/nav";
import { formatPoints } from "@/lib/utils";

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

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-10">
        {offers && offers.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-semibold">Special offers</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {offers.map((o: any) => (
                <div key={o.id} className="rounded-xl border bg-white p-5">
                  <div className="text-base font-semibold">{o.title}</div>
                  <p className="mt-1 text-sm text-gray-600">{o.description}</p>
                  {o.cta_url && (
                    <a
                      href={o.cta_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-sm font-medium text-brand-accent hover:underline"
                    >
                      {o.cta_label || "Learn more →"}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h1 className="text-2xl font-semibold">Experiences</h1>
          <p className="mt-1 text-sm text-gray-600">
            Redeem your points on curated partner offerings across Victoria.
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experiences?.map((e: any) => (
              <Link
                key={e.id}
                href={`/experiences/${e.id}`}
                className="group overflow-hidden rounded-xl border bg-white transition hover:shadow-md"
              >
                {e.image_url ? (
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={e.image_url}
                      alt={e.title}
                      fill
                      className="object-cover transition group-hover:scale-[1.02]"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] w-full bg-gray-100" />
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{e.title}</h3>
                    <span className="text-sm font-medium text-brand-accent">
                      {formatPoints(e.points_cost)} pts
                    </span>
                  </div>
                  {e.partners?.name && (
                    <div className="text-xs uppercase tracking-wide text-gray-500">
                      {e.partners.name}
                    </div>
                  )}
                  {e.region && <div className="mt-1 text-sm text-gray-600">{e.region}</div>}
                </div>
              </Link>
            ))}
          </div>

          {(!experiences || experiences.length === 0) && (
            <p className="mt-6 text-sm text-gray-600">
              No experiences live yet. Check back soon.
            </p>
          )}
        </section>
      </main>
    </>
  );
}
