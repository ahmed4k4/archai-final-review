"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Points, PointMaterial } from "@react-three/drei";
import type { Group, Mesh, Points as PointsType } from "three";
import type { PageKey } from "./PageScenes";
import { PALETTE, mulberry32 } from "./scene-utils";

/* ------------------------------------------------------------------ *
 * Shared low-cost helpers
 * ------------------------------------------------------------------ */

/** Deterministic particle cloud used by several backdrops. */
function Particles({
  count,
  color,
  size = 0.03,
  spread = 9,
  speed = 0.06,
}: {
  count: number;
  color: string;
  size?: number;
  spread?: number;
  speed?: number;
}) {
  const ref = useRef<PointsType>(null);
  const positions = useMemo(() => {
    const rng = mulberry32(11);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rng() - 0.5) * spread;
      arr[i * 3 + 1] = (rng() - 0.5) * spread;
      arr[i * 3 + 2] = (rng() - 0.5) * spread * 0.6;
    }
    return arr;
  }, [count, spread]);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed;
  });
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color={color}
        size={size}
        sizeAttenuation
        depthWrite={false}
        blending={2}
      />
    </Points>
  );
}

/** A soft, unlit glow orb — cheap stand-in for a volumetric blob. */
function GlowOrb({
  position,
  color,
  size,
  drift = 0.4,
}: {
  position: [number, number, number];
  color: string;
  size: number;
  drift?: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.set(
      position[0] + Math.sin(t * 0.25) * drift,
      position[1] + Math.cos(t * 0.2) * drift,
      position[2],
    );
    ref.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.08);
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 24, 24]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.22}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/** Rotating group wrapper so the whole composition can spin slowly. */
function Spin({
  children,
  speed = 0.04,
}: {
  children: React.ReactNode;
  speed?: number;
}) {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed;
  });
  return <group ref={ref}>{children}</group>;
}

/* ------------------------------------------------------------------ *
 * Per-page backdrop compositions (kept deliberately simple + light)
 * ------------------------------------------------------------------ */

function HomeBackdrop() {
  return (
    <>
      <GlowOrb position={[-3, 1.5, -2]} color={PALETTE.violet} size={2.6} />
      <GlowOrb position={[3.2, -1, -2]} color={PALETTE.mint} size={2.2} />
      <GlowOrb position={[0, -2.4, -3]} color={PALETTE.rose} size={1.8} />
      <Particles count={140} color={PALETTE.mintSoft} />
    </>
  );
}

function ServicesBackdrop() {
  const nodes = useMemo(() => {
    const rng = mulberry32(3);
    return Array.from({ length: 12 }).map(
      () =>
        [(rng() - 0.5) * 10, (rng() - 0.5) * 6, (rng() - 0.5) * 3] as [
          number,
          number,
          number,
        ],
    );
  }, []);
  return (
    <Spin speed={0.03}>
      {nodes.map((n, i) => (
        <Float key={i} speed={0.8} floatIntensity={0.6} rotationIntensity={0.2}>
          <mesh position={n}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshBasicMaterial
              color={i % 3 === 0 ? PALETTE.mint : PALETTE.violetSoft}
              toneMapped={false}
            />
          </mesh>
        </Float>
      ))}
      <Particles count={120} color={PALETTE.violetSoft} size={0.02} />
    </Spin>
  );
}

function IndustriesBackdrop() {
  const rings = [2.2, 3.1, 4];
  return (
    <Spin speed={0.05}>
      {rings.map((r, i) => (
        <mesh key={i} rotation={[1 + i * 0.4, 0.3, 0]}>
          <torusGeometry args={[r, 0.01, 8, 120]} />
          <meshBasicMaterial
            color={i % 2 ? PALETTE.mint : PALETTE.violet}
            transparent
            opacity={0.25}
            toneMapped={false}
          />
        </mesh>
      ))}
      <Particles count={110} color={PALETTE.mintSoft} />
    </Spin>
  );
}

function AboutBackdrop() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <GlowOrb
          key={i}
          position={[-2 + i * 2, 0.4 - i * 0.3, -2]}
          color={i % 2 ? PALETTE.mint : PALETTE.violet}
          size={2 - i * 0.3}
          drift={0.6}
        />
      ))}
      <Particles count={130} color={PALETTE.violetSoft} />
    </>
  );
}

function ProcessBackdrop() {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (ref.current)
      ref.current.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.6;
  });
  return (
    <group ref={ref}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={`n${i}`} position={[-5 + i * 2.5, Math.sin(i) * 0.8, 0]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshBasicMaterial
            color={i % 2 ? PALETTE.mint : PALETTE.violet}
            toneMapped={false}
          />
        </mesh>
      ))}
      <Particles count={90} color={PALETTE.violetSoft} size={0.02} />
    </group>
  );
}

function InsightsBackdrop() {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.06;
  });
  return (
    <group ref={ref}>
      {Array.from({ length: 9 }).map((_, i) => (
        <Float
          key={i}
          speed={1 + i * 0.05}
          floatIntensity={1}
          rotationIntensity={0.4}
        >
          <mesh
            position={[
              ((i % 3) - 1) * 2.6,
              (Math.floor(i / 3) - 1) * 2,
              -1 + (i % 2),
            ]}
          >
            <octahedronGeometry args={[0.22, 0]} />
            <meshBasicMaterial
              color={i % 3 === 0 ? PALETTE.gold : PALETTE.violetSoft}
              transparent
              opacity={0.5}
              toneMapped={false}
            />
          </mesh>
        </Float>
      ))}
      <Particles count={100} color={PALETTE.gold} size={0.02} />
    </group>
  );
}

