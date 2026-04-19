"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";
import type { Database } from "@/types/db";

type Result = { ok: true } | { ok: false; error: string };

/**
 * Resolve the signed-in user, their profile, and gate on host/admin role.
 * Returns the effective `host_id` to scope queries by. Admins operating on
 * behalf of a host must pass the host_id explicitly (not supported in this
 * slice - admins use /admin/properties, to be added later).
 */
async function requireHost() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, host_id")
    .eq("id", user.id)
    .single();

  if (!profile) return { ok: false as const, error: "Profile missing." };
  if (profile.role !== "host" && profile.role !== "admin") {
    return { ok: false as const, error: "Host access required." };
  }
  if (!profile.host_id) {
    return { ok: false as const, error: "Your profile isn't linked to a host yet." };
  }
  return { ok: true as const, userId: user.id, hostId: profile.host_id };
}

async function assertOwnsProperty(propertyId: string, hostId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("properties")
    .select("id, host_id")
    .eq("id", propertyId)
    .single();
  if (error || !data) return { ok: false as const, error: "Listing not found." };
  if (data.host_id !== hostId) {
    return { ok: false as const, error: "Not your listing." };
  }
  return { ok: true as const };
}

function str(data: FormData, key: string): string | null {
  const v = data.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

function int(data: FormData, key: string): number | null {
  const v = str(data, key);
  if (v === null) return null;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

function cents(data: FormData, key: string): number | null {
  const v = str(data, key);
  if (v === null) return null;
  const n = Number.parseFloat(v);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

function amenities(data: FormData): string[] {
  const raw = str(data, "amenities");
  if (!raw) return [];
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function uniqueSlug(
  admin: ReturnType<typeof createAdminClient>,
  base: string,
  ignoreId?: string,
): Promise<string> {
  const seed = slugify(base) || "listing";
  let candidate = seed;
  let n = 2;
  // Loop until we find a slug not taken by another property.
  for (;;) {
    const { data } = await admin
      .from("properties")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data || data.id === ignoreId) return candidate;
    candidate = `${seed}-${n}`;
    n += 1;
  }
}

export async function createListing(data: FormData): Promise<Result> {
  const auth = await requireHost();
  if (!auth.ok) return auth;

  const name = str(data, "name");
  const region = str(data, "region");
  if (!name) return { ok: false, error: "Name is required." };

  const admin = createAdminClient();
  const slug = await uniqueSlug(admin, name);

  const { data: row, error } = await admin
    .from("properties")
    .insert({
      host_id: auth.hostId,
      name,
      slug,
      region,
      listing_status: "draft",
    })
    .select("id")
    .single();
  if (error || !row) return { ok: false, error: "Could not create listing." };

  revalidatePath("/host/dashboard");
  revalidatePath("/host/dashboard/listings");
  redirect(`/host/dashboard/listings/${row.id}`);
}

export async function updateListing(
  propertyId: string,
  data: FormData,
): Promise<Result> {
  const auth = await requireHost();
  if (!auth.ok) return auth;
  const owns = await assertOwnsProperty(propertyId, auth.hostId);
  if (!owns.ok) return owns;

  const admin = createAdminClient();

  const name = str(data, "name");
  if (!name) return { ok: false, error: "Name is required." };

  // Keep slug stable unless name changed enough to warrant a rebuild: only
  // regenerate when the current slug doesn't match slugify(name)'s family.
  const { data: existing } = await admin
    .from("properties")
    .select("slug")
    .eq("id", propertyId)
    .single();
  const currentSlug = existing?.slug ?? null;
  const desiredSeed = slugify(name);
  let nextSlug = currentSlug;
  if (!currentSlug || !currentSlug.startsWith(desiredSeed)) {
    nextSlug = await uniqueSlug(admin, name, propertyId);
  }

  const updates = {
    name,
    slug: nextSlug,
    headline: str(data, "headline"),
    description: str(data, "description"),
    region: str(data, "region"),
    city: str(data, "city"),
    state: str(data, "state"),
    country: str(data, "country") ?? "Australia",
    bedrooms: int(data, "bedrooms"),
    bathrooms: int(data, "bathrooms"),
    max_guests: int(data, "max_guests"),
    min_nights: int(data, "min_nights"),
    base_rate_cents: cents(data, "base_rate_aud"),
    cleaning_fee_cents: cents(data, "cleaning_fee_aud") ?? 0,
    property_type: (str(data, "property_type") ??
      null) as Database["public"]["Enums"]["property_type"] | null,
    cancellation_policy: (str(data, "cancellation_policy") ??
      "moderate") as Database["public"]["Enums"]["cancellation_policy"],
    check_in_time: str(data, "check_in_time") ?? "15:00",
    check_out_time: str(data, "check_out_time") ?? "10:00",
    house_rules: str(data, "house_rules"),
    amenities: amenities(data),
  };

  const { error } = await admin
    .from("properties")
    .update(updates)
    .eq("id", propertyId);
  if (error) return { ok: false, error: "Could not save changes." };

  revalidatePath(`/host/dashboard/listings/${propertyId}`);
  revalidatePath("/host/dashboard/listings");
  revalidatePath("/stays");
  return { ok: true };
}

export async function publishListing(propertyId: string): Promise<Result> {
  const auth = await requireHost();
  if (!auth.ok) return auth;
  const owns = await assertOwnsProperty(propertyId, auth.hostId);
  if (!owns.ok) return owns;

  const admin = createAdminClient();
  // Require a hero image + base rate + region before publishing.
  const { data: row } = await admin
    .from("properties")
    .select(
      "base_rate_cents, region, property_images(id)",
    )
    .eq("id", propertyId)
    .single();
  if (!row) return { ok: false, error: "Listing not found." };
  if (!row.region) return { ok: false, error: "Add a region before publishing." };
  if (!row.base_rate_cents) {
    return { ok: false, error: "Add a nightly rate before publishing." };
  }
  const imageCount = Array.isArray(row.property_images)
    ? row.property_images.length
    : 0;
  if (imageCount === 0) {
    return { ok: false, error: "Add at least one photo before publishing." };
  }

  const { error } = await admin
    .from("properties")
    .update({
      listing_status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", propertyId);
  if (error) return { ok: false, error: "Could not publish." };

  revalidatePath(`/host/dashboard/listings/${propertyId}`);
  revalidatePath("/host/dashboard/listings");
  revalidatePath("/stays");
  return { ok: true };
}

export async function unpublishListing(propertyId: string): Promise<Result> {
  const auth = await requireHost();
  if (!auth.ok) return auth;
  const owns = await assertOwnsProperty(propertyId, auth.hostId);
  if (!owns.ok) return owns;

  const admin = createAdminClient();
  const { error } = await admin
    .from("properties")
    .update({ listing_status: "paused" })
    .eq("id", propertyId);
  if (error) return { ok: false, error: "Could not pause." };

  revalidatePath(`/host/dashboard/listings/${propertyId}`);
  revalidatePath("/host/dashboard/listings");
  revalidatePath("/stays");
  return { ok: true };
}

export async function deleteListing(propertyId: string): Promise<Result> {
  const auth = await requireHost();
  if (!auth.ok) return auth;
  const owns = await assertOwnsProperty(propertyId, auth.hostId);
  if (!owns.ok) return owns;

  const admin = createAdminClient();

  // Pull image rows so we can remove the storage objects too.
  const { data: images } = await admin
    .from("property_images")
    .select("url")
    .eq("property_id", propertyId);

  const paths = (images ?? [])
    .map((i) => extractStoragePath(i.url))
    .filter((p): p is string => !!p);

  if (paths.length) {
    await admin.storage.from("properties").remove(paths);
  }

  const { error } = await admin.from("properties").delete().eq("id", propertyId);
  if (error) return { ok: false, error: "Could not delete." };

  revalidatePath("/host/dashboard/listings");
  return { ok: true };
}

function extractStoragePath(publicUrl: string): string | null {
  // Public URLs look like:
  // https://<project>.supabase.co/storage/v1/object/public/properties/<path>
  const marker = "/storage/v1/object/public/properties/";
  const i = publicUrl.indexOf(marker);
  if (i === -1) return null;
  return publicUrl.slice(i + marker.length);
}

export async function uploadListingImage(
  propertyId: string,
  data: FormData,
): Promise<Result> {
  const auth = await requireHost();
  if (!auth.ok) return auth;
  const owns = await assertOwnsProperty(propertyId, auth.hostId);
  if (!owns.ok) return owns;

  const file = data.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image file." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Only image files are supported." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, error: "Image must be under 10 MB." };
  }

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const objectName = `${propertyId}/${crypto.randomUUID()}.${ext}`;

  const admin = createAdminClient();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: upErr } = await admin.storage
    .from("properties")
    .upload(objectName, bytes, {
      contentType: file.type,
      upsert: false,
    });
  if (upErr) return { ok: false, error: "Upload failed." };

  const { data: pub } = admin.storage.from("properties").getPublicUrl(objectName);

  // Determine next sort_order, and whether this is the first (hero) image.
  const { data: existing } = await admin
    .from("property_images")
    .select("id, sort_order, is_hero")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = existing && existing.length ? existing[0].sort_order + 1 : 0;
  const hasHero = (
    await admin
      .from("property_images")
      .select("id")
      .eq("property_id", propertyId)
      .eq("is_hero", true)
      .maybeSingle()
  ).data;

  const { error: insErr } = await admin.from("property_images").insert({
    property_id: propertyId,
    url: pub.publicUrl,
    sort_order: nextOrder,
    is_hero: !hasHero,
  });
  if (insErr) {
    // Best effort cleanup.
    await admin.storage.from("properties").remove([objectName]);
    return { ok: false, error: "Could not save image." };
  }

  revalidatePath(`/host/dashboard/listings/${propertyId}`);
  revalidatePath("/stays");
  return { ok: true };
}

export async function deleteListingImage(
  propertyId: string,
  imageId: string,
): Promise<Result> {
  const auth = await requireHost();
  if (!auth.ok) return auth;
  const owns = await assertOwnsProperty(propertyId, auth.hostId);
  if (!owns.ok) return owns;

  const admin = createAdminClient();
  const { data: img } = await admin
    .from("property_images")
    .select("id, url, is_hero, property_id")
    .eq("id", imageId)
    .single();
  if (!img || img.property_id !== propertyId) {
    return { ok: false, error: "Image not found." };
  }

  const path = extractStoragePath(img.url);
  if (path) await admin.storage.from("properties").remove([path]);

  await admin.from("property_images").delete().eq("id", imageId);

  // Promote a new hero if we deleted the current one.
  if (img.is_hero) {
    const { data: next } = await admin
      .from("property_images")
      .select("id")
      .eq("property_id", propertyId)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (next) {
      await admin
        .from("property_images")
        .update({ is_hero: true })
        .eq("id", next.id);
    }
  }

  revalidatePath(`/host/dashboard/listings/${propertyId}`);
  revalidatePath("/stays");
  return { ok: true };
}

export async function setHeroImage(
  propertyId: string,
  imageId: string,
): Promise<Result> {
  const auth = await requireHost();
  if (!auth.ok) return auth;
  const owns = await assertOwnsProperty(propertyId, auth.hostId);
  if (!owns.ok) return owns;

  const admin = createAdminClient();
  // Unique partial index on (property_id) where is_hero means we must clear
  // the previous hero before setting the new one. Two updates, not a single
  // statement, to keep within the constraint.
  await admin
    .from("property_images")
    .update({ is_hero: false })
    .eq("property_id", propertyId)
    .eq("is_hero", true);

  const { error } = await admin
    .from("property_images")
    .update({ is_hero: true })
    .eq("id", imageId)
    .eq("property_id", propertyId);
  if (error) return { ok: false, error: "Could not set hero." };

  revalidatePath(`/host/dashboard/listings/${propertyId}`);
  revalidatePath("/stays");
  return { ok: true };
}

