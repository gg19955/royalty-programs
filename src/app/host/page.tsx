import Link from "next/link";
import { Nav } from "@/components/nav";

export const metadata = {
  title: "List your property — Lively",
  description:
    "Lively is a curated marketplace for Victoria's most considered short-stay homes. Apply to join.",
};

export default function HostLandingPage() {
  return (
    <>
      <Nav transparent />
      <section className="relative isolate min-h-[92vh] overflow-hidden bg-brand">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=2400&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-6 py-28 sm:px-10 sm:py-32">
          <p className="text-[11px] uppercase tracking-[0.32em] text-white/80">
            For owners and operators
          </p>
          <h1 className="mt-6 max-w-5xl font-display text-6xl leading-[0.95] tracking-[-0.02em] text-white sm:text-8xl md:text-[8rem]">
            List a house that deserves to be found.
          </h1>
          <p className="mt-8 max-w-xl text-base leading-[1.7] text-white/85 sm:text-lg">
            Lively is a small, curated collection of Victoria's most considered
            short-stay homes. We don't list everything — we list the ones worth
            the drive.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/host/apply"
              className="rounded-sm bg-white px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-brand hover:bg-brand-soft"
            >
              Apply to list
            </Link>
            <Link
              href="/stays"
              className="rounded-sm border border-white/70 px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-white hover:bg-white hover:text-brand"
            >
              See the collection
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-10 sm:py-32">
        <p className="text-[11px] uppercase tracking-[0.32em] text-brand-accent">
          The Lively difference
        </p>
        <h2 className="mt-6 max-w-4xl font-display text-5xl leading-[1.02] tracking-[-0.02em] text-brand sm:text-7xl">
          Fewer listings. Better guests. Real partnerships.
        </h2>

        <div className="mt-16 grid gap-12 sm:grid-cols-3">
          <Pillar
            eyebrow="01"
            title="Curation over volume"
            body="We accept a small number of properties each quarter. Listings are hand-selected for architecture, setting, and the host's sense of service."
          />
          <Pillar
            eyebrow="02"
            title="Guests who notice"
            body="Lively attracts design-literate travellers who stay longer, leave things tidier, and come back. Average booking value sits well above the market."
          />
          <Pillar
            eyebrow="03"
            title="Operated like a brand"
            body="Editorial photography, seasonal campaigns, a rewards programme that brings guests back. Your house is presented the way it deserves."
          />
        </div>
      </section>

      <section className="bg-brand-soft">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-10 sm:py-32">
          <p className="text-[11px] uppercase tracking-[0.32em] text-brand-accent">
            How it works
          </p>
          <h2 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] tracking-[-0.02em] text-brand sm:text-6xl">
            A conversation, not a form submission.
          </h2>

          <ol className="mt-16 space-y-12">
            <Step
              n="01"
              title="Apply"
              body="Tell us about the house — the setting, the story, the service you offer guests. We read every application ourselves."
            />
            <Step
              n="02"
              title="Meet"
              body="If it's a fit, we come and see the property. We talk commercials, house rules, photography, the lot."
            />
            <Step
              n="03"
              title="List"
              body="We build the listing with you — editorial copy, professional photography, rate plan, house guide — then go live to the Lively collection."
            />
            <Step
              n="04"
              title="Host"
              body="Take bookings through Lively. Payouts are automated, guests are vetted, and the rewards programme keeps them coming back to you."
            />
          </ol>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-brand text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-10 sm:py-32">
          <p className="text-[11px] uppercase tracking-[0.32em] text-white/70">
            Commercials
          </p>
          <div className="mt-8 grid gap-12 sm:grid-cols-2">
            <div>
              <h3 className="font-display text-4xl leading-[1.05] text-white sm:text-5xl">
                Straightforward, all inclusive.
              </h3>
              <p className="mt-6 max-w-md text-base leading-[1.7] text-white/80">
                We take a single platform fee on confirmed bookings. No listing
                fees, no setup fees, no lock-in. Cleaning is passed through at
                cost. Payouts land 24 hours after check-in.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-y-8 self-center">
              <Stat label="Platform fee" value="12%" />
              <Stat label="Payout trigger" value="24h after check-in" />
              <Stat label="Min. nightly rate" value="$450" />
              <Stat label="Contract" value="Month to month" />
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 text-center sm:px-10 sm:py-32">
        <p className="text-[11px] uppercase tracking-[0.32em] text-brand-accent">
          Ready?
        </p>
        <h2 className="mx-auto mt-6 max-w-3xl font-display text-5xl leading-[1.02] tracking-[-0.02em] text-brand sm:text-7xl">
          Tell us about the house.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-[1.7] text-neutral-600">
          Applications take five minutes. We respond within a week.
        </p>
        <div className="mt-10 flex justify-center">
          <Link
            href="/host/apply"
            className="rounded-sm bg-brand px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-white hover:bg-black"
          >
            Start an application
          </Link>
        </div>
      </section>
    </>
  );
}

function Pillar({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.32em] text-brand-accent">
        {eyebrow}
      </div>
      <h3 className="mt-5 font-display text-2xl leading-snug text-brand">
        {title}
      </h3>
      <p className="mt-4 text-sm leading-[1.75] text-neutral-600">{body}</p>
    </div>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <li className="grid gap-6 border-t border-brand-line pt-8 sm:grid-cols-[6rem_1fr_2fr]">
      <div className="text-[11px] uppercase tracking-[0.32em] text-brand-accent">
        {n}
      </div>
      <h3 className="font-display text-3xl leading-tight text-brand">
        {title}
      </h3>
      <p className="text-base leading-[1.7] text-neutral-700">{body}</p>
    </li>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.32em] text-white/60">
        {label}
      </dt>
      <dd className="mt-2 font-display text-3xl text-white sm:text-4xl">
        {value}
      </dd>
    </div>
  );
}
