import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { regionToSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://livelyproperties.com.au";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/stays`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/experiences`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/offer`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/host`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  const { data: props } = await admin
    .from("properties")
    .select("slug, region, published_at")
    .eq("listing_status", "published")
    .not("slug", "is", null);

  const propertyEntries: MetadataRoute.Sitemap = (props ?? [])
    .filter((p): p is { slug: string; region: string | null; published_at: string | null } =>
      !!p.slug,
    )
    .map((p) => ({
      url: `${SITE_URL}/stays/${p.slug}`,
      lastModified: p.published_at ? new Date(p.published_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const regions = Array.from(
    new Set(
      (props ?? [])
        .map((p) => p.region)
        .filter((r): r is string => !!r),
    ),
  );

  const regionEntries: MetadataRoute.Sitemap = regions.map((r) => ({
    url: `${SITE_URL}/regions/${regionToSlug(r)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...regionEntries, ...propertyEntries];
}
