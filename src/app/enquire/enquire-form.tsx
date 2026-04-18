"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { submitEnquiry, type EnquireState } from "./actions";

const INITIAL: EnquireState = { ok: false, message: "" };

type Tab = "stay" | "list";

/**
 * Two-path enquiry form. Tabs switch between "Stay with Lively" and
 * "List with Lively"; the underlying server action branches on `type`
 * (carried as a hidden field) so both paths share the same submit path.
 */
export function EnquireForm() {
  const [tab, setTab] = useState<Tab>("stay");
  const [state, formAction] = useFormState(submitEnquiry, INITIAL);

  if (state.ok) {
    return (
      <div className="rounded-[6px] border border-white/15 bg-white/[0.03] p-10 text-center">
        <div className="font-display text-[11px] uppercase tracking-[0.32em] text-brand-accent">
          / Received
        </div>
        <p className="mt-6 font-display text-3xl uppercase leading-[1.05] tracking-[-0.01em] text-white sm:text-4xl">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Tab toggle */}
      <div
        role="tablist"
        aria-label="Enquiry type"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-[6px] border border-white/15 bg-white/10 text-white"
      >
        <TabButton active={tab === "stay"} onClick={() => setTab("stay")}>
          Stay with Lively
        </TabButton>
        <TabButton active={tab === "list"} onClick={() => setTab("list")}>
          List with Lively
        </TabButton>
      </div>

      <form
        action={formAction}
        className="mt-10 space-y-8"
        encType="multipart/form-data"
      >
        <input type="hidden" name="type" value={tab} />

        {/* Shared fields */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Name" name="name" required />
          <Field label="Email" name="email" type="email" required />
        </div>
        <Field label="Mobile number" name="mobile" type="tel" required />

        {tab === "stay" ? <StayFields /> : <ListFields />}

        {state.message && !state.ok && (
          <p className="text-sm text-red-300" role="alert">
            {state.message}
          </p>
        )}

        <SubmitButton tab={tab} />
      </form>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        "px-6 py-4 font-display text-[11px] font-medium uppercase tracking-[0.28em] transition " +
        (active
          ? "bg-white text-black"
          : "bg-transparent text-white/70 hover:text-white")
      }
    >
      {children}
    </button>
  );
}

function StayFields() {
  return (
    <>
      <Field
        label="Dates"
        name="dates"
        required
        placeholder="e.g. 12 – 15 December 2026"
      />
      <TextArea
        label="Nice to have"
        name="nice_to_have"
        placeholder="Pool, fireplace, walking distance to town — tell us what would round out the stay."
      />
      <TextArea
        label="Must have"
        name="must_have"
        placeholder="Non-negotiables — minimum bedrooms, accessibility, pet-friendly, etc."
      />
    </>
  );
}

function ListFields() {
  return (
    <>
      <Field label="Property address" name="property_address" required />
      <Field
        label="Link to property"
        name="property_link"
        type="url"
        placeholder="https://…"
      />
      <PhotoUpload />
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="font-display text-[10px] uppercase tracking-[0.32em] text-white/60">
        {label}
        {required && <span className="text-white/40"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-3 block w-full border-0 border-b border-white/20 bg-transparent px-0 py-3 text-base text-white placeholder-white/30 outline-none transition focus:border-white"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="font-display text-[10px] uppercase tracking-[0.32em] text-white/60">
        {label}
      </span>
      <textarea
        name={name}
        rows={3}
        placeholder={placeholder}
        className="mt-3 block w-full resize-y border-0 border-b border-white/20 bg-transparent px-0 py-3 text-base leading-[1.6] text-white placeholder-white/30 outline-none transition focus:border-white"
      />
    </label>
  );
}

function PhotoUpload() {
  const [names, setNames] = useState<string[]>([]);
  return (
    <label className="block">
      <span className="font-display text-[10px] uppercase tracking-[0.32em] text-white/60">
        Property photos
      </span>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
        <label className="inline-flex cursor-pointer items-center gap-3 rounded-[6px] border border-white/25 px-5 py-3 font-display text-[11px] uppercase tracking-[0.28em] text-white transition hover:border-white hover:bg-white hover:text-black">
          Choose files
          <input
            type="file"
            name="photos"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const fs = e.currentTarget.files
                ? Array.from(e.currentTarget.files)
                : [];
              setNames(fs.map((f) => f.name));
            }}
          />
        </label>
        <span className="text-xs text-white/50">
          {names.length
            ? names.length === 1
              ? names[0]
              : `${names.length} photos selected`
            : "No photos selected yet"}
        </span>
      </div>
    </label>
  );
}

function SubmitButton({ tab }: { tab: Tab }) {
  const { pending } = useFormStatus();
  const label =
    tab === "stay" ? "Request stay concierge" : "Submit property for review";
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-[15px] border border-white bg-white px-8 py-4 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-black transition hover:bg-transparent hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sending…" : label}
    </button>
  );
}
