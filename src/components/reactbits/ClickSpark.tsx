"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * ClickSpark — React Bits style component.
 * Emits a burst of coloured sparks from the pointer on click. The canvas is a
 * cheap 2D overlay; it is skipped entirely under reduced-motion.
 */
export default function ClickSpark({
  children,
  className,
  sparkColor = "#2ED2FF",
  sparkCount = 10,
}: {
  children: ReactNode;
  className?: string;
  sparkColor?: string;
  sparkCount?: number;
}) {
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparks = useRef<
    {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      color: string;
    }[]
  >([]);
  const raf = useRef(0);
  const [active, setActive] = useState(false);
  const colors = [sparkColor, "#2ED2FF", "#C48A5C", "#C48A5C"];

  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const loop = () => {
      raf.current = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      sparks.current = sparks.current.filter((s) => s.life > 0);
      if (!sparks.current.length) {
        if (active) setActive(false);
        return;
      }
      sparks.current.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.18;
        s.vx *= 0.98;
        s.life -= 0.025;
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };
    raf.current = requestAnimationFrame(loop);

    const onClick = (e: MouseEvent) => {
      for (let i = 0; i < sparkCount; i++) {
        const a = (i / sparkCount) * Math.PI * 2 + Math.random() * 0.4;
        const speed = 2 + Math.random() * 3;
        sparks.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed - 1,
          life: 1,
          color: colors[i % colors.length],
        });
      }
      setActive(true);
    };

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, sparkColor, sparkCount]);

  if (reduce) return <>{children}</>;

  return (
    <div className={className}>
      {children}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[999]"
        aria-hidden
      />
    </div>
  );
}
