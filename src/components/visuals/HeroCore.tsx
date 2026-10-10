"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  MeshTransmissionMaterial,
  Sparkles,
  Environment,
  Lightformer,
} from "@react-three/drei";
import type { Mesh, Group } from "three";
import Scene3D from "./Scene3D";
import { PALETTE } from "./scene-utils";

/**
 * Hero centrepiece — a refraction-glass core wrapped in a wireframe shell,
 * orbited by light-loaded rings and floating shards.
 *
 * Two nested meshes: an inner `MeshDistortMaterial` that breaths (visible
 * through the glass) and an outer `MeshTransmissionMaterial` that refracts it.
 * The distorted inner form is what makes the glass read as «alive».
 */
function Core() {
  const outer = useRef<Mesh>(null);
  const inner = useRef<Mesh>(null);
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (outer.current) {
      outer.current.rotation.x += delta * 0.08;
      outer.current.rotation.y += delta * 0.12;
      outer.current.scale.setScalar(1 + Math.sin(t * 1.2) * 0.03);
    }
    if (inner.current) {
      inner.current.rotation.y -= delta * 0.2;
      inner.current.scale.setScalar(0.78 + Math.sin(t * 2) * 0.05);
    }
  });
  return (
    <Float speed={1.3} rotationIntensity={0.25} floatIntensity={0.7}>
      {/* refractive glass shell */}
      <mesh ref={outer}>
        <icosahedronGeometry args={[1.15, 6]} />
        <MeshTransmissionMaterial
          transmission={1}
          thickness={2}
          roughness={0.05}
          chromaticAberration={0.5}
          anisotropy={0.3}
          distortion={0.4}
          distortionScale={0.3}
          temporalDistortion={0.15}
          ior={1.5}
          color={PALETTE.violet}
          samples={8}
          resolution={256}
          backside
        />
      </mesh>
      {/* inner breathing form, seen through the glass */}
      <mesh ref={inner}>
        <icosahedronGeometry args={[1.15, 5]} />
        <MeshDistortMaterial
          color={PALETTE.violetDeep}
          emissive={PALETTE.violet}
          emissiveIntensity={1.6}
          roughness={0.2}
          metalness={0.6}
          distort={0.42}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

function Shell() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y -= delta * 0.15;
    ref.current.rotation.x += delta * 0.07;
  });
  return (
    <mesh ref={ref} scale={1.35}>
      <icosahedronGeometry args={[1.15, 2]} />
      <meshBasicMaterial
        color={PALETTE.mint}
        wireframe
        transparent
        opacity={0.35}
        toneMapped={false}
      />
    </mesh>
  );
}

function Ring({
  radius,
  color,
  tilt,
  speed = 1,
}: {
  radius: number;
  color: string;
  tilt: number;
  speed?: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.28 * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0.2, 0]}>
      <torusGeometry args={[radius, 0.012, 16, 200]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2.5}
        metalness={0.9}
        roughness={0.15}
      />
    </mesh>
  );
}

function Orbiter({
  radius,
  speed,
  color,
  tilt,
  phase,
  size = 0.1,
}: {
  radius: number;
  speed: number;
  color: string;
  tilt: number;
  phase: number;
  size?: number;
}) {
  const ref = useRef<Group>(null);
  const sphere = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed + phase;
    ref.current.position.set(Math.cos(t) * radius, 0, Math.sin(t) * radius);
    /* each orbiter pulses as it swings past the camera */
    if (sphere.current) {
      const glow = (Math.sin(t * 2) + 1) / 2;
      sphere.current.scale.setScalar(0.85 + glow * 0.5);
    }
  });
  return (
    <group rotation={[tilt, 0, 0]}>
      <group ref={ref}>
        <mesh ref={sphere}>
          <sphereGeometry args={[size, 20, 20]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2.4}
            metalness={0.9}
            roughness={0.1}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

function Shard({
  position,
  scale,
  color,
  speed,
}: {
  position: [number, number, number];
  scale: number;
  color: string;
  speed: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.3 * speed;
    ref.current.rotation.y += delta * 0.42 * speed;
  });
  return (
    <Float speed={1.6} rotationIntensity={0.5} floatIntensity={1.2}>
      <mesh ref={ref} position={position} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.1}
          metalness={0.85}
          roughness={0.12}
        />
      </mesh>
    </Float>
  );
}

