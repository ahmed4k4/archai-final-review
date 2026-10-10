"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { Points as PointsType, Group } from "three";
import { Points, PointMaterial } from "@react-three/drei";
import Scene3D from "./Scene3D";

function Stream({ offset, color }: { offset: number; color: string }) {
  const ref = useRef<PointsType>(null);
  const positions = useMemo(() => {
    const count = 400;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (i / count) * 14 - 7;
      arr[i * 3 + 1] = Math.sin(i * 0.3 + offset) * 0.4 + offset * 0.15;
      arr[i * 3 + 2] = Math.cos(i * 0.2 + offset) * 0.5;
    }
    return arr;
  }, [offset]);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.x = Math.sin(state.clock.elapsedTime * 0.3 + offset) * 0.4;
    }
  });
  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial transparent color={color} size={0.06} sizeAttenuation depthWrite={false} toneMapped={false} />
    </Points>
  );
}

export default function DataStreams({ className }: { className?: string }) {
  const g = useRef<Group>(null);
  useFrame((_, delta) => {
    if (g.current) g.current.rotation.z += delta * 0.02;
  });
  return (
    <Scene3D className={className} camera={{ position: [0, 0, 8], fov: 50 }}>
      <group ref={g}>
        <Stream offset={0} color="#7c5cff" />
        <Stream offset={2} color="#4ce2d0" />
        <Stream offset={4} color="#ad97ff" />
        <Stream offset={6} color="#5ff5e0" />
      </group>
    </Scene3D>
  );
}