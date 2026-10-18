"use client";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";

/**
 * SplitText — React Bits (reactbits.dev) style component.
 * Reveals a line of text character-by-character with a spring, triggered when
 * the element scrolls into view. Reduced-motion renders the plain text.
 */
type SplitTextProps = {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  from?: { opacity?: number; y?: number };
  as?: "h1" | "h2" | "h3" | "p" | "span";
};

export default function SplitText({
  text,
  className,
  delay = 0.05,
  duration = 0.6,
  stagger = 0.025,
  from = { opacity: 0, y: 24 },
  as = "p",
}: SplitTextProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const chars = Array.from(text);

  if (reduce) {
    return (
      // @ts-expect-error dynamic tag
      <as className={className}>{text}</as>
    );
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  const child: Variants = {
    hidden: { opacity: from.opacity ?? 0, y: from.y ?? 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const Tag = motion[as] as typeof motion.p;

  return (
    <Tag
      ref={ref as never}
      className={className}
      variants={container}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      aria-label={text}
      style={{ display: "inline-block" }}
    >
      {chars.map((c, i) => (
        <motion.span
          key={i}
          variants={child}
          style={{ display: "inline-block", whiteSpace: "pre" }}
          aria-hidden
        >
          {c}
        </motion.span>
      ))}
    </Tag>
  );
}

/** Convenience: a state hook so consumers can react to mount (used by demos). */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
