import Link from "next/link";
import { tr } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import SectionVisual from "@/components/visuals/SectionVisual";
import Magnet from "@/components/reactbits/Magnet";
import StarBorder from "@/components/reactbits/StarBorder";

/** Section 9 — FINAL CTA (KB: "Let's engineer what's next."). */
export default function FinalCTASection({ lang }: { lang: Locale }) {
  const T = tr(lang);

  return (
    <section className="relative py-28 lg:py-36 overflow-hidden" id="cta">
      <div className="absolute inset-0 nebula opacity-40" aria-hidden />
      <div className="absolute inset-0 grid-floor opacity-25" aria-hidden />

      <div className="wrap relative">
        <div className="section-scene kb-scroll-reveal mb-10 rounded-3xl overflow-hidden">
          <SectionVisual variant="portal" className="h-full w-full" />
        </div>
      </div>

      <div className="wrap relative text-center max-w-4xl mx-auto kb-reveal">
        <span className="section-kicker justify-center inline-flex">
          {T("readyToStart")}
        </span>
        <h2 className="section-title text-4xl md:text-5xl lg:text-6xl mt-6">
          {T("finalCTA")}
        </h2>
        <p className="section-desc mx-auto mt-6">{T("finalCTADesc")}</p>

        <div className="mt-10 flex flex-wrap gap-4 justify-center items-center">
          <StarBorder as="span" color="#2ED2FF" speed={5}>
            <Magnet strength={0.25} padding={40}>
              <Link href={`/${lang}/contact`} className="btn-primary">
                {T("startProject")}
                <span className="text-lg">↗</span>
              </Link>
            </Magnet>
          </StarBorder>
          <Magnet strength={0.2} padding={40}>
            <Link href={`/${lang}/services`} className="btn-ghost">
              {T("talkToEngineers")}
            </Link>
          </Magnet>
        </div>
      </div>
    </section>
  );
}
