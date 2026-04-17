import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect(searchParams.next || "/portal");

  return (
    <main className="min-h-screen bg-brand-soft">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.24em] text-brand-accent"
        >
          Lively Rewards
        </Link>
        <h1 className="mt-6 font-serif text-4xl font-normal tracking-tightest text-brand">
          Stay Lively.
        </h1>
        <p className="mt-3 text-sm text-neutral-600">
          Sign in with your email — we&apos;ll send you a magic link.
        </p>
        <div className="mt-10 rounded-sm border border-brand-line bg-white p-8">
          <LoginForm next={searchParams.next} />
        </div>
        <Link href="/" className="mt-8 text-xs text-neutral-500 hover:text-brand">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
