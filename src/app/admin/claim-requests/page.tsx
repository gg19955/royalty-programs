import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import { ClaimRequestRow } from "./claim-request-row";

type RequestRow = {
  id: string;
  reservation_code: string;
  last_name: string;
  status: "pending" | "approved" | "rejected";
  reviewer_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  profiles: { email: string | null } | null;
};

export default async function AdminClaimRequestsPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const admin = createAdminClient();
  const status =
    searchParams?.status === "approved" ||
    searchParams?.status === "rejected" ||
    searchParams?.status === "all"
      ? searchParams.status
      : "pending";

  let query = admin
    .from("claim_requests")
    .select(
      "id, reservation_code, last_name, status, reviewer_note, reviewed_at, created_at, profiles!claim_requests_user_id_fkey(email)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (status !== "all") query = query.eq("status", status);

  const { data } = await query;
  const rows = (data ?? []) as unknown as RequestRow[];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Claim requests</h1>
      <p className="mt-1 text-sm text-gray-600">
        Guest-submitted claims awaiting review. Approving credits points to the guest.
      </p>

      <div className="mt-5 flex gap-2 text-xs">
        {(["pending", "approved", "rejected", "all"] as const).map((s) => (
          <a
            key={s}
            href={`/admin/claim-requests?status=${s}`}
            className={
              "rounded-sm border px-3 py-1.5 " +
              (status === s
                ? "border-brand bg-brand text-white"
                : "border-brand-line text-gray-600 hover:text-black")
            }
          >
            {s[0].toUpperCase() + s.slice(1)}
          </a>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Reservation</th>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Last name</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">
                {status === "pending" ? "Action" : "Status"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  No {status === "all" ? "" : status} claim requests.
                </td>
              </tr>
            )}
            {rows.map((r) =>
              r.status === "pending" ? (
                <ClaimRequestRow
                  key={r.id}
                  id={r.id}
                  email={r.profiles?.email ?? "—"}
                  reservationCode={r.reservation_code}
                  lastName={r.last_name}
                  submittedAt={r.created_at}
                />
              ) : (
                <tr key={r.id} className="align-top">
                  <td className="px-4 py-3 font-mono text-xs">{r.reservation_code}</td>
                  <td className="px-4 py-3">{r.profiles?.email ?? "—"}</td>
                  <td className="px-4 py-3">{r.last_name}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(r.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "rounded-sm px-2 py-0.5 text-xs " +
                        (r.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800")
                      }
                    >
                      {r.status}
                    </span>
                    {r.reviewer_note && (
                      <div className="mt-1 text-xs text-gray-500">
                        {r.reviewer_note}
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
