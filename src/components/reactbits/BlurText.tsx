"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/**
 * BlurText — React Bits style component.
 * Words fade in from blur as the element enters the viewport. Reduced-motion
 * renders plain text.
 */
export default function BlurText({
  text,
  className,
  delay = 0.08,
  animateBy = "words",
}: {
  text: string;
  className?: string;
  delay?: number;
  animateBy?: "words" | "chars";
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const items = animateBy === "words" ? text.split(" ") : Array.from(text);

  if (reduce) return <p className={className}>{text}</p>;

  return (
    <p ref={ref} className={className} style={{ display: "inline-block" }}>
      {items.map((item, i) => (
        <motion.span
          key={i}
          initial={{ filter: "blur(10px)", opacity: 0, y: 12 }}
          animate={
            inView
              ? { filter: "blur(0px)", opacity: 1, y: 0 }
              : { filter: "blur(10px)", opacity: 0, y: 12 }
          }
          transition={{
            duration: 0.6,
            delay: i * delay,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {item}
          {animateBy === "words" && i < items.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </p>
  );
}

/** React Bits style hook used by a couple of the components below. */
export function useSplitText() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
}
