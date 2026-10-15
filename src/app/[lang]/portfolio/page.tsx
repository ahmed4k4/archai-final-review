import Link from "next/link";
import PortfolioGallery from "@/components/PortfolioGallery";
import CategoryCards from "@/components/CategoryCards";
import Backdrop from "@/components/visuals/Backdrop";
import SectionScene from "@/components/visuals/SectionScene";
import { getHome } from "@/lib/data";
import { LOCALES, pick, tr } from "@/lib/i18n";
import { SITE_URL } from "@/lib/supabase";
import { pageSeo } from "@/lib/seo";
import {
  breadcrumbSchema,
  collectionPageSchema,
  jsonLd,
} from "@/lib/structured-data";

export const revalidate = 60;

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}) {
  const { lang } = params;
  const ar = lang === "ar";
  const title = ar ? "أعمالنا" : "Our Work";
  const description = ar
    ? "استعرض محفظة مشاريع Archai Solutions — حلول برمجية وأنظمة مدمجة وذكاء اصطناعي عبر قطاعات متعددة."
    : "Explore the Archai Solutions portfolio — software, embedded systems, and AI solutions across multiple industries.";
  return pageSeo(lang as any, "portfolio", title, description);
}

export default async function PortfolioPage({
  params,
}: {
  params: { lang: string };
}) {
  const { lang } = params;
  const T = tr(lang as any);
  const ar = lang === "ar";
  const { cats, projects } = await getHome();

  const list = [...projects].sort(
    (a, b) =>
      (b.featured ? 1 : 0) - (a.featured ? 1 : 0) ||
      (a.sort_order || 0) - (b.sort_order || 0),
  );

  const title = ar ? "أعمالنا" : "Our Work";
  const subtitle = ar
    ? "كل مشاريعنا في مكان واحد — فلترة حسب القسم أو التقنية."
    : "All our projects in one place — filter by category or technology.";

  return (
    <main className="wrap py-12">
      <Backdrop name="portfolio" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbSchema(lang as any, [
              { name: T("home"), url: `${SITE_URL}/${lang}` },
              { name: title, url: `${SITE_URL}/${lang}/portfolio` },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            collectionPageSchema(
              lang as any,
              title,
              subtitle,
              `${SITE_URL}/${lang}/portfolio`,
              list.map((p) => ({
                name: pick(p, "title", lang as any),
                url: `${SITE_URL}/${lang}/projects/${p.id}`,
              })),
            ),
          ),
        }}
      />

      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-2 text-xs text-ink-4 mb-8"
        aria-label="Breadcrumb"
      >
        <Link
          href={`/${lang}`}
          className="hover:text-[#2ED2FF] transition-colors"
        >
          {T("home")}
        </Link>
        <span>›</span>
        <span className="text-ink-2">{title}</span>
      </nav>

      {/* 3D portfolio grid scene */}
      <div className="section-scene mb-12 rounded-3xl overflow-hidden">
        <SectionScene
          name="PortfolioGridScene"
          className="h-full w-full"
          tint="#2ED2FF"
        />
      </div>

      {/* Hero header */}
      <header className="relative mb-12 p-8 lg:p-12 rounded-4xl glass overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2ED2FF]/15 blur-3xl rounded-full pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="flex-1">
            <span className="section-kicker">
              {ar ? "المحفظة" : "Portfolio"}
            </span>
            <h1 className="section-title mt-2">{title}</h1>
            <p className="text-ink-3 mt-3 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>
          <div className="text-center p-5 rounded-2xl bg-white/[0.03] border border-[#2ED2FF]/20">
            <b className="block font-display text-4xl font-medium bg-grad-text-light dark:bg-grad-text bg-clip-text text-transparent">
              {list.length}
            </b>
            <span className="text-xs text-ink-4 font-mono uppercase tracking-wider">
              {T("projectsWord")}
            </span>
          </div>
        </div>
      </header>

      {/* Filters + grid/list */}
      <PortfolioGallery projects={list} cats={cats} lang={lang as any} />

      {/* Categories */}
      {cats.length > 0 && (
        <section className="mt-20">
          <h2 className="section-title mb-8">{T("browseCats")}</h2>
          <CategoryCards cats={cats} projects={projects} lang={lang as any} />
        </section>
      )}
    </main>
  );
}
