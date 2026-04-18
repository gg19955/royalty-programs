"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

/**
 * Region → suburb map used by the homepage search bar. Intentionally
 * hand-curated for the four launch regions — once listings cover more
 * ground this should migrate to a DB-driven lookup, but for now the
 * editorial control of "which suburbs actually show" is worth the
 * duplication.
 */
const REGIONS: { label: string; slug: string; suburbs: string[] }[] = [
  {
    label: "Mornington Peninsula",
    slug: "mornington-peninsula",
    suburbs: [
      "Portsea",
      "Sorrento",
      "Blairgowrie",
      "Rye",
      "Rosebud",
      "Mount Martha",
      "Mornington",
      "Dromana",
      "Red Hill",
      "Flinders",
      "Shoreham",
      "Point Leo",
    ],
  },
  {
    label: "Yarra Valley",
    slug: "yarra-valley",
    suburbs: [
      "Healesville",
      "Yarra Glen",
      "Coldstream",
      "Yering",
      "Dixons Creek",
      "Warburton",
      "Seville",
      "Gruyere",
      "Wandin",
    ],
  },
  {
    label: "Melbourne & Surrounds",
    slug: "melbourne-surrounds",
    suburbs: [
      "Melbourne CBD",
      "South Yarra",
      "Toorak",
      "St Kilda",
      "Brighton",
      "Albert Park",
      "Richmond",
      "Fitzroy",
      "Carlton",
      "Port Melbourne",
    ],
  },
  {
    label: "Bellarine Peninsula",
    slug: "bellarine-peninsula",
    suburbs: [
      "Queenscliff",
      "Point Lonsdale",
      "Ocean Grove",
      "Barwon Heads",
      "Portarlington",
      "St Leonards",
      "Indented Head",
      "Drysdale",
    ],
  },
];

function today(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function HeroSearch() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [regionSlug, setRegionSlug] = useState("");
  const [suburb, setSuburb] = useState("");

  const suburbs = useMemo(() => {
    const r = REGIONS.find((x) => x.slug === regionSlug);
    return r ? r.suburbs : [];
  }, [regionSlug]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (checkIn) params.set("check_in", checkIn);
    if (checkOut) params.set("check_out", checkOut);
    if (regionSlug) params.set("region", regionSlug);
    if (suburb) params.set("suburb", suburb);
    const qs = params.toString();
    router.push(qs ? `/stays?${qs}` : "/stays");
  };

  const minIn = today();
  const minOut = checkIn || today(1);

  return (
    <section
      aria-label="Find a stay"
      className="relative z-20 border-b border-brand-line bg-black"
    >
      <div className="mx-auto max-w-[1296px] px-6 py-10 sm:px-10 sm:py-12">
        <div className="flex flex-col gap-4 border-b border-brand-line pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="section-index">/ Plan your stay</div>
            <h2 className="mt-3 font-display text-2xl font-semibold uppercase leading-[1.02] tracking-[-0.01em] text-white sm:text-3xl">
              When & where.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-[1.65] text-white/60">
            Pick your dates and region — narrow further by suburb if you
            already know the pocket of Victoria you&apos;re after.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="mt-8 grid grid-cols-1 gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr_1.1fr_auto]"
        >
          <SearchField label="Check in">
            <input
              type="date"
              value={checkIn}
              min={minIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-transparent text-base text-white outline-none"
            />
          </SearchField>

          <SearchField label="Check out">
            <input
              type="date"
              value={checkOut}
              min={minOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent text-base text-white outline-none"
            />
          </SearchField>

          <SearchField label="Region">
            <select
              value={regionSlug}
              onChange={(e) => {
                setRegionSlug(e.target.value);
                setSuburb("");
              }}
              className="w-full cursor-pointer appearance-none bg-transparent text-base text-white outline-none"
            >
              <option value="" className="bg-black text-white">
                Any region
              </option>
              {REGIONS.map((r) => (
                <option
                  key={r.slug}
                  value={r.slug}
                  className="bg-black text-white"
                >
                  {r.label}
                </option>
              ))}
            </select>
          </SearchField>

          <SearchField label="Suburb" disabled={!regionSlug}>
            <select
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
              disabled={!regionSlug}
              className="w-full cursor-pointer appearance-none bg-transparent text-base text-white outline-none disabled:cursor-not-allowed disabled:text-white/40"
            >
              <option value="" className="bg-black text-white">
                {regionSlug ? "Any suburb" : "Choose region first"}
              </option>
              {suburbs.map((s) => (
                <option key={s} value={s} className="bg-black text-white">
                  {s}
                </option>
              ))}
            </select>
          </SearchField>

          <button
            type="submit"
            className="bg-white px-10 py-6 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-black transition hover:bg-brand-accent lg:px-12"
          >
            Search stays
          </button>
        </form>
      </div>
    </section>
  );
}

function SearchField({
  label,
  disabled,
  children,
}: {
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      className={
        "flex flex-col justify-center gap-2 bg-black px-6 py-5 transition " +
        (disabled ? "opacity-60" : "hover:bg-white/[0.03]")
      }
    >
      <span className="font-display text-[10px] uppercase tracking-[0.32em] text-white/55">
        {label}
      </span>
      {children}
    </label>
  );
}
