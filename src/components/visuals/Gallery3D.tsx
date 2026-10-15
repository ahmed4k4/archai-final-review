"use client";
import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, useTexture, AdaptiveDpr } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import type { Group } from "three";
import * as THREE from "three";
import { COLORS, PALETTE } from "./scene-system";

/**
 * Gallery3D — project images presented on floating 3D screens in a gentle arc.
 * Scroll / drag rotates the carousel; the focused panel enlarges and lights up.
 * A lightweight CSS grid is shown when there are no images or reduced-motion.
 */

function Panel({
  url,
  index,
  total,
  active,
}: {
  url: string;
  index: number;
  total: number;
  active: number;
}) {
  const group = useRef<Group>(null);
  const tex = useTexture(url);
  tex.colorSpace = THREE.SRGBColorSpace;
  const isActive = index === active;
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (!group.current) return;
    const spread = (index - active) * 2.6;
    target.set(
      spread,
      isActive ? 0.35 : 0,
      isActive ? 0.4 : -Math.abs(index - active) * 1.4,
    );
    const t = 1 - Math.pow(0.001, delta);
    group.current.position.lerp(target, t);
    const targetScale = isActive ? 1.15 : 0.82;
    const s = group.current.scale.x + (targetScale - group.current.scale.x) * t;
    group.current.scale.setScalar(s);
    const targetRotY = isActive ? 0 : (index - active) * -0.28;
    group.current.rotation.y += (targetRotY - group.current.rotation.y) * t;
    group.current.rotation.z =
      Math.sin(state.clock.elapsedTime * 0.6 + index) * 0.02;
    group.current.position.y +=
      Math.sin(state.clock.elapsedTime + index) * 0.002;
  });

  return (
    <group
      ref={group}
      position={[(index - active) * 2.6, 0, -Math.abs(index - active) * 1.4]}
    >
      <RoundedBox args={[2.4, 1.5, 0.12]} radius={0.08} smoothness={5}>
        <meshStandardMaterial
          color={PALETTE.violet.dark}
          metalness={0.9}
          roughness={0.2}
          emissive={isActive ? COLORS.violet : "#000000"}
          emissiveIntensity={isActive ? 0.5 : 0}
        />
      </RoundedBox>
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[2.2, 1.3]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {/* glow frame when active */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[2.6, 1.7]} />
        <meshBasicMaterial
          color={COLORS.mint}
          transparent
          opacity={isActive ? 0.18 : 0}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function Carousel({
  images,
  active,
}: {
  images: { public_url: string }[];
  active: number;
}) {
  const group = useRef<Group>(null);
  const { camera } = useThree();
  useFrame((state, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.04;
    camera.position.x += (state.pointer.x * 0.5 - camera.position.x) * 0.05;
    camera.position.y +=
      (0.2 + state.pointer.y * 0.3 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });
  return (
    <group ref={group}>
      {images.map((img, i) => (
        <Panel
          key={img.public_url + i}
          url={img.public_url}
          index={i}
          total={images.length}
          active={active}
        />
      ))}
    </group>
  );
}

export default function Gallery3D({
  images,
  title,
  lang,
}: {
  images: {
    public_url: string;
    alt_en?: string | null;
    alt_ar?: string | null;
  }[];
  title: string;
  lang: "ar" | "en";
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [mobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768,
  );
  const n = images.length;
  if (!n) return null;

  return (
    <section className="mt-10" aria-label={title}>
      <div className="relative h-[380px] md:h-[460px] rounded-3xl overflow-hidden glass">
        {reduce ? (
          <div className="absolute inset-0 grid place-items-center p-6">
            <img
              src={images[active].public_url}
              alt={title}
              className="max-h-full object-contain"
            />
          </div>
        ) : (
          <Canvas
            camera={{ position: [0, 0.2, 6], fov: 42 }}
            dpr={mobile ? [1, 1.25] : [1, 1.75]}
            gl={{
              alpha: true,
              antialias: !mobile,
              powerPreference: "high-performance",
            }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[4, 5, 5]}
              intensity={2.2}
              color="#ffffff"
            />
            <pointLight
              position={[-4, -2, 4]}
              intensity={1.4}
              color={COLORS.violet}
            />
            <pointLight
              position={[0, 2, -4]}
              intensity={1.8}
              color={COLORS.mint}
            />
            <Suspense fallback={null}>
              <Carousel images={images} active={active} />
            </Suspense>
            <AdaptiveDpr pixelated />
          </Canvas>
        )}

        {/* controls */}
        {n > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous"
              onClick={() => setActive((a) => (a - 1 + n) % n)}
              className="absolute top-1/2 -translate-y-1/2 left-4 z-10 w-11 h-11 grid place-items-center rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-violet-500 transition-all"
            >
              {lang === "ar" ? "›" : "‹"}
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => setActive((a) => (a + 1) % n)}
              className="absolute top-1/2 -translate-y-1/2 right-4 z-10 w-11 h-11 grid place-items-center rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-violet-500 transition-all"
            >
              {lang === "ar" ? "‹" : "›"}
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to image ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === active
                      ? "w-7 bg-grad-primary shadow-glow-violet"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
