import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/nav";
import { Reveal } from "@/components/motion/reveal";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect(searchParams.next || "/portal");

  return (
    <>
      <ScrollProgress />
      <Nav />

      <section className="relative overflow-hidden border-b border-brand-line bg-black">
        <div className="mx-auto max-w-[1296px] px-6 py-24 sm:px-10 sm:py-32">
          <Reveal as="up">
            <div className="section-index">/ Sign in</div>
          </Reveal>
          <Reveal as="up" delay={120}>
            <h1 className="mt-10 max-w-5xl font-display text-6xl font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-white sm:text-8xl md:text-[8rem]">
              Stay
              <br />
              Lively.
            </h1>
          </Reveal>
          <Reveal as="up" delay={260}>
            <div className="mt-16 grid gap-12 border-t border-brand-line pt-12 sm:grid-cols-[1fr_2fr] sm:gap-20">
              <div className="section-index">/ Magic link</div>
              <p className="max-w-2xl text-base leading-[1.7] text-white/80 sm:text-lg">
                Enter the email on your Lively account - we&apos;ll send a
                single-use link that signs you straight into your portal. No
                passwords, no friction.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-black">
        <div className="mx-auto max-w-lg px-6 py-24 sm:px-10 sm:py-32">
          <Reveal as="up">
            <LoginForm next={searchParams.next} />
          </Reveal>
          <Reveal as="up" delay={200}>
            <Link
              href="/"
              className="mt-12 inline-block font-display text-[11px] uppercase tracking-[0.32em] text-white/50 transition hover:text-white"
            >
              ← Back to home
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}

export const metadata = {
  title: "Sign in - Lively",
  description: "Sign in to your Lively portal with a magic link.",
};
