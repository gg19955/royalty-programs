"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type EnquireState = {
  ok: boolean;
  message: string;
};

function str(formData: FormData, key: string, max = 2000): string {
  const v = formData.get(key);
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

function requireStr(formData: FormData, key: string, label: string): string {
  const v = str(formData, key);
  if (!v) throw new Error(`${label} is required`);
  return v;
}

/**
 * Single server action backing both enquire forms. Reads `type` off the
 * form, validates the required fields for that branch, uploads photos to
 * the `enquiry-photos` bucket for the list-with-us path, and writes a
 * single row into `public.enquiries`.
 */
export async function submitEnquiry(
  _prev: EnquireState,
  formData: FormData,
): Promise<EnquireState> {
  try {
    const type = str(formData, "type");
    if (type !== "stay" && type !== "list") {
      return { ok: false, message: "Please choose an enquiry type." };
    }

    const name = requireStr(formData, "name", "Name");
    const email = requireStr(formData, "email", "Email");
    const mobile = requireStr(formData, "mobile", "Mobile");

    const admin = createAdminClient();

    if (type === "stay") {
      const dates = requireStr(formData, "dates", "Dates");
      const nice_to_have = str(formData, "nice_to_have", 4000);
      const must_have = str(formData, "must_have", 4000);

      const { error } = await admin.from("enquiries").insert({
        type: "stay",
        name,
        email,
        mobile,
        dates,
        nice_to_have: nice_to_have || null,
        must_have: must_have || null,
      });
      if (error) throw error;

      return {
        ok: true,
        message: "Thank you — our concierge will be in touch shortly.",
      };
    }

    // List with Lively
    const property_address = requireStr(
      formData,
      "property_address",
      "Property address",
    );
    const property_link = str(formData, "property_link");

    const photos = formData.getAll("photos").filter((f): f is File => {
      return f instanceof File && f.size > 0;
    });

    const photo_urls: string[] = [];
    const timestamp = Date.now();
    for (let i = 0; i < photos.length; i++) {
      const file = photos[i];
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${timestamp}-${i}-${safeName}`;
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { error: upErr } = await admin.storage
        .from("enquiry-photos")
        .upload(path, bytes, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
      if (upErr) throw upErr;
      const { data: urlData } = admin.storage
        .from("enquiry-photos")
        .getPublicUrl(path);
      photo_urls.push(urlData.publicUrl);
    }

    const { error } = await admin.from("enquiries").insert({
      type: "list",
      name,
      email,
      mobile,
      property_address,
      property_link: property_link || null,
      photo_urls,
    });
    if (error) throw error;

    return {
      ok: true,
      message:
        "Thank you — a member of the Lively team will review your property and be in touch.",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Something went wrong.";
    return { ok: false, message: msg };
  }
}
