import { createClient } from "@/lib/supabase/server";

export type RequireHostResult =
  | { ok: true; userId: string; hostId: string }
  | { ok: false; error: string };

/**
 * Resolve the signed-in user, their profile, and gate on host/admin role.
 * Returns the effective `host_id` to scope queries by.
 */
export async function requireHost(): Promise<RequireHostResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, host_id")
    .eq("id", user.id)
    .single();

  if (!profile) return { ok: false, error: "Profile missing." };
  if (profile.role !== "host" && profile.role !== "admin") {
    return { ok: false, error: "Host access required." };
  }
  if (!profile.host_id) {
    return { ok: false, error: "Your profile isn't linked to a host yet." };
  }
  return { ok: true, userId: user.id, hostId: profile.host_id };
}
