import type { BlockedRange } from "@/lib/listings/availability";

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function isoFor(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isBlocked(iso: string, blocks: BlockedRange[]) {
  return blocks.some((b) => iso >= b.start && iso < b.end);
}

/**
 * Read-only two-month availability preview. Blocked dates are struck out.
 * Phase D will upgrade this to an interactive date-range picker.
 */
export function AvailabilityCalendar({ blocks }: { blocks: BlockedRange[] }) {
  const now = new Date();
  const months = [
    { year: now.getFullYear(), month: now.getMonth() },
    {
      year: now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear(),
      month: (now.getMonth() + 1) % 12,
    },
  ];
  const todayIso = isoFor(now.getFullYear(), now.getMonth(), now.getDate());

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {months.map(({ year, month }) => {
        const total = daysInMonth(year, month);
        const firstDow = new Date(year, month, 1).getDay();
        const cells: (number | null)[] = [
          ...Array(firstDow).fill(null),
          ...Array.from({ length: total }, (_, i) => i + 1),
        ];
        const label = new Date(year, month, 1).toLocaleDateString("en-AU", {
          month: "long",
          year: "numeric",
        });
        return (
          <div key={`${year}-${month}`} className="rounded-xl border border-brand-line p-4">
            <div className="mb-3 text-sm font-medium text-brand">{label}</div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wide text-neutral-400">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1 text-center text-xs">
              {cells.map((day, i) => {
                if (day === null) return <div key={i} />;
                const iso = isoFor(year, month, day);
                const blocked = isBlocked(iso, blocks);
                const past = iso < todayIso;
                return (
                  <div
                    key={i}
                    className={
                      "aspect-square rounded-sm py-1 " +
                      (blocked || past
                        ? "text-neutral-300 line-through"
                        : "text-neutral-700")
                    }
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
