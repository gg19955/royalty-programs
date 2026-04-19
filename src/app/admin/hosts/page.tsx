import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import { HostApplicationRow } from "./host-application-row";
import { KycReviewRow } from "./kyc-review-row";

type Status = "submitted" | "reviewing" | "approved" | "rejected" | "all";

type AppRow = {
  id: string;
  contact_email: string;
  contact_name: string;
  display_name: string;
  property_name: string;
  location: string;
  description: string;
  about: string | null;
  property_url: string | null;
  status: "submitted" | "reviewing" | "approved" | "rejected" | "withdrawn";
  review_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export const dynamic = "force-dynamic";

export default async function AdminHostsPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const filter: Status = ((s: string | undefined): Status => {
    switch (s) {
      case "reviewing":
      case "approved":
      case "rejected":
      case "all":
        return s;
      default:
        return "submitted";
    }
  })(searchParams?.status);

  const admin = createAdminClient();
  let query = admin
    .from("host_applications")
    .select(
      "id, contact_email, contact_name, display_name, property_name, location, description, about, property_url, status, review_notes, reviewed_at, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (filter !== "all") query = query.eq("status", filter);

  const { data } = await query;
  const rows = (data ?? []) as unknown as AppRow[];

  const { data: kycHosts } = await admin
    .from("hosts")
    .select(
      "id, display_name, contact_email, kyc_document_type, kyc_document_path, kyc_uploaded_at",
    )
    .eq("kyc_status", "pending")
    .order("kyc_uploaded_at", { ascending: true });

  const kycRows = await Promise.all(
    (kycHosts ?? []).map(async (h) => {
      let signedUrl: string | null = null;
      if (h.kyc_document_path) {
        const { data: signed } = await admin.storage
          .from("host-kyc")
          .createSignedUrl(h.kyc_document_path, 300);
        signedUrl = signed?.signedUrl ?? null;
      }
      return { ...h, signedUrl };
    }),
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold">Host applications</h1>
      <p className="mt-1 text-sm text-gray-600">
        Property operators applying to join the Lively collection. Approving
        creates a host record and invites the applicant by email.
      </p>

      <div className="mt-5 flex flex-wrap gap-2 text-xs">
        {(["submitted", "reviewing", "approved", "rejected", "all"] as const).map(
          (s) => (
            <a
              key={s}
              href={`/admin/hosts?status=${s}`}
              className={
                "rounded-sm border px-3 py-1.5 " +
                (filter === s
                  ? "border-brand bg-brand text-white"
                  : "border-brand-line text-gray-600 hover:text-black")
              }
            >
              {s[0].toUpperCase() + s.slice(1)}
            </a>
          ),
        )}
      </div>

      {kycRows.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-brand">
            KYC review queue ({kycRows.length})
          </h2>
          <div className="mt-3 overflow-hidden rounded-xl border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Host</th>
                  <th className="px-4 py-3">Document</th>
                  <th className="px-4 py-3">Uploaded</th>
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {kycRows.map((h) => (
                  <KycReviewRow
                    key={h.id}
                    hostId={h.id}
                    displayName={h.display_name}
                    contactEmail={h.contact_email}
                    documentType={h.kyc_document_type}
                    uploadedAt={h.kyc_uploaded_at}
                    signedUrl={h.signedUrl}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Property</th>
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">
                {filter === "submitted" || filter === "reviewing"
                  ? "Action"
                  : "Status"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                  No {filter === "all" ? "" : filter} applications.
                </td>
              </tr>
            )}
            {rows.map((r) =>
              r.status === "submitted" || r.status === "reviewing" ? (
                <HostApplicationRow
                  key={r.id}
                  id={r.id}
                  contactEmail={r.contact_email}
                  contactName={r.contact_name}
                  displayName={r.display_name}
                  propertyName={r.property_name}
                  location={r.location}
                  description={r.description}
                  about={r.about}
                  propertyUrl={r.property_url}
                  status={r.status}
                  submittedAt={r.created_at}
                />
              ) : (
                <tr key={r.id} className="align-top">
                  <td className="px-4 py-4">
                    <div className="font-medium text-brand">
                      {r.property_name}
                    </div>
                    <div className="text-xs text-gray-500">{r.location}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium">{r.display_name}</div>
                    <div className="text-xs text-gray-500">{r.contact_email}</div>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-500">
                    {formatDate(r.created_at)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={
                        "rounded-sm px-2 py-0.5 text-xs " +
                        (r.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : r.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-700")
                      }
                    >
                      {r.status}
                    </span>
                    {r.review_notes && (
                      <div className="mt-1 text-xs text-gray-500">
                        {r.review_notes}
                      </div>
                    )}
                    {r.reviewed_at && (
                      <div className="mt-0.5 text-xs text-gray-400">
                        {formatDate(r.reviewed_at)}
                      </div>
                    )}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
