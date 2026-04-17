import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/nav";
import { formatPoints } from "@/lib/utils";
import { RedeemButton } from "./redeem-button";

export default async function ExperienceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: experience } = await supabase
    .from("experiences")
    .select("id, title, description, image_url, region, points_cost, active, partners(name, website)")
    .eq("id", params.id)
    .single();

  if (!experience || !experience.active) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  let balance = 0;
  if (user) {
    const { data } = await supabase
      .from("v_user_points")
      .select("balance")
      .eq("user_id", user.id)
      .single();
    balance = data?.balance ?? 0;
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl px-4 py-10">
        {experience.image_url && (
          <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl">
            <Image src={experience.image_url} alt={experience.title} fill className="object-cover" />
          </div>
        )}
        <div className="mt-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold">{experience.title}</h1>
            {(experience.partners as any)?.name && (
              <div className="mt-1 text-sm text-gray-600">
                by {(experience.partners as any).name}
              </div>
            )}
            {experience.region && (
              <div className="mt-1 text-sm text-gray-600">{experience.region}</div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wide text-gray-500">Cost</div>
            <div className="text-2xl font-semibold text-brand-accent">
              {formatPoints(experience.points_cost)} pts
            </div>
          </div>
        </div>

        {experience.description && (
          <p className="mt-6 whitespace-pre-line text-gray-700">{experience.description}</p>
        )}

        <div className="mt-8">
          {user ? (
            <RedeemButton
              experienceId={experience.id}
              pointsCost={experience.points_cost}
              balance={balance}
            />
          ) : (
            <a
              href={`/login?next=/experiences/${experience.id}`}
              className="inline-block rounded-md bg-brand px-5 py-2.5 text-white hover:bg-black"
            >
              Sign in to redeem
            </a>
          )}
        </div>
      </main>
    </>
  );
}
