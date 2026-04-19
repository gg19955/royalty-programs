"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireHost } from "@/lib/host/require-host";
import { AGREEMENT_VERSION } from "@/content/host-agreement";

type Result = { ok: true } | { ok: false; error: string };

export async function acceptAgreement(): Promise<Result> {
  const auth = await requireHost();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("hosts")
    .update({
      agreement_accepted_at: new Date().toISOString(),
      agreement_version: AGREEMENT_VERSION,
    })
    .eq("id", auth.hostId);
  if (error) return { ok: false, error: "Could not save acceptance." };

  revalidatePath("/host/dashboard");
  revalidatePath("/host/dashboard/onboarding");
  return { ok: true };
}

export async function saveBusinessInfo(data: FormData): Promise<Result> {
  const auth = await requireHost();
  if (!auth.ok) return auth;

  const legalName = (data.get("legal_name") as string | null)?.trim() ?? "";
  const abnRaw = (data.get("abn") as string | null)?.trim() ?? "";
  const abn = abnRaw.replace(/\s+/g, "");

  if (legalName.length < 2) {
    return { ok: false, error: "Enter your legal name (or company name)." };
  }
  if (!/^\d{11}$/.test(abn)) {
    return { ok: false, error: "ABN must be 11 digits." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("hosts")
    .update({ legal_name: legalName, abn })
    .eq("id", auth.hostId);
  if (error) return { ok: false, error: "Could not save business details." };

  revalidatePath("/host/dashboard");
  revalidatePath("/host/dashboard/onboarding");
  return { ok: true };
}

const ALLOWED_DOC_TYPES = new Set(["drivers_licence", "passport"]);
const ALLOWED_MIME = (type: string) =>
  type.startsWith("image/") || type === "application/pdf";

export async function uploadKycDocument(data: FormData): Promise<Result> {
  const auth = await requireHost();
  if (!auth.ok) return auth;

  const documentType = (data.get("document_type") as string | null) ?? "";
  if (!ALLOWED_DOC_TYPES.has(documentType)) {
    return { ok: false, error: "Choose a document type." };
  }

  const file = data.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a file to upload." };
  }
  if (!ALLOWED_MIME(file.type)) {
    return { ok: false, error: "Upload an image or PDF." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, error: "File must be under 10 MB." };
  }

  const ext = (file.name.split(".").pop() ?? "pdf").toLowerCase();
  // Random suffix so that even if upsert fails to replace, we still write a
  // new object. Final path stored on the row wins.
  const objectName = `${auth.hostId}/id-${crypto.randomUUID()}.${ext}`;

  const admin = createAdminClient();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: upErr } = await admin.storage
    .from("host-kyc")
    .upload(objectName, bytes, {
      contentType: file.type,
      upsert: false,
    });
  if (upErr) return { ok: false, error: "Upload failed." };

  // Remove the previous document if any, keeping one-per-host.
  const { data: existing } = await admin
    .from("hosts")
    .select("kyc_document_path")
    .eq("id", auth.hostId)
    .single();
  if (existing?.kyc_document_path && existing.kyc_document_path !== objectName) {
    await admin.storage.from("host-kyc").remove([existing.kyc_document_path]);
  }

  const { error: updErr } = await admin
    .from("hosts")
    .update({
      kyc_document_path: objectName,
      kyc_document_type: documentType,
      kyc_status: "pending",
      kyc_uploaded_at: new Date().toISOString(),
      kyc_rejection_reason: null,
      kyc_verified_at: null,
      kyc_verified_by: null,
    })
    .eq("id", auth.hostId);
  if (updErr) {
    await admin.storage.from("host-kyc").remove([objectName]);
    return { ok: false, error: "Could not save document." };
  }

  revalidatePath("/host/dashboard");
  revalidatePath("/host/dashboard/onboarding");
  revalidatePath("/admin/hosts");
  return { ok: true };
}
