"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import type { Group, Mesh } from "three";
import Scene3D from "./Scene3D";

function Bubble({
  position,
  scale = 1,
  delay = 0,
}: {
  position: [number, number, number];
  scale?: number;
  delay?: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime + delay;
      ref.current.position.y = position[1] + Math.sin(t * 0.6) * 0.4;
      ref.current.rotation.x += 0.002;
      ref.current.rotation.y += 0.003;
    }
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshTransmissionMaterial
        backside
        samples={4}
        thickness={0.4}
        chromaticAberration={0.4}
        anisotropy={0.3}
        distortion={0.15}
        distortionScale={0.3}
        temporalDistortion={0.1}
        color="#ad97ff"
        transmission={1}
        roughness={0.02}
        ior={1.4}
      />
    </mesh>
  );
}

function Bubbles() {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.05;
  });
  return (
    <group ref={group}>
      <Bubble position={[0, 0, 0]} scale={1.6} />
      <Bubble position={[1.6, 0.8, -0.5]} scale={0.55} delay={1} />
      <Bubble position={[-1.5, -0.4, 0.7]} scale={0.75} delay={2} />
      <Bubble position={[1, -1.2, 0.3]} scale={0.4} delay={3} />
      <Bubble position={[-1.1, 1.3, -0.4]} scale={0.5} delay={4} />
    </group>
  );
}

export default function GlassBubbles({ className }: { className?: string }) {
  return (
    <Scene3D className={className}>
      <Bubbles />
    </Scene3D>
  );
}