import { tr } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import Section from "./Section";
import Spotlight from "@/components/reactbits/Spotlight";

/** Section 8 — WHY CHOOSE US (6 KB value propositions). */
export default function WhyUsSection({
  lang,
  sceneEnabled = true,
}: {
  lang: Locale;
  sceneEnabled?: boolean;
}) {
  const T = tr(lang);

  const items = [
    { key: "01", icon: "✓", title: T("whyQuality"), desc: T("whyQualityDesc") },
    {
      key: "02",
      icon: "⌘",
      title: T("whyEndToEnd"),
      desc: T("whyEndToEndDesc"),
    },
    {
      key: "03",
      icon: "⌁",
      title: T("whyHardware"),
      desc: T("whyHardwareDesc"),
    },
    { key: "04", icon: "✧", title: T("whyModern"), desc: T("whyModernDesc") },
    {
      key: "05",
      icon: "↗",
      title: T("whyReliable"),
      desc: T("whyReliableDesc"),
    },
    { key: "06", icon: "↻", title: T("whySupport"), desc: T("whySupportDesc") },
  ];

  return (
    <Section
      kicker="WHY ARCHAI / 005"
      title={T("whyUsTitle")}
      desc={T("whyUsDesc")}
      id="why"
      scene="WhyUsScene"
      sceneTint="#C48A5C"
      sceneEnabled={sceneEnabled}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((w, i) => (
          <Spotlight key={w.key} color="rgba(46,210,255,0.3)" className="rounded-3xl">
          <article
            className="kb-card group relative glass rounded-3xl p-7 hover:-translate-y-1.5 transition-transform duration-500 h-full"
            style={{
              animationDelay: `${i * 0.06}s`,
              transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <div className="flex items-start justify-between mb-5">
              <span className="font-mono text-[10px] tracking-widest text-ink-4">
                {w.key}
              </span>
              <span className="w-11 h-11 grid place-items-center rounded-2xl bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xl group-hover:rotate-[15deg] transition-transform duration-500">
                {w.icon}
              </span>
            </div>
            <h3 className="font-display text-xl text-ink-0 mb-2">{w.title}</h3>
            <p className="text-sm leading-relaxed text-ink-3">{w.desc}</p>
          </article>
          </Spotlight>
        ))}
      </div>
    </Section>
  );
}
