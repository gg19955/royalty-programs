import type { Metadata } from "next";
import { Noto_Sans, Oswald } from "next/font/google";
import "./globals.css";

// Body / UI - Noto Sans.
const body = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Display - Oswald is the closest freely-available analogue to
// notahotel's Manuka Condensed. Tall, narrow, confident.
const display = Oswald({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lively - curated luxury stays across Victoria",
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
