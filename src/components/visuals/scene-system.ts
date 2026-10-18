import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { damp3, damp } from "maath/easing";
import * as THREE from "three";
import { Vector3 } from "three";
import type { Group, Object3D } from "three";

/* ================================================================== *
 * scene-system.ts — the three.js-dependent half of the scene toolkit.
 *
 * The PURE constants (palette, colours, easings, PRNG, sphere lattice,
 * scroll config) now live in `./scene-tokens`, which imports NOTHING from
 * three.js. They are re-exported below so every scene keeps importing from
 * this single module — while lightweight consumers (the route-transition
 * overlay in the shared layout) import from `./scene-tokens` directly and
 * therefore never pull three.js into the First-Load bundle.
 * ================================================================== */

export {
  PALETTE,
  COLORS,
  HEX,
  MOTION,
  EASINGS,
  SCROLL_CONFIG,
  mulberry32,
  spherePoints,
} from "./scene-tokens";

/* LOCAL binding: `useReveal` below uses EASINGS as its default easing. */
import { EASINGS } from "./scene-tokens";

/* ---- Everything below depends on three.js ------------------------ */

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
 * GEOMETRY HELPERS — depend on three.js Vector3.
 * ================================================================== */

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
