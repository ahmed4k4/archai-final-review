"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sphere } from "@react-three/drei";
import type { Mesh, Group } from "three";
import Scene3D from "./Scene3D";

function Ring({ radius, color, tilt, speed = 1 }: { radius: number; color: string; tilt: number; speed?: number }) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.3 * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.015, 16, 200]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.4} metalness={0.9} roughness={0.15} />
    </mesh>
  );
}

function Orbiter({
  radius,
  speed,
  color,
  tilt = 0,
  phase = 0,
}: {
  radius: number;
  speed: number;
  color: string;
  tilt?: number;
  phase?: number;
}) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed + phase;
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;
    }
  });
  return (
    <group rotation={[tilt, 0, 0]}>
      <group ref={ref}>
        <Sphere args={[0.12, 24, 24]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} metalness={0.9} roughness={0.1} />
        </Sphere>
      </group>
    </group>
  );
}

function Core() {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.004;
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.05;
      ref.current.scale.setScalar(s);
    }
  });
  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.85, 4]} />
        <meshStandardMaterial color="#7c5cff" emissive="#4022a8" emissiveIntensity={0.6} metalness={0.7} roughness={0.2} />
      </mesh>
    </Float>
  );
}

export default function OrbitSystem({ className }: { className?: string }) {
  return (
    <Scene3D className={className}>
      <Core />
      <Ring radius={1.9} color="#4ce2d0" tilt={1.2} />
      <Ring radius={2.4} color="#9275ff" tilt={0.4} speed={-0.7} />
      <Ring radius={2.9} color="#5ff5e0" tilt={0.9} speed={1.2} />
      <Orbiter radius={1.9} speed={0.8} color="#4ce2d0" tilt={1.2} />
      <Orbiter radius={2.4} speed={-0.6} color="#ad97ff" tilt={0.4} phase={1.5} />
      <Orbiter radius={2.9} speed={0.5} color="#5ff5e0" tilt={0.9} phase={3} />
    </Scene3D>
  );
}