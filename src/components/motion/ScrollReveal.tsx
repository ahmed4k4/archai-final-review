"use client";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { createElement, useRef, type ReactNode } from "react";

/**
 * ScrollReveal — reveals children word-by-word (or as one block) as the
 * element travels through the viewport. Everything is driven by a single
 * useScroll progress, so it stays perfectly in sync with Lenis.
 * Respects prefers-reduced-motion (renders static content).
 */
export function ScrollRevealText({
  text,
  className,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.35"],
  });
  const words = text.split(" ");

  if (reduce) return createElement(Tag, { className }, text);

  return createElement(
    Tag,
    { className },
    <span ref={ref} className="inline">
      {words.map((w, i) => (
        <Word
          key={i}
          progress={scrollYProgress}
          range={[i / words.length, (i + 1) / words.length]}
        >
          {w}
        </Word>
      ))}
    </span>,
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const y = useTransform(progress, range, [12, 0]);
  return (
    <motion.span style={{ opacity, y }} className="inline-block mr-[0.28em]">
      {children}
    </motion.span>
  );
}

/**
 * Parallax — moves its children vertically at a scroll-relative speed.
 * `speed` > 0 moves slower than scroll (background), < 0 moves faster (fore).
 */
export function Parallax({
  children,
  speed = 0.3,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [speed * 120, -speed * 120]);
  return (
    <div ref={ref} className={className}>
      {reduce ? children : <motion.div style={{ y }}>{children}</motion.div>}
    </div>
  );
}
