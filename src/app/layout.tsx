import "./styles/globals.css";
import "./globals.css";
import { Readex_Pro, Sora, JetBrains_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";

/* ====================================================================
 * FONTS — self-hosted via next/font.
 *
 * Before: four <link rel=stylesheet> families pulled from
 * fonts.googleapis.com (~122 KB, 5 render-blocking requests, 750 ms of
 * blocking time on Slow 4G) with 4-5 weights each.
 *
 * After: next/font downloads and self-hosts the exact files at build time,
 * emits them from /_next/static/media (same origin → no extra DNS/TLS),
 * inlines the @font-face CSS, and applies `font-display: swap` + the size-
 * adjust metrics automatically (no CLS). Weights are trimmed to what the
 * design actually uses: 400 + 600, plus 500 for the display face.
 *
 * The CSS variables (`--font-sans`, `--font-display`, ...) are re-declared
 * in styles/globals.css so every existing `var(--font-* )` reference keeps
 * working unchanged.
 * ==================================================================== */

const readex = Readex_Pro({
  subsets: ["arabic", "latin"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-readex",
  preload: true,
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-sora",
  preload: true,
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-jetbrains",
  preload: false,
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-plex-arabic",
  preload: false,
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://archai-website-navy.vercel.app"),
  title: { default: "Archai Solutions | Software, AI & Digital Product Engineering", template: "%s | Archai Solutions" },
  description: "Archai Solutions designs and builds digital products, web platforms, AI-powered workflows, and embedded/IoT systems.",
  applicationName: "Archai Solutions",
  category: "technology",
  keywords: ["Archai Solutions", "software development company", "web development", "AI integration", "digital product engineering", "embedded systems", "IoT solutions", "تطوير البرمجيات", "تصميم وتطوير المواقع", "حلول الذكاء الاصطناعي", "الأنظمة المدمجة", "إنترنت الأشياء"],
  icons: { icon: "/icon.svg" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { type: "website", siteName: "Archai Solutions", title: "Archai Solutions | Software, AI & Digital Product Engineering", description: "Digital products, web platforms, AI integrations, embedded systems, and IoT solutions.", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Archai Solutions" }] },
  twitter: { card: "summary_large_image", title: "Archai Solutions | Software, AI & Digital Product Engineering", description: "Digital products, web platforms, AI integrations, embedded systems, and IoT solutions.", images: ["/opengraph-image"] },
};

export const viewport = {
  themeColor: "#071015",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${readex.variable} ${sora.variable} ${jetbrains.variable} ${plexArabic.variable}`}
    >
      <head>
        {/* Fonts are fully self-hosted by next/font above — the previous
            Google Fonts preconnects + render-blocking stylesheet are gone. */}
        <script dangerouslySetInnerHTML={{ __html: "try{document.documentElement.dataset.theme=localStorage.theme||'dark';var en=location.pathname.startsWith('/en');document.documentElement.lang=en?'en':'ar';document.documentElement.dir=en?'ltr':'rtl'}catch(e){}" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
