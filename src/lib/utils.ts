import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPoints(n: number) {
  return new Intl.NumberFormat("en-AU").format(n);
}

export function formatDate(input: string | Date) {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

export function formatCurrency(
  cents: number,
  opts: { currency?: string; withCents?: boolean } = {},
) {
  const { currency = "AUD", withCents = false } = opts;
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    minimumFractionDigits: withCents ? 2 : 0,
    maximumFractionDigits: withCents ? 2 : 0,
  }).format(cents / 100);
}

export function regionToSlug(region: string) {
  return region
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * General slug helper used for listing URLs. Same rules as regionToSlug.
 */
export function slugify(value: string) {
  return regionToSlug(value);
}
