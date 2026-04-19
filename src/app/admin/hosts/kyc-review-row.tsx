"use client";

import { useState, useTransition } from "react";
import { verifyHostKyc, rejectHostKyc } from "./actions";

type Props = {
  hostId: string;
  displayName: string;
  contactEmail: string;
  documentType: string | null;
  uploadedAt: string | null;
  signedUrl: string | null;
};

export function KycReviewRow(props: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onVerify() {
    setError(null);
    start(async () => {
      const res = await verifyHostKyc(props.hostId);
      if (!res.ok) setError(res.error);
    });
  }

  function onReject() {
    if (!reason.trim()) {
      setError("Reason is required.");
      return;
    }
    setError(null);
    start(async () => {
      const res = await rejectHostKyc(props.hostId, reason.trim());
      if (!res.ok) setError(res.error);
      else setOpen(false);
    });
  }

  return (
    <tr className="align-top">
      <td className="px-4 py-4">
        <div className="font-medium text-brand">{props.displayName}</div>
        <div className="text-xs text-gray-500">{props.contactEmail}</div>
      </td>
      <td className="px-4 py-4 text-xs text-gray-600">
        {props.documentType ?? "-"}
      </td>
      <td className="px-4 py-4 text-xs text-gray-500">
        {props.uploadedAt ? new Date(props.uploadedAt).toLocaleString() : "-"}
      </td>
      <td className="px-4 py-4">
        {props.signedUrl ? (
          <a
            href={props.signedUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs uppercase tracking-[0.18em] text-brand-accent hover:text-brand"
          >
            Download
          </a>
        ) : (
          <span className="text-xs text-gray-400">No file</span>
        )}
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onVerify}
              disabled={pending}
              className="rounded-sm bg-brand px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-white hover:bg-black disabled:opacity-50"
            >
              Verify
            </button>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              disabled={pending}
              className="rounded-sm border border-red-200 px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
          {open && (
            <div className="mt-1 flex flex-col items-end gap-1">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason shown to host"
                rows={2}
                className="w-64 rounded-sm border border-brand-line px-2 py-1 text-xs"
              />
              <button
                type="button"
                onClick={onReject}
                disabled={pending}
                className="rounded-sm bg-red-700 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white hover:bg-red-800 disabled:opacity-50"
              >
                Confirm reject
              </button>
            </div>
          )}
          {error && <div className="text-xs text-red-700">{error}</div>}
        </div>
      </td>
    </tr>
  );
}
