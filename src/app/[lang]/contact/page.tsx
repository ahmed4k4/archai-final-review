import MarketingPage from "@/components/marketing/MarketingPage";
import { pageSeo } from "@/lib/seo";
import { pageContent } from "@/lib/content";
import { getHome } from "@/lib/data";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/types";
import { SITE_URL } from "@/lib/supabase";
import { jsonLd } from "@/lib/structured-data";

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}) {
  const lang = isLocale(params.lang) ? params.lang : "en";
  const { settings } = await getHome();
  const c = pageContent(lang, "contact", settings.content);
  return pageSeo(lang, "contact", `${c.title} ${c.accent}`, c.description);
}

export default async function Page({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang as Locale;
  const { settings } = await getHome();
  const c = pageContent(lang, "contact", settings.content);

  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `${c.title} ${c.accent}`,
    description: c.description,
    url: `${SITE_URL}/${lang}/contact`,
    inLanguage: lang === "ar" ? "ar-EG" : "en-US",
    about: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(contactSchema) }}
      />
      <MarketingPage
        lang={lang}
        kind="contact"
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
        accentColor="mint"
      />
    </>
  );
}