function ContactBackdrop() {
  const pulses = useRef<(Mesh | null)[]>([]);
  useFrame((state) => {
    pulses.current.forEach((m, i) => {
      if (!m) return;
      const t = (state.clock.elapsedTime * 0.35 + i * 0.25) % 1;
      m.scale.setScalar(0.5 + t * 4);
      const mat = m.material as unknown as { opacity: number };
      mat.opacity = (1 - t) * 0.4;
    });
  });
  return (
    <>
      <mesh>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshBasicMaterial color={PALETTE.mint} toneMapped={false} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) pulses.current[i] = m;
          }}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.8, 0.86, 48]} />
          <meshBasicMaterial
            color={PALETTE.mint}
            transparent
            opacity={0.3}
            side={2}
            toneMapped={false}
          />
        </mesh>
      ))}
      <Particles count={120} color={PALETTE.violetSoft} size={0.025} />
    </>
  );
}

function CaseStudiesBackdrop() {
  const bars = useRef<(Mesh | null)[]>([]);
  const xs = useMemo(
    () => Array.from({ length: 9 }).map((_, i) => (i - 4) * 1.1),
    [],
  );
  useFrame((state) => {
    bars.current.forEach((m, i) => {
      if (!m) return;
      const h =
        0.6 +
        (Math.sin(state.clock.elapsedTime * 0.8 + i * 0.6) * 0.5 + 0.5) * 1.8;
      m.scale.y = h;
      m.position.y = h / 2 - 1.8;
    });
  });
  return (
    <>
      {xs.map((x, i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) bars.current[i] = m;
          }}
          position={[x, 0, -1]}
        >
          <boxGeometry args={[0.5, 1, 0.5]} />
          <meshBasicMaterial
            color={i % 2 ? PALETTE.mint : PALETTE.violet}
            transparent
            opacity={0.3}
            toneMapped={false}
          />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2.4, 0, 0]} position={[0, -1.9, -1]}>
        <gridHelper args={[16, 18, PALETTE.violet, PALETTE.violet]} />
      </mesh>
    </>
  );
}

function CareersBackdrop() {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.08;
  });
  return (
    <group ref={ref}>
      {[2.4, 3.4, 4.4].map((r, i) => (
        <group key={i} rotation={[1 + i * 0.5, 0, 0]}>
          {[0, 1, 2].map((k) => (
            <mesh
              key={k}
              position={[
                Math.cos((k / 3) * Math.PI * 2) * r,
                0,
                Math.sin((k / 3) * Math.PI * 2) * r,
              ]}
            >
              <sphereGeometry args={[0.1, 12, 12]} />
              <meshBasicMaterial
                color={i % 2 ? PALETTE.mintSoft : PALETTE.violetSoft}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
      ))}
      <Particles count={90} color={PALETTE.mintSoft} size={0.02} />
    </group>
  );
}

function FaqBackdrop() {
  const rng = useMemo(() => mulberry32(9), []);
  const bubbles = useMemo(
    () =>
      Array.from({ length: 12 }).map(() => ({
        pos: [(rng() - 0.5) * 11, (rng() - 0.5) * 7, -1 - rng() * 2] as [
          number,
          number,
          number,
        ],
        size: 0.18 + rng() * 0.35,
      })),
    [rng],
  );
  return (
    <>
      {bubbles.map((b, i) => (
        <Float
          key={i}
          speed={0.7 + i * 0.06}
          floatIntensity={1.2}
          rotationIntensity={0.1}
        >
          <mesh position={b.pos}>
            <sphereGeometry args={[b.size, 16, 16]} />
            <meshBasicMaterial
              color={i % 2 ? PALETTE.violetSoft : PALETTE.mint}
              transparent
              opacity={0.16}
              toneMapped={false}
            />
          </mesh>
        </Float>
      ))}
      <Particles count={80} color={PALETTE.violetSoft} size={0.02} />
    </>
  );
}

function ProjectBackdrop() {
  return (
    <>
      <GlowOrb position={[-3, 1, -3]} color={PALETTE.violet} size={2.4} />
      <Particles count={90} color={PALETTE.violetSoft} size={0.022} />
    </>
  );
}

function CategoryBackdrop() {
  return (
    <>
      <GlowOrb position={[3, -1, -3]} color={PALETTE.mint} size={2.4} />
      <Particles count={90} color={PALETTE.mintSoft} size={0.022} />
    </>
  );
}

const SCENES: Record<PageKey, React.ComponentType> = {
  home: HomeBackdrop,
  services: ServicesBackdrop,
  industries: IndustriesBackdrop,
  about: AboutBackdrop,
  process: ProcessBackdrop,
  insights: InsightsBackdrop,
  contact: ContactBackdrop,
  "case-studies": CaseStudiesBackdrop,
  careers: CareersBackdrop,
  faq: FaqBackdrop,
  project: ProjectBackdrop,
  category: CategoryBackdrop,
};

/**
 * SceneBackdrop — a lightweight WebGL ambience behind page content.
 *
 * Not interactive (`pointer-events: none`), low opacity, cheap: simple
 * geometries, ~100–150 particles, dpr capped at 1.25. Mounted at z-index -1 so
 * it never competes with the page. The whole canvas is lazy-loaded.
 */
function SceneBackdropInner({ name }: { name: PageKey }) {
  const Scene = SCENES[name] ?? HomeBackdrop;
  const [mobile, setMobile] = useLazyMobile();
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 opacity-60">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 50 }}
        dpr={mobile ? [1, 1] : [1, 1.25]}
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
        style={{ pointerEvents: "none", width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.6} />
        <Scene />
      </Canvas>
    </div>
  );
}

/** Small hook: is the viewport mobile-sized? (drives dpr + could gate detail) */
function useLazyMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    setMobile(window.matchMedia("(max-width: 767px)").matches);
  }, []);
  return [mobile, setMobile] as const;
}

export default SceneBackdropInner;
