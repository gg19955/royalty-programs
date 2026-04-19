import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate, formatPoints } from "@/lib/utils";

export default async function AdminUsersPage() {
  const admin = createAdminClient();

  const { data: users } = await admin
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const { data: balances } = await admin.from("v_user_points").select("user_id, balance");
  const balanceMap = new Map((balances ?? []).map((b: any) => [b.user_id, b.balance]));

  return (
    <div>
      <h1 className="text-2xl font-semibold">Users</h1>
      <p className="mt-1 text-sm text-gray-600">
        {users?.length ?? 0} recent signups (max 200 shown).
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Points</th>
              <th className="px-4 py-3">Signed up</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users?.map((u: any) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium">{u.email}</td>
                <td className="px-4 py-3 text-gray-700">{u.full_name ?? "-"}</td>
                <td className="px-4 py-3 text-gray-700">{u.role}</td>
                <td className="px-4 py-3 text-gray-700">
                  {formatPoints(balanceMap.get(u.id) ?? 0)}
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
