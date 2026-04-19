"use client";

import { useState, useTransition } from "react";
import { addIcalFeed, removeIcalFeed, syncFeedNow } from "./actions";

type Feed = {
  id: string;
  url: string;
  label: string;
  last_synced_at: string | null;
  last_sync_status: string | null;
  last_sync_error: string | null;
  last_event_count: number | null;
};

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function FeedRow({ feed }: { feed: Feed }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const runAction = (action: (fd: FormData) => Promise<{ ok: boolean; error?: string }>) => {
    const fd = new FormData();
    fd.set("feed_id", feed.id);
    setError(null);
    startTransition(async () => {
      const res = await action(fd);
      if (!res.ok) setError(res.error ?? "Failed.");
    });
  };

  return (
    <div className="rounded border border-neutral-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-neutral-700">
              {feed.label}
            </span>
            {feed.last_sync_status === "ok" && (
              <span className="text-xs text-green-700">✓ synced</span>
            )}
            {feed.last_sync_status === "error" && (
              <span className="text-xs text-red-700">⚠ error</span>
            )}
          </div>
          <div className="mt-2 truncate text-xs text-neutral-500" title={feed.url}>
            {feed.url}
          </div>
          <div className="mt-2 text-xs text-neutral-600">
            Last synced {timeAgo(feed.last_synced_at)}
            {feed.last_event_count !== null && ` · ${feed.last_event_count} events`}
          </div>
          {feed.last_sync_error && (
            <div className="mt-2 text-xs text-red-600">{feed.last_sync_error}</div>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => runAction(syncFeedNow)}
            disabled={pending}
            className="rounded border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50 disabled:opacity-50"
          >
            {pending ? "Syncing…" : "Sync now"}
          </button>
          <button
            type="button"
            onClick={() => runAction(removeIcalFeed)}
            disabled={pending}
            className="rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>
      {error && <div className="mt-3 text-xs text-red-600">{error}</div>}
    </div>
  );
}

export function FeedForm({ propertyId }: { propertyId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("property_id", propertyId);
    fd.set("url", url);
    fd.set("label", label);
    startTransition(async () => {
      const res = await addIcalFeed(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setUrl("");
      setLabel("");
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        Add a calendar
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_200px_auto]">
        <input
          type="url"
          required
          placeholder="https://www.airbnb.com/calendar/ical/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="rounded border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          required
          placeholder="Airbnb"
          maxLength={40}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="rounded border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add"}
        </button>
      </div>
      {error && <div className="text-xs text-red-600">{error}</div>}
      <p className="text-xs text-neutral-500">
        The URL must be <code>https://</code>. On Airbnb:{" "}
        <em>Calendar → Availability settings → Sync calendars → Export calendar</em>.
      </p>
    </form>
  );
}
