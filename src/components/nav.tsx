import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";

export async function Nav() {
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

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Lively Rewards
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/experiences" className="hover:text-brand-accent">Experiences</Link>
          {user ? (
            <>
              <Link href="/claim" className="hover:text-brand-accent">Claim a stay</Link>
              <Link href="/profile" className="hover:text-brand-accent">Profile</Link>
              {isAdmin && (
                <Link href="/admin" className="rounded bg-brand px-3 py-1 text-white">
                  Admin
                </Link>
              )}
              <SignOutButton />
            </>
          ) : (
            <Link href="/login" className="rounded bg-brand px-3 py-1 text-white">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
