"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { syncAvailability } from "@/lib/guesty/sync-availability";
import { syncListings } from "@/lib/guesty/sync-listings";

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not signed in");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if ((profile as { role?: string } | null)?.role !== "admin") {
    throw new Error("not admin");
  }
}

export async function runListingsSync(formData: FormData) {
  await requireAdmin();
  const dryRun = formData.get("dryRun") === "on";
  const maxRaw = formData.get("max");
  const max = typeof maxRaw === "string" && maxRaw.length > 0 ? Number(maxRaw) : undefined;

  await syncListings({ dryRun, max: Number.isFinite(max) ? max : undefined });
  revalidatePath("/admin/guesty");
}

export async function runAvailabilitySync(formData: FormData) {
  await requireAdmin();
  const dryRun = formData.get("dryRun") === "on";
  const maxRaw = formData.get("max");
  const max = typeof maxRaw === "string" && maxRaw.length > 0 ? Number(maxRaw) : undefined;

  await syncAvailability({ dryRun, max: Number.isFinite(max) ? max : undefined });
  revalidatePath("/admin/guesty");
}
