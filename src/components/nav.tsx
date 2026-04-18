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
    : "relative border-b border-brand-line bg-brand-ink/95 text-white backdrop-blur-sm";

  const linkColor = "text-white/70 hover:text-white transition-colors";

  const primaryBtn = transparent
    ? "border border-white/70 text-white hover:bg-white hover:text-black"
    : "border border-white/80 text-white hover:bg-white hover:text-black";

  return (
    <header className={base}>
      <div className="mx-auto flex max-w-[1296px] items-center justify-between px-6 py-5 sm:px-10">
        <Link
          href="/"
          className="font-display text-2xl font-semibold uppercase tracking-[0.18em] text-white"
        >
          Lively
        </Link>
        <nav className="flex items-center gap-8 text-sm">
          <Link
            href="/stays"
            className={"hidden font-display text-[11px] font-medium uppercase tracking-[0.28em] sm:inline " + linkColor}
          >
            Stays
          </Link>
          <Link
            href="/experiences"
            className={"hidden font-display text-[11px] font-medium uppercase tracking-[0.28em] sm:inline " + linkColor}
          >
            Experiences
          </Link>
          <Link
            href="/about"
            className={"hidden font-display text-[11px] font-medium uppercase tracking-[0.28em] md:inline " + linkColor}
          >
            About
          </Link>
          <Link
            href="/faq"
            className={"hidden font-display text-[11px] font-medium uppercase tracking-[0.28em] md:inline " + linkColor}
          >
            FAQ
          </Link>
          <Link
            href="/host"
            className={"hidden font-display text-[11px] font-medium uppercase tracking-[0.28em] lg:inline " + linkColor}
          >
            List property
          </Link>
          {user ? (
            <>
              <Link
                href="/portal"
                className={"font-display text-[11px] font-medium uppercase tracking-[0.28em] " + linkColor}
              >
                Portal
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={
                    "rounded-[15px] px-4 py-2 font-display text-[11px] font-medium uppercase tracking-[0.24em] transition " +
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
                "rounded-[15px] px-5 py-2.5 font-display text-[11px] font-medium uppercase tracking-[0.24em] transition " +
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
