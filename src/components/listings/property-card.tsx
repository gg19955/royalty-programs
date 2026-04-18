import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export type PropertyCardData = {
  slug: string;
  name: string;
  headline: string | null;
  region: string | null;
  city: string | null;
  bedrooms: number | null;
  max_guests: number | null;
  base_rate_cents: number | null;
  hero_url: string | null;
};

export function PropertyCard({
  p,
  featured = false,
}: {
  p: PropertyCardData;
  featured?: boolean;
}) {
  return (
    <Link href={`/stays/${p.slug}`} className="group block">
      <div
        className={
          "relative overflow-hidden bg-brand-soft " +
          (featured ? "aspect-[16/10]" : "aspect-[4/5]")
        }
      >
        {p.hero_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.hero_url}
            alt={p.name}
            className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-wide text-brand-accent">
            Photo coming soon
          </div>
        )}
        {/* subtle vignette on hover for depth */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        />
      </div>
      <div className="pt-5">
        <div className="text-[10px] uppercase tracking-[0.28em] text-brand-accent">
          {[p.city, p.region].filter(Boolean).join(" · ")}
        </div>
        <h3
          className={
            "mt-3 font-display leading-[1.05] tracking-[-0.01em] text-brand transition-colors duration-500 group-hover:text-brand-accent " +
            (featured ? "text-4xl sm:text-5xl" : "text-2xl sm:text-[1.75rem]")
          }
        >
          <span className="link-underline">{p.name}</span>
        </h3>
        {p.headline && (
          <p className="mt-3 line-clamp-2 max-w-md text-sm leading-relaxed text-neutral-600">
            {p.headline}
          </p>
        )}
        <div className="mt-5 flex items-baseline justify-between border-t border-brand-line pt-4 text-xs text-neutral-500">
          <span className="uppercase tracking-[0.18em]">
            {p.bedrooms ? `${p.bedrooms} bed` : "—"}
            {p.max_guests ? ` · sleeps ${p.max_guests}` : ""}
          </span>
          {p.base_rate_cents ? (
            <span className="text-sm text-brand">
              from <span className="font-medium">{formatCurrency(p.base_rate_cents)}</span>
              <span className="ml-1 text-xs text-neutral-500">/ night</span>
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
