import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { damp3, damp } from "maath/easing";
import * as THREE from "three";
import { Vector3 } from "three";
import type { Group, Object3D } from "three";

/* ================================================================== *
 * PALETTE — one source of truth for every scene.
 * Each hue carries base / light / dark / emissive so materials never
 * have to hard-code a hex again.
 *
 * Brand palette only: Carbon · Panel · Silver · Arc Blue · Copper.
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

  /* ---- Legacy aliases --------------------------------------------
     Some scenes reference PALETTE.violet / .mint / .gold. Kept as
     aliases so those files compile, but they resolve to the OFFICIAL
     brand palette. */
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

/**
 * Flat colour shortcuts — the single source of truth for scenes that want
 * a plain hex string (e.g. `COLORS.arc`) instead of the nested tokens.
 * Derived from PALETTE so both stay in sync forever.
 */
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

  /* ---- Legacy aliases --------------------------------------------
     Older scenes reference violet/mint/gold/rose keys. They are kept
     as aliases so those files keep compiling, but every value now
     resolves to the OFFICIAL brand palette (no violet/mint/rose in
     the actual output). */
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
 * MOTION — rotation / pulse speed constants so every scene moves in
 * the same register instead of at arbitrary speeds.
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
 * SPRING HELPERS — damp-based smoothing via maath, frame-rate safe.
 * ================================================================== */

/** Smoothly damp a vec3 object (a `group.position`, etc.) toward a target. */
export function useDampVec3(
  ref: React.RefObject<Object3D>,
  target: [number, number, number],
  smoothTime = 0.5,
) {
  useFrame((_, delta) => {
    if (!ref.current) return;
    damp3(ref.current.position, target, smoothTime, delta);
  });
}

/** Smoothly damp a single scalar toward `target` (returns a ref of the value). */
export function useDampScalar(target: number, smoothTime = 0.5) {
  const value = useRef(0);
  useFrame((_, delta) => {
    damp(value, "current", target, smoothTime, delta);
  });
  return value;
}

/** Smoothly damp a group's rotation toward a target Euler. */
export function useDampRotation(
  ref: React.RefObject<Object3D>,
  target: [number, number, number],
  smoothTime = 0.6,
) {
  const cur = useRef(new Vector3());
  const tgt = useRef(new Vector3(target[0], target[1], target[2]));
  useFrame((_, delta) => {
    tgt.current.set(target[0], target[1], target[2]);
    damp3(cur.current, tgt.current, smoothTime, delta);
    if (ref.current)
      ref.current.rotation.set(cur.current.x, cur.current.y, cur.current.z);
  });
}

/**
 * A staged 0→1 reveal, driven inside useFrame.
 * Returns a getter that maps elapsed seconds → eased progress (0–1).
 */
export function useReveal(
  duration: number,
  delay = 0,
  easing: (t: number) => number = EASINGS.outExpo,
) {
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    elapsed.current += delta;
  });
  return () =>
    easing(Math.min(1, Math.max(0, (elapsed.current - delay) / duration)));
}

/* ================================================================== *
 * MATERIAL PRESETS — consistent PBR across scenes.
 * ================================================================== */

export const MATERIAL = {
  /** Dark anodised metal — the "hardware" look. */
  metalDark: { color: "#141A1F", metalness: 0.95, roughness: 0.15 },
  /** Polished accent metal. */
  metalAccent: (hex: string) => ({
    color: hex,
    metalness: 0.9,
    roughness: 0.18,
  }),
  /** Emissive "energy" surface. */
  energy: (hex: string, intensity = 2) => ({
    color: hex,
    emissive: hex,
    emissiveIntensity: intensity,
    toneMapped: false,
  }),
  /** Glass / transmission preset (use with <MeshTransmissionMaterial>). */
  glass: {
    transmission: 1,
    thickness: 2.4,
    roughness: 0.04,
    ior: 1.5,
    chromaticAberration: 0.5,
    anisotropy: 0.35,
    distortion: 0.25,
    distortionScale: 0.2,
    temporalDistortion: 0.08,
    samples: 8,
    resolution: 384,
    backside: true,
  } as const,
  /** Soft plastic/ceramic shell for beveled product shapes. */
  shell: (hex: string) => ({
    color: hex,
    metalness: 0.55,
    roughness: 0.28,
    clearcoat: 1,
    clearcoatRoughness: 0.2,
  }),
} as const;

/* ================================================================== *
 * SCROLL_CONFIG — a shared vocabulary for scroll-driven scenes.
 * Every page uses the same 0→1 progress contract so scenes stay
 * consistent while their *behaviour* stays unique.
 * ================================================================== */

export const SCROLL_CONFIG = {
  /** Multiplier applied to rotation speed as the section scrolls through. */
  spinBoost: 2.4,
  /** How far the camera dollies back at full scroll (world units). */
  cameraDolly: 3.2,
  /** Max extra spread applied to orbital rings. */
  ringSpread: 0.55,
  /** Max upward drift of background layers (parallax). */
  parallax: { back: 0.15, mid: 0.4, content: 1, fore: 1.8 },
  /** Reveal window used by section cards (fraction of viewport). */
  reveal: { start: 0.92, end: 0.55 },
} as const;

/* ================================================================== *
 * GEOMETRY / RANDOM HELPERS
 * Unified here (was scene-utils.ts) so there is exactly one visual
 * module: palettes, motion, easings, helpers.
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

/** A smooth curve through points — used for connecting lines between nodes. */
export function curveBetween(a: THREE.Vector3, b: THREE.Vector3, bow = 0.35) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  mid.normalize().multiplyScalar(mid.length() * (1 + bow));
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  return curve.getPoints(40);
}

/** Sample a point along a bezier at t in [0,1]. */
export function pointOnCurve(points: THREE.Vector3[], t: number) {
  const clamped = Math.min(Math.max(t, 0), 1);
  const idx = clamped * (points.length - 1);
  const i = Math.floor(idx);
  const f = idx - i;
  const a = points[i];
  const b = points[Math.min(i + 1, points.length - 1)];
  if (!a || !b) return new THREE.Vector3();
  return a.clone().lerp(b, f);
}

export type { Vector3, Group };
