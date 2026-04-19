"use client";

import { useState, useTransition } from "react";
import {
  acceptAgreement,
  saveBusinessInfo,
  uploadKycDocument,
} from "./actions";

type Result = { ok: true } | { ok: false; error: string };

export function AcceptAgreementButton({ accepted }: { accepted: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (accepted) {
    return (
      <p className="text-sm text-neutral-600">
        You accepted the agreement. Thank you.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const form = e.currentTarget;
        const checked = (form.elements.namedItem("agree") as HTMLInputElement)
          ?.checked;
        if (!checked) {
          setError("Tick the box to accept.");
          return;
        }
        start(async () => {
          const res = (await acceptAgreement()) as Result;
          if (!res.ok) setError(res.error);
        });
      }}
      className="space-y-4"
    >
      <label className="flex items-start gap-3 text-sm text-neutral-700">
        <input
          type="checkbox"
          name="agree"
          className="mt-1 h-4 w-4 rounded border-brand-line"
        />
        <span>
          I have read and agree to the Lively Host Agreement.
        </span>
      </label>
      {error && <p className="text-xs text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-sm bg-brand px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-white hover:bg-black disabled:opacity-50"
      >
        {pending ? "Saving..." : "Accept agreement"}
      </button>
    </form>
  );
}

export function BusinessInfoForm({
  legalName,
  abn,
}: {
  legalName: string | null;
  abn: string | null;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setSaved(false);
        const data = new FormData(e.currentTarget);
        start(async () => {
          const res = (await saveBusinessInfo(data)) as Result;
          if (!res.ok) setError(res.error);
          else setSaved(true);
        });
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-xs uppercase tracking-[0.18em] text-brand-accent">
          Legal / company name
        </label>
        <input
          type="text"
          name="legal_name"
          defaultValue={legalName ?? ""}
          required
          className="mt-1 w-full rounded-sm border border-brand-line bg-white px-3 py-2 text-sm"
          placeholder="e.g. Sorrento Holdings Pty Ltd"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-[0.18em] text-brand-accent">
          ABN
        </label>
        <input
          type="text"
          name="abn"
          defaultValue={abn ?? ""}
          required
          inputMode="numeric"
          pattern="[0-9 ]{11,14}"
          className="mt-1 w-full rounded-sm border border-brand-line bg-white px-3 py-2 text-sm font-mono tracking-wider"
          placeholder="11 digit ABN"
        />
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
      {saved && <p className="text-xs text-green-700">Saved.</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-sm bg-brand px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-white hover:bg-black disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save details"}
      </button>
    </form>
  );
}

export function KycUploadForm({ uploaded }: { uploaded: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setDone(false);
        const data = new FormData(e.currentTarget);
        start(async () => {
          const res = (await uploadKycDocument(data)) as Result;
          if (!res.ok) setError(res.error);
          else {
            setDone(true);
            e.currentTarget?.reset?.();
          }
        });
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-xs uppercase tracking-[0.18em] text-brand-accent">
          Document type
        </label>
        <div className="mt-2 flex gap-4 text-sm text-neutral-700">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="document_type"
              value="drivers_licence"
              defaultChecked
            />
            Drivers licence
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="document_type" value="passport" />
            Passport
          </label>
        </div>
      </div>
      <div>
        <label className="block text-xs uppercase tracking-[0.18em] text-brand-accent">
          File (image or PDF, max 10 MB)
        </label>
        <input
          type="file"
          name="file"
          accept="image/*,application/pdf"
          required
          className="mt-1 block w-full text-sm"
        />
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
      {done && (
        <p className="text-xs text-green-700">
          Uploaded. We will review shortly.
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-sm bg-brand px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-white hover:bg-black disabled:opacity-50"
      >
        {pending
          ? "Uploading..."
          : uploaded
            ? "Replace document"
            : "Upload document"}
      </button>
    </form>
  );
}
