"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ next }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const supabase = createClient();
    // Prefer an explicit canonical site URL so magic links always land on
    // the production domain, even when this form is submitted from a
    // preview deploy or localhost tab. Falls back to the current origin
    // only when the env var is unset (local dev without .env.local).
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      window.location.origin;
    const callback = `${origin}/auth/callback${
      next ? `?next=${encodeURIComponent(next)}` : ""
    }`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callback },
    });
    if (error) {
      setStatus("error");
      setError(error.message);
      return;
    }
    setStatus("sent");
  };

  if (status === "sent") {
    return (
      <div className="rounded-[6px] border border-white/15 bg-white/[0.03] p-10 text-center">
        <div className="font-display text-[11px] uppercase tracking-[0.32em] text-brand-accent">
          / Link sent
        </div>
        <p className="mt-6 font-display text-3xl uppercase leading-[1.05] tracking-[-0.01em] text-white sm:text-4xl">
          Check {email} for your magic link.
        </p>
        <p className="mt-6 text-sm text-white/60">
          The link expires in one hour. You can close this tab.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <label className="block">
        <span className="font-display text-[10px] uppercase tracking-[0.32em] text-white/60">
          Email <span className="text-white/40">*</span>
        </span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-3 block w-full border-0 border-b border-white/20 bg-transparent px-0 py-3 text-base text-white placeholder-white/30 outline-none transition focus:border-white"
        />
      </label>

      {error && (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-[15px] border border-white bg-white px-8 py-4 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-black transition hover:bg-transparent hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send magic link"}
      </button>
    </form>
  );
}
