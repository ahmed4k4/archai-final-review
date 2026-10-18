"use client";
import { Canvas, type CanvasProps, useThree, useFrame } from "@react-three/fiber";
import { Preload, AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import {
  Component,
  Suspense,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Shared scroll-progress ref (0 → 1) for the scene's host element.
 * Scenes read `.current` inside useFrame — no React re-renders per frame.
 */
export type ScrollRef = MutableRefObject<number>;

/** Tracks how far the scene's container has moved through the viewport. */
export function useElementScroll(
  elRef: MutableRefObject<HTMLElement | null>,
  progress: ScrollRef,
) {
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const total = r.height + window.innerHeight;
      const passed = window.innerHeight - r.top;
      progress.current = Math.min(1, Math.max(0, passed / total));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [elRef, progress]);
}

type Props = {
  children: ReactNode;
  className?: string;
  camera?: CanvasProps["camera"];
  intensity?: number;
  /** Let the camera gently follow the pointer for depth (desktop only). */
  mouseParallax?: boolean;
  /** Provide your own lights (skips the default 4-light rig). */
  lights?: boolean;
  /** Optional post-processing composer rendered inside the Canvas. */
  composer?: ReactNode;
  /** Quality tier — "hero" raises dpr for the flagship scene. */
  tier?: "default" | "hero";
  /** Dolly the camera back as the scene scrolls out of view. */
  scrollCamera?: boolean;
  /** Explicit scroll progress ref to drive the scene itself. */
  scrollProgress?: ScrollRef;
};

/** Keep a WebGL/context error contained to this scene instead of the page. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[Scene3D] scene failed to render:", error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Subtle pointer-driven camera drift + slow breathing + optional scroll dolly. */
function CameraParallax({
  enabled,
  baseZ = 6,
  strength = 1,
  scroll,
  dolly = 0,
}: {
  enabled: boolean;
  baseZ?: number;
  strength?: number;
  scroll?: ScrollRef;
  dolly?: number;
}) {
  const { camera } = useThree();
  useFrame((state, delta) => {
    const t = 1 - Math.pow(0.001, delta); // frame-rate independent ease
    if (enabled) {
      const x = state.pointer.x * 0.9 * strength;
      const y = state.pointer.y * 0.5 * strength;
      camera.position.x += (x - camera.position.x) * t * 0.6;
      camera.position.y += (y - camera.position.y) * t * 0.6;
    }
    const p = scroll?.current ?? 0;
    const targetZ = baseZ + Math.sin(state.clock.elapsedTime * 0.5) * 0.1 + p * dolly;
    camera.position.z += (targetZ - camera.position.z) * t * 0.6;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Scene3D({
  children,
  className,
  camera = { position: [0, 0, 6], fov: 42 },
  intensity = 1,
  mouseParallax = true,
  lights = true,
  composer,
  tier = "default",
  scrollCamera = false,
  scrollProgress,
}: Props) {
  const reduce = useReducedMotion();
  const [mobile, setMobile] = useState<boolean | null>(null);
  const [onScreen, setOnScreen] = useState(true);
  const hostRef = useRef<HTMLDivElement>(null);
  const internalScroll = useRef(0);
  const scroll = scrollProgress ?? internalScroll;

  useEffect(() => {
    setMobile(window.matchMedia("(max-width: 767px)").matches);
  }, []);

  useElementScroll(hostRef, scroll);

  /* Pause the whole render loop when the scene leaves the viewport.
     `frameloop="never"` stops rAF entirely — the canvas keeps its last
     frame instead of burning CPU/GPU while scrolled away. */
  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: "120px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* dpr is fixed to 1 on phones — a decorative canvas gains nothing from 2x
     while the fragment cost scales with dpr². Desktop keeps a soft ramp. */
  const isMobile = mobile === true;
  const dpr: [number, number] = isMobile
    ? [1, 1]
    : tier === "hero"
      ? [1, 1.75]
      : [1, 1.4];

  /* "never" freezes the loop; "always" runs it; "demand" renders a single
     frame for reduced-motion users. */
  const frameloop = reduce ? "demand" : onScreen ? "always" : "never";

  const baseZ = (camera as { position?: [number, number, number] })?.position?.[2] ?? 6;

  /* frameloop="demand" yields a frozen frame under reduced-motion. */
  return (
    <div ref={hostRef} className={className} style={{ width: "100%", height: "100%" }}>
      <SceneBoundary>
        <Canvas
          camera={camera}
          dpr={dpr}
          frameloop={frameloop}
          gl={{
            alpha: true,
            /* MSAA is a per-pixel cost the whole page pays for; the scenes
               are soft/bloomed so the aliasing is invisible — off everywhere. */
            antialias: false,
            powerPreference: "high-performance",
            preserveDrawingBuffer: false,
            stencil: false,
            depth: true,
          }}
          style={{ pointerEvents: "none", width: "100%", height: "100%" }}
        >
          {lights && (
            <>
              <ambientLight intensity={0.75 * intensity} />
              <directionalLight position={[4, 4, 4]} intensity={1.4 * intensity} color="#8AE8FF" />
              <pointLight position={[-4, -3, 2]} intensity={1.6 * intensity} color="#2ED2FF" />
              <pointLight position={[3, 3, -3]} intensity={1.1 * intensity} color="#C48A5C" />
            </>
          )}
          <CameraParallax
            enabled={mouseParallax && !reduce}
            baseZ={baseZ}
            strength={tier === "hero" ? 1 : 0.6}
            scroll={scrollCamera ? scroll : undefined}
            dolly={scrollCamera ? 3.2 : 0}
          />
          <Suspense fallback={null}>{children}</Suspense>
          {/* Post-processing is skipped on mobile and under reduced-motion for a
              stable frame rate on mid-range devices. */}
          {!reduce && !isMobile && composer}
          <Preload all />
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
        </Canvas>
      </SceneBoundary>
    </div>
  );
}