const RINGS = [
  { r: 1.9, color: PALETTE.mint, tilt: 1.2, speed: 1 },
  { r: 2.3, color: PALETTE.violetSoft, tilt: 0.5, speed: -0.8 },
  { r: 2.7, color: PALETTE.mintSoft, tilt: 0.9, speed: 1.2 },
  { r: 3.1, color: PALETTE.violet, tilt: 0.3, speed: -0.9 },
  { r: 3.5, color: PALETTE.rose, tilt: 1.6, speed: 0.7 },
];

const SHARDS: { position: [number, number, number]; scale: number; color: string; speed: number }[] = [
  { position: [2.3, 1.1, 0.4], scale: 0.28, color: PALETTE.mintSoft, speed: 1.2 },
  { position: [-2.1, -0.9, 0.5], scale: 0.22, color: PALETTE.violetSoft, speed: -0.9 },
  { position: [1.5, -2.1, 0.2], scale: 0.18, color: PALETTE.violet, speed: 1.6 },
  { position: [-1.8, 1.8, -0.6], scale: 0.2, color: PALETTE.rose, speed: -1.3 },
  { position: [2.1, -0.4, -1.1], scale: 0.15, color: PALETTE.mint, speed: 1.1 },
  { position: [-2.4, 0.3, 0.9], scale: 0.24, color: PALETTE.violetDeep, speed: -0.7 },
  { position: [0.4, 2.4, -0.8], scale: 0.17, color: PALETTE.mintSoft, speed: 1.4 },
];

export default function HeroCore({ className }: { className?: string }) {
  return (
    <Scene3D className={className} camera={{ position: [0, 0, 7.6], fov: 42 }}>
      {/* ── Five-source light rig for realistic reflections ── */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={2.5} color={PALETTE.violetSoft} />
      <pointLight position={[-5, -3, 2]} intensity={3} color={PALETTE.mint} />
      <pointLight position={[3, -3, -3]} intensity={2} color={PALETTE.rose} />
      <spotLight position={[0, 8, 2]} angle={0.5} penumbra={0.8} intensity={3} color="#ffffff" />
      <spotLight position={[0, -8, 2]} angle={0.6} penumbra={0.9} intensity={2} color={PALETTE.violet} />

      {/* Studio HDRI built from Lightformers — no external asset needed */}
      <Environment resolution={256}>
        <Lightformer intensity={2} color="#ffffff" position={[0, 5, -9]} scale={[10, 10, 1]} />
        <Lightformer intensity={3} color={PALETTE.violet} position={[-5, 1, -1]} scale={[10, 2, 1]} />
        <Lightformer intensity={2.5} color={PALETTE.mint} position={[5, -1, 1]} scale={[10, 2, 1]} />
        <Lightformer intensity={1.5} color={PALETTE.rose} position={[0, -5, 2]} scale={[10, 2, 1]} />
      </Environment>

      <Core />
      <Shell />
      {RINGS.map((r, i) => (
        <Ring
          key={`r${i}`}
          radius={r.r}
          color={r.color}
          tilt={r.tilt}
          speed={r.speed}
        />
      ))}
      {RINGS.flatMap((r, i) =>
        [0, 1].map((k) => (
          <Orbiter
            key={`o${i}-${k}`}
            radius={r.r}
            speed={r.speed * (k === 0 ? 0.8 : -0.6)}
            color={r.color}
            tilt={r.tilt}
            phase={k * Math.PI + i}
            size={k === 0 ? 0.1 : 0.07}
          />
        )),
      )}
      {SHARDS.map((s, i) => (
        <Shard key={`s${i}`} {...s} />
      ))}
      <Sparkles
        count={150}
        scale={8}
        size={2}
        speed={0.3}
        color={PALETTE.mintSoft}
        opacity={0.7}
      />
    </Scene3D>
  );
}
