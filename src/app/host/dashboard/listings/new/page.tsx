import Link from "next/link";
import { createListing } from "../actions";

export const dynamic = "force-dynamic";

async function createListingAction(data: FormData): Promise<void> {
  "use server";
  const res = await createListing(data);
  // Success path redirects from inside createListing. If we land here the
  // action reported an error — surface it by throwing so Next's error UI shows
  // something rather than silently dropping back to the form.
  if (!res.ok) throw new Error(res.error);
}

export default function NewListingPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link
          href="/host/dashboard/listings"
          className="text-[11px] uppercase tracking-[0.22em] text-brand-accent hover:text-brand"
        >
          ← Listings
        </Link>
        <h1 className="mt-4 font-display text-4xl leading-tight text-brand sm:text-5xl">
          Start a new listing.
        </h1>
        <p className="mt-3 max-w-lg text-sm text-neutral-600">
          A working title and a rough location is all we need to begin. You can
          refine every detail, add photography and set your rate on the next
          screen. Nothing publishes until you say so.
        </p>
      </div>

      <form
        action={createListingAction}
        className="space-y-6 rounded-xl border border-brand-line bg-white p-6"
      >
        <Field label="Listing name" hint="What guests will see at the top of the page.">
          <input
            name="name"
            required
            maxLength={120}
            placeholder="The Beach House, Sorrento"
            className="w-full rounded-sm border border-brand-line bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </Field>

        <Field label="Region" hint="Optional. You can set this later.">
          <input
            name="region"
            maxLength={80}
            placeholder="Mornington Peninsula"
            className="w-full rounded-sm border border-brand-line bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </Field>

        <div className="flex items-center justify-between pt-2">
          <Link
            href="/host/dashboard/listings"
            className="text-xs uppercase tracking-[0.22em] text-brand-accent hover:text-brand"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-sm bg-brand px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-white hover:bg-black"
          >
            Create draft
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <div>
        <div className="text-[11px] uppercase tracking-[0.22em] text-brand-accent">
          {label}
        </div>
        {hint ? (
          <div className="mt-1 text-xs text-neutral-500">{hint}</div>
        ) : null}
      </div>
      {children}
    </label>
  );
}
