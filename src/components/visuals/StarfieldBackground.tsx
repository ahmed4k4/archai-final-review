"use client";
import { useEffect, useRef } from "react";

/* ==================================================================== *
 * StarfieldBackground — realistic deep-space field, Canvas 2D only.
 *
 * Chosen over WebGL deliberately: a full-screen background does not need
 * a GPU context (the page's single WebGL canvas belongs to the hero), so
 * this runs on a 2D context — cheaper, cooler, and available even when
 * WebGL is disabled.
 *
 *   a) 800 stars spread in DEPTH (near + far), 0.5–2px, three tints
 *      (silver / arc blue / white), twinkling at different speeds and a
 *      scroll parallax where nearer stars move faster.
 *   b) 8 realistic shooting stars — a gradient line (arc → transparent)
 *      with a long glowing trail, launched from 30°–60° angles, 1.5–2.5s
 *      each, 3–8s apart, leaving small sparks as they pass.
 *   c) 3 nebula blobs (radial-gradient, arc blue + silver, 0.03–0.05)
 *      drifting slowly over 40–60s.
 *   d) A faint 60×60px grid at 0.02 opacity.
 *
 * Pauses on document.hidden and when scrolled out of view; respects
 * prefers-reduced-motion (renders one static frame); dpr-aware; ~60fps.
 * ==================================================================== */

const BRAND = {
  carbon: "#141A1F",
  silver: "#CCD3DA",
  arc: "#2ED2FF",
  white: "#F6F8FA",
} as const;

type Star = {
  x: number;
  y: number;
  r: number;
  depth: number; // 0 = far, 1 = near
  color: string;
  twSpeed: number;
  twPhase: number;
  baseAlpha: number;
};

type Meteor = {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
  life: number;
  maxLife: number;
  next: number;
};

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
};

