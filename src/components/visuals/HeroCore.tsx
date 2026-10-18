"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
} from "@react-three/postprocessing";
import {
  AdditiveBlending,
  BackSide,
  Color,
  Euler,
  Matrix4,
  Quaternion,
  Vector2,
  Vector3,
} from "three";
import type { Group, Mesh, Points, ShaderMaterial, InstancedMesh } from "three";
import Scene3D from "./Scene3D";
import { COLORS, EASINGS, mulberry32 } from "./scene-system";

/* ==================================================================== *
 * HeroCore — "Planet + Orbits"   (v16 rebuild)
 *
 * A realistic planet suspended in deep space: a shader-lit globe with
 * continents + fresnel atmosphere, three tilted orbital rings carrying
 * twelve moons, a 200-rock asteroid belt, and a 500-point star layer.
 *
 * Palette — official brand only:
 *   Arc Blue #2ED2FF · Silver #CCD3DA · Copper #C48A5C · Carbon #1B2228
 *
 * Layers:
 *   1  Planet         — icosahedron surface shader + physical shell
 *   2  Clouds         — translucent drifting shell above the surface
 *   3  Atmosphere     — back-side fresnel glow around the globe
 *   4  Orbits         — 3 torus rings, distinct tilt + speed, emissive
 *   5  Moons          — 12 small spheres orbiting on the rings + pulse
 *   6  Asteroid belt  — InstancedMesh of 200 rocks (drift + rotate)
 *   7  Starfield      — 500 points in-scene
 *
 * Motion on three levels per element: internal spin / wobble, orbital
 * drift, and scroll response (camera dolly + spin-up).
 * ==================================================================== */

const ARC = COLORS.arc; // #2ED2FF
const ARC_SOFT = COLORS.arcSoft; // #8AE8FF
const SILVER = COLORS.silver; // #CCD3DA
const COPPER = COLORS.copper; // #C48A5C
const CARBON = COLORS.carbon; // #1B2228

const PLANET_R = 1.4;

/* ------------------------------------------------------------------ *
 * 1 — PLANET SURFACE SHADER
 * Continents from layered value-noise, oceans in carbon, land in silver,
 * with an arc-blue fresnel rim so the globe glows at the edge.
 * ------------------------------------------------------------------ */

const PLANET_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vP;
  varying vec2 vUv;
  void main() {
    vN = normalize(mat3(modelMatrix) * normal);
    vP = (modelMatrix * vec4(position, 1.0)).xyz;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const PLANET_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3  uOcean;
  uniform vec3  uLand;
  uniform vec3  uRim;
  varying vec3 vN;
  varying vec3 vP;
  varying vec2 vUv;

  float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7)))*43758.5453); }
  float noise(vec3 p){
    vec3 i = floor(p), f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x),
                   mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
                   mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p){
    float v = 0.0, a = 0.5;
    for(int i=0;i<5;i++){ v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }

  void main(){
    vec3 dir = normalize(vP);
    float land = fbm(dir * 2.6 + 12.0);
    float mask = smoothstep(0.48, 0.62, land);      // continents
    float detail = fbm(dir * 7.0) * 0.25;
    vec3 col = mix(uOcean, uLand, mask);
    col += detail * uLand;
    // polar ice caps in silver
    float lat = abs(dir.y);
    col = mix(col, uLand, smoothstep(0.78, 0.95, lat) * 0.7);
    // day/night terminator from a fixed sun direction
    float lit = clamp(dot(vN, normalize(vec3(0.6, 0.5, 0.7))), 0.0, 1.0);
    col *= 0.35 + lit * 0.95;
    // arc-blue atmospheric rim
    float fres = pow(1.0 - abs(dot(vN, vec3(0.0, 0.0, 1.0))), 2.4);
    col += uRim * fres * 0.9;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function Planet({ reveal }: { reveal: (d: number, s?: number) => number }) {
  const group = useRef<Group>(null);
  const clouds = useRef<Mesh>(null);
  const surface = useRef<ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOcean: { value: new Color("#101820") },
      uLand: { value: new Color(SILVER) },
      uRim: { value: new Color(ARC) },
    }),
    [],
  );

  useFrame((state, delta) => {
    if (group.current) {
      // internal spin + subtle wobble
      group.current.rotation.y += delta * 0.05;
      group.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 0.25) * 0.04;
      group.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.2) * 0.03;
      const s = 0.9 + reveal(0.1) * 0.1;
      group.current.scale.setScalar(s);
    }
    if (clouds.current) {
      clouds.current.rotation.y += delta * 0.08;
      clouds.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.15) * 0.05;
    }
    if (surface.current) uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group ref={group}>
      {/* Surface — custom shader on an icosahedron for a faceted-but-smooth look */}
      <mesh>
        <icosahedronGeometry args={[PLANET_R, 6]} />
        <shaderMaterial
          ref={surface}
          vertexShader={PLANET_VERT}
          fragmentShader={PLANET_FRAG}
          uniforms={uniforms}
        />
      </mesh>

      {/* Physical shell — specular highlight / metalness for a real body */}
      <mesh scale={1.004}>
        <icosahedronGeometry args={[PLANET_R, 6]} />
        <meshPhysicalMaterial
          color={CARBON}
          metalness={0.9}
          roughness={0.2}
          transparent
          opacity={0.35}
          clearcoat={1}
          clearcoatRoughness={0.15}
        />
      </mesh>

      {/* Cloud layer — translucent drifting shell */}
      <mesh ref={clouds} scale={1.03}>
        <sphereGeometry args={[PLANET_R, 64, 64]} />
        <meshPhysicalMaterial
          color={SILVER}
          metalness={0}
          roughness={0.9}
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * 2 — ATMOSPHERE GLOW (back-side fresnel halo around the globe)
 * ------------------------------------------------------------------ */

