"use client";
import { Canvas, type CanvasProps, useThree, useFrame } from "@react-three/fiber";
import { Preload, AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import { Component, Suspense, useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

type Props = {
  children: ReactNode;
  className?: string;
  camera?: CanvasProps["camera"];
  intensity?: number;
  /** Let the camera gently follow the pointer for depth (desktop only). */
  mouseParallax?: boolean;
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

/** Subtle pointer-driven camera drift. Disabled under reduced-motion. */
function CameraParallax({ enabled }: { enabled: boolean }) {
  const { camera } = useThree();
  useFrame((state, delta) => {
    if (!enabled) return;
    const t = 1 - Math.pow(0.001, delta); // frame-rate independent ease
    const x = state.pointer.x * 0.9;
    const y = state.pointer.y * 0.5;
    camera.position.x += (x - camera.position.x) * t * 0.6;
    camera.position.y += (y - camera.position.y) * t * 0.6;
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
}: Props) {
  const reduce = useReducedMotion();
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(window.matchMedia("(max-width: 767px)").matches);
  }, []);

  /* frameloop="demand" yields a frozen frame under reduced-motion. */
  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <SceneBoundary>
        <Canvas
          camera={camera}
          dpr={mobile ? [1, 1.2] : [1, 1.5]}
          frameloop={reduce ? "demand" : "always"}
          gl={{ alpha: true, antialias: !mobile, powerPreference: "high-performance" }}
          style={{ pointerEvents: "none", width: "100%", height: "100%" }}
        >
          <ambientLight intensity={0.75 * intensity} />
          <directionalLight position={[4, 4, 4]} intensity={1.4 * intensity} color="#ad97ff" />
          <pointLight position={[-4, -3, 2]} intensity={1.6 * intensity} color="#4ce2d0" />
          <pointLight position={[3, 3, -3]} intensity={1.1 * intensity} color="#ff6b9d" />
          <CameraParallax enabled={mouseParallax && !reduce && !mobile} />
          <Suspense fallback={null}>{children}</Suspense>
          <Preload all />
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
        </Canvas>
      </SceneBoundary>
    </div>
  );
}