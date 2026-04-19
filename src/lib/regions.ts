import { createAdminClient } from "@/lib/supabase/admin";

export type Region = {
  id: string;
  label: string;
  slug: string;
  suburbs: string[];
  display_order: number;
  active: boolean;
};

/**
 * Load active regions sorted by display_order, then label. Used by the hero
 * search bar, the /stays filter chips, and the listing form region dropdown.
 * Admin-managed via /admin/regions.
 */
export async function listActiveRegions(): Promise<Region[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("regions")
    .select("id, label, slug, suburbs, display_order, active")
    .eq("active", true)
    .order("display_order", { ascending: true })
    .order("label", { ascending: true });
  return (data ?? []) as Region[];
}

export async function listAllRegions(): Promise<Region[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("regions")
    .select("id, label, slug, suburbs, display_order, active")
    .order("display_order", { ascending: true })
    .order("label", { ascending: true });
  return (data ?? []) as Region[];
}
