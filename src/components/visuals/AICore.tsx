"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import type { Mesh, Group } from "three";
import Scene3D from "./Scene3D";

function Core() {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x += 0.006;
      ref.current.rotation.y += 0.008;
      const s = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.06;
      ref.current.scale.setScalar(s);
    }
  });
  return (
    <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1, 6]} />
        <MeshDistortMaterial
          color="#7c5cff"
          emissive="#4022a8"
          emissiveIntensity={1.1}
          roughness={0.15}
          metalness={0.85}
          distort={0.4}
          speed={2.2}
        />
      </mesh>
    </Float>
  );
}

function Electrons() {
  const g = useRef<Group>(null);
  useFrame((_, delta) => {
    if (g.current) g.current.rotation.y += delta * 0.4;
  });
  return (
    <group ref={g}>
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2;
        return (
          <Sphere key={i} args={[0.08, 24, 24]} position={[Math.cos(a) * 2, Math.sin(a) * 0.6, Math.sin(a) * 2]}>
            <meshStandardMaterial color="#4ce2d0" emissive="#4ce2d0" emissiveIntensity={3} toneMapped={false} />
          </Sphere>
        );
      })}
    </group>
  );
}

function Shell() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y -= delta * 0.2;
  });
  return (
    <mesh ref={ref} scale={1.35}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial color="#4ce2d0" wireframe transparent opacity={0.35} toneMapped={false} />
    </mesh>
  );
}

export default function AICore({ className }: { className?: string }) {
  return (
    <Scene3D className={className}>
      <Core />
      <Shell />
      <Electrons />
    </Scene3D>
  );
}