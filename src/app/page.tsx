import Link from "next/link";
import { Nav } from "@/components/nav";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <section className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Your stay, rewarded.
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Claim your reservation, earn points, and unlock curated experiences from our partners
            across Victoria.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/login"
              className="rounded-md bg-brand px-5 py-2.5 text-white hover:bg-black"
            >
              Sign in
            </Link>
            <Link
              href="/experiences"
              className="rounded-md border border-gray-300 px-5 py-2.5 hover:border-gray-400"
            >
              Browse experiences
            </Link>
          </div>
        </section>

        <section className="mt-20 grid gap-6 sm:grid-cols-3">
          <Step n={1} title="Sign in" body="Email magic link — no passwords." />
          <Step n={2} title="Claim your stay" body="Enter your reservation code to earn points." />
          <Step n={3} title="Redeem" body="Spend points on partner experiences." />
        </section>
      </main>
    </>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="text-sm font-medium text-brand-accent">Step {n}</div>
      <div className="mt-1 text-lg font-semibold">{title}</div>
      <p className="mt-1 text-sm text-gray-600">{body}</p>
    </div>
  );
}
