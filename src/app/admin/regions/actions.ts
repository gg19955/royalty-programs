"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

type Result = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return { ok: false as const, error: "Admin only." };
  }
  return { ok: true as const };
}

function parseSuburbs(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function revalidateAll() {
  revalidatePath("/admin/regions");
  revalidatePath("/stays");
  revalidatePath("/");
}

export async function createRegion(data: FormData): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const label = ((data.get("label") as string | null) ?? "").trim();
  const slugRaw = ((data.get("slug") as string | null) ?? "").trim();
  const slug = slugify(slugRaw || label);
  const suburbs = parseSuburbs(data.get("suburbs") as string | null);
  const orderRaw = (data.get("display_order") as string | null) ?? "100";
  const display_order = Number.parseInt(orderRaw, 10) || 100;

  if (label.length < 2) return { ok: false, error: "Label is required." };
  if (!slug) return { ok: false, error: "Slug is required." };

  const admin = createAdminClient();
  const { error } = await admin.from("regions").insert({
    label,
    slug,
    suburbs,
    display_order,
    active: true,
  });
  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "A region with that label or slug already exists." };
    }
    return { ok: false, error: "Could not create region." };
  }
  revalidateAll();
  return { ok: true };
}

export async function updateRegion(id: string, data: FormData): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const label = ((data.get("label") as string | null) ?? "").trim();
  const suburbs = parseSuburbs(data.get("suburbs") as string | null);
  const orderRaw = (data.get("display_order") as string | null) ?? "100";
  const display_order = Number.parseInt(orderRaw, 10) || 100;

  if (label.length < 2) return { ok: false, error: "Label is required." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("regions")
    .update({ label, suburbs, display_order })
    .eq("id", id);
  if (error) return { ok: false, error: "Could not save region." };
  revalidateAll();
  return { ok: true };
}

export async function setRegionActive(
  id: string,
  active: boolean,
): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("regions")
    .update({ active })
    .eq("id", id);
  if (error) return { ok: false, error: "Could not update status." };
  revalidateAll();
  return { ok: true };
}
