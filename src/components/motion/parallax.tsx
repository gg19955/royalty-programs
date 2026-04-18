"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ParallaxProps = {
  children: ReactNode;
  /** Scroll ratio. 0.3 means the child moves at 30% of scroll speed (slower = further away). */
  speed?: number;
  className?: string;
};

/**
 * Lightweight parallax wrapper. Applies translateY on a child based on the
 * element's scroll offset, throttled via requestAnimationFrame. Disables
 * entirely for users who prefer reduced motion.
 */
export function Parallax({ children, speed = 0.3, className }: ParallaxProps) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;

    const update = () => {
      ticking = false;
      const rect = outer.getBoundingClientRect();
      const viewportH = window.innerHeight;
      // Only animate while the element is anywhere near the viewport.
      if (rect.bottom < -viewportH || rect.top > viewportH * 2) return;
      // Distance from viewport centre to element centre, scaled.
      const offset = (rect.top + rect.height / 2 - viewportH / 2) * speed;
      inner.style.transform = `translate3d(0, ${offset * -1}px, 0)`;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return (
    <div ref={outerRef} className={className} style={{ overflow: "hidden" }}>
      <div ref={innerRef} style={{ willChange: "transform" }}>
        {children}
      </div>
    </div>
  );
}
