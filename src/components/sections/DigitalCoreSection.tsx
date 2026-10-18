import { tr } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import Section from "./Section";

/**
 * Section 2 — DIGITAL CORE / 001
 * A symbolic system panel: status readouts + the four engineering layers
 * (AI · Software · Embedded · Real-World Impact). Pure CSS/SVG, no WebGL.
 */
export default function DigitalCoreSection({
  lang,
  sceneEnabled = true,
}: {
  lang: Locale;
  sceneEnabled?: boolean;
}) {
  const T = tr(lang);
  const ar = lang === "ar";

  const layers = [
    {
      key: "01",
      label: T("layerAI"),
      topics: T("layerAITopics"),
      color: "#2ED2FF",
    },
    {
      key: "02",
      label: T("layerSoftware"),
      topics: T("layerSoftwareTopics"),
      color: "#2ED2FF",
    },
    {
      key: "03",
      label: T("layerEmbedded"),
      topics: T("layerEmbeddedTopics"),
      color: "#8AE8FF",
    },
    {
      key: "04",
      label: T("layerImpact"),
      topics: T("layerImpactTopics"),
      color: "#C48A5C",
    },
  ];

  const statuses = [
    T("digitalCoreStatus1"),
    T("digitalCoreStatus2"),
    T("digitalCoreStatus3"),
  ];

  return (
    <Section
      kicker={T("digitalCoreLabel")}
      title={ar ? "بنية متكاملة." : "One integrated core."}
      accent={ar ? "طبقات متصلة." : "Connected layers."}
      scene="DigitalCoreScene"
      sceneTint="#2ED2FF"
      sceneEnabled={sceneEnabled}
    >
      {/* status bar */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-10 font-mono text-[11px] tracking-[0.18em] text-mint-300">
        {statuses.map((s, i) => (
          <span key={s} className="inline-flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full bg-mint-400 shadow-glow-mint-sm animate-pulse"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
            {s}
          </span>
        ))}
        <span className="ml-auto hidden sm:inline text-ink-4">
          ARCHAI CORE v3
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {layers.map((l) => (
          <div
            key={l.key}
            className="group relative glass rounded-3xl p-6 overflow-hidden hover:-translate-y-1.5 transition-transform duration-500"
            style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
          >
            {/* glowing accent line */}
            <span
              className="absolute top-0 left-0 h-1 w-full opacity-70"
              style={{
                background: `linear-gradient(90deg, ${l.color}, transparent)`,
              }}
            />
            <span
              className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
              style={{ background: l.color }}
            />
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-[10px] tracking-widest text-ink-4">
                {l.key}
              </span>
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                aria-hidden
                style={{ color: l.color }}
              >
                <circle cx="12" cy="12" r="3.2" fill="currentColor" />
                <circle
                  cx="12"
                  cy="12"
                  r="8.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.5"
                  strokeDasharray="3 3"
                />
              </svg>
            </div>
            <h3 className="font-display text-xl text-ink-0 mb-3">{l.label}</h3>
            <p
              className="text-sm text-ink-3 leading-relaxed"
              dir={ar ? "rtl" : "ltr"}
            >
              {l.topics}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
