import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Nav } from "@/components/nav";

export default async function HostDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/host/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, host_id, full_name, email")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "host" && profile.role !== "admin")) {
    redirect("/host");
  }
  if (!profile.host_id) {
    // Approved by an admin but profile linkage missing - send them to landing
    // with a hint; admin can repair.
    redirect("/host?not-linked=1");
  }

  const admin = createAdminClient();
  const { data: host } = await admin
    .from("hosts")
    .select("display_name, onboarding_status")
    .eq("id", profile.host_id)
    .single();

  return (
    <>
      <Nav />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-[220px_1fr] gap-8">
          <aside className="space-y-1 text-sm">
            <div className="mb-2 text-xs uppercase tracking-[0.22em] text-brand-accent">
              {host?.display_name ?? "Host"}
            </div>
            <HostLink href="/host/dashboard">Dashboard</HostLink>
            <HostLink href="/host/dashboard/onboarding">Onboarding</HostLink>
            <HostLink href="/host/dashboard/listings">Listings</HostLink>
            <HostLink href="/host/dashboard/calendar">Calendar</HostLink>
            <HostLink href="/host/dashboard/payouts">Payouts</HostLink>
            <HostLink href="/host/dashboard/settings">Settings</HostLink>
          </aside>
          <section>{children}</section>
        </div>
      </div>
    </>
  );
}

function HostLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded px-3 py-2 text-neutral-700 hover:bg-brand-soft hover:text-brand"
    >
      {children}
    </Link>
  );
}
