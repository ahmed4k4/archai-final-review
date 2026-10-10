"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import type { Group, Mesh } from "three";
import Scene3D from "./Scene3D";

function Card({
  position,
  rotation,
  color,
  delay = 0,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  delay?: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime + delay;
      ref.current.position.y = position[1] + Math.sin(t * 0.8) * 0.15;
    }
  });
  return (
    <group ref={ref} position={position} rotation={rotation}>
      <RoundedBox args={[1.6, 2.2, 0.08]} radius={0.12} smoothness={4}>
        <meshPhysicalMaterial
          color="#0a0e1f"
          emissive={color}
          emissiveIntensity={0.15}
          metalness={0.6}
          roughness={0.25}
          clearcoat={0.8}
          clearcoatRoughness={0.15}
        />
      </RoundedBox>
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[1.4, 2]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function FloatingCards({ className }: { className?: string }) {
  const g = useRef<Group>(null);
  useFrame((_, delta) => {
    if (g.current) g.current.rotation.y += delta * 0.1;
  });
  return (
    <Scene3D className={className} camera={{ position: [0, 0, 8], fov: 45 }}>
      <group ref={g}>
        <Card position={[0, 0, 0]} rotation={[0, 0, 0]} color="#7c5cff" />
        <Card position={[-2.2, 0.4, -0.6]} rotation={[0, 0.4, -0.15]} color="#4ce2d0" delay={1} />
        <Card position={[2.2, -0.3, -0.6]} rotation={[0, -0.4, 0.15]} color="#ad97ff" delay={2} />
        <Card position={[0, -1.6, -1.2]} rotation={[0.2, 0, 0]} color="#5ff5e0" delay={3} />
      </group>
    </Scene3D>
  );
}