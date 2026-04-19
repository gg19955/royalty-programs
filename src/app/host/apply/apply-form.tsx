"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitHostApplication, type ApplyState } from "./actions";

const initial: ApplyState = { status: "idle" };

export function HostApplyForm() {
  const [state, formAction] = useFormState(submitHostApplication, initial);

  if (state.status === "success") {
    return (
      <div className="border border-brand-line bg-brand-soft px-8 py-16 text-center">
        <p className="text-[11px] uppercase tracking-[0.32em] text-brand-accent">
          Received
        </p>
        <h2 className="mt-6 font-display text-4xl leading-tight text-brand sm:text-5xl">
          Thanks - we&apos;ll be in touch.
        </h2>
        <p className="mx-auto mt-6 max-w-md text-sm leading-[1.7] text-neutral-600">
          Every application is read by the curation team. Expect to hear from
          us within a week.
        </p>
      </div>
    );
  }

  const values = state.status === "error" ? state.values : {};

  return (
    <form action={formAction} className="space-y-10">
      <Fieldset legend="About you">
        <Field
          name="contact_name"
          label="Your name"
          required
          defaultValue={values.contact_name}
        />
        <Field
          name="contact_email"
          label="Email"
          type="email"
          required
          defaultValue={values.contact_email}
        />
        <Field
          name="phone"
          label="Phone (optional)"
          type="tel"
          defaultValue={values.phone}
        />
      </Fieldset>

      <Fieldset legend="The property">
        <Field
          name="display_name"
          label="Brand or host name"
          help="How guests will see you - e.g. 'Sorrento House' or 'Studio North'."
          required
          defaultValue={values.display_name}
        />
        <Field
          name="property_name"
          label="Property name"
          required
          defaultValue={values.property_name}
        />
        <Field
          name="location"
          label="Location"
          help="Town and region - e.g. 'Sorrento, Mornington Peninsula'."
          required
          defaultValue={values.location}
        />
        <Field
          name="property_url"
          label="Existing listing or website (optional)"
          type="url"
          defaultValue={values.property_url}
        />
        <TextArea
          name="description"
          label="Tell us about it"
          help="Architecture, setting, the kind of stay guests have."
          required
          defaultValue={values.description}
          rows={5}
        />
        <TextArea
          name="about"
          label="Anything else (optional)"
          defaultValue={values.about}
          rows={3}
        />
      </Fieldset>

      {state.status === "error" && (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-sm bg-brand px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-white transition hover:bg-black disabled:opacity-60"
    >
      {pending ? "Submitting…" : "Submit application"}
    </button>
  );
}

function Fieldset({
  legend,
  children,
}: {
  legend: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-6 border-t border-brand-line pt-8">
      <legend className="text-[11px] uppercase tracking-[0.32em] text-brand-accent">
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({
  name,
  label,
  help,
  required,
  type = "text",
  defaultValue,
}: {
  name: string;
  label: string;
  help?: string;
  required?: boolean;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.22em] text-brand">
        {label}
        {required && <span className="text-brand-accent"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-2 block w-full border-b border-brand-line bg-transparent py-2.5 text-base text-brand outline-none transition focus:border-brand"
      />
      {help && (
        <span className="mt-2 block text-xs text-neutral-500">{help}</span>
      )}
    </label>
  );
}

function TextArea({
  name,
  label,
  help,
  required,
  defaultValue,
  rows = 4,
}: {
  name: string;
  label: string;
  help?: string;
  required?: boolean;
  defaultValue?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.22em] text-brand">
        {label}
        {required && <span className="text-brand-accent"> *</span>}
      </span>
      <textarea
        name={name}
        required={required}
        defaultValue={defaultValue}
        rows={rows}
        className="mt-2 block w-full border border-brand-line bg-transparent px-3 py-2.5 text-base leading-relaxed text-brand outline-none transition focus:border-brand"
      />
      {help && (
        <span className="mt-2 block text-xs text-neutral-500">{help}</span>
      )}
    </label>
  );
}
