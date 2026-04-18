import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";

// Body / UI — clean neutral sans.
const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// Display — Oswald is the closest freely-available analogue to
// notahotel's Manuka Condensed. Tall, narrow, confident.
const display = Oswald({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lively — curated luxury stays across Victoria",
  description:
    "A curated collection of luxury short-stay properties across Victoria. Earn and redeem points on every booking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body className="min-h-screen bg-brand-ink font-sans text-white antialiased">
        {children}
      </body>
    </html>
  );
}
