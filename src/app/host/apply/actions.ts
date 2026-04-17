"use server";

import { createClient } from "@/lib/supabase/server";

export type ApplyState =
  | { status: "idle" }
  | { status: "error"; error: string; values: Record<string, string> }
  | { status: "success" };

function required(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

export async function submitHostApplication(
  _prev: ApplyState,
  data: FormData,
): Promise<ApplyState> {
  const values: Record<string, string> = {};
  for (const [k, v] of data.entries()) {
    if (typeof v === "string") values[k] = v;
  }

  const contact_name = required(data.get("contact_name"));
  const contact_email = required(data.get("contact_email"));
  const display_name = required(data.get("display_name"));
  const property_name = required(data.get("property_name"));
  const location = required(data.get("location"));
  const description = required(data.get("description"));
  const phone = required(data.get("phone"));
  const property_url = required(data.get("property_url"));
  const about = required(data.get("about"));

  if (
    !contact_name ||
    !contact_email ||
    !display_name ||
    !property_name ||
    !location ||
    !description
  ) {
    return {
      status: "error",
      error: "Please fill in every required field.",
      values,
    };
  }

  // Basic email shape check.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
    return {
      status: "error",
      error: "That email doesn't look right.",
      values,
    };
  }

  const supabase = createClient();
  const { error } = await supabase.from("host_applications").insert({
    contact_name,
    contact_email,
    display_name,
    property_name,
    location,
    description,
    phone,
    property_url,
    about,
  });

  if (error) {
    return {
      status: "error",
      error: "We couldn't save your application. Please try again.",
      values,
    };
  }

  return { status: "success" };
}
