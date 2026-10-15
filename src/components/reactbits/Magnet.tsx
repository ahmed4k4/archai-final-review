"use client";
import { useRef, type CSSProperties, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

/**
 * Magnet — React Bits style component.
 * The child is pulled toward the cursor within a radius, using a spring for a
 * weighty, organic feel. Reduced-motion disables the pull.
 */
export default function Magnet({
  children,
  className,
  padding = 60,
  strength = 0.35,
  disabled = false,
  style,
}: {
  children: ReactNode;
  className?: string;
  padding?: number;
  strength?: number;
  disabled?: boolean;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), {
    stiffness: 260,
    damping: 20,
    mass: 0.6,
  });
  const y = useSpring(useMotionValue(0), {
    stiffness: 260,
    damping: 20,
    mass: 0.6,
  });

  const onMove = (e: React.MouseEvent) => {
    if (disabled || reduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const range = Math.max(r.width, r.height) / 2 + padding;
    if (dist < range) {
      x.set(dx * strength);
      y.set(dy * strength);
    } else {
      x.set(0);
      y.set(0);
    }
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y, display: "inline-block", ...style }}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      {children}
    </motion.div>
  );
}
