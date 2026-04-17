import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
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

  if (profile?.role !== "admin") redirect("/profile");

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
            <AdminLink href="/admin/claims">Claims</AdminLink>
            <AdminLink href="/admin/redemptions">Redemptions</AdminLink>
            <AdminLink href="/admin/experiences">Experiences</AdminLink>
          </aside>
          <section>{children}</section>
        </div>
      </div>
    </>
  );
}

function AdminLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-black"
    >
      {children}
    </Link>
  );
}
