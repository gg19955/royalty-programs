import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/nav";
import { ClaimRequestForm } from "./claim-request-form";

export default async function ClaimPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/claim");

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.24em] text-brand-accent">
          Rewards
        </p>
        <h1 className="mt-4 font-serif text-4xl font-normal tracking-tightest text-brand">
          Claim a stay.
        </h1>
        <p className="mt-4 text-sm text-neutral-600">
          Enter the reservation code and last name on your booking. Our team reviews each
          claim and confirms your points by email — usually within a day.
        </p>

        <div className="mt-10 rounded-sm border border-brand-line bg-white p-8">
          <ClaimRequestForm />
        </div>

        <Link
          href="/portal"
          className="mt-10 inline-block text-sm text-neutral-500 hover:text-brand"
        >
          ← Back to portal
        </Link>
      </main>
    </>
  );
}
