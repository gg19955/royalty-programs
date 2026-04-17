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
    const callback = `${window.location.origin}/auth/callback${
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
      <div className="text-sm text-neutral-700">
        Check <strong className="text-brand">{email}</strong> for your magic link.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block">
        <span className="text-xs uppercase tracking-[0.18em] text-brand-accent">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 block w-full rounded-sm border border-brand-line bg-white px-3 py-2.5 text-sm shadow-none focus:border-brand-accent focus:outline-none"
          placeholder="you@example.com"
        />
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-sm bg-brand px-4 py-3 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send magic link"}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </form>
  );
}
