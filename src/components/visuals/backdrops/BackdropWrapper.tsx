"use client";
import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { PALETTE } from "../scene-system";

/** Shared backdrop canvas — subtle, non-interactive, cheap. */
export default function BackdropWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    setMobile(window.matchMedia("(max-width: 767px)").matches);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 opacity-55">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        dpr={mobile ? [1, 1] : [1, 1.25]}
        frameloop={reduce ? "demand" : "always"}
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
        style={{ pointerEvents: "none", width: "100%", height: "100%" }}
      >
        <fog attach="fog" args={["#050812", 10, 30]} />
        <ambientLight intensity={0.55} />
        <pointLight
          position={[0, 0, 5]}
          intensity={1.2}
          color={PALETTE.violet.light}
        />
        {children}
        {!reduce && (
          <EffectComposer multisampling={0}>
            <Bloom
              intensity={0.6}
              luminanceThreshold={0.4}
              luminanceSmoothing={0.5}
              mipmapBlur
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
