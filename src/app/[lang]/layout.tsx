import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LocaleSync from "@/components/LocaleSync";
import { getHome } from "@/lib/data";
import { LOCALES, isLocale, pick } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { SITE_URL } from "@/lib/supabase";
import {
  organizationSchema,
  websiteSchema,
  jsonLd,
} from "@/lib/structured-data";

/* Starfield runs on a 2D canvas (no WebGL) — lazy-loaded client-side so it
   never blocks first paint and never competes for the single GPU context. */
const StarfieldBackground = dynamic(
  () => import("@/components/visuals/StarfieldBackground"),
  { ssr: false },
);

/* ====================================================================
 * Non-critical global chrome — each renders `null` as its shell and only
 * mounts behaviour after the page is interactive. Loading them with
 * `ssr:false` keeps their JavaScript out of the initial hydration pass,
 * which is what actually reduces TBT: the main thread finishes rendering
 * the real content before these effects are even requested.
 * ==================================================================== */
const SmoothScroll = dynamic(() => import("@/components/motion/SmoothScroll"), {
  ssr: false,
});
const PageTransition = dynamic(
  () => import("@/components/motion/PageTransition"),
  { ssr: false },
);
const ScrollProgress = dynamic(
  () => import("@/components/motion/ScrollProgress"),
  { ssr: false },
);
const CursorGlow = dynamic(() => import("@/components/motion/CursorGlow"), {
  ssr: false,
});
const ClickSpark = dynamic(() => import("@/components/reactbits/ClickSpark"), {
  ssr: false,
});

export const revalidate = 60;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}) {
  const { lang } = params;
  const { settings } = await getHome();

  const title =
    settings.site_title ||
    (lang === "ar"
      ? "الحلول البرمجية والذكاء الاصطناعي"
      : "Software, AI & Digital Product Engineering");

  const description =
    pick(settings, "home_desc", lang as Locale) ||
    (lang === "ar"
      ? "أركاي للحلول البرمجية: نبني المنتجات الرقمية ومنصات الويب وحلول الذكاء الاصطناعي والأنظمة المدمجة وإنترنت الأشياء."
      : "Archai Solutions designs and builds digital products, web platforms, AI-powered workflows, and embedded/IoT systems.");

  const brand = lang === "ar" ? "أركاي للحلول البرمجية" : "Archai Solutions";
  const brandMark = lang === "ar" ? "أركاي" : "Archai Solutions";
  // Guard against a duplicate brand suffix (e.g. site_title already = "Archai Solutions").
  const localizedTitle = title.includes(brandMark)
    ? title
    : `${title} | ${brand}`;

  const canonical = `${SITE_URL}/${lang}`;
  const keywords =
    lang === "ar"
      ? [
          "أركاي",
          "تطوير برمجيات",
          "تطبيقات ويب",
          "ذكاء اصطناعي",
          "أنظمة مدمجة",
          "إنترنت الأشياء",
          "شركة برمجة مصر",
        ]
      : [
          "Archai Solutions",
          "software development company",
          "web development",
          "AI integration",
          "digital product engineering",
          "embedded systems",
          "IoT solutions",
        ];

  // The brand suffix must not be appended when the resolved title already
  // carries the brand — that is exactly what produced the duplicated
  // "Archai Solutions | Archai Solutions" <title>. Use an absolute title so
  // the parent layout's `%s | Archai Solutions` template is bypassed.
  const titleMetadata = { absolute: localizedTitle };

  return {
    metadataBase: new URL(SITE_URL),
    title: titleMetadata,
    description,
    keywords,
    applicationName: "Archai Solutions",
    category: "technology",
    authors: [{ name: "Archai Solutions", url: SITE_URL }],
    creator: "Archai Solutions",
    publisher: "Archai Solutions",
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      apple: "/apple-icon.png",
    },
    alternates: {
      canonical,
      languages: {
        ar: `${SITE_URL}/ar`,
        en: `${SITE_URL}/en`,
        "x-default": `${SITE_URL}/en`,
      },
    },
    openGraph: {
      title: localizedTitle,
      description,
      url: canonical,
      siteName: "Archai Solutions",
      type: "website",
      locale: lang === "ar" ? "ar_EG" : "en_US",
      alternateLocale: lang === "ar" ? "en_US" : "ar_EG",
      images: settings.default_seo_image
        ? [
            {
              url: settings.default_seo_image,
              width: 1200,
              height: 630,
              alt: localizedTitle,
            },
          ]
        : [
            {
              url: `${SITE_URL}/${lang}/opengraph-image`,
              width: 1200,
              height: 630,
              alt: localizedTitle,
            },
          ],
    },
    twitter: {
      card: "summary_large_image",
      title: localizedTitle,
      description,
      images: [`${SITE_URL}/${lang}/opengraph-image`],
      creator: "@archaisolutions",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const { lang } = params;
  if (!isLocale(lang)) notFound();
  const { cats, projects, settings } = await getHome();
  const withProjects = cats.filter((c) =>
    projects.some((p) => p.category_id === c.id)
  );

  return (
    <>
      {/* ============================================================
          Structured data — Organization + Website
          ============================================================ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema(lang, settings)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(websiteSchema(lang)) }}
      />

      {/* ============================================================
          Global layers — each page renders its own WebGL Backdrop.
          ============================================================ */}
      <StarfieldBackground />
      <PageTransition />
      <SmoothScroll />
      <LocaleSync lang={lang} />
      <ScrollProgress />
      <CursorGlow />
      <ClickSpark>{" "}</ClickSpark>

      {/* Skip link — first focusable element on every page. */}
      <a href="#main-content" className="skip-link">
        {lang === "ar" ? "تخطَّ إلى المحتوى" : "Skip to content"}
      </a>

      <Header lang={lang} cats={withProjects} />

      <main id="main-content" className="relative pt-[76px]" tabIndex={-1}>
        {children}
      </main>

      <Footer lang={lang} cats={withProjects} settings={settings} />
    </>
  );
}