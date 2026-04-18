"use client";

import { useEffect, useState } from "react";

/**
 * Cross-fades through a list of words on a fixed cadence, used inside
 * the hero headline. Respects prefers-reduced-motion — stops at the
 * first word instead of cycling. Occupies the grid cell of the longest
 * word (via invisible aria-hidden shadow spans) so the headline never
 * reflows between rotations.
 */
export function RotatingWord({
  words,
  intervalMs = 2600,
  fadeMs = 450,
}: {
  words: string[];
  intervalMs?: number;
  fadeMs?: number;
}) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const cycle = setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIdx((i) => (i + 1) % words.length);
        setVisible(true);
      }, fadeMs);
    }, intervalMs);
    return () => clearInterval(cycle);
  }, [words.length, intervalMs, fadeMs]);

  return (
    <span className="relative inline-grid">
      {/* Shadow row — one cell per word, all in the same grid cell,
          invisible. Keeps the headline's box sized to the widest word
          so rotation never reflows surrounding layout. */}
      {words.map((w) => (
        <span
          key={w}
          aria-hidden
          className="invisible col-start-1 row-start-1"
        >
          {w}
        </span>
      ))}
      {/* Active word — fades over the shadow row */}
      <span
        className="col-start-1 row-start-1 transition-all ease-out will-change-[opacity,transform]"
        style={{
          transitionDuration: `${fadeMs}ms`,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(0.25em)",
        }}
      >
        {words[idx]}
      </span>
    </span>
  );
}
