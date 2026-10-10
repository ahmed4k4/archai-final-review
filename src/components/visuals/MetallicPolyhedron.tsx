"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import type { Mesh } from "three";
import Scene3D from "./Scene3D";

function Form() {
  const ref = useRef<Mesh>(null);
  const inner = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.2;
      ref.current.rotation.y += delta * 0.32;
    }
    if (inner.current) {
      inner.current.rotation.x -= delta * 0.15;
      inner.current.rotation.y -= delta * 0.22;
    }
  });
  return (
    <>
      <Float speed={1.2} rotationIntensity={0.35} floatIntensity={0.8}>
        <mesh ref={ref}>
          <icosahedronGeometry args={[1.5, 1]} />
          <meshStandardMaterial
            color="#0a0e1f"
            emissive="#4ce2d0"
            emissiveIntensity={0.35}
            metalness={0.95}
            roughness={0.15}
            flatShading
          />
        </mesh>
        <mesh ref={inner} scale={0.72}>
          <icosahedronGeometry args={[1.5, 3]} />
          <meshStandardMaterial
            color="#4ce2d0"
            emissive="#4ce2d0"
            emissiveIntensity={1.6}
            wireframe
            transparent
            opacity={0.55}
          />
        </mesh>
      </Float>
    </>
  );
}

export default function MetallicPolyhedron({ className }: { className?: string }) {
  return (
    <Scene3D className={className} camera={{ position: [0, 0, 6], fov: 40 }}>
      <Form />
    </Scene3D>
  );
}