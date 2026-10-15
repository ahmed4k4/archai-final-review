"use client";
import { useEffect } from "react";
import Lenis from "lenis";

type LenisWindow = Window & { __lenis?: Lenis };

/*
 * A module-level singleton. React StrictMode mounts every component twice in
 * development, and a per-mount Lenis whose destroy() runs on the first unmount
 * resets the scroll position and tears down the classes mid-scroll. Creating it
 * once and reusing it across remounts keeps scrolling stable.
 */
let lenisInstance: Lenis | null = null;

function getLenis(): Lenis | null {
  if (typeof window === "undefined") return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  if (lenisInstance) return lenisInstance;

  lenisInstance = new Lenis({
    duration: 1.1,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6,
    wheelMultiplier: 1,
    autoRaf: true,
  });
  (window as LenisWindow).__lenis = lenisInstance;
  return lenisInstance;
}

/**
 * SmoothScroll — Lenis-powered inertia scrolling for the whole site.
 *
 * Lenis owns its own requestAnimationFrame loop (autoRaf), so we do NOT also
 * drive it from gsap.ticker — two rafs double-step the interpolation and the
 * page snaps back to the top.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;

    /* Smooth in-page anchor navigation (header + CTA links). */
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest?.(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -90 });
    };
    document.addEventListener("click", onClick);

    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
