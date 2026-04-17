/**
 * Curated editorial stills pulled from livelyproperties.com.au.
 * Used by the marketing home + /stays fallback until hosts have seeded
 * live listings on the platform. Order is deliberate — the first entry is
 * the lead frame, the rest follow as a descending visual rhythm.
 */

export type SignatureHome = {
  /** Local path under /public — served as-is. */
  src: string;
  /** Property name, as published on livelyproperties.com.au. */
  name: string;
  /** Where it sits — region tile. */
  region: string;
  /** Editorial one-liner (not a description). */
  caption: string;
};

export const signatureHomes: SignatureHome[] = [
  {
    src: "/media/homes/oceans-edge.jpg",
    name: "The Ocean's Edge",
    region: "Sorrento",
    caption: "A clifftop residence where the horizon does the decorating.",
  },
  {
    src: "/media/homes/portsea-paradise.jpg",
    name: "Portsea Paradise",
    region: "Portsea",
    caption: "Pool, tennis court, and a garden that reads like a summer plan.",
  },
  {
    src: "/media/homes/la-perla-marina.jpg",
    name: "La Perla Marina",
    region: "Mornington",
    caption: "Penthouse, private pool, bay views — aerially speaking.",
  },
  {
    src: "/media/homes/onyx-retreat.jpg",
    name: "Onyx Retreat",
    region: "Yarra Valley",
    caption: "Thirteen acres of quiet, held together by a single long table.",
  },
  {
    src: "/media/homes/marthas-peak.jpg",
    name: "Martha's Peak",
    region: "Mount Martha",
    caption: "A house that lets the light do most of the talking.",
  },
  {
    src: "/media/homes/villa-floretti.jpg",
    name: "Villa Floretti",
    region: "Mornington Peninsula",
    caption: "Heated spa, vineyard views, and an intentional kind of stillness.",
  },
  {
    src: "/media/homes/the-hull.jpg",
    name: "The Hull",
    region: "Mount Martha",
    caption: "Architecturally severe, domestically generous.",
  },
  {
    src: "/media/homes/barrington.jpg",
    name: "Barrington",
    region: "Mornington",
    caption: "A retreat designed for the long weekend that keeps extending.",
  },
  {
    src: "/media/homes/sol-yarra-valley.jpg",
    name: "Sol",
    region: "Yarra Valley",
    caption: "Barrel sauna, outdoor tub, and the sound of absolutely nothing.",
  },
  {
    src: "/media/homes/muskoka.jpg",
    name: "Muskoka",
    region: "Red Hill",
    caption: "Pool, spa, and rooms that were built to be lingered in.",
  },
  {
    src: "/media/homes/clifftop.jpg",
    name: "Clifftop Luxury",
    region: "Portsea",
    caption: "Ocean out front, cellar out back.",
  },
  {
    src: "/media/homes/mt-martha-manor.jpg",
    name: "Mount Martha Manor",
    region: "Mount Martha",
    caption: "Indoor pool, cinema, and a quiet confidence about both.",
  },
];

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
