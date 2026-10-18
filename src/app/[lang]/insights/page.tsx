import MarketingPage from "@/components/marketing/MarketingPage";
import { pageSeo } from "@/lib/seo";
import { pageContent } from "@/lib/content";
import { getHome } from "@/lib/data";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/types";

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const lang = isLocale(params.lang) ? params.lang : "en";
  const { settings } = await getHome();
  const c = pageContent(lang, "insights", settings.content);
  return pageSeo(lang, "insights", `${c.title} ${c.accent}`, c.description);
}

export default async function Page({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang as Locale;
  const { settings } = await getHome();
  const c = pageContent(lang, "insights", settings.content);

  return (
    <MarketingPage
      lang={lang}
      kind="insights"
      eyebrow={c.eyebrow}
      title={c.title}
      accent={c.accent}
      description={c.description}
      primary={lang === "ar" ? "ابدأ مشروعك" : "Start your project"}
      primaryHref="https://landing-ideas.web.app/"
      secondary={lang === "ar" ? "استكشف المشاريع" : "Explore projects"}
      secondaryHref={`/${lang}/portfolio`}
      cards={c.cards}
      outroTitle={c.outroTitle}
      outroText={c.outroText}
      accentColor="violet"
    />
  );
}