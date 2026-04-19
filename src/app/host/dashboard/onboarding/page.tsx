import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AGREEMENT_MARKDOWN } from "@/content/host-agreement";
import type { Database } from "@/types/db";
import {
  AcceptAgreementButton,
  BusinessInfoForm,
  KycUploadForm,
} from "./onboarding-forms";

export const dynamic = "force-dynamic";

type KycStatus = Database["public"]["Enums"]["host_kyc_status"];

export default async function OnboardingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("host_id")
    .eq("id", user!.id)
    .single();
  const hostId = profile!.host_id!;

  const admin = createAdminClient();
  const { data: host } = await admin
    .from("hosts")
    .select(
      "legal_name, abn, agreement_accepted_at, agreement_version, kyc_status, kyc_document_type, kyc_uploaded_at, kyc_rejection_reason",
    )
    .eq("id", hostId)
    .single();

  const agreementDone = !!host?.agreement_accepted_at;
  const businessDone = !!host?.legal_name && !!host?.abn;
  const kycStatus: KycStatus = host?.kyc_status ?? "none";
  const kycCleared = kycStatus === "pending" || kycStatus === "verified";

  return (
    <div className="space-y-10">
      <header>
        <p className="text-[11px] uppercase tracking-[0.28em] text-brand-accent">
          Onboarding
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-brand sm:text-5xl">
          Get ready to publish.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-neutral-600">
          Three quick steps before your first listing can go live. They only
          need to be done once.
        </p>
      </header>

      {/* 1 - Agreement */}
      <section className="rounded-xl border border-brand-line bg-white p-6">
        <StepHeader
          index={1}
          title="Host agreement"
          done={agreementDone}
          pending={false}
        />
        <div className="mt-5 max-h-72 overflow-y-auto rounded border border-brand-line bg-brand-soft p-4 text-sm leading-relaxed text-neutral-700">
          <pre className="whitespace-pre-wrap font-sans">
            {AGREEMENT_MARKDOWN}
          </pre>
        </div>
        <div className="mt-5">
          <AcceptAgreementButton accepted={agreementDone} />
        </div>
      </section>

      {/* 2 - Business info */}
      <section className="rounded-xl border border-brand-line bg-white p-6">
        <StepHeader
          index={2}
          title="Business details"
          done={businessDone}
          pending={false}
        />
        <p className="mt-2 max-w-xl text-sm text-neutral-600">
          Legal name and ABN are required for invoicing and tax reporting.
        </p>
        <div className="mt-5 max-w-lg">
          <BusinessInfoForm
            legalName={host?.legal_name ?? null}
            abn={host?.abn ?? null}
          />
        </div>
      </section>

      {/* 3 - KYC */}
      <section className="rounded-xl border border-brand-line bg-white p-6">
        <StepHeader
          index={3}
          title="Identity verification"
          done={kycStatus === "verified"}
          pending={kycStatus === "pending"}
          rejected={kycStatus === "rejected"}
        />
        <p className="mt-2 max-w-xl text-sm text-neutral-600">
          Upload a clear photo or scan of a drivers licence or passport. Only
          Lively admins can view this file.
        </p>
        {kycStatus === "rejected" && host?.kyc_rejection_reason && (
          <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <strong className="font-medium">Rejected:</strong>{" "}
            {host.kyc_rejection_reason}
          </div>
        )}
        <div className="mt-5 max-w-lg">
          <KycUploadForm uploaded={kycCleared} />
        </div>
      </section>
    </div>
  );
}

function StepHeader({
  index,
  title,
  done,
  pending,
  rejected,
}: {
  index: number;
  title: string;
  done: boolean;
  pending: boolean;
  rejected?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-brand-accent">
          Step {index}
        </p>
        <h2 className="mt-1 font-display text-2xl text-brand">{title}</h2>
      </div>
      <StatusPill done={done} pending={pending} rejected={rejected} />
    </div>
  );
}

function StatusPill({
  done,
  pending,
  rejected,
}: {
  done: boolean;
  pending: boolean;
  rejected?: boolean;
}) {
  const [cls, label] = rejected
    ? ["bg-red-100 text-red-800", "Rejected"]
    : done
      ? ["bg-green-100 text-green-800", "Complete"]
      : pending
        ? ["bg-yellow-100 text-yellow-800", "Pending review"]
        : ["bg-neutral-100 text-neutral-700", "Not started"];
  return (
    <span
      className={`inline-block rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ${cls}`}
    >
      {label}
    </span>
  );
}
