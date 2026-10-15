"use client";
import { useEffect, useId, useRef, useState } from "react";
import DynamicVisual, { type VisualName } from "./DynamicVisual";
import { useActiveScene } from "./ActiveSceneContext";

/**
 * ViewportVisual — mounts a heavy WebGL scene only while it is the *active*
 * scene (the registered element nearest the centre of the viewport). Combined
 * with the section scenes through ActiveSceneProvider, this guarantees exactly
 * ONE WebGL context is alive at any moment across the whole page — the single
 * most effective guard against renderer / GPU-context exhaustion.
 *
 * Falls back to always-mounted when there is no provider (a page with a single
 * scene).
 */
export default function ViewportVisual({
  name,
  className,
  margin = "0px",
}: {
  name: VisualName;
  className?: string;
  /** How far outside the viewport the canvas may stay mounted. */
  margin?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const id = useId();
  const ctx = useActiveScene();
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: margin, threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);

  useEffect(() => {
    const el = host.current;
    if (!el || !ctx) return;
    ctx.register(id, el);
    return () => ctx.unregister(id);
  }, [ctx, id]);

  const isActive = ctx ? ctx.activeId === id : true;
  const [holding, setHolding] = useState(false);
  useEffect(() => {
    if (!inView || !isActive || !ctx) {
      if (ctx && holding) ctx.release(id);
      setHolding(false);
      return;
    }
    if (ctx.acquire(id)) setHolding(true);
    return () => ctx.release(id);
  }, [inView, isActive, ctx, id, holding]);

  /* Mounted only while it is in the viewport AND holds the single WebGL slot. */
  const mounted = ctx ? holding : inView;

  return (
    <div ref={host} className={className}>
      {mounted ? (
        <DynamicVisual name={name} className="absolute inset-0" />
      ) : null}
    </div>
  );
}
