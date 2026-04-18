import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // notahotel-inspired dark palette
        // brand           = primary text (white) on dark surfaces
        // brand.soft      = elevated surface (card/panel) — #0b0b0d
        // brand.line      = hairline divider — #2d2d2d
        // brand.accent    = muted caption text — #cecdc1
        // brand.muted     = secondary muted — #707070
        // brand.ink       = page background (true black)
        brand: {
          DEFAULT: "#ffffff",
          accent: "#cecdc1",
          muted: "#707070",
          soft: "#0b0b0d",
          line: "#2d2d2d",
          ink: "#000000",
          raised: "#191919",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-body)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "Oswald",
          "Impact",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tightest: "-0.03em",
      },
    },
  },
  plugins: [],
};

export default config;
