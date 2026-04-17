import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Nav } from "@/components/nav";

export const dynamic = "force-dynamic";

export default async function BookPlaceholderPage({
  params,
}: {
  params: { slug: string };
}) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("properties")
    .select("name, slug, headline")
    .eq("slug", params.slug)
    .eq("listing_status", "published")
    .maybeSingle();
  if (!data) notFound();

  return (
    <>
      <Nav />
      <section className="mx-auto max-w-2xl px-6 py-24">
        <Link
          href={`/stays/${data.slug}`}
          className="text-xs uppercase tracking-[0.22em] text-brand-accent hover:text-brand"
        >
          ← Back to {data.name}
        </Link>
        <h1 className="mt-6 font-display text-4xl leading-tight tracking-tight text-brand">
          Instant booking is coming soon.
        </h1>
        <p className="mt-4 text-base text-neutral-600">
          We&apos;re finalising on-platform payments. While we ship that, reach out and
          our team will hold these dates and confirm within a day.
        </p>
        <div className="mt-10 rounded-xl border border-brand-line bg-white p-6">
          <div className="text-xs uppercase tracking-[0.22em] text-brand-accent">
            Enquire
          </div>
          <p className="mt-2 text-sm text-neutral-600">
            Email{" "}
            <a
              className="text-brand underline-offset-4 hover:underline"
              href={`mailto:stays@livelyproperties.com.au?subject=Enquiry: ${encodeURIComponent(data.name)}`}
            >
              stays@livelyproperties.com.au
            </a>{" "}
            with your preferred dates and guest count.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={`mailto:stays@livelyproperties.com.au?subject=Enquiry: ${encodeURIComponent(data.name)}`}
              className="rounded-sm bg-brand px-5 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-white hover:bg-black"
            >
              Email us
            </a>
            <Link
              href="/stays"
              className="rounded-sm border border-brand-line px-5 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-neutral-700 hover:border-brand hover:text-brand"
            >
              Browse more stays
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
