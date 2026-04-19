"use client";

import { useState, useTransition } from "react";
import { updateListing } from "../actions";

type Initial = {
  name: string;
  headline: string | null;
  description: string | null;
  region: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  max_guests: number | null;
  min_nights: number | null;
  amenities: string[];
  base_rate_cents: number | null;
  cleaning_fee_cents: number | null;
  cancellation_policy: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  house_rules: string | null;
};

function centsToInput(cents: number | null): string {
  if (cents === null || cents === undefined) return "";
  return (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
}

export function ListingForm({
  propertyId,
  initial,
}: {
  propertyId: string;
  initial: Initial;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<
    { kind: "ok" | "err"; text: string } | null
  >(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateListing(propertyId, form);
      if (res.ok) setMessage({ kind: "ok", text: "Saved." });
      else setMessage({ kind: "err", text: res.error });
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-8 rounded-xl border border-brand-line bg-white p-6"
    >
      <FieldGroup title="Essentials">
        <Field label="Listing name">
          <input
            name="name"
            required
            defaultValue={initial.name}
            className={inputCls}
          />
        </Field>
        <Field label="Headline" hint="A single editorial line shown under the title.">
          <input
            name="headline"
            maxLength={140}
            defaultValue={initial.headline ?? ""}
            className={inputCls}
          />
        </Field>
        <Field label="Description">
          <textarea
            name="description"
            rows={6}
            defaultValue={initial.description ?? ""}
            className={inputCls}
          />
        </Field>
      </FieldGroup>

      <FieldGroup title="Location">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Region">
            <input
              name="region"
              defaultValue={initial.region ?? ""}
              placeholder="Mornington Peninsula"
              className={inputCls}
            />
          </Field>
          <Field label="City / town">
            <input
              name="city"
              defaultValue={initial.city ?? ""}
              className={inputCls}
            />
          </Field>
          <Field label="State">
            <input
              name="state"
              defaultValue={initial.state ?? ""}
              className={inputCls}
            />
          </Field>
          <Field label="Country">
            <input
              name="country"
              defaultValue={initial.country ?? "Australia"}
              className={inputCls}
            />
          </Field>
        </div>
      </FieldGroup>

      <FieldGroup title="The property">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Property type">
            <select
              name="property_type"
              defaultValue={initial.property_type ?? ""}
              className={inputCls}
            >
              <option value="">-</option>
              <option value="villa">Villa</option>
              <option value="beach_house">Beach house</option>
              <option value="apartment">Apartment</option>
              <option value="chalet">Chalet</option>
              <option value="farm_stay">Farm stay</option>
              <option value="cottage">Cottage</option>
              <option value="penthouse">Penthouse</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Max guests">
            <input
              name="max_guests"
              type="number"
              min={1}
              defaultValue={initial.max_guests ?? ""}
              className={inputCls}
            />
          </Field>
          <Field label="Bedrooms">
            <input
              name="bedrooms"
              type="number"
              min={0}
              defaultValue={initial.bedrooms ?? ""}
              className={inputCls}
            />
          </Field>
          <Field label="Bathrooms">
            <input
              name="bathrooms"
              type="number"
              min={0}
              defaultValue={initial.bathrooms ?? ""}
              className={inputCls}
            />
          </Field>
        </div>
        <Field
          label="Amenities"
          hint="Comma or newline separated. e.g. pool, fireplace, wood-fired oven."
        >
          <textarea
            name="amenities"
            rows={3}
            defaultValue={initial.amenities.join(", ")}
            className={inputCls}
          />
        </Field>
      </FieldGroup>

      <FieldGroup title="Rates & stay">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Base rate / night (AUD)">
            <input
              name="base_rate_aud"
              type="number"
              step="0.01"
              min={0}
              defaultValue={centsToInput(initial.base_rate_cents)}
              className={inputCls}
            />
          </Field>
          <Field label="Cleaning fee (AUD)">
            <input
              name="cleaning_fee_aud"
              type="number"
              step="0.01"
              min={0}
              defaultValue={centsToInput(initial.cleaning_fee_cents)}
              className={inputCls}
            />
          </Field>
          <Field label="Minimum nights">
            <input
              name="min_nights"
              type="number"
              min={1}
              defaultValue={initial.min_nights ?? 2}
              className={inputCls}
            />
          </Field>
          <Field label="Cancellation policy">
            <select
              name="cancellation_policy"
              defaultValue={initial.cancellation_policy ?? "moderate"}
              className={inputCls}
            >
              <option value="flexible">Flexible</option>
              <option value="moderate">Moderate</option>
              <option value="strict">Strict</option>
            </select>
          </Field>
          <Field label="Check-in">
            <input
              name="check_in_time"
              type="time"
              defaultValue={initial.check_in_time ?? "15:00"}
              className={inputCls}
            />
          </Field>
          <Field label="Check-out">
            <input
              name="check_out_time"
              type="time"
              defaultValue={initial.check_out_time ?? "10:00"}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="House rules">
          <textarea
            name="house_rules"
            rows={3}
            defaultValue={initial.house_rules ?? ""}
            className={inputCls}
          />
        </Field>
      </FieldGroup>

      <div className="flex items-center justify-between border-t border-brand-line pt-6">
        <div className="text-xs">
          {message ? (
            <span
              className={
                message.kind === "ok" ? "text-green-700" : "text-red-700"
              }
            >
              {message.text}
            </span>
          ) : (
            <span className="text-neutral-400">Changes save to draft.</span>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-sm bg-brand px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-white hover:bg-black disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-sm border border-brand-line bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none";

function FieldGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-[11px] uppercase tracking-[0.22em] text-brand-accent">
        {title}
      </legend>
      {children}
    </fieldset>
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
    <label className="block space-y-1">
      <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
        {label}
      </div>
      {children}
      {hint ? <div className="text-xs text-neutral-500">{hint}</div> : null}
    </label>
  );
}
