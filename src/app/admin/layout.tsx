import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Nav } from "@/components/nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/portal");

  const admin = createAdminClient();
  const [{ count: pendingCount }, { count: pendingHostCount }] = await Promise.all([
    admin
      .from("claim_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    admin
      .from("host_applications")
      .select("*", { count: "exact", head: true })
      .in("status", ["submitted", "reviewing"]),
  ]);

  return (
    <>
      <Nav />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-[200px_1fr] gap-8">
          <aside className="space-y-1 text-sm">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Admin
            </div>
            <AdminLink href="/admin">Dashboard</AdminLink>
            <AdminLink href="/admin/users">Users</AdminLink>
            <AdminLink
              href="/admin/claim-requests"
              badge={pendingCount ?? 0}
            >
              Claim requests
            </AdminLink>
            <AdminLink href="/admin/claims">Approved claims</AdminLink>
            <AdminLink href="/admin/redemptions">Redemptions</AdminLink>
            <AdminLink href="/admin/experiences">Experiences</AdminLink>
            <AdminLink
              href="/admin/hosts"
              badge={pendingHostCount ?? 0}
            >
              Host applications
            </AdminLink>
            <AdminLink href="/admin/guesty">Guesty sync</AdminLink>
          </aside>
          <section>{children}</section>
        </div>
      </div>
    </>
  );
}

function AdminLink({
  href,
  children,
  badge,
}: {
  href: string;
  children: React.ReactNode;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-black"
    >
      <span>{children}</span>
      {badge && badge > 0 ? (
        <span className="rounded-sm bg-brand-accent px-1.5 py-0.5 text-xs font-medium text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
