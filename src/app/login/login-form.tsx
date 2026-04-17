"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
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
      <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        Check <strong>{email}</strong> for your magic link.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-accent focus:outline-none"
          placeholder="you@example.com"
        />
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-md bg-brand px-4 py-2 text-white hover:bg-black disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send magic link"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
