import { tr } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import Section from "./Section";

/** Section 5 — ENGINEERING PROCESS (5 KB stages, each with its bullets). */
export default function ProcessSection({
  lang,
  sceneEnabled = true,
}: {
  lang: Locale;
  sceneEnabled?: boolean;
}) {
  const T = tr(lang);
  const ar = lang === "ar";

  const stages = [
    {
      key: "01",
      title: T("processDiscovery"),
      body: T("processDiscoveryBody"),
    },
    {
      key: "02",
      title: T("processArchitecture"),
      body: T("processArchitectureBody"),
    },
    {
      key: "03",
      title: T("processEngineering"),
      body: T("processEngineeringBody"),
    },
    {
      key: "04",
      title: T("processValidation"),
      body: T("processValidationBody"),
    },
    {
      key: "05",
      title: T("processDeployment"),
      body: T("processDeploymentBody"),
    },
  ];

  return (
    <Section
      kicker="PROCESS / 003"
      title={T("processTitle")}
      desc={T("processDesc")}
      id="process"
      scene="ProcessScene3D"
      sceneTint="#2ED2FF"
      sceneEnabled={sceneEnabled}
    >
      <ol className="relative grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* connecting rail on large screens */}
        <span
          className="hidden lg:block absolute top-[38px] left-6 right-6 h-px bg-gradient-to-r from-violet-500/40 via-mint-400/40 to-transparent"
          aria-hidden
        />
        {stages.map((s, i) => (
          <li
            key={s.key}
            className="relative kb-card"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="relative z-10 w-12 h-12 grid place-items-center rounded-2xl bg-grad-cta text-white font-mono text-sm font-bold shadow-glow-violet-sm">
                {s.key}
              </span>
              <span className="font-mono text-[10px] tracking-widest text-ink-4">
                {ar ? "المرحلة" : "STAGE"}
              </span>
            </div>
            <h3 className="font-display text-xl text-ink-0 mb-2">{s.title}</h3>
            <p className="text-sm leading-relaxed text-ink-3">{s.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
