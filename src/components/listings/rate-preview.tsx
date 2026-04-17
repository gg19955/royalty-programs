import { formatCurrency } from "@/lib/utils";
import type { RateBreakdown } from "@/lib/listings/rate";

export function RatePreview({
  rate,
  checkIn,
  checkOut,
}: {
  rate: RateBreakdown | null;
  checkIn?: string;
  checkOut?: string;
}) {
  if (!rate) {
    return (
      <div className="text-sm text-neutral-500">
        Enter check-in and check-out dates to see a quote.
      </div>
    );
  }

  const nightly = formatCurrency(rate.nightlyRateCents);
  return (
    <div className="space-y-2 text-sm">
      {checkIn && checkOut && (
        <div className="text-xs uppercase tracking-[0.2em] text-brand-accent">
          {checkIn} → {checkOut}
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-neutral-600">
          {nightly} × {rate.nights} night{rate.nights === 1 ? "" : "s"}
        </span>
        <span>{formatCurrency(rate.accommodationCents)}</span>
      </div>
      {rate.cleaningFeeCents > 0 && (
        <div className="flex justify-between">
          <span className="text-neutral-600">Cleaning fee</span>
          <span>{formatCurrency(rate.cleaningFeeCents)}</span>
        </div>
      )}
      <div className="border-t border-brand-line pt-2" />
      <div className="flex justify-between text-base font-medium">
        <span>Total</span>
        <span>{formatCurrency(rate.totalCents)}</span>
      </div>
      {rate.minNights > 1 && (
        <div className="text-xs text-neutral-500">
          {rate.minNights}-night minimum stay.
        </div>
      )}
    </div>
  );
}
