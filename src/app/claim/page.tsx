import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/nav";
import { ClaimForm } from "./claim-form";

export default async function ClaimPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/claim");

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold">Claim your stay</h1>
        <p className="mt-1 text-sm text-gray-600">
          Enter the reservation code from your booking confirmation. Points are credited instantly.
        </p>
        <div className="mt-6">
          <ClaimForm />
        </div>
      </main>
    </>
  );
}
