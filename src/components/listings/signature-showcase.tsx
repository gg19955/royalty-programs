import Link from "next/link";
import { signatureHomes, signatureRegions } from "@/lib/content/signature-homes";

/**
 * Editorial curation shown on the home page. Uses locally-hosted stills from
 * livelyproperties.com.au until the platform has its own published listings.
 * Rhythm is deliberate: oversized lead frame, asymmetric pair, wide strip,
 * closing frame. No property IDs — each tile links to the /stays browse.
 */
export function SignatureShowcase() {
  const [lead, wideA, wideB, ...rest] = signatureHomes;
  const portraitStrip = rest.slice(0, 4);
  const closer = rest[4];

  return (
    <section className="border-b border-brand-line bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-10 sm:py-32">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-brand-accent">
              The collection
            </p>
            <h2 className="mt-5 font-display text-5xl leading-[0.98] tracking-[-0.02em] text-brand sm:text-7xl">
              A handful of signatures.
            </h2>
          </div>
          <Link
            href="/stays"
            className="text-[11px] uppercase tracking-[0.24em] text-brand hover:underline"
          >
            Every home →
          </Link>
        </div>
      </div>

      {/* Lead frame — full-bleed, tall, anchor of the section */}
      <EditorialFrame home={lead} height="h-[78vh]" align="bottom-left" />

      {/* Asymmetric pair */}
      <div className="mx-auto mt-0 grid max-w-none grid-cols-1 gap-0 md:grid-cols-[5fr_4fr]">
        <EditorialFrame home={wideA} height="h-[68vh]" align="bottom-left" />
        <EditorialFrame home={wideB} height="h-[68vh]" align="bottom-left" />
      </div>

      {/* Portrait strip */}
      <div className="grid grid-cols-2 gap-0 md:grid-cols-4">
        {portraitStrip.map((h) => (
          <Link
            key={h.src}
            href="/stays"
            className="group relative block aspect-[3/4] overflow-hidden bg-black"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={h.src}
              alt={h.name}
              className="h-full w-full object-cover transition duration-[1400ms] ease-out group-hover:scale-[1.06]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <div className="text-[10px] uppercase tracking-[0.28em] text-white/70">
                {h.region}
              </div>
              <div className="mt-2 font-display text-2xl leading-[1.05] tracking-[-0.01em] sm:text-3xl">
                {h.name}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Closer */}
      {closer && (
        <EditorialFrame home={closer} height="h-[72vh]" align="bottom-right" />
      )}
    </section>
  );
}

function EditorialFrame({
  home,
  height,
  align,
}: {
  home: {
    src: string;
    name: string;
    region: string;
    caption: string;
  };
  height: string;
  align: "bottom-left" | "bottom-right";
}) {
  const justify =
    align === "bottom-right" ? "justify-end text-right" : "justify-start";
  return (
    <Link
      href="/stays"
      className={"group relative block overflow-hidden bg-black " + height}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={home.src}
        alt={home.name}
        className="absolute inset-0 h-full w-full object-cover transition duration-[1400ms] ease-out group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-black/60" />
      <div className={"relative flex h-full items-end px-8 pb-12 sm:px-16 sm:pb-20 " + justify}>
        <div className="max-w-2xl text-white">
          <div className="text-[10px] uppercase tracking-[0.32em] text-white/75">
            {home.region}
          </div>
          <div className="mt-4 font-display text-4xl leading-[1.02] tracking-[-0.01em] sm:text-6xl md:text-7xl">
            {home.name}
          </div>
          <p className="mt-5 max-w-md text-base leading-[1.55] text-white/85 sm:text-lg">
            {home.caption}
          </p>
        </div>
      </div>
    </Link>
  );
}

/**
 * Region tiles — used on the home page even when the DB has no properties yet.
 */
export function SignatureRegions() {
  return (
    <section className="border-b border-brand-line bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-10 sm:py-32">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-brand-accent">
              By region
            </p>
            <h2 className="mt-5 font-display text-5xl leading-[0.98] tracking-[-0.02em] text-brand sm:text-7xl">
              Where Lively goes.
            </h2>
          </div>
          <Link
            href="/stays"
            className="text-[11px] uppercase tracking-[0.24em] text-brand hover:underline"
          >
            All stays →
          </Link>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-3 sm:gap-6">
          {signatureRegions.map((r) => (
            <Link
              key={r.slug}
              href={`/regions/${r.slug}`}
              className="group relative block aspect-[3/4] overflow-hidden bg-black"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.src}
                alt={r.region}
                className="h-full w-full object-cover transition duration-[1400ms] ease-out group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/20" />
              <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                <div className="text-[10px] uppercase tracking-[0.28em] text-white/70">
                  Region
                </div>
                <div className="mt-3 font-display text-4xl leading-[1.05] tracking-[-0.01em] sm:text-5xl">
                  {r.region}
                </div>
                <p className="mt-3 max-w-xs text-sm leading-[1.55] text-white/80">
                  {r.caption}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
