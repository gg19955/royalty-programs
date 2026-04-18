"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type RevealVariant = "up" | "fade" | "scale";

type RevealProps = {
  children: ReactNode;
  /** Motion variant. "up" slides in from below, "fade" only opacities, "scale" zooms in. */
  as?: RevealVariant;
  /** Delay before revealing, in ms. Useful for staggered groups. */
  delay?: number;
  /** IntersectionObserver threshold — proportion of element visible before firing. */
  threshold?: number;
  /** Extra bottom rootMargin — reveal earlier as the element nears the viewport. */
  rootMargin?: string;
  className?: string;
  /** Render a specific HTML element. Defaults to a div. */
  element?: "div" | "section" | "article" | "li" | "span";
};

/**
 * Scroll-triggered reveal. Uses IntersectionObserver to set data-visible once,
 * then the CSS transition in globals.css handles the animation. Fires at most
 * once per mount — repeat reveals feel cheap on luxury sites.
 */
export function Reveal({
  children,
  as = "up",
  delay = 0,
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
  className,
  element = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If the element is already on-screen at mount (e.g. hero area) or the
    // user prefers reduced motion, reveal immediately with no observer.
    if (typeof window !== "undefined") {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        setVisible(true);
        return;
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin]);

  const style: CSSProperties | undefined =
    delay > 0 ? { transitionDelay: `${delay}ms` } : undefined;

  const props = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: ref as any,
    className,
    style,
    "data-reveal": as,
    "data-visible": visible ? "true" : "false",
  };

  switch (element) {
    case "section":
      return <section {...props}>{children}</section>;
    case "article":
      return <article {...props}>{children}</article>;
    case "li":
      return <li {...props}>{children}</li>;
    case "span":
      return <span {...props}>{children}</span>;
    default:
      return <div {...props}>{children}</div>;
  }
}
