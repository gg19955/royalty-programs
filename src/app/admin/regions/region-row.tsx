"use client";

import { useState, useTransition } from "react";
import type { Region } from "@/lib/regions";
import { setRegionActive, updateRegion } from "./actions";

export function RegionRow({ region }: { region: Region }) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSave(form: FormData) {
    setError(null);
    start(async () => {
      const res = await updateRegion(region.id, form);
      if (!res.ok) setError(res.error);
      else setEditing(false);
    });
  }

  function onToggleActive() {
    setError(null);
    start(async () => {
      const res = await setRegionActive(region.id, !region.active);
      if (!res.ok) setError(res.error);
    });
  }

  if (editing) {
    return (
      <tr className="align-top">
        <td colSpan={5} className="px-4 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave(new FormData(e.currentTarget));
            }}
            className="space-y-3"
          >
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_120px]">
              <Field label="Label">
                <input
                  name="label"
                  required
                  defaultValue={region.label}
                  className={inputCls}
                />
              </Field>
              <Field label="Slug (read-only)">
                <input
                  value={region.slug}
                  readOnly
                  className={`${inputCls} bg-neutral-50 text-neutral-500`}
                />
              </Field>
              <Field label="Order">
                <input
                  name="display_order"
                  type="number"
                  defaultValue={region.display_order}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Suburbs (comma or newline separated)">
              <textarea
                name="suburbs"
                rows={3}
                defaultValue={region.suburbs.join(", ")}
                className={inputCls}
              />
            </Field>
            {error && <div className="text-xs text-red-700">{error}</div>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={pending}
                className="rounded-sm bg-brand px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white hover:bg-black disabled:opacity-50"
              >
                {pending ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={pending}
                className="rounded-sm border border-brand-line px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-neutral-700 hover:border-brand hover:text-brand"
              >
                Cancel
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="align-top">
      <td className="px-4 py-3">
        <div className="font-medium text-brand">{region.label}</div>
        <div className="text-xs text-gray-500">/{region.slug}</div>
      </td>
      <td className="px-4 py-3 text-xs text-gray-600">
        {region.suburbs.length > 0
          ? region.suburbs.slice(0, 4).join(", ") +
            (region.suburbs.length > 4 ? `, +${region.suburbs.length - 4}` : "")
          : "-"}
      </td>
      <td className="px-4 py-3 text-xs text-gray-600">{region.display_order}</td>
      <td className="px-4 py-3">
        <span
          className={
            "rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] " +
            (region.active
              ? "bg-green-100 text-green-800"
              : "bg-neutral-200 text-neutral-600")
          }
        >
          {region.active ? "Active" : "Archived"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="inline-flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            disabled={pending}
            className="rounded-sm border border-brand-line px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-neutral-700 hover:border-brand hover:text-brand"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onToggleActive}
            disabled={pending}
            className={
              "rounded-sm border px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] " +
              (region.active
                ? "border-red-200 text-red-700 hover:bg-red-50"
                : "border-green-300 text-green-800 hover:bg-green-50")
            }
          >
            {region.active ? "Archive" : "Restore"}
          </button>
        </div>
        {error && <div className="mt-1 text-xs text-red-700">{error}</div>}
      </td>
    </tr>
  );
}

const inputCls =
  "w-full rounded-sm border border-brand-line bg-white px-3 py-2 text-sm";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </span>
      {children}
    </label>
  );
}
