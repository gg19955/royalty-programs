import { createAdminClient } from "@/lib/supabase/admin";

export type BlockedRange = { start: string; end: string };

/**
 * Fetch blocked date ranges for a property. Reads from `availability_blocks`
 * (union of iCal imports, platform bookings, and manual holds).
 */
export async function getBlockedRanges(propertyId: string): Promise<BlockedRange[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("availability_blocks")
    .select("start_date, end_date")
    .eq("property_id", propertyId)
    .gte("end_date", new Date().toISOString().slice(0, 10))
    .order("start_date", { ascending: true });
  return (data ?? []).map((r) => ({ start: r.start_date, end: r.end_date }));
}

/**
 * True if the requested window [checkIn, checkOut) does NOT overlap any
 * existing availability block. Half-open range so back-to-back stays are OK.
 */
export async function isAvailable(args: {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
}): Promise<boolean> {
  const admin = createAdminClient();
  const checkInIso = args.checkIn.toISOString().slice(0, 10);
  const checkOutIso = args.checkOut.toISOString().slice(0, 10);
  const { count } = await admin
    .from("availability_blocks")
    .select("*", { count: "exact", head: true })
    .eq("property_id", args.propertyId)
    .lt("start_date", checkOutIso)
    .gt("end_date", checkInIso);
  return (count ?? 0) === 0;
}
