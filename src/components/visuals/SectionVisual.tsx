"use client";
import { useReducedMotion } from "framer-motion";

/**
 * SectionVisual — a pure CSS-3D visual per homepage section.
 *
 * Uses CSS 3D transforms + keyframes (no WebGL) so every section still has its
 * own movement, depth and identity at a locked 60 fps and without spending the
 * page's single WebGL context. Each variant is symbolic of its section:
 *   layers · machines · industries · line · orbit · tokens · portal
 */

type Variant =
  | "layers"
  | "machines"
  | "industries"
  | "line"
  | "orbit"
  | "tokens"
  | "portal";

/* Two-colour discipline: everything lives between violet and mint. */
const ACCENT: Record<Variant, string> = {
  layers: "#2ED2FF", // violet
  machines: "#2ED2FF", // mint
  industries: "#8AE8FF", // violet-soft
  line: "#2ED2FF", // mint
  orbit: "#2ED2FF", // violet
  tokens: "#8AE8FF", // mint-light
  portal: "#2ED2FF", // violet
};

export default function SectionVisual({
  variant,
  className,
}: {
  variant: Variant;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const accent = ACCENT[variant];

  return (
    <div
      className={`sv-root ${className ?? ""}`}
      style={{ ["--sv-accent" as string]: accent }}
      data-reduce={reduce ? "true" : "false"}
      aria-hidden
    >
      <div className="sv-stage">
        {variant === "layers" && <Layers />}
        {variant === "machines" && <Machines />}
        {variant === "industries" && <Industries />}
        {variant === "line" && <Line />}
        {variant === "orbit" && <Orbit />}
        {variant === "tokens" && <Tokens />}
        {variant === "portal" && <Portal />}
      </div>
      {/* shared glow + grid floor */}
      <span className="sv-glow" />
      <span className="sv-grid" />
    </div>
  );
}

/* 1. Digital Core — four stacked, counter-rotating layers. */
function Layers() {
  return (
    <div className="sv-3d sv-cube">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="sv-layer"
          style={{ ["--i" as string]: `${i}`, animationDelay: `${i * 0.5}s` }}
        />
      ))}
    </div>
  );
}

/* 2. Disciplines — three machines in a row (rack / board / net). */
function Machines() {
  return (
    <div className="sv-row">
      <div className="sv-machine sv-rack">
        <span />
        <span />
        <span />
      </div>
      <div className="sv-machine sv-board">
        <i />
      </div>
      <div className="sv-machine sv-net">
        {Array.from({ length: 7 }).map((_, i) => (
          <b key={i} style={{ ["--i" as string]: `${i}` }} />
        ))}
      </div>
    </div>
  );
}

/* 3. Industries — orbit of four machines. */
function Industries() {
  const items = ["drone", "arm", "heart", "turbine"];
  return (
    <div className="sv-orbit">
      {items.map((k, i) => (
        <span
          key={k}
          className={`sv-orb sv-orb-${k}`}
          style={{ ["--i" as string]: `${i}` }}
        />
      ))}
      <span className="sv-core" />
    </div>
  );
}

/* 4. Process — a conveyor with a travelling package. */
function Line() {
  return (
    <div className="sv-line">
      <span className="sv-belt" />
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="sv-station"
          style={{ ["--i" as string]: `${i}` }}
        />
      ))}
      <span className="sv-package" />
    </div>
  );
}

/* 5. Tech stack — concentric rings of satellites. */
function Orbit() {
  return (
    <div className="sv-rings">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <span key={i} className="sv-ring" style={{ ["--i" as string]: `${i}` }}>
          <b />
        </span>
      ))}
      <span className="sv-core sv-core-glass" />
    </div>
  );
}

/* 6. Why us — six floating hexagonal tokens. */
function Tokens() {
  return (
    <div className="sv-tokens">
      {Array.from({ length: 6 }).map((_, i) => (
        <span
          key={i}
          className="sv-token"
          style={{ ["--i" as string]: `${i}` }}
        >
          {["✓", "⌘", "⌁", "✧", "↗", "↻"][i]}
        </span>
      ))}
    </div>
  );
}

/* 7. Final CTA — a luminous portal. */
function Portal() {
  return (
    <div className="sv-portal">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="sv-arc"
          style={{ ["--i" as string]: `${i}` }}
        />
      ))}
      <span className="sv-portal-core" />
    </div>
  );
}
