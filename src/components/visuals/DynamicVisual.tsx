"use client";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const registry: Record<string, ComponentType<{ className?: string }>> = {
  CrystalCluster: dynamic(() => import("./CrystalCluster"), { ssr: false, loading: () => null }),
  OrbitSystem: dynamic(() => import("./OrbitSystem"), { ssr: false, loading: () => null }),
  ParticleGlobe: dynamic(() => import("./ParticleGlobe"), { ssr: false, loading: () => null }),
  MetallicPolyhedron: dynamic(() => import("./MetallicPolyhedron"), { ssr: false, loading: () => null }),
  GlassBubbles: dynamic(() => import("./GlassBubbles"), { ssr: false, loading: () => null }),
  NeonRings: dynamic(() => import("./NeonRings"), { ssr: false, loading: () => null }),
  AICore: dynamic(() => import("./AICore"), { ssr: false, loading: () => null }),
  CircuitBoard: dynamic(() => import("./CircuitBoard"), { ssr: false, loading: () => null }),
  FloatingCards: dynamic(() => import("./FloatingCards"), { ssr: false, loading: () => null }),
  DataStreams: dynamic(() => import("./DataStreams"), { ssr: false, loading: () => null }),
};

export type VisualName = keyof typeof registry;

export default function DynamicVisual({ name, className }: { name: VisualName; className?: string }) {
  const Comp = registry[name];
  if (!Comp) return null;
  return <Comp className={className} />;
}