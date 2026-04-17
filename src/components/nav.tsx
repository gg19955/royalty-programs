import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";

export async function Nav({ transparent = false }: { transparent?: boolean } = {}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  const base = transparent
    ? "absolute inset-x-0 top-0 z-30 text-white"
    : "relative border-b border-brand-line bg-white/85 text-brand backdrop-blur";

  const linkColor = transparent
    ? "text-white/85 hover:text-white"
    : "text-neutral-600 hover:text-brand";

  const primaryBtn = transparent
    ? "border border-white/70 text-white hover:bg-white hover:text-brand"
    : "bg-brand text-white hover:bg-black";

  return (
    <header className={base}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10">
        <Link
          href="/"
          className={
            "font-display text-2xl tracking-tight " +
            (transparent ? "text-white" : "text-brand")
          }
        >
          Lively
        </Link>
        <nav className="flex items-center gap-7 text-sm">
          <Link
            href="/stays"
            className={"hidden text-[11px] uppercase tracking-[0.22em] sm:inline " + linkColor}
          >
            Stays
          </Link>
          <Link
            href="/experiences"
            className={"hidden text-[11px] uppercase tracking-[0.22em] sm:inline " + linkColor}
          >
            Rewards
          </Link>
          <Link
            href="/host"
            className={"hidden text-[11px] uppercase tracking-[0.22em] md:inline " + linkColor}
          >
            List your property
          </Link>
          {user ? (
            <>
              <Link
                href="/portal"
                className={"text-[11px] uppercase tracking-[0.22em] " + linkColor}
              >
                Portal
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={
                    "rounded-sm px-3.5 py-2 text-[11px] uppercase tracking-[0.22em] transition " +
                    primaryBtn
                  }
                >
                  Admin
                </Link>
              )}
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/login"
              className={
                "rounded-sm px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] transition " +
                primaryBtn
              }
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
