import type { PageKey } from "./PageScenes";

/**
 * Backdrop — pure CSS, no WebGL.
 *
 * Keeping page backgrounds as CSS removes a second/third WebGL context per
 * page (the hero scene is the page's only canvas), so pages stay at a stable
 * 60 fps even on mid-range devices. Each page key still gets a distinct
 * colour signature via the injected custom properties, and the motion is
 * disabled automatically under prefers-reduced-motion by the global reset.
 */

const ACCENTS: Record<PageKey, [string, string]> = {
  home: ["#2ED2FF", "#CCD3DA"],
  services: ["#2ED2FF", "#8AE8FF"],
  industries: ["#2ED2FF", "#C48A5C"],
  about: ["#CCD3DA", "#2ED2FF"],
  process: ["#2ED2FF", "#5CDDFF"],
  insights: ["#C48A5C", "#2ED2FF"],
  contact: ["#2ED2FF", "#C48A5C"],
  "case-studies": ["#2ED2FF", "#CCD3DA"],
  careers: ["#CCD3DA", "#2ED2FF"],
  faq: ["#2ED2FF", "#8AE8FF"],
  portfolio: ["#2ED2FF", "#CCD3DA"],
  project: ["#2ED2FF", "#CCD3DA"],
  category: ["#2ED2FF", "#C48A5C"],
};

export default function Backdrop({ name }: { name: PageKey }) {
  const [a, b] = ACCENTS[name] ?? ACCENTS.home;
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-60"
      aria-hidden
      style={{ ["--bd-a" as string]: a, ["--bd-b" as string]: b }}
    >
      <div className="bd-orb bd-orb-a" />
      <div className="bd-orb bd-orb-b" />
      <div className="bd-grid" />
      {/* Per-page signature motion layer (orbit / radar / helix / wave /
          twinkle / rings) — each page key renders a distinct backdrop. */}
      <div className={`bd-sig bd-sig-${name}`} />
    </div>
  );
}
