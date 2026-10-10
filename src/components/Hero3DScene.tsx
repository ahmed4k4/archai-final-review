"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  Environment,
  Sparkles,
  Preload,
  AdaptiveDpr,
} from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import type { Mesh, Group } from "three";

/* ============================================================
   CORE — Morphing icosahedron with distortion
   ============================================================ */
function Core({ reduceMotion }: { reduceMotion: boolean | null }) {
  const ref = useRef<Mesh>(null);
  useFrame((state, delta) => {
    if (reduceMotion || !ref.current) return;
    ref.current.rotation.x += delta * 0.12;
    ref.current.rotation.y += delta * 0.18;
    const s = 1 + Math.sin(state.clock.elapsedTime * 1.4) * 0.04;
    ref.current.scale.setScalar(s);
  });
  return (
    <Float
      speed={reduceMotion ? 0 : 1.3}
      rotationIntensity={reduceMotion ? 0 : 0.25}
      floatIntensity={reduceMotion ? 0 : 0.7}
    >
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.1, 6]} />
        <MeshDistortMaterial
          color="#7c5cff"
          emissive="#4022a8"
          emissiveIntensity={0.55}
          roughness={0.15}
          metalness={0.85}
          distort={0.35}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

/* ============================================================
   WIREFRAME SHELL — Outer wireframe
   ============================================================ */
function Shell({ reduceMotion }: { reduceMotion: boolean | null }) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (reduceMotion || !ref.current) return;
    ref.current.rotation.y -= delta * 0.15;
    ref.current.rotation.x += delta * 0.08;
  });
  return (
    <mesh ref={ref} scale={1.35}>
      <icosahedronGeometry args={[1.1, 1]} />
      <meshBasicMaterial
        color="#4ce2d0"
        wireframe
        transparent
        opacity={0.42}
        toneMapped={false}
      />
    </mesh>
  );
}

/* ============================================================
   RINGS — Orbital rings
   ============================================================ */
function Ring({
  radius,
  color,
  tilt,
  speed = 1,
  reduceMotion,
}: {
  radius: number;
  color: string;
  tilt: number;
  speed?: number;
  reduceMotion: boolean | null;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (reduceMotion || !ref.current) return;
    ref.current.rotation.z += delta * 0.35 * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0.2, 0]}>
      <torusGeometry args={[radius, 0.015, 16, 200]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2.2}
        metalness={0.9}
        roughness={0.15}
      />
    </mesh>
  );
}

/* ============================================================
   ORBITERS — Small spheres on orbits
   ============================================================ */
function Orbiter({
  radius,
  speed,
  color,
  tilt = 0,
  phase = 0,
  reduceMotion,
}: {
  radius: number;
  speed: number;
  color: string;
  tilt?: number;
  phase?: number;
  reduceMotion: boolean | null;
}) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (reduceMotion || !ref.current) return;
    const t = state.clock.elapsedTime * speed + phase;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius;
  });
  return (
    <group rotation={[tilt, 0, 0]}>
      <group ref={ref}>
        <mesh>
          <sphereGeometry args={[0.1, 24, 24]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2}
            metalness={0.9}
            roughness={0.1}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

/* ============================================================
   FLOATING SHARDS — Small crystals
   ============================================================ */
function FloatingShard({
  position,
  scale = 0.2,
  color,
  reduceMotion,
  speed = 1,
}: {
  position: [number, number, number];
  scale?: number;
  color: string;
  reduceMotion: boolean | null;
  speed?: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (reduceMotion || !ref.current) return;
    ref.current.rotation.x += delta * 0.3 * speed;
    ref.current.rotation.y += delta * 0.4 * speed;
  });
  return (
    <Float
      speed={reduceMotion ? 0 : 1.6}
      rotationIntensity={reduceMotion ? 0 : 0.5}
      floatIntensity={reduceMotion ? 0 : 1.2}
    >
      <mesh ref={ref} position={position} scale={scale}>
        <octahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          metalness={0.85}
          roughness={0.15}
        />
      </mesh>
    </Float>
  );
}

/* ============================================================
   SCENE — Composed
   ============================================================ */
function Scene() {
  const reduceMotion = useReducedMotion();
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (reduceMotion || !groupRef.current) return;
    const { x, y } = state.pointer;
    groupRef.current.rotation.y += (x * 0.3 - groupRef.current.rotation.y) * 0.04;
    groupRef.current.rotation.x += (-y * 0.2 - groupRef.current.rotation.x) * 0.04;
  });

  return (
    <group ref={groupRef}>
      <Core reduceMotion={reduceMotion} />
      <Shell reduceMotion={reduceMotion} />

      <Ring radius={1.7} color="#4ce2d0" tilt={1.2} reduceMotion={reduceMotion} />
      <Ring radius={2.2} color="#ad97ff" tilt={0.5} speed={-0.8} reduceMotion={reduceMotion} />
      <Ring radius={2.7} color="#5ff5e0" tilt={0.9} speed={1.2} reduceMotion={reduceMotion} />

      <Orbiter radius={1.7} speed={0.7} color="#4ce2d0" tilt={1.2} reduceMotion={reduceMotion} />
      <Orbiter radius={2.2} speed={-0.5} color="#ad97ff" tilt={0.5} phase={1.5} reduceMotion={reduceMotion} />
      <Orbiter radius={2.7} speed={0.4} color="#5ff5e0" tilt={0.9} phase={3} reduceMotion={reduceMotion} />

      <FloatingShard position={[2.4, 0.9, 0.3]} color="#b8fff4" reduceMotion={reduceMotion} speed={1.2} />
      <FloatingShard position={[-2.2, -0.7, 0.4]} color="#ad97ff" reduceMotion={reduceMotion} speed={-0.8} />
      <FloatingShard position={[1.6, -2, 0.2]} color="#7c5cff" reduceMotion={reduceMotion} speed={1.5} scale={0.15} />

      <Sparkles
        count={90}
        scale={6.5}
        size={2.2}
        speed={reduceMotion ? 0 : 0.24}
        color="#b5fff5"
        opacity={0.7}
      />
    </group>
  );
}

/* ============================================================
   ROOT — Canvas
   ============================================================ */
export default function Hero3DScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.5], fov: 40 }}
      dpr={[1, 1.6]}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      }}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 4, 4]} intensity={1.4} color="#ad97ff" />
      <pointLight position={[-4, -3, 2]} intensity={2} color="#4ce2d0" />
      <pointLight position={[3, 3, -3]} intensity={1.2} color="#ff6b9d" />

      <Scene />

      <Environment preset="city" />
      <Preload all />
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}