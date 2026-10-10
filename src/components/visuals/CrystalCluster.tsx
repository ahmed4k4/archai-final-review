"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment } from "@react-three/drei";
import type { Mesh, Group } from "three";
import Scene3D from "./Scene3D";

function Shard({
  position,
  rotation,
  scale = 1,
  color = "#7c5cff",
  speed = 1,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color?: string;
  speed?: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.15 * speed;
      ref.current.rotation.y += delta * 0.22 * speed;
    }
  });
  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
        <octahedronGeometry args={[0.8, 0]} />
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          roughness={0.15}
          metalness={0.75}
          distort={0.15}
          speed={1.6}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  );
}

function Cluster() {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.08;
  });
  return (
    <group ref={ref}>
      <Shard position={[1.2, 0.6, 0]} scale={1.4} color="#7c5cff" />
      <Shard position={[-1.4, -0.5, 0.5]} scale={1} color="#4ce2d0" speed={-1} />
      <Shard position={[0.6, -1.3, -0.5]} scale={0.8} color="#9275ff" />
      <Shard position={[-0.8, 1.4, -0.3]} scale={0.9} color="#ad97ff" speed={-0.8} />
      <Shard position={[0.2, 0.1, 1]} scale={0.6} color="#5ff5e0" />
      <Shard position={[-1.6, 1, 0.4]} scale={0.7} color="#6742f0" />
    </group>
  );
}

export default function CrystalCluster({ className }: { className?: string }) {
  return (
    <Scene3D className={className} camera={{ position: [0, 0, 6.5], fov: 42 }}>
      <Cluster />
      <Environment preset="city" />
    </Scene3D>
  );
}