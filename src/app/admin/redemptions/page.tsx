import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate, formatPoints } from "@/lib/utils";

export default async function AdminRedemptionsPage() {
  const admin = createAdminClient();

  const { data: redemptions } = await admin
    .from("redemptions")
    .select(
      "id, points_spent, status, confirmation_code, created_at, profiles(email), experiences(title, partners(name))",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Redemptions</h1>
      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Experience</th>
              <th className="px-4 py-3">Partner</th>
              <th className="px-4 py-3">Points</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {redemptions?.map((r: any) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-mono">{r.confirmation_code}</td>
                <td className="px-4 py-3">{r.profiles?.email}</td>
                <td className="px-4 py-3">{r.experiences?.title}</td>
                <td className="px-4 py-3 text-gray-600">
                  {r.experiences?.partners?.name ?? "-"}
                </td>
                <td className="px-4 py-3 text-gray-700">-{formatPoints(r.points_spent)}</td>
                <td className="px-4 py-3">{r.status}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
