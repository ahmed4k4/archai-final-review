"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import Scene3D from "./Scene3D";

function Ring({ radius, color, tilt, speed = 1, opacity = 1 }: { radius: number; color: string; tilt: number; speed?: number; opacity?: number }) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.4 * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0.2, 0]}>
      <torusGeometry args={[radius, 0.02, 32, 240]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} />
    </mesh>
  );
}

export default function NeonRings({ className }: { className?: string }) {
  const rings = useMemo(
    () => [
      { r: 1.4, c: "#7c5cff", t: 0, s: 1 },
      { r: 1.8, c: "#4ce2d0", t: 1.3, s: -0.8 },
      { r: 2.2, c: "#ad97ff", t: 0.6, s: 1.2 },
      { r: 2.6, c: "#5ff5e0", t: 1.6, s: -1.1 },
      { r: 3.0, c: "#9275ff", t: 0.3, s: 0.9 },
    ],
    []
  );
  return (
    <Scene3D className={className} camera={{ position: [0, 0, 7], fov: 45 }}>
      {rings.map((ring, i) => (
        <Ring key={i} radius={ring.r} color={ring.c} tilt={ring.t} speed={ring.s} opacity={0.8} />
      ))}
    </Scene3D>
  );
}