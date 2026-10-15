"use client";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useId, useRef, useState } from "react";
import { useActiveScene } from "./ActiveSceneContext";
import type { SectionSceneName } from "./SectionScenes";

/**
 * SectionScene — renders one content-specific 3D scene, but only while its
 * section is the active one (the nearest to the centre of the viewport). This
 * keeps a single WebGL context alive across the whole page, which is both the
 * biggest performance win and a hard requirement on devices that cap the number
 * of live contexts. A CSS placeholder holds the space and colour identity the
 * rest of the time, so the layout never jumps.
 */
const scenes = {
  DigitalCoreScene: dynamic(
    () => import("./SectionScenes").then((m) => m.DigitalCoreScene),
    { ssr: false },
  ),
  DisciplinesScene: dynamic(
    () => import("./SectionScenes").then((m) => m.DisciplinesScene),
    { ssr: false },
  ),
  IndustriesScene: dynamic(
    () => import("./SectionScenes").then((m) => m.IndustriesScene),
    { ssr: false },
  ),
  ProcessScene3D: dynamic(
    () => import("./SectionScenes").then((m) => m.ProcessScene3D),
    { ssr: false },
  ),
  TechStackScene: dynamic(
    () => import("./SectionScenes").then((m) => m.TechStackScene),
    { ssr: false },
  ),
  WhyUsScene: dynamic(
    () => import("./SectionScenes").then((m) => m.WhyUsScene),
    { ssr: false },
  ),
  FinalPortalScene: dynamic(
    () => import("./SectionScenes").then((m) => m.FinalPortalScene),
    { ssr: false },
  ),
  CategoryGridScene: dynamic(
    () => import("./SectionScenes").then((m) => m.CategoryGridScene),
    { ssr: false },
  ),
  PortfolioGridScene: dynamic(
    () => import("./SectionScenes").then((m) => m.PortfolioGridScene),
    { ssr: false },
  ),
} satisfies Record<
  SectionSceneName,
  React.ComponentType<{ className?: string }>
>;

export default function SectionScene({
  name,
  className,
  tint = "#2ED2FF",
  enabled = true,
}: {
  name: SectionSceneName;
  className?: string;
  tint?: string;
  /** When false, only the CSS identity panel is shown (no WebGL). */
  enabled?: boolean;
  keepMounted?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const id = useId();
  const ctx = useActiveScene();
  const Scene = scenes[name];
  const isActive = ctx ? ctx.activeId === id : true;

  /* Mount only when (a) this scene has been the active one for a beat, so any
     previous canvas has fully torn down, and (b) it can claim the single WebGL
     slot. This guarantees at most ONE live WebGL context page-wide. */
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!isActive) {
      setReady(false);
      return;
    }
    const t = setTimeout(() => setReady(true), 220);
    return () => clearTimeout(t);
  }, [isActive]);

  const [holding, setHolding] = useState(false);
  useEffect(() => {
    if (!ready || !ctx) {
      if (ctx && holding) ctx.release(id);
      setHolding(false);
      return;
    }
    if (ctx.acquire(id)) setHolding(true);
    return () => {
      ctx.release(id);
    };
  }, [ready, ctx, id, holding]);

  useEffect(() => {
    const el = host.current;
    if (!el || !ctx) return;
    ctx.register(id, el);
    return () => ctx.unregister(id);
  }, [ctx, id]);

  const show = enabled && (ctx ? holding : true);

  return (
    <div
      ref={host}
      className={`relative ${className ?? ""}`}
      style={{ ["--lazy-tint" as string]: tint }}
    >
      <div className="lazy-fallback absolute inset-0" aria-hidden />
      {show ? (
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <Scene className="absolute inset-0" />
          </Suspense>
        </div>
      ) : null}
    </div>
  );
}
