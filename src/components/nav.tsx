import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";
import { MobileMenu } from "./mobile-menu";

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
        <MobileMenu signedIn={!!user} isAdmin={isAdmin} />
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link
            href="/"
            className={"hidden font-display text-[11px] font-medium uppercase tracking-[0.28em] sm:inline " + linkColor}
          >
            Home
          </Link>
          <Link
            href="/stays"
            className={"hidden font-display text-[11px] font-medium uppercase tracking-[0.28em] sm:inline " + linkColor}
          >
            Stays
          </Link>
          <Link
            href="/collection"
            className={"hidden font-display text-[11px] font-medium uppercase tracking-[0.28em] md:inline " + linkColor}
          >
            The Collection
          </Link>
          <Link
            href="/experiences"
            className={"hidden font-display text-[11px] font-medium uppercase tracking-[0.28em] sm:inline " + linkColor}
          >
            Experiences
          </Link>
          <div className="group relative hidden md:block">
            <Link
              href="/about"
              className={"font-display text-[11px] font-medium uppercase tracking-[0.28em] " + linkColor}
            >
              About
            </Link>
            <div className="invisible absolute left-1/2 top-full z-40 -translate-x-1/2 pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="min-w-[180px] border border-brand-line bg-brand-ink/95 backdrop-blur-sm">
                <Link
                  href="/about"
                  className="block px-5 py-4 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-white/70 transition hover:bg-white/5 hover:text-white"
                >
                  Our story
                </Link>
                <Link
                  href="/about/team"
                  className="block border-t border-brand-line px-5 py-4 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-white/70 transition hover:bg-white/5 hover:text-white"
                >
                  Our team
                </Link>
              </div>
            </div>
          </div>
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
              href="/enquire"
              className={
                "rounded-[15px] px-5 py-2.5 font-display text-[11px] font-medium uppercase tracking-[0.24em] transition " +
                primaryBtn
              }
            >
              Enquire
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
