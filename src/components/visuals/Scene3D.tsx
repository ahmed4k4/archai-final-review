"use client";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { Preload, AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import { Suspense, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  camera?: CanvasProps["camera"];
  dpr?: CanvasProps["dpr"];
  intensity?: number;
};

export default function Scene3D({
  children,
  className,
  camera = { position: [0, 0, 6], fov: 42 },
  dpr = [1, 1.8],
  intensity = 1,
}: Props) {
  return (
    <div className={className}>
      <Canvas
        camera={camera}
        dpr={dpr}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.8 * intensity} />
        <directionalLight position={[4, 4, 4]} intensity={1.2 * intensity} color="#ad97ff" />
        <pointLight position={[-4, -3, 2]} intensity={1.5 * intensity} color="#4ce2d0" />
        <Suspense fallback={null}>{children}</Suspense>
        <Preload all />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Canvas>
    </div>
  );
}