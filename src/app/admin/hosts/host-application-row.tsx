"use client";

import { useState, useTransition } from "react";
import {
  approveHostApplication,
  markHostApplicationReviewing,
  rejectHostApplication,
} from "./actions";

type Props = {
  id: string;
  contactEmail: string;
  contactName: string;
  displayName: string;
  propertyName: string;
  location: string;
  description: string;
  about: string | null;
  propertyUrl: string | null;
  status: "submitted" | "reviewing";
  submittedAt: string;
};

export function HostApplicationRow(props: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function handleApprove() {
    setError(null);
    start(async () => {
      const r = await approveHostApplication(props.id);
      if (!r.ok) setError(r.error);
    });
  }

  function handleReject() {
    setError(null);
    if (!reason.trim()) {
      setError("Add a reason before rejecting.");
      return;
    }
    start(async () => {
      const r = await rejectHostApplication(props.id, reason);
      if (!r.ok) setError(r.error);
    });
  }

  function handleMarkReviewing() {
    setError(null);
    start(async () => {
      const r = await markHostApplicationReviewing(props.id);
      if (!r.ok) setError(r.error);
    });
  }

  return (
    <tr className="align-top">
      <td className="px-4 py-4">
        <div className="font-medium text-brand">{props.propertyName}</div>
        <div className="text-xs text-gray-500">{props.location}</div>
        {props.propertyUrl && (
          <a
            href={props.propertyUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block text-xs text-brand-accent underline-offset-4 hover:underline"
          >
            Existing listing ↗
          </a>
        )}
      </td>
      <td className="px-4 py-4">
        <div className="font-medium">{props.displayName}</div>
        <div className="text-xs text-gray-500">{props.contactName}</div>
        <a
          href={`mailto:${props.contactEmail}`}
          className="text-xs text-brand-accent underline-offset-4 hover:underline"
        >
          {props.contactEmail}
        </a>
      </td>
      <td className="px-4 py-4 text-xs text-gray-500">
        {new Date(props.submittedAt).toLocaleDateString()}
        {props.status === "reviewing" && (
          <span className="ml-2 rounded-sm bg-yellow-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-yellow-800">
            Reviewing
          </span>
        )}
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap items-start gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-sm border border-brand-line px-3 py-1.5 text-xs text-brand hover:border-brand"
          >
            {open ? "Hide" : "Read"}
          </button>
          {props.status === "submitted" && (
            <button
              type="button"
              onClick={handleMarkReviewing}
              disabled={pending}
              className="rounded-sm border border-brand-line px-3 py-1.5 text-xs text-brand hover:border-brand disabled:opacity-50"
            >
              Mark reviewing
            </button>
          )}
          <button
            type="button"
            onClick={handleApprove}
            disabled={pending}
            className="rounded-sm bg-brand px-3 py-1.5 text-xs text-white hover:bg-black disabled:opacity-50"
          >
            {pending ? "…" : "Approve"}
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={pending}
            className="rounded-sm border border-red-300 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Reject
          </button>
        </div>

        {open && (
          <div className="mt-3 space-y-3 border-l-2 border-brand-line pl-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
                Description
              </div>
              <p className="mt-1 whitespace-pre-line text-sm text-gray-700">
                {props.description}
              </p>
            </div>
            {props.about && (
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
                  About
                </div>
                <p className="mt-1 whitespace-pre-line text-sm text-gray-700">
                  {props.about}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-3">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (for reject)"
            className="w-full rounded-sm border border-brand-line px-2 py-1 text-xs"
          />
        </div>
        {error && <div className="mt-2 text-xs text-red-700">{error}</div>}
      </td>
    </tr>
  );
}