const ATMO_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vP;
  void main() {
    vN = normalize(mat3(modelMatrix) * normal);
    vP = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMO_FRAG = /* glsl */ `
  uniform vec3 uGlow;
  varying vec3 vN;
  varying vec3 vP;
  void main(){
    float fres = pow(0.72 - dot(vN, vec3(0.0, 0.0, 1.0)), 3.0);
    fres = clamp(fres, 0.0, 1.0);
    gl_FragColor = vec4(uGlow, fres);
  }
`;

function Atmosphere({ reveal }: { reveal: (d: number, s?: number) => number }) {
  const mat = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uGlow: { value: new Color(ARC) } }), []);
  useFrame((state) => {
    if (mat.current) {
      const pulse = 0.55 + Math.sin(state.clock.elapsedTime * 0.6) * 0.12;
      mat.current.opacity = pulse * reveal(0.3);
    }
  });
  return (
    <mesh scale={1.16}>
      <sphereGeometry args={[PLANET_R, 64, 64]} />
      <shaderMaterial
        ref={mat}
        vertexShader={ATMO_VERT}
        fragmentShader={ATMO_FRAG}
        uniforms={uniforms}
        transparent
        blending={AdditiveBlending}
        side={BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ *
 * 3 — ORBITAL RINGS (3 torus rings, distinct tilt + speed)
 * ------------------------------------------------------------------ */

type RingCfg = {
  radius: number;
  thickness: number;
  tilt: [number, number, number];
  speed: number;
  color: string;
  moons: number;
};

const RINGS: RingCfg[] = [
  {
    radius: 2.35,
    thickness: 0.018,
    tilt: [1.35, 0.1, 0.2],
    speed: 0.16,
    color: ARC,
    moons: 4,
  },
  {
    radius: 3.05,
    thickness: 0.03,
    tilt: [1.05, -0.35, 0.55],
    speed: -0.11,
    color: ARC_SOFT,
    moons: 4,
  },
  {
    radius: 3.85,
    thickness: 0.045,
    tilt: [0.72, 0.5, -0.35],
    speed: 0.08,
    color: SILVER,
    moons: 4,
  },
];

function OrbitalRing({
  cfg,
  reveal,
  scroll,
  ringIndex,
}: {
  cfg: RingCfg;
  reveal: (d: number, s?: number) => number;
  scroll: React.MutableRefObject<number>;
  ringIndex: number;
}) {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    const boost = 1 + scroll.current * 1.6; // scroll spins the rings up
    group.current.rotation.z += delta * cfg.speed * boost;
    const s = 0.6 + reveal(0.2 + ringIndex * 0.12) * 0.4;
    group.current.scale.setScalar(s);
  });

  return (
    <group ref={group} rotation={cfg.tilt}>
      <mesh>
        <torusGeometry args={[cfg.radius, cfg.thickness, 16, 220]} />
        <meshStandardMaterial
          color={cfg.color}
          emissive={cfg.color}
          emissiveIntensity={1.4}
          metalness={0.9}
          roughness={0.25}
          toneMapped={false}
        />
      </mesh>
      {/* A faint inner hairline to give the ring depth */}
      <mesh>
        <torusGeometry args={[cfg.radius, cfg.thickness * 2.6, 12, 180]} />
        <meshBasicMaterial
          color={cfg.color}
          transparent
          opacity={0.12}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * 4 — MOONS (12 small spheres riding the rings, each pulsing)
 * ------------------------------------------------------------------ */

/** Copper for the middle ring's moons so the accent is used sparingly. */
function moonColor(cfg: RingCfg) {
  return cfg.color === ARC_SOFT ? COPPER : SILVER;
}

function Moon({
  cfg,
  seed,
  reveal,
}: {
  cfg: RingCfg;
  seed: number;
  reveal: (d: number, s?: number) => number;
}) {
  const mesh = useRef<Mesh>(null);

  const data = useMemo(() => {
    const rr = mulberry32(seed * 7 + 13);
    return {
      phase: rr() * Math.PI * 2,
      speed: cfg.speed * 2.4 + (rr() - 0.5) * 0.1,
      size: 0.07 + rr() * 0.06,
      wobble: 0.02 + rr() * 0.04,
    };
  }, [seed, cfg.speed]);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime * data.speed + data.phase;
    const wob = Math.sin(state.clock.elapsedTime * 0.9 + seed) * data.wobble;
    mesh.current.position.set(
      Math.cos(t) * (cfg.radius + wob),
      wob,
      Math.sin(t) * (cfg.radius + wob),
    );
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.2 + seed) * 0.18;
    mesh.current.scale.setScalar(data.size * pulse * reveal(0.4));
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        color={moonColor(cfg)}
        emissive={moonColor(cfg)}
        emissiveIntensity={1.1}
        metalness={0.7}
        roughness={0.35}
        toneMapped={false}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ *
 * 5 — ASTEROID BELT (InstancedMesh, 200 rocks — drift + rotate)
 * ------------------------------------------------------------------ */

function AsteroidBelt({
  count = 200,
  reveal,
  scroll,
}: {
  count?: number;
  reveal: (d: number, s?: number) => number;
  scroll: React.MutableRefObject<number>;
}) {
  const inst = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Matrix4(), []);
  const pos = useMemo(() => new Vector3(), []);
  const quat = useMemo(() => new Quaternion(), []);
  const scl = useMemo(() => new Vector3(), []);
  const eul = useMemo(() => new Euler(), []);

  const rocks = useMemo(() => {
    const rng = mulberry32(99);
    return Array.from({ length: count }).map(() => ({
      radius: 4.6 + rng() * 1.6,
      theta: rng() * Math.PI * 2,
      y: (rng() - 0.5) * 0.5,
      speed: (0.04 + rng() * 0.1) * (rng() > 0.5 ? 1 : -1),
      size: 0.02 + rng() * 0.06,
      spin: (rng() - 0.5) * 2,
    }));
  }, [count]);

  useFrame((state, delta) => {
    if (!inst.current) return;
    const t = state.clock.elapsedTime;
    const boost = 1 + scroll.current * 1.4;
    for (let i = 0; i < rocks.length; i++) {
      const r = rocks[i];
      const ang = r.theta + t * r.speed * boost;
      pos.set(Math.cos(ang) * r.radius, r.y, Math.sin(ang) * r.radius);
      eul.set(ang * r.spin, ang, r.spin);
      quat.setFromEuler(eul);
      scl.setScalar(r.size * reveal(0.5));
      dummy.compose(pos, quat, scl);
      inst.current.setMatrixAt(i, dummy);
    }
    inst.current.instanceMatrix.needsUpdate = true;
    inst.current.rotation.y += delta * 0.01;
  });

  return (
    <instancedMesh ref={inst} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={COLORS.panel}
        metalness={0.6}
        roughness={0.7}
      />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ *
 * 6 — STARFIELD (500 in-scene points, twinkling)
 * ------------------------------------------------------------------ */

function StarLayer({
  count = 500,
  reveal,
}: {
  count?: number;
  reveal: (d: number, s?: number) => number;
}) {
  const pts = useRef<Points>(null);
  const positions = useMemo(() => {
    const rng = mulberry32(21);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 7 + rng() * 12;
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1);
      arr[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      arr[i * 3 + 1] = Math.cos(phi) * r;
      arr[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!pts.current) return;
    pts.current.rotation.y += 0.0004;
    const mat = pts.current.material as unknown as { opacity: number };
    mat.opacity =
      reveal(0.6) * (0.55 + Math.sin(state.clock.elapsedTime * 0.8) * 0.15);
  });

  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color={SILVER}
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ *
 * Post-processing + clock
 * ------------------------------------------------------------------ */

function Effects() {
  const caOffset = useMemo(() => new Vector2(0.001, 0.001), []);
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={1.2}
        luminanceThreshold={0.22}
        luminanceSmoothing={0.5}
        mipmapBlur
      />
      <ChromaticAberration
        offset={caOffset}
        radialModulation
        modulationOffset={0.4}
      />
      <Vignette offset={0.3} darkness={0.68} />
    </EffectComposer>
  );
}

function SceneClock({ elapsed }: { elapsed: React.MutableRefObject<number> }) {
  useFrame((_, delta) => {
    elapsed.current += delta;
  });
  return null;
}

/* ------------------------------------------------------------------ *
 * ROOT
 * ------------------------------------------------------------------ */

export default function HeroCore({ className }: { className?: string }) {
  const elapsed = useRef(0);
  const scroll = useRef(0);
  const reveal = (delay: number, duration = 1) =>
    EASINGS.outExpo(
      Math.min(1, Math.max(0, (elapsed.current - delay) / duration)),
    );

  /* QUALITY BUDGET — decided once on mount.
   *
   * Desktop gets the full composition. Phones get a reduced set: no HDRI
   * cubemap (Environment renders a 6-face cube target on build), half the
   * asteroid instances, a third of the in-scene stars, and 6 moons instead
   * of 12. Every item below is an instanced/buffer draw that is updated in
   * `useFrame`, so the cut is proportional to the per-frame CPU cost.
   *
   * `null` while unknown → render nothing heavy on the first paint. */
  const [light, setLight] = useState<boolean | null>(null);
  useEffect(() => {
    setLight(window.matchMedia("(max-width: 767px)").matches);
  }, []);

  const ASTEROIDS = light ? 60 : 200;
  const STARS = light ? 160 : 500;
  const MOONS_PER_RING = light ? 2 : 4;

  /* Moons distributed across the 3 rings. */
  const moons = useMemo(
    () =>
      RINGS.flatMap((cfg, ri) =>
        Array.from({ length: MOONS_PER_RING }).map((_, mi) => ({
          cfg,
          seed: ri * 10 + mi + 1,
        })),
      ),
    [MOONS_PER_RING],
  );

  return (
    <Scene3D
      className={className}
      camera={{ position: [0, 1.4, 9] }}
      lights={false}
      tier="hero"
      composer={<Effects />}
      mouseParallax
      scrollCamera
      scrollProgress={scroll}
    >
      <SceneClock elapsed={elapsed} />

      {/* ── 6-source light rig: key sun + rim + fill + atmosphere ── */}
      <ambientLight intensity={0.18} />
      {/* key sun */}
      <directionalLight position={[8, 10, 6]} intensity={3.2} color="#FFFFFF" />
      {/* rim */}
      <directionalLight position={[-7, -4, 5]} intensity={1.8} color={ARC} />
      {/* fill */}
      <pointLight position={[5, 4, -5]} intensity={2.2} color={SILVER} />
      {/* atmosphere under-glow */}
      <pointLight position={[0, -4, 2]} intensity={2} color={ARC} />
      {/* backlight */}
      <pointLight position={[0, 0, -8]} intensity={3.4} color={ARC_SOFT} />
      {/* warm copper accent (used sparingly) */}
      <spotLight
        position={[-4, 6, 3]}
        angle={0.6}
        penumbra={1}
        intensity={2.6}
        color={COPPER}
      />

      {/* ── Internal HDRI (Lightformer) — desktop only ──
          <Environment> allocates + renders a cube render-target; on a phone
          the six explicit lights below already carry the lighting, so the
          HDRI is pure cost there. */}
      {light === false ? (
        <Environment resolution={128}>
          <Lightformer
            intensity={2}
            color="#FFFFFF"
            position={[0, 6, -9]}
            scale={[12, 12, 1]}
          />
          <Lightformer
            intensity={1.6}
            color={ARC}
            position={[7, 0, -6]}
            scale={[10, 10, 1]}
          />
          <Lightformer
            intensity={1.6}
            color={SILVER}
            position={[-7, 0, -6]}
            scale={[10, 10, 1]}
          />
        </Environment>
      ) : null}

      {/* ── The planet + its atmosphere ── */}
      <Planet reveal={reveal} />
      <Atmosphere reveal={reveal} />

      {/* ── Orbital rings ── */}
      {RINGS.map((cfg, i) => (
        <OrbitalRing
          key={i}
          cfg={cfg}
          reveal={reveal}
          scroll={scroll}
          ringIndex={i}
        />
      ))}

      {/* ── Moons riding the rings ── */}
      {moons.map((m, i) => (
        <Moon key={i} cfg={m.cfg} seed={m.seed} reveal={reveal} />
      ))}

      {/* ── Asteroid belt ── */}
      <AsteroidBelt count={ASTEROIDS} reveal={reveal} scroll={scroll} />

      {/* ── In-scene stars ── */}
      <StarLayer count={STARS} reveal={reveal} />
    </Scene3D>
  );
}
