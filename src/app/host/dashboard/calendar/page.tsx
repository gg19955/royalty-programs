import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FeedForm, FeedRow } from "./feed-controls";

export const dynamic = "force-dynamic";

type Property = { id: string; name: string };
type Feed = {
  id: string;
  property_id: string;
  url: string;
  label: string;
  active: boolean;
  last_synced_at: string | null;
  last_sync_status: string | null;
  last_sync_error: string | null;
  last_event_count: number | null;
};

export default async function HostCalendarPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/host/dashboard/calendar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, host_id")
    .eq("id", user.id)
    .single();
  if (!profile?.host_id) redirect("/host");

  const admin = createAdminClient();
  const { data: properties } = await admin
    .from("properties")
    .select("id, name")
    .eq("host_id", profile.host_id)
    .order("name");
  const props = (properties as Property[] | null) ?? [];

  const propertyIds = props.map((p) => p.id);
  let feedList: Feed[] = [];
  if (propertyIds.length > 0) {
    const { data: feeds } = await admin
      .from("ical_feeds")
      .select(
        "id, property_id, url, label, active, last_synced_at, last_sync_status, last_sync_error, last_event_count",
      )
      .in("property_id", propertyIds)
      .order("created_at", { ascending: false });
    feedList = (feeds as Feed[] | null) ?? [];
  }
  const feedsByProperty = new Map<string, Feed[]>();
  for (const f of feedList) {
    const list = feedsByProperty.get(f.property_id) ?? [];
    list.push(f);
    feedsByProperty.set(f.property_id, list);
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-semibold">Calendar sync</h1>
        <p className="mt-1 max-w-2xl text-sm text-neutral-600">
          Add the iCal export URL from any platform your property is listed on
          (Airbnb, VRBO, Stayz, Guesty, etc.). Lively pulls those calendars
          every couple of hours and blocks the dates in your Lively listing so
          you can&apos;t be double-booked.
        </p>
      </header>

      {props.length === 0 && (
        <div className="rounded border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">
          You don&apos;t have any listings yet. Create one on the{" "}
          <a href="/host/dashboard/listings" className="underline">
            Listings
          </a>{" "}
          tab, then come back here to wire up your calendars.
        </div>
      )}

      {props.map((p) => {
        const ownFeeds = feedsByProperty.get(p.id) ?? [];
        return (
          <section key={p.id} className="rounded border border-neutral-200 bg-white p-6">
            <header className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <h2 className="text-lg font-medium">{p.name}</h2>
              <span className="text-xs uppercase tracking-[0.22em] text-neutral-500">
                {ownFeeds.length} feed{ownFeeds.length === 1 ? "" : "s"}
              </span>
            </header>

            <div className="mt-6 space-y-4">
              {ownFeeds.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  No calendars connected yet.
                </p>
              ) : (
                ownFeeds.map((f) => <FeedRow key={f.id} feed={f} />)
              )}
            </div>

            <div className="mt-6 border-t border-neutral-100 pt-6">
              <FeedForm propertyId={p.id} />
            </div>
          </section>
        );
      })}
    </div>
  );
}
