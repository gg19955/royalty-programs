"use client";

import { useState, useTransition } from "react";
import { createRegion } from "./actions";

export function NewRegionForm() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-sm border border-brand-line px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] text-neutral-700 hover:border-brand hover:text-brand"
      >
        + Add region
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const data = new FormData(e.currentTarget);
        const form = e.currentTarget;
        start(async () => {
          const res = await createRegion(data);
          if (!res.ok) setError(res.error);
          else {
            form.reset();
            setOpen(false);
          }
        });
      }}
      className="rounded-xl border border-brand-line bg-white p-5"
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_120px]">
        <Field label="Label" hint="e.g. High Country">
          <input name="label" required className={inputCls} />
        </Field>
        <Field label="Slug" hint="Leave blank to auto-generate from label">
          <input
            name="slug"
            placeholder="high-country"
            className={inputCls}
          />
        </Field>
        <Field label="Order" hint="Lower appears first">
          <input
            name="display_order"
            type="number"
            defaultValue={100}
            className={inputCls}
          />
        </Field>
      </div>
      <div className="mt-3">
        <Field
          label="Suburbs"
          hint="Comma or newline separated. Shown in the search bar dropdown."
        >
          <textarea
            name="suburbs"
            rows={3}
            placeholder="Bright, Mansfield, Mount Beauty"
            className={inputCls}
          />
        </Field>
      </div>
      {error && <div className="mt-2 text-xs text-red-700">{error}</div>}
      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-brand px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] text-white hover:bg-black disabled:opacity-50"
        >
          {pending ? "Adding..." : "Add region"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={pending}
          className="rounded-sm border border-brand-line px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] text-neutral-700 hover:border-brand hover:text-brand"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-sm border border-brand-line bg-white px-3 py-2 text-sm";

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
    <label className="block space-y-1">
      <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </span>
      {children}
      {hint && <span className="text-xs text-neutral-500">{hint}</span>}
    </label>
  );
}
