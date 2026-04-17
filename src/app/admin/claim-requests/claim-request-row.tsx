"use client";

import { useState, useTransition } from "react";
import { approveClaimRequest, rejectClaimRequest } from "./actions";

export function ClaimRequestRow({
  id,
  email,
  reservationCode,
  lastName,
  submittedAt,
}: {
  id: string;
  email: string;
  reservationCode: string;
  lastName: string;
  submittedAt: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const onApprove = () => {
    setError(null);
    startTransition(async () => {
      const result = await approveClaimRequest(id);
      if (!result.ok) setError(result.error);
    });
  };

  const onReject = () => {
    setError(null);
    startTransition(async () => {
      const result = await rejectClaimRequest(id, reason);
      if (!result.ok) setError(result.error);
      else {
        setRejecting(false);
        setReason("");
      }
    });
  };

  return (
    <tr className="align-top">
      <td className="px-4 py-3 font-mono text-xs">{reservationCode}</td>
      <td className="px-4 py-3">{email}</td>
      <td className="px-4 py-3">{lastName}</td>
      <td className="px-4 py-3 text-gray-500">
        {new Date(submittedAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        {rejecting ? (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (shown to guest later)"
              className="rounded-sm border border-brand-line px-2 py-1 text-xs"
            />
            <div className="flex gap-2">
              <button
                onClick={onReject}
                disabled={pending || !reason.trim()}
                className="rounded-sm bg-red-600 px-3 py-1 text-xs text-white disabled:opacity-50"
              >
                Confirm reject
              </button>
              <button
                onClick={() => {
                  setRejecting(false);
                  setReason("");
                  setError(null);
                }}
                className="text-xs text-gray-500 hover:text-black"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onApprove}
              disabled={pending}
              className="rounded-sm bg-brand px-3 py-1 text-xs text-white hover:bg-black disabled:opacity-50"
            >
              {pending ? "…" : "Approve"}
            </button>
            <button
              onClick={() => setRejecting(true)}
              disabled={pending}
              className="rounded-sm border border-brand-line px-3 py-1 text-xs text-gray-700 hover:text-black"
            >
              Reject
            </button>
          </div>
        )}
        {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
      </td>
    </tr>
  );
}
