"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import Scene3D from "./Scene3D";

function Board() {
  const g = useRef<Group>(null);
  useFrame((_, delta) => {
    if (g.current) {
      g.current.rotation.x = Math.sin(Date.now() * 0.0002) * 0.15;
      g.current.rotation.y += delta * 0.08;
    }
  });

  const traces = useMemo(() => {
    const list: { points: [number, number, number][]; color: string }[] = [];
    for (let i = 0; i < 12; i++) {
      const y = -2 + i * 0.35;
      const points: [number, number, number][] = [];
      let x = -3;
      while (x < 3) {
        points.push([x, y, 0]);
        x += 0.3 + Math.random() * 0.4;
        points.push([x, y, 0]);
        if (Math.random() > 0.6) {
          const ny = y + (Math.random() > 0.5 ? 0.2 : -0.2);
          points.push([x, ny, 0]);
        }
      }
      list.push({ points, color: i % 3 === 0 ? "#4ce2d0" : i % 3 === 1 ? "#7c5cff" : "#ad97ff" });
    }
    return list;
  }, []);

  const chips = useMemo(() => {
    const list: { pos: [number, number, number]; size: [number, number] }[] = [];
    for (let i = 0; i < 18; i++) {
      list.push({
        pos: [-2.5 + Math.random() * 5, -1.8 + Math.random() * 3.6, 0.02],
        size: [0.1 + Math.random() * 0.25, 0.1 + Math.random() * 0.2],
      });
    }
    return list;
  }, []);

  return (
    <group ref={g}>
      {/* Base board */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[6.6, 4.4, 0.1]} />
        <meshStandardMaterial color="#0a0e1f" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Traces */}
      {traces.map((t, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={t.points.length}
              array={new Float32Array(t.points.flat())}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={t.color} linewidth={1.5} toneMapped={false} transparent opacity={0.9} />
        </line>
      ))}

      {/* Chips */}
      {chips.map((c, i) => (
        <mesh key={i} position={c.pos}>
          <boxGeometry args={[c.size[0], c.size[1], 0.04]} />
          <meshStandardMaterial
            color="#1a1f3a"
            emissive={i % 4 === 0 ? "#4ce2d0" : "#000000"}
            emissiveIntensity={i % 4 === 0 ? 1.2 : 0}
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function CircuitBoard({ className }: { className?: string }) {
  return (
    <Scene3D className={className} camera={{ position: [0, 0, 7], fov: 42 }}>
      <Board />
    </Scene3D>
  );
}