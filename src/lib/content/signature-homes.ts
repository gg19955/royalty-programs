/**
 * Curated editorial stills pulled from livelyproperties.com.au.
 * Used by the marketing home + /stays fallback until hosts have seeded
 * live listings on the platform. Order is deliberate — the first entry is
 * the lead frame, the rest follow as a descending visual rhythm.
 */

export type SignatureHome = {
  /** URL slug — used for /stays/[slug]. Stable across the site. */
  slug: string;
  /** Local path under /public — served as-is. */
  src: string;
  /**
   * Optional mp4 under /public. When set, tiles render this as a muted
   * autoplaying loop in place of the still, and fall back to `src` as
   * the video poster if `videoPoster` is not provided.
   */
  video?: string;
  /** Optional poster frame for the video (jpg under /public). */
  videoPoster?: string;
  /** Property name, as published on livelyproperties.com.au. */
  name: string;
  /** Where it sits — region tile. */
  region: string;
  /** Editorial one-liner (not a description). */
  caption: string;
  /** Longer editorial paragraph used on the detail page. */
  description: string;
  /** Rough sleeping capacity (editorial estimate). */
  sleeps?: number;
  /** Bedroom count (editorial estimate). */
  bedrooms?: number;
};

export const signatureHomes: SignatureHome[] = [
  {
    slug: "the-oceans-edge",
    src: "/media/homes/oceans-edge.jpg",
    name: "The Ocean's Edge",
    region: "Sorrento",
    caption: "A clifftop residence where the horizon does the decorating.",
    description:
      "A four-bedroom clifftop retreat perched above the bay, designed around an infinity pool that reads as the ocean itself. Interiors are all linen, limestone, and long sightlines — every window curates a picture of the water. Wake to sunrise over the Peninsula, linger over lunch on the terrace, and watch the horizon burn in for dinner.",
    bedrooms: 4,
    sleeps: 8,
  },
  {
    slug: "portsea-paradise",
    src: "/media/homes/portsea-paradise.jpg",
    name: "Portsea Paradise",
    region: "Portsea",
    caption: "Pool, tennis court, and a garden that reads like a summer plan.",
    description:
      "A quietly grand family home set on a deep Portsea block, with a heated pool, a floodlit tennis court, and a garden that was built for long afternoons. Cook for a crowd in the Italian-tiled kitchen, eat on the terrace, and let everyone spread out across five bedrooms when the day finally winds down.",
    bedrooms: 5,
    sleeps: 10,
  },
  {
    slug: "la-perla-marina",
    src: "/media/homes/la-perla-marina.jpg",
    name: "La Perla Marina",
    region: "Mornington",
    caption: "Penthouse, private pool, bay views — aerially speaking.",
    description:
      "A full-floor penthouse above the Mornington marina with a private rooftop pool and 270° water views. Designed by a local architect with an unapologetic love of white plaster and curves, La Perla Marina plays like a Mediterranean apartment transplanted to the Peninsula.",
    bedrooms: 3,
    sleeps: 6,
  },
  {
    slug: "onyx-retreat",
    src: "/media/homes/onyx-retreat.jpg",
    name: "Onyx Retreat",
    region: "Yarra Valley",
    caption: "Thirteen acres of quiet, held together by a single long table.",
    description:
      "Thirteen acres of Yarra Valley vineyard, a blackened-timber residence, and a single long dining table that anchors every gathering. Onyx Retreat is the kind of house that changes the pace of a weekend — slow mornings in the kitchen, afternoons in the pool, and dinners that run until the stars take over.",
    bedrooms: 5,
    sleeps: 10,
  },
  {
    slug: "marthas-peak",
    src: "/media/homes/marthas-peak.jpg",
    name: "Martha's Peak",
    region: "Mount Martha",
    caption: "A house that lets the light do most of the talking.",
    description:
      "A sculptural four-bedroom home on the high side of Mount Martha, oriented for morning sun and evening calm. Polished concrete, pale oak, and floor-to-ceiling glass frame a compositional view of the bay. Minimal on the inside, generous on the outside — a patio that wraps the whole north-facing wing.",
    bedrooms: 4,
    sleeps: 8,
  },
  {
    slug: "villa-floretti",
    src: "/media/homes/villa-floretti.jpg",
    name: "Villa Floretti",
    region: "Mornington Peninsula",
    caption: "Heated spa, vineyard views, and an intentional kind of stillness.",
    description:
      "A Mediterranean-leaning villa set among vines, with a heated spa tucked into the garden and an interior that draws on Tuscan restraint — plaster walls, terracotta tiles, and linen everywhere. Floretti was built to slow you down: long breakfasts, long lunches, long naps.",
    bedrooms: 4,
    sleeps: 8,
  },
  {
    slug: "the-hull",
    src: "/media/homes/the-hull.jpg",
    name: "The Hull",
    region: "Mount Martha",
    caption: "Architecturally severe, domestically generous.",
    description:
      "A charcoal-clad contemporary residence cut into the Mount Martha headland. From the street it reads as an uncompromising piece of architecture; inside it opens out into a warm, light-filled home with a five-metre island bench, a pool, and a lounge that spills onto the lawn.",
    bedrooms: 4,
    sleeps: 8,
  },
  {
    slug: "barrington",
    src: "/media/homes/barrington.jpg",
    video: "/media/homes/barrington.mp4",
    videoPoster: "/media/homes/barrington-poster.jpg",
    name: "Barrington",
    region: "Mornington",
    caption: "A retreat designed for the long weekend that keeps extending.",
    description:
      "A relaxed, family-scale retreat tucked back from the coast, built around a central courtyard and a kitchen you'll want to cook in. Three separate living zones let groups find their own corner; the garden is all lawn, fire pit, and outdoor bath.",
    bedrooms: 4,
    sleeps: 9,
  },
  {
    slug: "sol",
    src: "/media/homes/sol-yarra-valley.jpg",
    name: "Sol",
    region: "Yarra Valley",
    caption: "Barrel sauna, outdoor tub, and the sound of absolutely nothing.",
    description:
      "A pared-back three-bedroom cabin in the Yarra Valley with a Finnish barrel sauna, outdoor wood-fired tub, and the kind of quiet that only country land delivers. Cellar-door territory — a short drive from some of Victoria's best vineyards, and easy reach to Healesville.",
    bedrooms: 3,
    sleeps: 6,
  },
  {
    slug: "muskoka",
    src: "/media/homes/muskoka.jpg",
    name: "Muskoka",
    region: "Red Hill",
    caption: "Pool, spa, and rooms that were built to be lingered in.",
    description:
      "A Canadian-inspired lake-house on Red Hill farmland — dark-stained timber, a soaring pitched roof, and a fireplace you can walk into. Pool and spa outside, cinema room inside, and four bedrooms arranged around a central hearth.",
    bedrooms: 4,
    sleeps: 8,
  },
  {
    slug: "clifftop-luxury",
    src: "/media/homes/clifftop.jpg",
    name: "Clifftop Luxury",
    region: "Portsea",
    caption: "Ocean out front, cellar out back.",
    description:
      "A coastal Portsea residence with front-row views across to the back beaches, a glass-walled wine cellar, and an owner's wing that runs to its own terrace. Designed to entertain — the kitchen opens to a covered pavilion big enough for a long table of twelve.",
    bedrooms: 5,
    sleeps: 10,
  },
  {
    slug: "mount-martha-manor",
    src: "/media/homes/mt-martha-manor.jpg",
    name: "Mount Martha Manor",
    region: "Mount Martha",
    caption: "Indoor pool, cinema, and a quiet confidence about both.",
    description:
      "A substantial Mount Martha home built for cooler-weather stays — an indoor heated pool, a purpose-built cinema, a gym, and six bedrooms across two wings. The scale is generous without being showy, and the finish level quietly excellent throughout.",
    bedrooms: 6,
    sleeps: 12,
  },
];

export function getSignatureHomeBySlug(
  slug: string,
): SignatureHome | undefined {
  return signatureHomes.find((h) => h.slug === slug);
}

export const signatureRegions: {
  region: string;
  slug: string;
  src: string;
  caption: string;
}[] = [
  {
    region: "Mornington Peninsula",
    slug: "mornington-peninsula",
    src: "/media/homes/portsea-paradise.jpg",
    caption: "Cellar doors, hot springs, and the ocean on both sides.",
  },
  {
    region: "Yarra Valley",
    slug: "yarra-valley",
    src: "/media/homes/onyx-retreat.jpg",
    caption: "Vineyards, long drives, the slow kind of lunch.",
  },
  {
    region: "Mount Martha",
    slug: "mount-martha",
    src: "/media/homes/the-hull.jpg",
    caption: "A headland cut precisely to hold long weekends.",
  },
];
