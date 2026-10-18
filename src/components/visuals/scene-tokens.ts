/* ================================================================== *
 * scene-tokens.ts — PURE, THREE-FREE constants.
 *
 * This module MUST NOT import `three`, `@react-three/fiber`, or `maath`.
 * It exists so that lightweight consumers (e.g. the route-transition
 * overlay in the shared layout) can read the brand colours WITHOUT pulling
 * the entire Three.js library into the First-Load JS bundle.
 *
 * `scene-system.ts` re-exports everything here, so scene files keep
 * importing from a single place — but webpack no longer drags three.js
 * into any chunk that only needs a hex string.
 * ================================================================== */

/* ================================================================== *
 * PALETTE — one source of truth for every scene.
 * ================================================================== */

export const PALETTE = {
  arc: {
    base: "#2ED2FF",
    light: "#8AE8FF",
    dark: "#0E90B8",
    emissive: "#2ED2FF",
  },
  silver: {
    base: "#CCD3DA",
    light: "#F6F8FA",
    dark: "#78848F",
    emissive: "#B4BEC7",
  },
  copper: {
    base: "#C48A5C",
    light: "#E4C1A2",
    dark: "#8E5A36",
    emissive: "#C48A5C",
  },
  carbon: {
    base: "#1B2228",
    light: "#2A333B",
    dark: "#141A1F",
    emissive: "#38424B",
  },
  ink: { base: "#F6F8FA", muted: "#CCD3DA", dim: "#78848F" },

  /* ---- Legacy aliases -------------------------------------------- */
  violet: {
    base: "#2ED2FF",
    light: "#8AE8FF",
    dark: "#0E90B8",
    emissive: "#2ED2FF",
  },
  mint: {
    base: "#2ED2FF",
    light: "#8AE8FF",
    dark: "#0E90B8",
    emissive: "#2ED2FF",
  },
  gold: {
    base: "#C48A5C",
    light: "#E4C1A2",
    dark: "#8E5A36",
    emissive: "#C48A5C",
  },
  rose: {
    base: "#C48A5C",
    light: "#E4C1A2",
    dark: "#8E5A36",
    emissive: "#C48A5C",
  },
} as const;

/** Flat colour shortcuts — derived from PALETTE so both stay in sync. */
export const COLORS = {
  arc: PALETTE.arc.base,
  arcDeep: PALETTE.arc.dark,
  arcSoft: PALETTE.arc.light,
  silver: PALETTE.silver.base,
  silverSoft: PALETTE.silver.light,
  copper: PALETTE.copper.base,
  copperSoft: PALETTE.copper.light,
  carbon: PALETTE.carbon.base,
  panel: PALETTE.carbon.light,
  ink: "#141A1F",

  /* ---- Legacy aliases -------------------------------------------- */
  violet: PALETTE.arc.base,
  violetSoft: PALETTE.arc.light,
  violetDeep: PALETTE.arc.dark,
  mint: PALETTE.arc.base,
  mintSoft: PALETTE.arc.light,
  mintDeep: PALETTE.arc.dark,
  gold: PALETTE.copper.base,
  rose: PALETTE.copper.base,
  white: PALETTE.silver.light,
} as const;

/** Flat hex shortcuts (still used by a few older helpers). */
export const HEX = {
  arc: PALETTE.arc.base,
  arcLight: PALETTE.arc.light,
  arcDark: PALETTE.arc.dark,
  silver: PALETTE.silver.base,
  silverLight: PALETTE.silver.light,
  copper: PALETTE.copper.base,
  copperLight: PALETTE.copper.light,
  carbon: PALETTE.carbon.base,
  ink: "#141A1F",
} as const;

/* ================================================================== *
 * MOTION — rotation / pulse speed constants.
 * ================================================================== */

export const MOTION = {
  slow: 0.06,
  base: 0.15,
  fast: 0.3,
  breath: 0.4,
  orbit: 0.2,
} as const;

/* ================================================================== *
 * EASINGS — hand-rolled so we don't add a library.
 * ================================================================== */

export const EASINGS = {
  expo: (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  back: (t: number) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2),
  elastic: (t: number) =>
    t === 0 || t === 1
      ? t
      : -Math.pow(2, 10 * t - 10) *
        Math.sin(((t * 10 - 10.75) * (Math.PI * 2)) / 3),
  outExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOut: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
} as const;

/* ================================================================== *
 * SCROLL_CONFIG — a shared vocabulary for scroll-driven scenes.
 * ================================================================== */

export const SCROLL_CONFIG = {
  spinBoost: 2.4,
  cameraDolly: 3.2,
  ringSpread: 0.55,
  parallax: { back: 0.15, mid: 0.4, content: 1, fore: 1.8 },
  reveal: { start: 0.92, end: 0.55 },
} as const;

/* ================================================================== *
 * RANDOM HELPERS — pure math, no three.js.
 * ================================================================== */

/** Deterministic PRNG so scenes look identical on every render/hydration. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Evenly distributed points on a sphere (fibonacci lattice). */
export function spherePoints(
  count: number,
  radius: number,
): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const golden = Math.PI * (1 + Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1 || 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    pts.push([
      Math.cos(theta) * r * radius,
      y * radius,
      Math.sin(theta) * r * radius,
    ]);
  }
  return pts;
}
