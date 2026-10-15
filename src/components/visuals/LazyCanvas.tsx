"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * LazyCanvas — only mounts its children (a WebGL scene) once the host element
 * scrolls near the viewport, and unmounts when it is far away. This is how we
 * can afford a distinct 3D scene per homepage section without paying for every
 * canvas at once.
 *
 * A CSS fallback (gradient + grid) shows in the placeholder so layout and
 * colour identity never disappear, and is what a device without WebGL keeps.
 */
export default function LazyCanvas({
  children,
  className,
  fallbackTint = "#2ED2FF",
  rootMargin = "200px",
  keepMounted = true,
}: {
  children: ReactNode;
  className?: string;
  fallbackTint?: string;
  rootMargin?: string;
  keepMounted?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
        else if (!keepMounted) setVisible(false);
      },
      { rootMargin, threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, keepMounted]);

  return (
    <div
      ref={host}
      className={`relative ${className ?? ""}`}
      style={{ ["--lazy-tint" as string]: fallbackTint }}
    >
      {/* Always-present CSS identity; the canvas paints over it once ready. */}
      <div className="lazy-fallback absolute inset-0" aria-hidden />
      {visible ? <div className="absolute inset-0">{children}</div> : null}
    </div>
  );
}
