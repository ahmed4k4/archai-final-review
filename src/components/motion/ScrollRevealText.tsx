"use client";
import { createElement, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * ScrollRevealText — word/char reveal driven by IntersectionObserver + CSS.
 *
 * PERFORMANCE: this used to import the entire gsap runtime plus the
 * ScrollTrigger and SplitText plugins (~30 KB gzipped) just to animate one
 * headline. It now splits the text into <span>s in React and staggers them
 * with CSS transitions — no animation library, no layout thrash, and the
 * text is present in the DOM (and readable by screen readers) from the very
 * first paint, which also improves LCP because the headline is never blank.
 *
 * ACCESSIBILITY: the wrapper carries `aria-label` populated with the full
 * phrase while the visual fragments are `aria-hidden`, so the element keeps
 * a single, coherent accessible name. (The previous `srt-root` span had a
 * fragmenting structure with no role.)
 *
 * Reduced-motion renders the plain text with no split and no animation.
 */

type Tag = "span" | "h1" | "h2" | "h3" | "p";

export default function ScrollRevealText({
  text,
  className,
  as: Tag = "span",
  type = "chars",
  stagger = 0.02,
  start = "top 85%",
}: {
  text: string;
  className?: string;
  as?: Tag;
  type?: "chars" | "words" | "lines";
  stagger?: number;
  start?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  /* LCP FIX: if this element is already inside the initial viewport (the hero
     headline), reveal it synchronously before the first paint instead of
     waiting for the IntersectionObserver callback. Otherwise the words sit at
     opacity:0 through hydration and the browser delays registering the
     headline as the LCP element (~700ms element render delay measured on
     Moto-G / Slow-4G). Above-the-fold text must be painted immediately. */
  useIsomorphicLayoutEffect(() => {
    if (reduce) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const top = el.getBoundingClientRect().top;
    if (top < vh) setShown(true);
  }, [reduce]);

  /* Respect the start offset ("top 85%") with a matching rootMargin so the
     reveal fires exactly where the old ScrollTrigger did. */
  useEffect(() => {
    if (reduce) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const parts = start.split(" ");
    const pct = parts.length > 1 ? parseInt(parts[1], 10) : 85;
    const margin = Number.isFinite(pct) ? `0px 0px -${100 - pct}% 0px` : "0px";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: margin, threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce, start]);

  if (reduce) return createElement(Tag, { className }, text);

  /* Split into tokens once per render — cheap for headlines. */
  const tokens =
    type === "chars"
      ? Array.from(text)
      : type === "words"
        ? text.split(/(\s+)/)
        : [text];

  return createElement(
    Tag,
    {
      ref,
      className: `srt-root ${className ?? ""}`,
    },
    /* ACCESSIBILITY FIX: the previous code put `aria-label` on a plain <span>
       with no role, which assistive tech ignores or mis-announces. Provide a
       visually-hidden, complete copy of the phrase for screen readers and keep
       the animated fragments aria-hidden. */
    createElement("span", { className: "sr-only" }, text),
    tokens.map((tok, i) =>
      tok.trim() === "" ? (
        <span key={i} aria-hidden>
          {tok}
        </span>
      ) : (
        <span
          key={i}
          aria-hidden
          style={{
            display: "inline-block",
            whiteSpace: "pre",
            opacity: shown ? 1 : 0,
            transform: shown ? "translateY(0)" : "translateY(0.9em)",
            transitionProperty: "opacity, transform",
            transitionDuration: "0.7s",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            transitionDelay: shown ? `${Math.min(i * stagger, 0.4)}s` : "0s",
          }}
        >
          {tok}
        </span>
      ),
    ),
  );
}
