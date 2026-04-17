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
