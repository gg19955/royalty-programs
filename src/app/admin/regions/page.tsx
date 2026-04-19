import { listAllRegions } from "@/lib/regions";
import { NewRegionForm } from "./new-region-form";
import { RegionRow } from "./region-row";

export const dynamic = "force-dynamic";

export default async function AdminRegionsPage() {
  const regions = await listAllRegions();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Regions</h1>
      <p className="mt-1 text-sm text-gray-600">
        Filter options shown in the hero search bar, the{" "}
        <code>/stays</code> filter chips, and the per-property region
        dropdown. Suburbs appear as a second-level filter in the search bar.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Region</th>
              <th className="px-4 py-3">Suburbs</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {regions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  No regions yet.
                </td>
              </tr>
            ) : (
              regions.map((r) => <RegionRow key={r.id} region={r} />)
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <NewRegionForm />
      </div>
    </div>
  );
}
