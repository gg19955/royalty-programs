import Link from "next/link";
import {
  signatureHomes,
  signatureRegions,
  type SignatureHome,
} from "@/lib/content/signature-homes";

/**
 * Tile media — renders either a still or a muted autoplaying loop,
 * depending on whether the home has a `video` asset. Keeping this in one
 * place so any tile (portrait strip, editorial frame, future layouts) picks
 * up richer media simply by setting `video` + `videoPoster` in the content
 * module.
 */
function TileMedia({
  home,
  className,
}: {
  home: SignatureHome;
  className: string;
}) {
  if (home.video) {
    return (
      <video
        className={className}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={home.videoPoster ?? home.src}
        aria-label={home.name}
      >
        <source src={home.video} type="video/mp4" />
      </video>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={home.src} alt={home.name} className={className} />
  );
}

/**
 * Editorial curation shown on the home page. Uses locally-hosted stills from
 * livelyproperties.com.au until the platform has its own published listings.
 */
export function SignatureShowcase() {
  const [lead, wideA, wideB, ...rest] = signatureHomes;
  const portraitStrip = rest.slice(0, 4);
  const closer = rest[4];

  return (
    <section className="border-b border-brand-line bg-black">
      {/* Lead frame */}
      <EditorialFrame home={lead} height="h-[78vh]" align="bottom-left" />

      {/* Asymmetric pair */}
      <div className="mx-auto mt-0 grid max-w-none grid-cols-1 gap-px bg-brand-line md:grid-cols-[5fr_4fr]">
        <EditorialFrame home={wideA} height="h-[68vh]" align="bottom-left" />
        <EditorialFrame home={wideB} height="h-[68vh]" align="bottom-left" />
      </div>

      {/* Portrait strip */}
      <div className="grid grid-cols-2 gap-px bg-brand-line md:grid-cols-4">
        {portraitStrip.map((h) => (
          <Link
            key={h.src}
            href={`/stays/${h.slug}`}
            className="group relative block aspect-[3/4] overflow-hidden bg-black"
          >
            <TileMedia
              home={h}
              className="h-full w-full object-cover transition duration-[1400ms] ease-out group-hover:scale-[1.06]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
            <div className="absolute left-4 top-4 font-display text-[10px] uppercase tracking-[0.28em] text-white/70">
              / {h.region}
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <div className="font-display text-2xl font-semibold uppercase leading-[0.95] tracking-[-0.01em] sm:text-3xl">
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
  home: SignatureHome;
  height: string;
  align: "bottom-left" | "bottom-right";
}) {
  const justify =
    align === "bottom-right" ? "justify-end text-right" : "justify-start";
  return (
    <Link
      href={`/stays/${home.slug}`}
      className={"group relative block overflow-hidden bg-black " + height}
    >
      <TileMedia
        home={home}
        className="absolute inset-0 h-full w-full object-cover transition duration-[1400ms] ease-out group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-black/75" />
      <div
        className={
          "relative flex h-full items-end px-8 pb-12 sm:px-16 sm:pb-20 " +
          justify
        }
      >
        <div className="max-w-2xl text-white">
          <div className="section-index text-white/70">/ {home.region}</div>
          <div className="mt-5 font-display text-5xl font-semibold uppercase leading-[0.9] tracking-[-0.01em] sm:text-7xl md:text-[7rem]">
            {home.name}
          </div>
          <p className="mt-6 max-w-md text-base leading-[1.55] text-white/80 sm:text-lg">
            {home.caption}
          </p>
        </div>
      </div>
    </Link>
  );
}

/**
 * Region tiles — fallback when DB has no properties yet.
 */
export function SignatureRegions() {
  return (
    <section className="border-b border-brand-line bg-black">
      <div className="mx-auto max-w-[1296px] px-6 py-24 sm:px-10 sm:py-32">
        <div className="flex flex-col gap-4 border-b border-brand-line pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="section-index">/ 02 — By region</div>
            <h2 className="mt-6 font-display text-5xl font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-white sm:text-7xl">
              Where Lively goes.
            </h2>
          </div>
          <Link
            href="/stays"
            className="link-underline font-display text-[11px] uppercase tracking-[0.28em] text-white"
          >
            All stays →
          </Link>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-3 sm:gap-6">
          {signatureRegions.map((r) => (
            <Link
              key={r.slug}
              href={`/regions/${r.slug}`}
              className="group relative block aspect-[3/4] overflow-hidden rounded-[2px] bg-black"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.src}
                alt={r.region}
                className="h-full w-full object-cover transition duration-[1400ms] ease-out group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/30" />
              <div className="absolute left-4 top-4 font-display text-[10px] uppercase tracking-[0.28em] text-white/70">
                / Region
              </div>
              <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                <div className="font-display text-4xl font-semibold uppercase leading-[0.95] tracking-[-0.01em] sm:text-5xl">
                  <span className="link-underline">{r.region}</span>
                </div>
                <p className="mt-3 max-w-xs text-sm leading-[1.55] text-white/75">
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
