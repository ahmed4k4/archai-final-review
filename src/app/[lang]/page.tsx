import Link from "next/link";
import Hero from "../../components/Hero";
import Slider from "../../components/Slider";
import Explorer from "../../components/Explorer";
import CategoryCards from "../../components/CategoryCards";
import Backdrop from "../../components/visuals/Backdrop";
import ClientShowcase from "../../components/ClientShowcase";
import ProjectCard from "../../components/ProjectCard";
import DigitalCoreSection from "../../components/sections/DigitalCoreSection";
import DisciplinesSection from "../../components/sections/DisciplinesSection";
import IndustriesSection from "../../components/sections/IndustriesSection";
import ProcessSection from "../../components/sections/ProcessSection";
import TechStackSection from "../../components/sections/TechStackSection";
import WhyUsSection from "../../components/sections/WhyUsSection";
import FinalCTASection from "../../components/sections/FinalCTASection";
import { ActiveSceneProvider } from "../../components/visuals/ActiveSceneContext";
import { getHome } from "../../lib/data";
import { tr, isLocale } from "../../lib/i18n";
import type { Locale } from "../../lib/types";
import { notFound } from "next/navigation";

export const revalidate = 60;

/**
 * Homepage — nine KB sections:
 *   1. Hero (KB message)          6. Featured projects (Supabase)
 *   2. Digital Core               7. Technology stack
 *   3. Engineering disciplines    8. Why choose us
 *   4. Industries                 9. Final CTA
 *   5. Engineering process
 *
 * KB content is static; only the projects / categories come from Supabase.
 * A single WebGL scene lives in the Hero — everything else is CSS/SVG.
 */
export default async function Home({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang as Locale;
  const T = tr(lang);
  const { cats, projects, settings, configured } = await getHome();
  const vis = settings.section_visibility || {};

  /* Homepage shows only the first 3 projects; the full grid lives on
     /portfolio. `settings.featured_limit` is respected as an upper bound
     but never exceeds 3 on the homepage. */
  const homeLimit = Math.min(settings.featured_limit || 3, 3);
  const featured = projects
    .filter((p) => p.featured)
    .sort(
      (a, b) =>
        (a.featured_sort_order ?? 0) - (b.featured_sort_order ?? 0) ||
        (a.sort_order ?? 0) - (b.sort_order ?? 0)
    )
    .slice(0, homeLimit);

  /* If nothing is flagged featured, fall back to the first three projects. */
  const featuredList = featured.length ? featured : projects.slice(0, homeLimit);

  /* The homepage keeps exactly ONE WebGL context and it belongs to the hero.
   * Creating a second concurrent context (one per section) exhausts the GPU
   * context budget and crashes the renderer on constrained devices, so the
   * sections use their rich CSS-3D identity panels. The SectionScene components
   * remain fully built and are used on pages where they are the only canvas
   * (e.g. category pages). */
  const sectionSceneEnabled = false;

  return (
    <>
      <Backdrop name="home" />

      {/* Exactly one WebGL scene is alive at a time across the page; the hero
          participates in the same active-scene gate as the sections. */}
      <ActiveSceneProvider>
      {/* 1 — HERO (single WebGL scene) */}
      {vis.hero !== false ? (
        <Hero lang={lang} settings={settings} count={projects.length} />
      ) : null}

      <main id="app">
          {/* 2 — DIGITAL CORE */}
          <DigitalCoreSection lang={lang} sceneEnabled={sectionSceneEnabled} />

          {/* 3 — ENGINEERING DISCIPLINES */}
          <DisciplinesSection lang={lang} sceneEnabled={sectionSceneEnabled} />

          {/* 4 — INDUSTRIES */}
          <IndustriesSection lang={lang} sceneEnabled={sectionSceneEnabled} />

          {/* 5 — ENGINEERING PROCESS */}
          <ProcessSection lang={lang} sceneEnabled={sectionSceneEnabled} />

        {/* 6 — FEATURED PROJECTS (Supabase) */}
        {featuredList.length ? (
          <section className="relative py-20 lg:py-28" id="work">
            <div className="wrap">
              <header className="kb-reveal mb-12">
                <span className="section-kicker">WORK / 006</span>
                <h2 className="section-title">{T("featuredProjects")}</h2>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {featuredList.map((p) => (
                  <ProjectCard key={p.id} p={p} lang={lang} />
                ))}
              </div>

              {vis.featured !== false ? (
                <Slider
                  id="sl"
                  items={featured.length ? featured : featuredList}
                  lang={lang}
                  label={T("featT")}
                />
              ) : null}

              <div className="mt-8 flex flex-wrap gap-4">
                <Link href={`/${lang}/portfolio`} className="btn-primary">
                  {T("viewAll")}
                  <span aria-hidden>↗</span>
                </Link>
              </div>

              {!configured ? (
                <div className="notice mt-10">
                  <b>{T("setupTitle")}</b>
                  <p>{T("setupBody")}</p>
                </div>
              ) : null}

              {/* Categories + full explorer live under the featured grid */}
              {cats.length ? (
                <section className="mt-20" id="explore">
                  <h2 className="section-title text-3xl mb-3">{T("browseCats")}</h2>
                  <p className="section-desc mb-8">{T("browseSub")}</p>
                  <CategoryCards cats={cats} projects={projects} lang={lang} />
                </section>
              ) : null}

              <div className="mt-16">
                <Explorer
                  cats={cats}
                  projects={projects}
                  lang={lang}
                  limit={settings.projects_per_category || 6}
                />
              </div>
            </div>
          </section>
        ) : null}

        {/* 7 — TECHNOLOGY STACK */}
        <TechStackSection lang={lang} sceneEnabled={sectionSceneEnabled} />

        {/* 8 — WHY CHOOSE US */}
        <WhyUsSection lang={lang} sceneEnabled={sectionSceneEnabled} />

          {/* 9 — FINAL CTA */}
          <FinalCTASection lang={lang} />
      </main>
      </ActiveSceneProvider>

      <ClientShowcase lang={lang} />
    </>
  );
}
