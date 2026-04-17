import { createAdminClient } from "@/lib/supabase/admin";
import { formatPoints } from "@/lib/utils";

export default async function AdminExperiencesPage() {
  const admin = createAdminClient();

  const { data: experiences } = await admin
    .from("experiences")
    .select("id, title, region, points_cost, stock, active, partners(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Experiences</h1>
        <span className="text-xs text-gray-500">
          CRUD UI is MVP v2 — manage in Supabase for now.
        </span>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Partner</th>
              <th className="px-4 py-3">Region</th>
              <th className="px-4 py-3">Points</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {experiences?.map((e: any) => (
              <tr key={e.id}>
                <td className="px-4 py-3 font-medium">{e.title}</td>
                <td className="px-4 py-3 text-gray-600">{e.partners?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{e.region ?? "—"}</td>
                <td className="px-4 py-3">{formatPoints(e.points_cost)}</td>
                <td className="px-4 py-3 text-gray-600">
                  {e.stock === null ? "∞" : e.stock}
                </td>
                <td className="px-4 py-3">{e.active ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
