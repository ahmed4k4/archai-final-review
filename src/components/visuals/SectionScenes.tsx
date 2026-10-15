"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  RoundedBox,
  MeshTransmissionMaterial,
  Line,
  Environment,
  Lightformer,
} from "@react-three/drei";
import type { Group, Mesh } from "three";
import { QuadraticBezierCurve3, Vector3 } from "three";
import Scene3D from "./Scene3D";
import { PALETTE, COLORS, mulberry32 } from "./scene-system";

/* ==================================================================== *
 * Section scenes — one distinct, content-specific 3D scene per homepage
 * section. Every shape is symbolic and every object moves on three levels:
 *   internal spin/pulse · environmental orbit/float · scroll reaction.
 * ==================================================================== */

/* ------------------------------------------------------------------ *
 * 1. DIGITAL CORE — four stacked engineering layers wired together,
 *    packets travelling vertically between them.
 * ------------------------------------------------------------------ */

const LAYER_COLORS = [
  COLORS.violet,
  COLORS.mint,
  COLORS.violetSoft,
  COLORS.mint,
];

function StackLayer({ index, label }: { index: number; label: number }) {
  const group = useRef<Group>(null);
  const led = useRef<Mesh>(null);
  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * (0.2 + index * 0.05);
    group.current.position.y =
      label + Math.sin(state.clock.elapsedTime * 0.8 + index) * 0.06;
    const pulse =
      (Math.sin(state.clock.elapsedTime * 2 + index * 1.5) + 1) * 0.5;
    if (led.current) {
      const m = led.current.material as unknown as {
        emissiveIntensity: number;
      };
      m.emissiveIntensity = 0.4 + pulse * 2.2;
    }
  });
  return (
    <group ref={group} position={[0, label, 0]}>
      <RoundedBox args={[1.7, 0.34, 1.7]} radius={0.08} smoothness={6}>
        <meshStandardMaterial
          color={PALETTE.violet.dark}
          emissive={LAYER_COLORS[index]}
          emissiveIntensity={0.35}
          metalness={0.92}
          roughness={0.18}
        />
      </RoundedBox>
      {/* a chip glyph on top of each layer */}
      <RoundedBox
        args={[0.6, 0.12, 0.6]}
        radius={0.04}
        smoothness={4}
        position={[0, 0.23, 0]}
      >
        <meshStandardMaterial
          color={LAYER_COLORS[index]}
          emissive={LAYER_COLORS[index]}
          emissiveIntensity={1.4}
          metalness={0.7}
          roughness={0.2}
          toneMapped={false}
        />
      </RoundedBox>
      <mesh ref={led} position={[0.7, 0.2, 0.7]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshBasicMaterial color={LAYER_COLORS[index]} toneMapped={false} />
      </mesh>
    </group>
  );
}

