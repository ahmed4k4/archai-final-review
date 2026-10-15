"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { COLORS } from "@/components/visuals/scene-system";

/* ==================================================================== *
 * PageTransition — "Circuit Build" route transition.
 *
 * On an internal link click we:
 *   1. pause Lenis smooth-scroll,
 *   2. play a full-screen "circuit build" overlay: a carbon veil draws in,
 *      an Arc-Blue circuit tree traces itself (SVG stroke-dashoffset), a
 *      progress hairline fills, and the Archai mark pulses,
 *   3. navigate, then reveal the new page (overlay wipes out) and resume.
 *
 * Links are PREFETCHED on hover/focus (router.prefetch) so the swap feels
 * instant, and the overlay never fires for external links, in-page anchors,
 * modified clicks, or downloads.
 * ==================================================================== */

const CIRCUIT_PATHS = [
  "M0,20 H180 V90 H420 V40 H640",
  "M0,140 H120 V60 H300 V160 H520",
  "M0,240 H240 V180 H480 V260 H640",
  "M160,0 V40 M340,0 V100 M500,0 V60",
  "M120,280 V220 H360 V280 M440,280 V200 H620",
];

const ARC = COLORS.arc; // #2ED2FF
const SILVER = COLORS.silver; // #CCD3DA
const CARBON = COLORS.carbon; // #1B2228

export default function PageTransition() {
  const pathname = usePathname();
  const router = useRouter();
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---- Lenis helpers ---- */
  const pauseScroll = useCallback(() => {
    const lenis = (window as unknown as { __lenis?: { stop: () => void } })
      .__lenis;
    lenis?.stop();
  }, []);
  const resumeScroll = useCallback(() => {
    const lenis = (window as unknown as { __lenis?: { start: () => void } })
      .__lenis;
    lenis?.start();
  }, []);

  /* ---- reveal when the route actually changes ---- */
  useEffect(() => {
    if (activeRef.current) {
      // New page mounted → let the overlay wipe out, then resume scroll.
      const t = setTimeout(() => {
        setActive(false);
        activeRef.current = false;
        resumeScroll();
        window.scrollTo(0, 0);
      }, 260);
      return () => clearTimeout(t);
    }
  }, [pathname, resumeScroll]);

  /* ---- intercept internal navigations + prefetch on hover ---- */
  useEffect(() => {
    const normalize = (href: string) => {
      try {
        const u = new URL(href, window.location.origin);
        if (u.origin !== window.location.origin) return null;
        return u.pathname + u.search;
      } catch {
        return null;
      }
    };

    const onOver = (e: Event) => {
      const a = (e.target as HTMLElement)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href) return;
      const to = normalize(href);
      if (!to || to === pathname) return;
      // Prefetch the destination so navigation is instant.
      router.prefetch(to);
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = (e.target as HTMLElement)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!a) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;

      const href = a.getAttribute("href");
      if (!href) return;
      // In-page anchors are handled by SmoothScroll — ignore them.
      if (href.startsWith("#")) return;

      const to = normalize(href);
      if (!to) return;
      if (to === pathname) return;

      e.preventDefault();
      activeRef.current = true;
      setActive(true);
      pauseScroll();
      if (timer.current) clearTimeout(timer.current);
      // Give the build animation ~520ms of runway, then commit the route.
      timer.current = setTimeout(() => {
        router.push(to);
      }, 520);
    };

    document.addEventListener("mouseover", onOver, true);
    document.addEventListener("focusin", onOver, true);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("mouseover", onOver, true);
      document.removeEventListener("focusin", onOver, true);
      document.removeEventListener("click", onClick, true);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [pathname, router, pauseScroll]);

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          key="page-transition"
          className="pointer-events-none fixed inset-0 z-[9998] overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.28, ease: "easeOut" } }}
          aria-hidden
        >
          {/* Carbon veil — draws in from the top */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${CARBON} 0%, #141A1F 60%, #0E1317 100%)`,
            }}
            initial={{ y: "-100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Circuit tree — traces itself while the veil is down */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 640 280"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
          >
            <defs>
              <linearGradient id="ptGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={ARC} />
                <stop offset="70%" stopColor={ARC} />
                <stop offset="100%" stopColor={SILVER} />
              </linearGradient>
              <filter id="ptGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g filter="url(#ptGlow)">
              {CIRCUIT_PATHS.map((d, i) => (
                <motion.path
                  key={i}
                  d={d}
                  stroke="url(#ptGrad)"
                  strokeWidth={1.4}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0.2 }}
                  animate={{ pathLength: 1, opacity: 0.85 }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.06,
                    ease: "easeInOut",
                  }}
                />
              ))}
              {/* Nodes pulse as the traces reach them */}
              {[
                [180, 20],
                [420, 40],
                [300, 160],
                [480, 260],
                [120, 280],
              ].map(([cx, cy], i) => (
                <motion.circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={3}
                  fill={ARC}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.6, 1], opacity: [0, 1, 0.9] }}
                  transition={{ duration: 0.5, delay: 0.25 + i * 0.06 }}
                />
              ))}
            </g>
          </svg>

          {/* Center mark — pulses while loading */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="relative flex items-center justify-center"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.12 }}
            >
              <motion.span
                className="absolute h-20 w-20 rounded-full"
                style={{ border: `1px solid ${ARC}` }}
                animate={{ scale: [0.9, 1.35, 0.9], opacity: [0.7, 0.15, 0.7] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.span
                className="absolute h-14 w-14 rounded-full"
                style={{ border: `1px solid ${SILVER}`, opacity: 0.4 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
              />
              <span
                className="text-2xl font-semibold tracking-widest"
                style={{ color: SILVER }}
              >
                A
              </span>
            </motion.div>
          </div>

          {/* Progress hairline at the bottom */}
          <motion.div
            className="absolute bottom-0 left-0 h-[2px]"
            style={{ background: `linear-gradient(90deg, ${ARC}, ${SILVER})` }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