export default function StarfieldBackground({
  className = "",
  starCount = 420,
  meteorCount = 3,
  reducedCount = 220,
}: {
  className?: string;
  starCount?: number;
  meteorCount?: number;
  /** Lighter budget used on small screens / reduced motion. */
  reducedCount?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    /* PERFORMANCE BUDGET
     *   mobile  → 100 stars, no meteors   (PageSpeed Moto G budget)
     *   desktop → 420 stars, 3 meteors    (was 800 / 8)
     *   reduce  → static single frame
     * The full field (800 stars + 8 meteors + 3 full-screen nebula
     * gradients + a 60px grid) repainted every frame was one of the
     * largest constant costs on the page. */
    const COUNT = reduce ? reducedCount : isMobile ? 100 : starCount;
    const METEORS = reduce ? 0 : isMobile ? 0 : meteorCount;

    let w = 0;
    let h = 0;
    let dpr = 1;
    const stars: Star[] = [];
    const meteors: Meteor[] = [];
    const sparks: Spark[] = [];
    let scrollY = 0;
    let running = true;
    let raf = 0;
    let last = performance.now();
    let nextMeteorAt = 1200;

    /* Static layers (grid + nebulae) never change between resizes — the
       nebula drift is imperceptibly slow, so we render them ONCE into an
       offscreen canvas and blit it each frame. This removes 3 full-screen
       radial-gradient fills and ~60 stroke calls from the 60fps path. */
    let staticLayer: HTMLCanvasElement | null = null;

    function buildStaticLayer() {
      const c = document.createElement("canvas");
      c.width = Math.floor(w * dpr);
      c.height = Math.floor(h * dpr);
      const s = c.getContext("2d");
      if (!s) return;
      s.setTransform(dpr, 0, 0, dpr, 0, 0);

      /* faint 60px grid */
      s.strokeStyle = "rgba(204, 211, 218, 0.02)";
      s.lineWidth = 1;
      const g = 60;
      for (let x = 0; x < w; x += g) {
        s.beginPath();
        s.moveTo(x, 0);
        s.lineTo(x, h);
        s.stroke();
      }
      for (let y = 0; y < h; y += g) {
        s.beginPath();
        s.moveTo(0, y);
        s.lineTo(w, y);
        s.stroke();
      }

      /* three nebula blobs, drawn once */
      const nebula = [
        { cx: 0.25, cy: 0.25, r: 0.5, color: "46, 210, 255", o: 0.05 },
        { cx: 0.78, cy: 0.68, r: 0.55, color: "204, 211, 218", o: 0.04 },
        { cx: 0.5, cy: 0.95, r: 0.6, color: "46, 210, 255", o: 0.035 },
      ];
      nebula.forEach((n) => {
        const cx = n.cx * w;
        const cy = n.cy * h;
        const rad = n.r * Math.max(w, h);
        const grad = s.createRadialGradient(cx, cy, 0, cx, cy, rad);
        grad.addColorStop(0, `rgba(${n.color}, ${n.o})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        s.fillStyle = grad;
        s.fillRect(0, 0, w, h);
      });

      staticLayer = c;
    }

    const rng = (() => {
      let a = 1337 >>> 0;
      return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    })();

    const palette = [BRAND.silver, BRAND.arc, BRAND.white];

    function resize() {
      /* Cap the device-pixel-ratio to 1 on small screens so the full-screen
         background canvas stays cheap; keep [1,2] on larger displays. */
      const maxDpr = window.innerWidth < 768 ? 1 : 2;
      dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
      buildStaticLayer();
    }

    function buildStars() {
      stars.length = 0;
      for (let i = 0; i < COUNT; i++) {
        const depth = rng();
        const near = depth > 0.72;
        stars.push({
          x: rng() * w,
          y: rng() * h,
          r: 0.5 + depth * 1.5,
          depth,
          color: near
            ? palette[Math.floor(rng() * palette.length)]
            : BRAND.silver,
          twSpeed: 0.4 + rng() * 2.2,
          twPhase: rng() * Math.PI * 2,
          baseAlpha: 0.35 + rng() * 0.55,
        });
      }
    }

    function spawnMeteor() {
      if (meteors.length >= METEORS) return;
      const angle = (30 + rng() * 30) * (Math.PI / 180); // 30°–60°
      const fromLeft = rng() > 0.5;
      const dirX = fromLeft ? Math.cos(angle) : -Math.cos(angle);
      const speed = 700 + rng() * 500;
      const maxLife = 1.5 + rng() * 1.0;
      meteors.push({
        active: true,
        x: fromLeft ? -40 : w + 40,
        y: rng() * h * 0.5,
        vx: dirX * speed,
        vy: Math.sin(angle) * speed * 0.55,
        len: 120 + rng() * 180,
        life: 0,
        maxLife,
        next: 0,
      });
    }

    function drawMeteor(m: Meteor, dt: number) {
      m.life += dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      const t = m.life / m.maxLife;
      const alpha = Math.sin(Math.min(1, t) * Math.PI) * 0.95;
      const speedMag = Math.hypot(m.vx, m.vy) || 1;
      const tx = m.x - (m.vx / speedMag) * m.len;
      const ty = m.y - (m.vy / speedMag) * m.len;

      const grad = ctx!.createLinearGradient(m.x, m.y, tx, ty);
      grad.addColorStop(0, `rgba(138, 232, 255, ${alpha})`);
      grad.addColorStop(0.35, `rgba(46, 210, 255, ${alpha * 0.5})`);
      grad.addColorStop(1, "rgba(46, 210, 255, 0)");
      ctx!.strokeStyle = grad;
      ctx!.lineWidth = 2;
      ctx!.lineCap = "round";
      ctx!.beginPath();
      ctx!.moveTo(m.x, m.y);
      ctx!.lineTo(tx, ty);
      ctx!.stroke();

      // bright head
      ctx!.fillStyle = `rgba(246, 248, 250, ${alpha})`;
      ctx!.beginPath();
      ctx!.arc(m.x, m.y, 2.2, 0, Math.PI * 2);
      ctx!.fill();

      // spark trail
      if (rng() > 0.75) {
        sparks.push({
          x: m.x,
          y: m.y,
          vx: (rng() - 0.5) * 60,
          vy: (rng() - 0.5) * 60,
          life: 0,
          maxLife: 0.5 + rng() * 0.5,
        });
      }

      if (m.life >= m.maxLife) {
        m.active = false;
        m.next = 3 + rng() * 5; // 3–8s between meteors
      }
    }

    function frame(now: number) {
      /* Stop scheduling frames entirely while paused — the previous version
         kept requesting frames even when hidden/out-of-view, which kept the
         main thread busy for nothing. */
      if (!running) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      ctx!.clearRect(0, 0, w, h);

      /* --- static grid + nebulae, pre-rendered once --- */
      if (staticLayer) {
        ctx!.drawImage(
          staticLayer,
          0,
          0,
          w * dpr,
          h * dpr,
          0,
          0,
          w,
          h,
        );
      }

      const time = now / 1000;

      /* --- a) stars with twinkle + parallax --- */
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const par = scrollY * (0.02 + s.depth * 0.12);
        let y = s.y - par;
        y = ((y % h) + h) % h;
        const tw = 0.5 + 0.5 * Math.sin(time * s.twSpeed + s.twPhase);
        const alpha = s.baseAlpha * (0.3 + tw * 0.7);
        ctx!.globalAlpha = alpha;
        ctx!.fillStyle = s.color;
        ctx!.beginPath();
        ctx!.arc(s.x, y, s.r, 0, Math.PI * 2);
        ctx!.fill();
        // glow on brighter stars
        if (s.depth > 0.85 && tw > 0.7) {
          ctx!.globalAlpha = alpha * 0.25;
          ctx!.beginPath();
          ctx!.arc(s.x, y, s.r * 3.2, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
      ctx!.globalAlpha = 1;

      /* --- b) meteors --- */
      nextMeteorAt -= dt * 1000;
      if (
        nextMeteorAt <= 0 &&
        meteors.filter((m) => m.active).length < METEORS
      ) {
        spawnMeteor();
        nextMeteorAt = 400 + rng() * 900;
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        if (m.active) {
          drawMeteor(m, dt);
        } else {
          m.next -= dt;
          if (m.next <= 0) {
            meteors.splice(i, 1);
          }
        }
      }

      /* --- sparks --- */
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.life += dt;
        sp.x += sp.vx * dt;
        sp.y += sp.vy * dt;
        const a = 1 - sp.life / sp.maxLife;
        if (a <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx!.globalAlpha = a * 0.8;
        ctx!.fillStyle = BRAND.arc;
        ctx!.beginPath();
        ctx!.arc(sp.x, sp.y, 1.1, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
    }

    /* --- visibility + scroll --- */
    const onScroll = () => {
      scrollY = window.scrollY || window.pageYOffset || 0;
    };
    const onVisibility = () => {
      running = !document.hidden;
      last = performance.now();
      /* Restart the loop when the tab becomes visible again. */
      if (running && !raf && !reduce) raf = requestAnimationFrame(frame);
    };

    let io: IntersectionObserver | null = null;
    const host = canvas.parentElement;
    if (host) {
      io = new IntersectionObserver(
        ([entry]) => {
          running = entry.isIntersecting && !document.hidden;
          last = performance.now();
          if (running && !raf && !reduce) raf = requestAnimationFrame(frame);
        },
        { threshold: 0 },
      );
      io.observe(host);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onScroll, { passive: true });

    resize();
    onScroll();

    if (reduce) {
      /* Single static frame — no animation loop. */
      frame(performance.now());
      running = false;
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
    };
  }, [starCount, meteorCount, reducedCount]);

  return (
    <div
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${className}`}
      aria-hidden
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
