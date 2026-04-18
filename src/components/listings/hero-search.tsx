"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Region → suburb map used by the homepage search bar. Intentionally
 * hand-curated for the four launch regions — once listings cover more
 * ground this should migrate to a DB-driven lookup.
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

function formatDisplay(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function HeroSearch() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [regionSlugs, setRegionSlugs] = useState<string[]>([]);
  const [suburbList, setSuburbList] = useState<string[]>([]);

  const selectedRegions = useMemo(
    () => REGIONS.filter((r) => regionSlugs.includes(r.slug)),
    [regionSlugs],
  );
  const availableSuburbs = useMemo(
    () => selectedRegions.flatMap((r) => r.suburbs),
    [selectedRegions],
  );

  // Toggling a region: if it's removed, prune any of its suburbs from the
  // suburb selection so we never submit a suburb that isn't visible.
  const toggleRegion = (slug: string) => {
    setRegionSlugs((prev) => {
      const next = prev.includes(slug)
        ? prev.filter((x) => x !== slug)
        : [...prev, slug];
      const nextAvailable = REGIONS.filter((r) => next.includes(r.slug)).flatMap(
        (r) => r.suburbs,
      );
      setSuburbList((curr) => curr.filter((s) => nextAvailable.includes(s)));
      return next;
    });
  };
  const toggleSuburb = (s: string) =>
    setSuburbList((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (checkIn) params.set("check_in", checkIn);
    if (checkOut) params.set("check_out", checkOut);
    regionSlugs.forEach((r) => params.append("region", r));
    suburbList.forEach((s) => params.append("suburb", s));
    const qs = params.toString();
    router.push(qs ? `/stays?${qs}` : "/stays");
  };

  const regionDisplay =
    selectedRegions.length === 0
      ? "Any region"
      : selectedRegions.length === 1
        ? selectedRegions[0].label
        : `${selectedRegions[0].label} +${selectedRegions.length - 1}`;
  const suburbDisplay =
    suburbList.length === 0
      ? regionSlugs.length
        ? "Any suburb"
        : "Choose region first"
      : suburbList.length === 1
        ? suburbList[0]
        : `${suburbList[0]} +${suburbList.length - 1}`;

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
          <DateField
            label="Check in"
            value={checkIn}
            min={minIn}
            onChange={setCheckIn}
          />
          <DateField
            label="Check out"
            value={checkOut}
            min={minOut}
            onChange={setCheckOut}
          />

          <MultiDropdownField
            label="Region"
            values={regionSlugs}
            placeholder="Any region"
            displayText={regionDisplay}
            options={REGIONS.map((r) => ({ value: r.slug, label: r.label }))}
            onToggle={toggleRegion}
            onClear={() => {
              setRegionSlugs([]);
              setSuburbList([]);
            }}
          />

          <MultiDropdownField
            label="Suburb"
            values={suburbList}
            disabled={regionSlugs.length === 0}
            placeholder={regionSlugs.length ? "Any suburb" : "Choose region first"}
            displayText={suburbDisplay}
            options={availableSuburbs.map((s) => ({ value: s, label: s }))}
            onToggle={toggleSuburb}
            onClear={() => setSuburbList([])}
          />

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

/**
 * Date tile — the whole tile is clickable. We render the native input
 * transparently over the tile surface and also call `showPicker()` on
 * container click (supported in modern Chrome/Edge/Safari) so guests
 * never have to hunt for the tiny browser calendar icon.
 */
function DateField({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: string;
  min: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const open = () => {
    const el = ref.current;
    if (!el) return;
    // showPicker is the modern way; fall back to focus + click on the
    // input itself for older browsers.
    if (typeof (el as any).showPicker === "function") {
      try {
        (el as any).showPicker();
        return;
      } catch {
        /* gesture requirement may fail; fall through */
      }
    }
    el.focus();
    el.click();
  };

  return (
    <div
      onClick={open}
      className="group relative flex cursor-pointer flex-col justify-center gap-2 bg-black px-6 py-5 transition hover:bg-white/[0.03]"
    >
      <span className="font-display text-[10px] uppercase tracking-[0.32em] text-white/55">
        {label}
      </span>
      <span
        className={
          "text-base " + (value ? "text-white" : "text-white/40")
        }
      >
        {value ? formatDisplay(value) : "Select date"}
      </span>
      {/* Native input — invisible but present, covers the tile so any
          click / tap opens the OS date picker. */}
      <input
        ref={ref}
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-label={label}
      />
    </div>
  );
}

/**
 * Editorial multi-select dropdown. Renders as a tile matching the date
 * tiles; opens a panel of checkbox-style options. The panel stays open
 * across toggles (so guests can pick multiple regions/suburbs) and
 * closes on outside click, Escape, or the "Done" affordance.
 */
function MultiDropdownField({
  label,
  values,
  displayText,
  placeholder,
  options,
  onToggle,
  onClear,
  disabled,
}: {
  label: string;
  values: string[];
  displayText: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onToggle: (v: string) => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const hasSelection = values.length > 0;

  return (
    <div
      ref={wrapRef}
      className={
        "group relative flex flex-col justify-center gap-2 bg-black px-6 py-5 transition " +
        (disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:bg-white/[0.03]")
      }
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full flex-col items-start gap-2 text-left outline-none disabled:cursor-not-allowed"
      >
        <span className="font-display text-[10px] uppercase tracking-[0.32em] text-white/55">
          {label}
        </span>
        <span
          className={
            "flex w-full items-center justify-between gap-4 text-base " +
            (hasSelection ? "text-white" : "text-white/40")
          }
        >
          <span className="truncate">{displayText || placeholder}</span>
          <Caret open={open} />
        </span>
      </button>

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-full z-30 mt-px border-x border-b border-brand-line bg-black shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)]">
          <ul
            role="listbox"
            aria-multiselectable="true"
            className="max-h-72 overflow-y-auto py-2"
          >
            {options.map((o) => {
              const selected = values.includes(o.value);
              return (
                <li key={o.value} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => onToggle(o.value)}
                    className={
                      "flex w-full items-center gap-3 px-6 py-3 text-left text-[15px] transition " +
                      (selected
                        ? "bg-white/[0.06] text-white"
                        : "text-white/75 hover:bg-white/[0.04] hover:text-white")
                    }
                  >
                    <Checkbox checked={selected} />
                    <span className="flex-1 truncate">{o.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {hasSelection && (
            <div className="flex items-center justify-between border-t border-brand-line px-6 py-3">
              <button
                type="button"
                onClick={onClear}
                className="font-display text-[10px] uppercase tracking-[0.28em] text-white/60 transition hover:text-white"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="font-display text-[10px] uppercase tracking-[0.28em] text-brand-accent"
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={
        "flex h-4 w-4 shrink-0 items-center justify-center border transition " +
        (checked
          ? "border-brand-accent bg-brand-accent text-black"
          : "border-white/40 bg-transparent")
      }
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M2 5.2 L4.2 7.4 L8 3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

function Caret({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      width="12"
      height="12"
      viewBox="0 0 12 12"
      className={
        "shrink-0 text-white/60 transition-transform " + (open ? "rotate-180" : "")
      }
    >
      <path
        d="M2 4.5 L6 8.5 L10 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
