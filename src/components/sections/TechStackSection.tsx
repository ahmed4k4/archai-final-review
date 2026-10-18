import { tr } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import Section from "./Section";

/** Section 7 — TECHNOLOGY STACK (7 KB categories with exact technology lists). */
export default function TechStackSection({
  lang,
  sceneEnabled = true,
}: {
  lang: Locale;
  sceneEnabled?: boolean;
}) {
  const T = tr(lang);

  const groups = [
    {
      key: "Frontend",
      label: T("techFrontend"),
      items: [
        "React",
        "TypeScript",
        "Next.js",
        "Tailwind CSS",
        "Three.js",
        "Framer Motion",
      ],
      color: "#2ED2FF",
    },
    {
      key: "Backend",
      label: T("techBackend"),
      items: ["Node.js", "Python", "Go", "Rust", "PostgreSQL", "Redis"],
      color: "#2ED2FF",
    },
    {
      key: "Embedded",
      label: T("techEmbedded"),
      items: [
        "C/C++",
        "Zephyr RTOS",
        "FreeRTOS",
        "ARM Cortex-M",
        "FPGA",
        "VHDL/Verilog",
      ],
      color: "#8AE8FF",
    },
    {
      key: "AI",
      label: T("techAI"),
      items: [
        "PyTorch",
        "TensorFlow",
        "ONNX Runtime",
        "Hugging Face",
        "LangChain",
        "OpenCV",
      ],
      color: "#C48A5C",
    },
    {
      key: "Cloud",
      label: T("techCloud"),
      items: [
        "Kubernetes",
        "Docker",
        "AWS",
        "Google Cloud Platform",
        "Terraform",
        "GitLab CI",
      ],
      color: "#C48A5C",
    },
    {
      key: "IoT",
      label: T("techIoT"),
      items: [
        "MQTT",
        "LoRaWAN",
        "Bluetooth Low Energy",
        "Modbus",
        "OPC UA",
        "Thread",
      ],
      color: "#8AE8FF",
    },
    {
      key: "Mobile",
      label: T("techMobile"),
      items: [
        "React Native",
        "Flutter",
        "Swift",
        "Kotlin",
        "Expo",
        "Capacitor",
      ],
      color: "#5CDDFF",
    },
  ];

  return (
    <Section
      kicker="STACK / 004"
      title={T("techStackTitle")}
      desc={T("techStackDesc")}
      id="stack"
      scene="TechStackScene"
      sceneTint="#8AE8FF"
      sceneEnabled={sceneEnabled}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((g, i) => (
          <div
            key={g.key}
            className="kb-card glass rounded-3xl p-6 hover:-translate-y-1.5 transition-transform duration-500"
            style={{
              animationDelay: `${i * 0.05}s`,
              transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: g.color,
                  boxShadow: `0 0 12px ${g.color}`,
                }}
              />
              <h3 className="font-display text-lg text-ink-0">{g.label}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {g.items.map((t) => (
                <span key={t} className="tech-chip">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
