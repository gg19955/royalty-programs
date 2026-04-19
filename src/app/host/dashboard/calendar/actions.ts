"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncOneFeed } from "@/lib/ical/sync";

type Result = { ok: true } | { ok: false; error: string };

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
  if (data.host_id !== hostId) return { ok: false as const, error: "Not your listing." };
  return { ok: true as const };
}

async function assertOwnsFeed(feedId: string, hostId: string) {
  const admin = createAdminClient();
  const { data: feed, error } = await admin
    .from("ical_feeds")
    .select("id, property_id")
    .eq("id", feedId)
    .single();
  if (error || !feed) return { ok: false as const, error: "Feed not found." };
  return assertOwnsProperty((feed as { property_id: string }).property_id, hostId);
}

function isValidHttpsIcalUrl(value: string): boolean {
  try {
    const u = new URL(value);
    // Refuse http - almost all major providers (Airbnb, VRBO, Stayz, Guesty)
    // serve over https, and letting http through exposes hosts to MITM
    // tampering of availability data.
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function addIcalFeed(formData: FormData): Promise<Result> {
  const gate = await requireHost();
  if (!gate.ok) return gate;

  const propertyId = String(formData.get("property_id") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();

  if (!propertyId || !url || !label) {
    return { ok: false, error: "Property, URL, and label are all required." };
  }
  if (!isValidHttpsIcalUrl(url)) {
    return { ok: false, error: "Calendar URL must be a valid https:// link." };
  }
  if (label.length > 40) {
    return { ok: false, error: "Label must be 40 characters or fewer." };
  }

  const owns = await assertOwnsProperty(propertyId, gate.hostId);
  if (!owns.ok) return owns;

  const admin = createAdminClient();
  const { error } = await admin.from("ical_feeds").insert({
    property_id: propertyId,
    url,
    label,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/host/dashboard/calendar");
  return { ok: true };
}

export async function removeIcalFeed(formData: FormData): Promise<Result> {
  const gate = await requireHost();
  if (!gate.ok) return gate;

  const feedId = String(formData.get("feed_id") ?? "");
  if (!feedId) return { ok: false, error: "Missing feed id." };

  const owns = await assertOwnsFeed(feedId, gate.hostId);
  if (!owns.ok) return owns;

  const admin = createAdminClient();
  // Blocks survive the feed removal by design - a removed feed is not a
  // "booking cancelled" signal, it's a "host unhooked their calendar"
  // signal. Host can delete individual blocks manually if needed.
  const { error } = await admin.from("ical_feeds").delete().eq("id", feedId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/host/dashboard/calendar");
  return { ok: true };
}

export async function syncFeedNow(formData: FormData): Promise<Result> {
  const gate = await requireHost();
  if (!gate.ok) return gate;

  const feedId = String(formData.get("feed_id") ?? "");
  if (!feedId) return { ok: false, error: "Missing feed id." };

  const owns = await assertOwnsFeed(feedId, gate.hostId);
  if (!owns.ok) return owns;

  const result = await syncOneFeed(feedId);
  revalidatePath("/host/dashboard/calendar");
  if (result.status === "error") {
    return { ok: false, error: result.errorMessage ?? "Sync failed." };
  }
  return { ok: true };
}
