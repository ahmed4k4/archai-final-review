import { tr } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import Section from "./Section";
import Spotlight from "@/components/reactbits/Spotlight";
import RotatingText from "@/components/reactbits/RotatingText";

/** Section 3 — ENGINEERING DISCIPLINES (3 KB disciplines). */
export default function DisciplinesSection({
  lang,
  sceneEnabled = true,
}: {
  lang: Locale;
  sceneEnabled?: boolean;
}) {
  const T = tr(lang);

  const items = [
    {
      key: "01",
      icon: "⌘",
      title: T("softwareTitle"),
      desc: T("softwareDesc"),
      topics: [T("softwareTopic1"), T("softwareTopic2"), T("softwareTopic3")],
      color: "#2ED2FF",
    },
    {
      key: "02",
      icon: "⌁",
      title: T("embeddedTitle"),
      desc: T("embeddedDesc"),
      topics: [T("embeddedTopic1"), T("embeddedTopic2"), T("embeddedTopic3")],
      color: "#2ED2FF",
    },
    {
      key: "03",
      icon: "✧",
      title: T("aiTitle"),
      desc: T("aiDesc"),
      topics: [T("aiTopic1"), T("aiTopic2"), T("aiTopic3")],
      color: "#8AE8FF",
    },
  ];

  return (
    <Section
      kicker="WHAT WE DO / 001"
      title={T("disciplinesTitle")}
      accent={
        <RotatingText
          items={[T("softwareTitle"), T("embeddedTitle"), T("aiTitle")]}
        />
      }
      desc={T("disciplinesDesc")}
      id="disciplines"
      scene="DisciplinesScene"
      sceneTint="#2ED2FF"
      sceneEnabled={sceneEnabled}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((d) => (
          <Spotlight key={d.key} color={`${d.color}44`} className="rounded-3xl">
          <article
            className="group relative glass rounded-3xl p-8 overflow-hidden hover:-translate-y-2 transition-transform duration-500 h-full"
            style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
          >
            <div
              className="absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl opacity-0 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none"
              style={{ background: d.color }}
            />
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-[10px] tracking-widest text-ink-4">
                {d.key}
              </span>
              <span
                className="w-12 h-12 grid place-items-center rounded-2xl text-2xl border group-hover:rotate-[15deg] transition-transform duration-500"
                style={{
                  color: d.color,
                  borderColor: `${d.color}55`,
                  background: `${d.color}14`,
                }}
              >
                {d.icon}
              </span>
            </div>
            <h3 className="font-display text-2xl text-ink-0 mb-3">{d.title}</h3>
            <p className="text-sm leading-relaxed text-ink-3 mb-5">{d.desc}</p>
            <div className="flex flex-wrap gap-2">
              {d.topics.map((t) => (
                <span key={t} className="tech-chip">
                  {t}
                </span>
              ))}
            </div>
          </article>
          </Spotlight>
        ))}
      </div>
    </Section>
  );
}
