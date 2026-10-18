import { tr } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import Section from "./Section";
import Spotlight from "@/components/reactbits/Spotlight";

/** Section 4 — INDUSTRIES (4 KB industries with their exact focus lists). */
export default function IndustriesSection({
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
      icon: "◇",
      title: T("aerospaceTitle"),
      topics: [
        T("aerospaceTopic1"),
        T("aerospaceTopic2"),
        T("aerospaceTopic3"),
        T("aerospaceTopic4"),
      ],
      color: "#2ED2FF",
    },
    {
      key: "02",
      icon: "⌁",
      title: T("industrialTitle"),
      topics: [
        T("industrialTopic1"),
        T("industrialTopic2"),
        T("industrialTopic3"),
        T("industrialTopic4"),
      ],
      color: "#2ED2FF",
    },
    {
      key: "03",
      icon: "▤",
      title: T("healthcareTitle"),
      topics: [
        T("healthcareTopic1"),
        T("healthcareTopic2"),
        T("healthcareTopic3"),
      ],
      color: "#8AE8FF",
    },
    {
      key: "04",
      icon: "◎",
      title: T("energyTitle"),
      topics: [
        T("energyTopic1"),
        T("energyTopic2"),
        T("energyTopic3"),
        T("energyTopic4"),
      ],
      color: "#C48A5C",
    },
  ];

  return (
    <Section
      kicker="INDUSTRIES / 002"
      title={T("industriesTitle")}
      desc={T("industriesDesc")}
      id="industries"
      scene="IndustriesScene"
      sceneTint="#C48A5C"
      sceneEnabled={sceneEnabled}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {items.map((ind) => (
          <Spotlight key={ind.key} color={`${ind.color}44`} className="rounded-3xl">
          <article
            className="group relative glass rounded-3xl p-8 overflow-hidden hover:-translate-y-1.5 transition-transform duration-500 h-full"
            style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
          >
            <span
              className="absolute top-0 left-0 h-1 w-24 opacity-70 group-hover:w-full transition-all duration-500"
              style={{
                background: `linear-gradient(90deg, ${ind.color}, transparent)`,
              }}
            />
            <div className="flex items-center gap-4 mb-5">
              <span
                className="w-12 h-12 grid place-items-center rounded-2xl text-2xl border"
                style={{
                  color: ind.color,
                  borderColor: `${ind.color}55`,
                  background: `${ind.color}14`,
                }}
              >
                {ind.icon}
              </span>
              <h3 className="font-display text-2xl text-ink-0">{ind.title}</h3>
            </div>
            <ul className="space-y-2.5">
              {ind.topics.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-3 text-sm text-ink-3"
                >
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: ind.color }}
                  />
                  {t}
                </li>
              ))}
            </ul>
          </article>
          </Spotlight>
        ))}
      </div>
    </Section>
  );
}
