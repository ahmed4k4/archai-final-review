"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * RotatingText — React Bits style component.
 * Cycles through a list of phrases with a smooth vertical swap.
 * Reduced-motion renders only the first phrase.
 */
export default function RotatingText({
  items,
  className,
  interval = 2600,
}: {
  items: string[];
  className?: string;
  interval?: number;
}) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce || items.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % items.length), interval);
    return () => clearInterval(t);
  }, [reduce, items.length, interval]);

  if (reduce) return <span className={className}>{items[0]}</span>;

  return (
    <span
      className={`relative inline-grid overflow-hidden align-bottom ${className ?? ""}`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={i}
          initial={{ y: "1em", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-1em", opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="col-start-1 row-start-1"
        >
          {items[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
