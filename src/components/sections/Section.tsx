import type { ReactNode } from "react";
import SectionScene from "@/components/visuals/SectionScene";
import SectionVisual from "@/components/visuals/SectionVisual";
import type { SectionSceneName } from "@/components/visuals/SectionScenes";
import ScrollRevealText from "@/components/motion/ScrollRevealText";

/** Map each 3D scene to its matching CSS-3D fallback variant. */
const CSS_VARIANT: Record<SectionSceneName, string> = {
  DigitalCoreScene: "layers",
  DisciplinesScene: "machines",
  IndustriesScene: "industries",
  ProcessScene3D: "line",
  TechStackScene: "orbit",
  WhyUsScene: "tokens",
  FinalPortalScene: "portal",
  CategoryGridScene: "layers",
  PortfolioGridScene: "layers",
};

type SectionProps = {
  kicker?: string;
  title: ReactNode;
  accent?: ReactNode;
  desc?: ReactNode;
  children: ReactNode;
  id?: string;
  className?: string;
  /** Reveal the header with CSS (View-Timeline when supported, else visible). */
  center?: boolean;
  /** Content-specific 3D scene shown beside the header. */
  scene?: SectionSceneName;
  /** Tint for the scene placeholder + fallback. */
  sceneTint?: string;
  /**
   * Whether the 3D scene may use WebGL. On the homepage the hero already owns
   * the page's single WebGL context, so sections render their CSS identity
   * panel and keep the layout + colour without a second canvas.
   */
  sceneEnabled?: boolean;
};

/**
 * Shared section shell for the homepage KB sections.
 * Uses a "reveal-on-scroll" CSS animation that degrades gracefully to a plain
 * visible state (so content is always accessible and reduced-motion safe).
 */
export default function Section({
  kicker,
  title,
  accent,
  desc,
  children,
  id,
  className = "",
  center = false,
  scene,
  sceneTint = "#2ED2FF",
  sceneEnabled = true,
}: SectionProps) {
  return (
    <section id={id} className={`relative py-20 lg:py-28 ${className}`}>
      <div className="wrap">
        {scene ? (
          <div className="section-scene kb-scroll-reveal mb-12 rounded-3xl overflow-hidden">
            {sceneEnabled ? (
              <SectionScene
                name={scene}
                className="h-full w-full"
                tint={sceneTint}
                enabled
              />
            ) : (
              <SectionVisual
                variant={
                  (CSS_VARIANT[scene] ?? "layers") as
                    | "layers"
                    | "machines"
                    | "industries"
                    | "line"
                    | "orbit"
                    | "tokens"
                    | "portal"
                }
                className="h-full w-full"
              />
            )}
          </div>
        ) : null}
        <header
          className={`kb-reveal mb-12 ${center ? "text-center max-w-3xl mx-auto" : ""}`}
        >
          {kicker && (
            <span
              className={`section-kicker ${center ? "justify-center inline-flex" : ""}`}
            >
              {kicker}
            </span>
          )}
          <h2 className="section-title">
            {typeof title === "string" ? (
              <ScrollRevealText as="span" text={title} type="words" stagger={0.05} />
            ) : (
              title
            )}
            {accent ? (
              <>
                <br />
                {typeof accent === "string" ? (
                  <span className="accent">
                    <ScrollRevealText as="span" text={accent} type="words" stagger={0.05} />
                  </span>
                ) : (
                  <span className="accent">{accent}</span>
                )}
              </>
            ) : null}
          </h2>
          {desc ? (
            <p className={`section-desc ${center ? "mx-auto" : ""}`}>{desc}</p>
          ) : null}
        </header>
        {children}
      </div>
    </section>
  );
}