function VerticalBuses() {
  const packets = useRef<(Mesh | null)[]>([]);
  const lines = useMemo(() => {
    const out: {
      curve: QuadraticBezierCurve3;
      pts: [number, number, number][];
    }[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const x = Math.cos(a) * 1.1;
      const z = Math.sin(a) * 1.1;
      const c = new QuadraticBezierCurve3(
        new Vector3(x, 1.5, z),
        new Vector3(x * 1.6, 0, z * 1.6),
        new Vector3(x, -1.5, z),
      );
      out.push({
        curve: c,
        pts: c
          .getPoints(30)
          .map((p) => [p.x, p.y, p.z] as [number, number, number]),
      });
    }
    return out;
  }, []);
  const tmp = useMemo(() => new Vector3(), []);
  useFrame((state) => {
    lines.forEach((l, i) => {
      const m = packets.current[i];
      if (!m) return;
      const t = (state.clock.elapsedTime * 0.35 + i * 0.16) % 1;
      l.curve.getPoint(t, tmp);
      m.position.copy(tmp);
      const mat = m.material as unknown as { opacity: number };
      mat.opacity = Math.sin(t * Math.PI) * 0.9;
    });
  });
  return (
    <group>
      {lines.map((l, i) => (
        <Line
          key={`l${i}`}
          points={l.pts}
          color={COLORS.mint}
          lineWidth={1}
          transparent
          opacity={0.2}
        />
      ))}
      {lines.map((_, i) => (
        <mesh
          key={`p${i}`}
          ref={(m) => {
            packets.current[i] = m;
          }}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial
            color={COLORS.mintSoft}
            transparent
            opacity={0}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export function DigitalCoreScene({ className }: { className?: string }) {
  return (
    <Scene3D
      className={className}
      camera={{ position: [3.2, 2.4, 5.2], fov: 45 }}
      intensity={1.1}
    >
      {[0, 1, 2, 3].map((i) => (
        <StackLayer key={i} index={i} label={1.5 - i * 1} />
      ))}
      <VerticalBuses />
    </Scene3D>
  );
}

/* ------------------------------------------------------------------ *
 * 2. DISCIPLINES — three distinct machines side by side:
 *    server rack · microcontroller board · neural net.
 * ------------------------------------------------------------------ */

function ServerRack() {
  const group = useRef<Group>(null);
  const leds = useRef<(Mesh | null)[]>([]);
  useFrame((state, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.15;
    leds.current.forEach((m, i) => {
      if (!m) return;
      const mat = m.material as unknown as { opacity: number };
      const on = (Math.sin(state.clock.elapsedTime * 3 + i * 0.8) + 1) * 0.5;
      mat.opacity = 0.3 + on * 0.7;
    });
  });
  return (
    <group ref={group} position={[-2.4, 0, 0]}>
      <RoundedBox args={[1.1, 2.2, 0.9]} radius={0.08} smoothness={5}>
        <meshStandardMaterial
          color={PALETTE.violet.dark}
          metalness={0.9}
          roughness={0.25}
        />
      </RoundedBox>
      {Array.from({ length: 5 }).map((_, i) => (
        <group key={i} position={[0, 0.8 - i * 0.4, 0.46]}>
          <mesh>
            <planeGeometry args={[0.8, 0.22]} />
            <meshStandardMaterial
              color={COLORS.violetDeep}
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
          <mesh
            ref={(m) => {
              leds.current[i] = m;
            }}
            position={[0.3, 0, 0.02]}
          >
            <circleGeometry args={[0.04, 12]} />
            <meshBasicMaterial
              color={COLORS.mint}
              transparent
              opacity={0.6}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function MicroBoard() {
  const group = useRef<Group>(null);
  const pins = useRef<Group>(null);
  useFrame((state, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.18;
    if (pins.current)
      pins.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
  });
  return (
    <group ref={group}>
      <RoundedBox args={[1.9, 0.12, 1.5]} radius={0.04} smoothness={4}>
        <meshStandardMaterial
          color={COLORS.mint}
          metalness={0.5}
          roughness={0.4}
        />
      </RoundedBox>
      {/* central chip */}
      <RoundedBox
        args={[0.7, 0.18, 0.7]}
        radius={0.03}
        smoothness={4}
        position={[0, 0.14, 0]}
      >
        <meshStandardMaterial
          color={PALETTE.violet.dark}
          emissive={COLORS.violet}
          emissiveIntensity={0.8}
          metalness={0.8}
          roughness={0.2}
        />
      </RoundedBox>
      {/* pins row */}
      <group ref={pins} position={[0, 0.06, 0.82]}>
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh key={i} position={[-0.8 + i * 0.18, 0, 0]}>
            <boxGeometry args={[0.04, 0.02, 0.22]} />
            <meshStandardMaterial
              color={COLORS.mint}
              metalness={1}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function NeuralNet() {
  const nodes = useMemo(() => {
    const rng = mulberry32(5);
    return Array.from({ length: 14 }).map(() => ({
      p: new Vector3(
        (rng() - 0.5) * 1.6,
        (rng() - 0.5) * 1.6,
        (rng() - 0.5) * 1.2,
      ),
      phase: rng() * Math.PI * 2,
    }));
  }, []);
  const group = useRef<Group>(null);
  const refs = useRef<(Mesh | null)[]>([]);
  const edges = useMemo(() => {
    const out: [[number, number, number], [number, number, number]][] = [];
    nodes.forEach((n, i) => {
      const b = nodes[(i + 3) % nodes.length];
      out.push([
        [n.p.x, n.p.y, n.p.z],
        [b.p.x, b.p.y, b.p.z],
      ]);
    });
    return out;
  }, [nodes]);
  useFrame((state, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.25;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const pulse =
        (Math.sin(state.clock.elapsedTime * 2.4 + nodes[i].phase) + 1) * 0.5;
      m.scale.setScalar(0.7 + pulse * 0.9);
    });
  });
  return (
    <group ref={group} position={[2.4, 0, 0]}>
      {edges.map((e, i) => (
        <Line
          key={i}
          points={e}
          color={COLORS.mintSoft}
          lineWidth={1}
          transparent
          opacity={0.25}
        />
      ))}
      {nodes.map((n, i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs.current[i] = m;
          }}
          position={[n.p.x, n.p.y, n.p.z]}
        >
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial
            color={COLORS.violetSoft}
            emissive={COLORS.violet}
            emissiveIntensity={1.4}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export function DisciplinesScene({ className }: { className?: string }) {
  const group = useRef<Group>(null);
  useFrame((state) => {
    if (group.current)
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.3;
  });
  return (
    <Scene3D
      className={className}
      camera={{ position: [0, 1.2, 6.6], fov: 46 }}
      intensity={1.05}
    >
      <group ref={group}>
        <ServerRack />
        <MicroBoard />
        <NeuralNet />
      </group>
    </Scene3D>
  );
}

/* ------------------------------------------------------------------ *
 * 3. INDUSTRIES — four machines in a ring:
 *    drone · robot arm · heartbeat · turbine.
 * ------------------------------------------------------------------ */

function Drone() {
  const rotors = useRef<(Mesh | null)[]>([]);
  const group = useRef<Group>(null);
  useFrame((state, delta) => {
    if (group.current) {
      group.current.position.y =
        0.4 + Math.sin(state.clock.elapsedTime * 1.2) * 0.12;
      group.current.rotation.y += delta * 0.3;
    }
    rotors.current.forEach((m) => {
      if (m) m.rotation.y += delta * 14;
    });
  });
  const arms: [number, number][] = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  return (
    <group ref={group}>
      <RoundedBox args={[0.5, 0.16, 0.5]} radius={0.05} smoothness={4}>
        <meshStandardMaterial
          color={PALETTE.violet.dark}
          emissive={COLORS.violet}
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.2}
        />
      </RoundedBox>
      {arms.map(([x, z], i) => (
        <group key={i}>
          <mesh position={[x * 0.35, 0, z * 0.35]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.5, 0.04, 0.05]} />
            <meshStandardMaterial
              color={COLORS.violetDeep}
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
          <mesh
            ref={(m) => {
              rotors.current[i] = m;
            }}
            position={[x * 0.55, 0.06, z * 0.55]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[0.18, 0.02, 8, 24]} />
            <meshStandardMaterial
              color={COLORS.mint}
              emissive={COLORS.mint}
              emissiveIntensity={1.2}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function RobotArm() {
  const base = useRef<Group>(null);
  const forearm = useRef<Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (base.current) base.current.rotation.y = Math.sin(t * 0.7) * 0.8;
    if (forearm.current)
      forearm.current.rotation.z = Math.sin(t * 1.1) * 0.6 - 0.4;
  });
  return (
    <group>
      <RoundedBox args={[0.7, 0.24, 0.7]} radius={0.06} smoothness={4}>
        <meshStandardMaterial
          color={PALETTE.violet.dark}
          metalness={0.9}
          roughness={0.25}
        />
      </RoundedBox>
      <group ref={base} position={[0, 0.2, 0]}>
        <RoundedBox
          args={[0.22, 0.9, 0.22]}
          radius={0.05}
          smoothness={4}
          position={[0, 0.45, 0]}
        >
          <meshStandardMaterial
            color={COLORS.violetSoft}
            emissive={COLORS.violetSoft}
            emissiveIntensity={0.4}
            metalness={0.9}
            roughness={0.2}
          />
        </RoundedBox>
        <group ref={forearm} position={[0, 0.9, 0]}>
          <RoundedBox
            args={[0.18, 0.7, 0.18]}
            radius={0.04}
            smoothness={4}
            position={[0.3, 0.1, 0]}
          >
            <meshStandardMaterial
              color={COLORS.mint}
              emissive={COLORS.mint}
              emissiveIntensity={0.6}
              metalness={0.9}
              roughness={0.2}
            />
          </RoundedBox>
        </group>
      </group>
    </group>
  );
}

function Heartbeat() {
  const heart = useRef<Mesh>(null);
  const ring = useRef<Mesh>(null);
  useFrame((state, delta) => {
    const beat = Math.pow(
      Math.max(0, Math.sin(state.clock.elapsedTime * 2.2)),
      6,
    );
    if (heart.current) {
      heart.current.scale.setScalar(0.8 + beat * 0.35);
      heart.current.rotation.y += delta * 0.4;
    }
    if (ring.current) {
      const t = (state.clock.elapsedTime * 0.6) % 1;
      ring.current.scale.setScalar(0.6 + t * 1.6);
      const m = ring.current.material as unknown as { opacity: number };
      m.opacity = (1 - t) * 0.6;
    }
  });
  return (
    <group>
      <mesh ref={heart} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry
          args={[0.5, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6]}
        />
        <meshStandardMaterial
          color={COLORS.mint}
          emissive={COLORS.mint}
          emissiveIntensity={1.4}
          metalness={0.4}
          roughness={0.25}
          side={2}
        />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1, 64]} />
        <meshBasicMaterial
          color={COLORS.mint}
          transparent
          opacity={0.4}
          side={2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function Turbine() {
  const blades = useRef<Group>(null);
  useFrame((_, delta) => {
    if (blades.current) blades.current.rotation.z += delta * 2.4;
  });
  return (
    <group>
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 1.4, 12]} />
        <meshStandardMaterial
          color={PALETTE.violet.dark}
          metalness={0.9}
          roughness={0.3}
        />
      </mesh>
      <group ref={blades} position={[0, 0.6, 0]}>
        <mesh>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial
            color={COLORS.violetSoft}
            emissive={COLORS.violetSoft}
            emissiveIntensity={1.2}
            toneMapped={false}
          />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[0, 0, (i / 3) * Math.PI * 2]}>
            <boxGeometry args={[0.06, 0.9, 0.14]} />
            <meshStandardMaterial
              color={COLORS.mint}
              emissive={COLORS.mint}
              emissiveIntensity={0.6}
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function IndustriesScene({ className }: { className?: string }) {
  const group = useRef<Group>(null);
  useFrame((state, delta) => {
    if (group.current)
      group.current.rotation.y +=
        delta * 0.12 + Math.sin(state.clock.elapsedTime * 0.1) * 0.002;
  });
  const R = 3.1;
  const place = (i: number): [number, number, number] => {
    const a = (i / 4) * Math.PI * 2;
    return [Math.cos(a) * R, 0, Math.sin(a) * R];
  };
  return (
    <Scene3D
      className={className}
      camera={{ position: [0, 3, 8], fov: 46 }}
      intensity={1.05}
    >
      <group ref={group}>
        <group position={place(0)}>
          <Drone />
        </group>
        <group position={place(1)} rotation={[0, Math.PI / 2, 0]}>
          <RobotArm />
        </group>
        <group position={place(2)}>
          <Heartbeat />
        </group>
        <group position={place(3)}>
          <Turbine />
        </group>
        {/* rotating platform */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]}>
          <ringGeometry args={[R - 0.5, R + 0.5, 96]} />
          <meshBasicMaterial
            color={COLORS.violetSoft}
            transparent
            opacity={0.12}
            side={2}
            toneMapped={false}
          />
        </mesh>
      </group>
    </Scene3D>
  );
}

/* ------------------------------------------------------------------ *
 * 4. PROCESS — a conveyor with 5 stations and a product moving along.
 * ------------------------------------------------------------------ */

function Process3D() {
  const STATIONS = 5;
  const stationX = (i: number) => (i - (STATIONS - 1) / 2) * 2.2;
  const refs = useRef<(Mesh | null)[]>([]);
  const product = useRef<Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.5;
    const cycle = t % STATIONS;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const d = Math.min(Math.abs(cycle - i), STATIONS - Math.abs(cycle - i));
      const lit = Math.max(0, 1 - d * 1.5);
      const mat = m.material as unknown as { emissiveIntensity: number };
      mat.emissiveIntensity = 0.3 + lit * 1.8;
    });
    if (product.current) {
      const i = Math.floor(cycle);
      const f = cycle - i;
      const ease = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
      const x0 = stationX(i % STATIONS);
      const x1 = stationX((i + 1) % STATIONS);
      product.current.position.set(x0 + (x1 - x0) * ease, 0.35, 0);
      product.current.rotation.y += 0.03;
    }
  });
  return (
    <group position={[0, -0.6, 0]}>
      {/* conveyor belt */}
      <RoundedBox args={[12, 0.18, 0.9]} radius={0.06} smoothness={4}>
        <meshStandardMaterial
          color={PALETTE.violet.dark}
          metalness={0.85}
          roughness={0.3}
        />
      </RoundedBox>
      {Array.from({ length: STATIONS }).map((_, i) => (
        <group key={i} position={[stationX(i), 0, 0]}>
          <RoundedBox
            ref={(m) => {
              refs.current[i] = m;
            }}
            args={[0.5, 1, 0.5]}
            radius={0.08}
            smoothness={5}
            position={[0, 0.6, 0]}
          >
            <meshStandardMaterial
              color={PALETTE.violet.dark}
              emissive={i % 2 ? COLORS.mint : COLORS.violet}
              emissiveIntensity={0.4}
              metalness={0.9}
              roughness={0.2}
            />
          </RoundedBox>
          <mesh position={[0, 1.2, 0]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshBasicMaterial color={COLORS.mintSoft} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <RoundedBox
        ref={product}
        args={[0.45, 0.45, 0.45]}
        radius={0.1}
        smoothness={5}
        position={[stationX(0), 0.35, 0]}
      >
        <meshStandardMaterial
          color={COLORS.mintSoft}
          emissive={COLORS.mint}
          emissiveIntensity={1.8}
          metalness={0.5}
          roughness={0.25}
          toneMapped={false}
        />
      </RoundedBox>
    </group>
  );
}

export function ProcessScene3D({ className }: { className?: string }) {
  return (
    <Scene3D
      className={className}
      camera={{ position: [0, 2.6, 9], fov: 44 }}
      intensity={1.05}
      mouseParallax={false}
    >
      <Process3D />
    </Scene3D>
  );
}

/* ------------------------------------------------------------------ *
 * 5. TECH STACK — a central glass core with 7 orbital rings, each a
 *    technology category carrying little satellites.
 * ------------------------------------------------------------------ */

const STACK_RINGS = [
  { r: 1.6, color: COLORS.violet, count: 6, speed: 0.5, tilt: 0.1 },
  { r: 2.0, color: COLORS.mint, count: 6, speed: -0.42, tilt: 0.5 },
  { r: 2.4, color: COLORS.violetSoft, count: 6, speed: 0.36, tilt: 0.9 },
  { r: 2.8, color: COLORS.mint, count: 6, speed: -0.3, tilt: 1.3 },
  { r: 3.2, color: COLORS.violet, count: 6, speed: 0.26, tilt: 0.3 },
  { r: 3.6, color: COLORS.mintSoft, count: 6, speed: -0.22, tilt: 0.7 },
  { r: 4.0, color: COLORS.violet, count: 6, speed: 0.18, tilt: 1.1 },
];

function StackRing({ cfg }: { cfg: (typeof STACK_RINGS)[number] }) {
  const band = useRef<Mesh>(null);
  const sats = useRef<(Group | null)[]>([]);
  useFrame((state, delta) => {
    if (band.current) band.current.rotation.z += delta * cfg.speed;
    sats.current.forEach((g, i) => {
      if (!g) return;
      const a =
        state.clock.elapsedTime * cfg.speed * 2 + (i / cfg.count) * Math.PI * 2;
      g.position.set(Math.cos(a) * cfg.r, Math.sin(a) * cfg.r, 0);
      g.rotation.y += delta * 0.5;
    });
  });
  return (
    <group rotation={[cfg.tilt, 0, 0]}>
      <mesh ref={band}>
        <torusGeometry args={[cfg.r, 0.008, 8, 128]} />
        <meshBasicMaterial
          color={cfg.color}
          transparent
          opacity={0.3}
          toneMapped={false}
        />
      </mesh>
      {Array.from({ length: cfg.count }).map((_, i) => (
        <group
          key={i}
          ref={(g) => {
            sats.current[i] = g;
          }}
        >
          <RoundedBox args={[0.12, 0.12, 0.12]} radius={0.03} smoothness={3}>
            <meshStandardMaterial
              color={PALETTE.violet.dark}
              emissive={cfg.color}
              emissiveIntensity={1.8}
              metalness={0.9}
              roughness={0.2}
              toneMapped={false}
            />
          </RoundedBox>
        </group>
      ))}
    </group>
  );
}

export function TechStackScene({ className }: { className?: string }) {
  const core = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (core.current) {
      core.current.rotation.y += delta * 0.2;
      core.current.rotation.x += delta * 0.1;
    }
  });
  return (
    <Scene3D
      className={className}
      camera={{ position: [0, 1.4, 9], fov: 46 }}
      intensity={1.05}
    >
      <mesh ref={core}>
        <icosahedronGeometry args={[0.9, 1]} />
        <MeshTransmissionMaterial
          transmission={1}
          thickness={1.6}
          roughness={0.05}
          ior={1.45}
          chromaticAberration={0.5}
          samples={6}
          resolution={256}
          color="#c9bcff"
        />
      </mesh>
      {STACK_RINGS.map((cfg, i) => (
        <StackRing key={i} cfg={cfg} />
      ))}
    </Scene3D>
  );
}

/* ------------------------------------------------------------------ *
 * 6. WHY US — six symbolic tokens arranged in a ring, each pulsing.
 * ------------------------------------------------------------------ */

const WHY_TOKENS = [
  { color: COLORS.violet, shape: "shield" },
  { color: COLORS.mint, shape: "chip" },
  { color: COLORS.violetSoft, shape: "cube" },
  { color: COLORS.mintSoft, shape: "rocket" },
  { color: COLORS.violet, shape: "ring" },
  { color: COLORS.mint, shape: "gem" },
];

function WhyToken({
  index,
  shape,
  color,
}: {
  index: number;
  shape: string;
  color: string;
}) {
  const group = useRef<Group>(null);
  const R = 2.8;
  useFrame((state, delta) => {
    if (!group.current) return;
    const a = (index / 6) * Math.PI * 2 + state.clock.elapsedTime * 0.25;
    group.current.position.set(
      Math.cos(a) * R,
      Math.sin(state.clock.elapsedTime * 0.8 + index) * 0.25,
      Math.sin(a) * R,
    );
    group.current.rotation.y += delta * 0.8;
    group.current.rotation.x += delta * 0.3;
    const pulse = (Math.sin(state.clock.elapsedTime * 1.6 + index) + 1) * 0.5;
    group.current.scale.setScalar(0.85 + pulse * 0.3);
  });
  const geo = () => {
    switch (shape) {
      case "chip":
        return <boxGeometry args={[0.5, 0.12, 0.5]} />;
      case "gem":
        return <octahedronGeometry args={[0.36, 0]} />;
      case "ring":
        return <torusGeometry args={[0.28, 0.09, 12, 32]} />;
      case "rocket":
        return <coneGeometry args={[0.26, 0.7, 6]} />;
      case "shield":
        return <cylinderGeometry args={[0.34, 0.34, 0.16, 6]} />;
      default:
        return <boxGeometry args={[0.42, 0.42, 0.42]} />;
    }
  };
  return (
    <group ref={group}>
      <RoundedBox args={[0.7, 0.7, 0.7]} radius={0.14} smoothness={4}>
        <meshStandardMaterial
          color={PALETTE.violet.dark}
          metalness={0.85}
          roughness={0.25}
        />
      </RoundedBox>
      <mesh>
        {geo()}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.6}
          metalness={0.6}
          roughness={0.2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export function WhyUsScene({ className }: { className?: string }) {
  return (
    <Scene3D
      className={className}
      camera={{ position: [0, 2.2, 8] }}
      intensity={1.05}
    >
      {WHY_TOKENS.map((t, i) => (
        <WhyToken key={i} index={i} shape={t.shape} color={t.color} />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <ringGeometry args={[2.3, 3.3, 96]} />
        <meshBasicMaterial
          color={COLORS.violetSoft}
          transparent
          opacity={0.1}
          side={2}
          toneMapped={false}
        />
      </mesh>
    </Scene3D>
  );
}

/* ------------------------------------------------------------------ *
 * 7. FINAL CTA — a luminous portal that widens with scroll.
 * ------------------------------------------------------------------ */

export function FinalPortalScene({ className }: { className?: string }) {
  const group = useRef<Group>(null);
  const inner = useRef<Mesh>(null);
  useFrame((state, delta) => {
    if (group.current) group.current.rotation.z += delta * 0.06;
    if (inner.current) {
      const pulse = (Math.sin(state.clock.elapsedTime * 1.4) + 1) * 0.5;
      inner.current.scale.setScalar(1 + pulse * 0.06);
    }
  });
  return (
    <Scene3D
      className={className}
      camera={{ position: [0, 0, 7] }}
      intensity={1.1}
      mouseParallax={false}
    >
      <group ref={group}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, (i / 4) * Math.PI]}>
            <torusGeometry
              args={[2.4 + i * 0.08, 0.05, 12, 96, Math.PI * 1.4]}
            />
            <meshStandardMaterial
              color={
                [COLORS.violet, COLORS.mint, COLORS.violetSoft, COLORS.mint][i]
              }
              emissive={
                [COLORS.violet, COLORS.mint, COLORS.violetSoft, COLORS.mint][i]
              }
              emissiveIntensity={1.6}
              metalness={0.8}
              roughness={0.2}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
      <mesh ref={inner}>
        <circleGeometry args={[1.9, 64]} />
        <meshBasicMaterial
          color={COLORS.mintSoft}
          transparent
          opacity={0.14}
          side={2}
          toneMapped={false}
        />
      </mesh>
      <Environment resolution={256}>
        <Lightformer
          intensity={2}
          color={COLORS.violet}
          position={[0, 0, -6]}
          scale={[10, 10, 1]}
        />
        <Lightformer
          intensity={2}
          color={COLORS.mint}
          position={[0, 0, 6]}
          scale={[10, 10, 1]}
        />
      </Environment>
    </Scene3D>
  );
}

/* ------------------------------------------------------------------ *
 * 8. CATEGORY — a 3×3 wall of project tiles that wave + light up.
 * ------------------------------------------------------------------ */

function CategoryGrid() {
  const refs = useRef<(Group | null)[]>([]);
  const rng = useMemo(() => mulberry32(3), []);
  const tiles = useMemo(
    () =>
      Array.from({ length: 9 }).map((_, i) => ({
        col: i % 3,
        row: Math.floor(i / 3),
        color: [COLORS.violet, COLORS.mint, COLORS.violetSoft][i % 3],
        speed: 0.5 + rng() * 0.5,
      })),
    [rng],
  );
  useFrame((state) => {
    refs.current.forEach((g, i) => {
      if (!g) return;
      const t = tiles[i];
      const wave = Math.sin(
        state.clock.elapsedTime * t.speed - (t.col + t.row) * 0.5,
      );
      g.position.z = -2 + wave * 0.5;
      g.rotation.y = wave * 0.25;
      g.rotation.x = -wave * 0.15;
      const m = (g.children[0] as Mesh)?.material as unknown as {
        emissiveIntensity: number;
      };
      if (m) m.emissiveIntensity = 0.3 + (wave + 1) * 0.5;
    });
  });
  return (
    <group>
      {tiles.map((t, i) => (
        <group
          key={i}
          ref={(g) => {
            refs.current[i] = g;
          }}
          position={[(t.col - 1) * 1.6, (1 - t.row) * 1.6, -2]}
        >
          <RoundedBox args={[1.3, 1.3, 0.16]} radius={0.1} smoothness={5}>
            <meshStandardMaterial
              color={PALETTE.violet.dark}
              emissive={t.color}
              emissiveIntensity={0.5}
              metalness={0.85}
              roughness={0.22}
            />
          </RoundedBox>
          <mesh position={[0, 0, 0.1]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              color={t.color}
              transparent
              opacity={0.18}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function CategoryGridScene({ className }: { className?: string }) {
  return (
    <Scene3D
      className={className}
      camera={{ position: [0, 0, 7], fov: 45 }}
      intensity={1.1}
      mouseParallax={false}
    >
      <CategoryGrid />
    </Scene3D>
  );
}

/* ------------------------------------------------------------------ *
 * 9. PORTFOLIO — a tilted 4×3 wall of project tiles in perspective,
 *    each lighting up in sequence as if a visitor scans the gallery.
 * ------------------------------------------------------------------ */

function PortfolioGrid() {
  const refs = useRef<(Group | null)[]>([]);
  const tiles = useMemo(() => {
    const r = mulberry32(7);
    return Array.from({ length: 12 }).map((_, i) => ({
      col: i % 4,
      row: Math.floor(i / 4),
      color: [COLORS.arc, COLORS.silver, COLORS.copper, COLORS.arcSoft][
        i % 4
      ],
      speed: 0.35 + r() * 0.5,
      lift: r() * 0.4,
    }));
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refs.current.forEach((g, i) => {
      if (!g) return;
      const tile = tiles[i];
      const scan = Math.sin(t * tile.speed - (tile.col + tile.row) * 0.7);
      g.position.z = -2.2 + scan * 0.6 + tile.lift;
      g.rotation.y = scan * 0.32;
      g.rotation.x = -scan * 0.2;
      const m = (g.children[0] as Mesh)?.material as unknown as {
        emissiveIntensity: number;
      };
      if (m) m.emissiveIntensity = 0.35 + (scan + 1) * 0.6;
    });
  });

  return (
    <group rotation={[-0.32, 0, 0]}>
      {tiles.map((tile, i) => (
        <group
          key={i}
          ref={(g) => {
            refs.current[i] = g;
          }}
          position={[(tile.col - 1.5) * 1.35, (1.5 - tile.row) * 1.1, -2]}
        >
          <RoundedBox args={[1.1, 0.95, 0.14]} radius={0.09} smoothness={5}>
            <meshStandardMaterial
              color={PALETTE.carbon.dark}
              emissive={tile.color}
              emissiveIntensity={0.5}
              metalness={0.85}
              roughness={0.22}
            />
          </RoundedBox>
          <mesh position={[0, 0, 0.09]}>
            <planeGeometry args={[0.86, 0.72]} />
            <meshBasicMaterial
              color={tile.color}
              transparent
              opacity={0.2}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function PortfolioGridScene({ className }: { className?: string }) {
  return (
    <Scene3D
      className={className}
      camera={{ position: [0, 0.6, 8], fov: 42 }}
      intensity={1.15}
      mouseParallax={false}
    >
      <PortfolioGrid />
    </Scene3D>
  );
}

export type SectionSceneName =
  | "DigitalCoreScene"
  | "DisciplinesScene"
  | "IndustriesScene"
  | "ProcessScene3D"
  | "TechStackScene"
  | "WhyUsScene"
  | "FinalPortalScene"
  | "CategoryGridScene"
  | "PortfolioGridScene";

export const SECTION_SCENES: Record<
  SectionSceneName,
  React.ComponentType<{ className?: string }>
> = {
  DigitalCoreScene,
  DisciplinesScene,
  IndustriesScene,
  ProcessScene3D,
  TechStackScene,
  WhyUsScene,
  FinalPortalScene,
  CategoryGridScene,
  PortfolioGridScene,
};

export default SECTION_SCENES;
