import { marketingContent } from "./marketing-content";
import type { Locale } from "./types";

/**
 * content.ts — single place that resolves the *effective* content for a page.
 *
 * The dashboard writes JSONB overrides into `site_settings.content` keyed by
 * page key (about, services, industries, process, insights, contact, ...).
 * Anything the admin leaves empty falls back to the built-in static defaults
 * from `marketing-content.ts`, so the site never breaks and no content is
 * ever hardcoded without a DB escape hatch.
 *
 * Shape stored in `site_settings.content`:
 *   {
 *     "about":      { "title": "…", "accent": "…", "description": "…", "cards": [...] },
 *     "services":   { ... },
 *     "industries": { ... },
 *     "process":    { ... },
 *     "insights":   { ... },
 *     "contact":    { ... }
 *   }
 */

export type PageContent = {
  title: string;
  accent: string;
  description: string;
  outroTitle: string;
  outroText: string;
  cards: any[];
  [key: string]: any;
};

/** Shallow-merge the DB override object over the static default. */
function merge<T extends Record<string, any>>(
  base: T,
  override?: Record<string, any> | null,
): T {
  if (!override || typeof override !== "object") return base;
  const out: Record<string, any> = { ...base };
  for (const [k, v] of Object.entries(override)) {
    if (v === null || v === undefined || v === "") continue;
    out[k] = v;
  }
  return out as T;
}

/**
 * Effective content for a marketing page in a given locale.
 * `overrides` is the whole `site_settings.content` object; we look up the
 * page key, then the locale within it, then fall back to static defaults.
 */
export function pageContent(
  lang: Locale,
  key: string,
  overrides?: Record<string, any> | null,
): PageContent {
  const base = marketingContent(lang, key) as PageContent;
  const all = overrides?.[key];
  const scoped = all && typeof all === "object" ? (all[lang] ?? all) : null;
  return merge(base, scoped);
}

/** Effective hero copy (title/subtitle/CTAs/stats) with static fallback. */
export function heroContent(
  lang: Locale,
  overrides?: Record<string, any> | null,
) {
  const all = overrides ?? {};
  const scoped = all[lang] ?? all;
  return {
    eyebrow: scoped?.eyebrow ?? "",
    title: scoped?.[`title_${lang}`] ?? scoped?.title ?? "",
    subtitle: scoped?.[`subtitle_${lang}`] ?? scoped?.subtitle ?? "",
    ctaPrimary: scoped?.ctaPrimary ?? "",
    ctaSecondary: scoped?.ctaSecondary ?? "",
    stats: Array.isArray(scoped?.stats) ? scoped.stats : [],
  };
}

/** Effective footer contact/social/legal with static fallback. */
export function footerContent(overrides?: Record<string, any> | null) {
  const all = overrides ?? {};
  return {
    contact: all.contact ?? {},
    social: all.social ?? {},
    legal: all.legal ?? {},
  };
}

/** Effective SEO metadata override for a page key. */
export function seoOverride(
  lang: Locale,
  key: string,
  overrides?: Record<string, any> | null,
): { title?: string; description?: string; image?: string } {
  const all = overrides?.[key];
  const scoped = all && typeof all === "object" ? (all[lang] ?? all) : null;
  return {
    title: scoped?.title,
    description: scoped?.description,
    image: scoped?.image,
  };
}
