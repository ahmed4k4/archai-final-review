"use client";
import { useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Spotlight — React Bits style component.
 * A soft radial highlight follows the pointer across the child surface — ideal
 * for glass cards. Reduced-motion keeps a static (centred) highlight.
 */
export default function Spotlight({
  children,
  className,
  color = "rgba(46,210,255,0.28)",
  size = 320,
}: {
  children: ReactNode;
  className?: string;
  color?: string;
  size?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [visible, setVisible] = useState(false);

  const onMove = (e: React.MouseEvent) => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };

  return (
    <div
      ref={ref}
      className={`relative ${className ?? ""}`}
      onMouseMove={onMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        aria-hidden
        animate={{ opacity: visible && !reduce ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: `radial-gradient(${size}px circle at ${pos.x}% ${pos.y}%, ${color}, transparent 70%)`,
        }}
      />
    </div>
  );
}
