import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate, formatPoints } from "@/lib/utils";

export default async function AdminClaimsPage() {
  const admin = createAdminClient();

  const { data: claims } = await admin
    .from("stay_claims")
    .select(
      "id, points_awarded, claimed_at, profiles(email), reservations(code, check_in, check_out)",
    )
    .order("claimed_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Stay claims</h1>
      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Reservation</th>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Stay dates</th>
              <th className="px-4 py-3">Points</th>
              <th className="px-4 py-3">Claimed</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {claims?.map((c: any) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-mono">{c.reservations?.code}</td>
                <td className="px-4 py-3">{c.profiles?.email}</td>
                <td className="px-4 py-3 text-gray-700">
                  {c.reservations?.check_in && formatDate(c.reservations.check_in)} →{" "}
                  {c.reservations?.check_out && formatDate(c.reservations.check_out)}
                </td>
                <td className="px-4 py-3 text-brand-accent">
                  +{formatPoints(c.points_awarded)}
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(c.claimed_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
