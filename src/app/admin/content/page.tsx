"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Save, LayoutTemplate, Home, Share2, Search } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useAdminI18n } from "@/components/admin/AdminI18n";

/**
 * /admin/content — controls EVERY editable site section from Supabase.
 *
 * Everything is stored as JSONB on `site_settings`:
 *   hero    → title/subtitle per locale (+ CTAs)
 *   content → per-page marketing copy (about, services, industries, process, insights, contact)
 *   footer  → contact email/phone/address + social links
 *   seo     → per-page SEO title/description overrides
 *
 * The public site merges these overrides over the built-in defaults, so an
 * empty field simply falls back to the shipped copy.
 */

type TabKey = "hero" | "pages" | "footer" | "seo";

const PAGE_KEYS = [
  "about",
  "services",
  "industries",
  "process",
  "insights",
  "contact",
] as const;

export default function ContentEditor() {
  const { locale } = useAdminI18n();
  const sb = supabaseBrowser();
  const ar = locale === "ar";

  const [f, setF] = useState<any>({
    hero: {},
    content: {},
    footer: {},
    seo: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<TabKey>("hero");
  const [pageKey, setPageKey] = useState<string>("about");

  useEffect(() => {
    sb.from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (data) {
          setF({
            hero: data.hero || {},
            content: data.content || {},
            footer: data.footer || {},
            seo: data.seo || {},
          });
        }
        if (error) toast.error(error.message);
        setLoading(false);
      });
  }, [sb]);

  async function save() {
    setSaving(true);
    const toastId = toast.loading(ar ? "جارٍ الحفظ…" : "Saving…");
    const { error } = await sb
      .from("site_settings")
      .update({
        hero: f.hero,
        content: f.content,
        footer: f.footer,
        seo: f.seo,
      })
      .eq("id", 1);
    if (error) {
      toast.error(error.message, { id: toastId });
      setSaving(false);
      return;
    }
    const session = (await sb.auth.getSession()).data.session;
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token || ""}` },
    });
    toast.success(ar ? "تم الحفظ" : "Saved", { id: toastId });
    setSaving(false);
  }

  /* ---- JSONB path helpers (immutable set) ---- */
  const setPath = (path: (string | number)[], value: any) =>
    setF((prev: any) => {
      const next = structuredClone(prev);
      let cur = next;
      for (let i = 0; i < path.length - 1; i++) {
        const k = path[i];
        if (cur[k] === undefined || cur[k] === null)
          cur[k] = typeof path[i + 1] === "number" ? [] : {};
        cur = cur[k];
      }
      cur[path[path.length - 1]] = value;
      return next;
    });
  const getPath = (path: (string | number)[]) =>
    path.reduce((acc: any, k) => (acc == null ? undefined : acc[k]), f);

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: "hero", label: ar ? "الهيرو" : "Hero", icon: Home },
    {
      key: "pages",
      label: ar ? "أقسام الصفحات" : "Page sections",
      icon: LayoutTemplate,
    },
    { key: "footer", label: ar ? "التذييل" : "Footer", icon: Share2 },
    { key: "seo", label: ar ? "بيانات SEO" : "SEO metadata", icon: Search },
  ];

  const cards = useMemo(
    () => (getPath(["content", pageKey, "ar", "cards"]) as any[]) || [],
    [f, pageKey],
  );

  if (loading)
    return (
      <div className="admin-loading">{ar ? "جارٍ التحميل…" : "Loading…"}</div>
    );

  return (
    <div className="admin-dashboard">
      <div className="admin-page-head">
        <div>
          <span className="admin-kicker">CONTENT / SITE SECTIONS</span>
          <h2>{ar ? "محتوى الموقع" : "Site content"}</h2>
          <p>
            {ar
              ? "تحكم كامل في كل أقسام الموقع — بدون أي محتوى ثابت في الكود."
              : "Full control of every site section — nothing hardcoded in the app."}
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tb) => {
          const Icon = tb.icon;
          const active = tab === tb.key;
          return (
            <button
              key={tb.key}
              type="button"
              onClick={() => setTab(tb.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-medium transition-colors ${
                active
                  ? "border-[#2ED2FF]/60 bg-[#2ED2FF]/15 text-[#2ED2FF]"
                  : "border-white/10 text-ink-3 hover:text-ink-1"
              }`}
            >
              <Icon size={14} />
              {tb.label}
            </button>
          );
        })}
      </div>

      {/* ---------------- HERO ---------------- */}
      {tab === "hero" && (
        <motion.section
          className="admin-panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="admin-section-title">
            <div>
              <span className="admin-kicker">01 / HERO</span>
              <h3>{ar ? "عنوان الصفحة الرئيسية" : "Hero headline"}</h3>
            </div>
          </div>
          <div className="form-grid">
            <label>
              {ar ? "العنوان (عربي)" : "Title (Arabic)"}
              <input
                dir="rtl"
                value={getPath(["hero", "ar", "title_ar"]) || ""}
                onChange={(e) =>
                  setPath(["hero", "ar", "title_ar"], e.target.value)
                }
              />
            </label>
            <label>
              {ar ? "العنوان (إنجليزي)" : "Title (English)"}
              <input
                dir="ltr"
                value={getPath(["hero", "en", "title_en"]) || ""}
                onChange={(e) =>
                  setPath(["hero", "en", "title_en"], e.target.value)
                }
              />
            </label>
            <label className="wide">
              {ar ? "الوصف (عربي)" : "Subtitle (Arabic)"}
              <textarea
                dir="rtl"
                rows={3}
                value={getPath(["hero", "ar", "subtitle_ar"]) || ""}
                onChange={(e) =>
                  setPath(["hero", "ar", "subtitle_ar"], e.target.value)
                }
              />
            </label>
            <label className="wide">
              {ar ? "الوصف (إنجليزي)" : "Subtitle (English)"}
              <textarea
                dir="ltr"
                rows={3}
                value={getPath(["hero", "en", "subtitle_en"]) || ""}
                onChange={(e) =>
                  setPath(["hero", "en", "subtitle_en"], e.target.value)
                }
              />
            </label>
          </div>
        </motion.section>
      )}

      {/* ---------------- PAGE SECTIONS ---------------- */}
      {tab === "pages" && (
        <motion.section
          className="admin-panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="admin-section-title">
            <div>
              <span className="admin-kicker">02 / PAGE SECTIONS</span>
              <h3>{ar ? "محتوى الصفحات" : "Marketing page content"}</h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {PAGE_KEYS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setPageKey(k)}
                className={`px-3 py-1.5 rounded-md border text-xs capitalize transition-colors ${
                  pageKey === k
                    ? "border-[#2ED8FF]/60 bg-[#2ED2FF]/15 text-[#2ED2FF]"
                    : "border-white/10 text-ink-3 hover:text-ink-1"
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          <div className="form-grid">
            <label>
              {ar ? "العنوان (عربي)" : "Title (Arabic)"}
              <input
                dir="rtl"
                value={getPath(["content", pageKey, "ar", "title"]) || ""}
                onChange={(e) =>
                  setPath(["content", pageKey, "ar", "title"], e.target.value)
                }
              />
            </label>
            <label>
              {ar ? "العنوان (إنجليزي)" : "Title (English)"}
              <input
                dir="ltr"
                value={getPath(["content", pageKey, "en", "title"]) || ""}
                onChange={(e) =>
                  setPath(["content", pageKey, "en", "title"], e.target.value)
                }
              />
            </label>
            <label>
              {ar ? "الكلمة المميزة (عربي)" : "Accent word (Arabic)"}
              <input
                dir="rtl"
                value={getPath(["content", pageKey, "ar", "accent"]) || ""}
                onChange={(e) =>
                  setPath(["content", pageKey, "ar", "accent"], e.target.value)
                }
              />
            </label>
            <label>
              {ar ? "الكلمة المميزة (إنجليزي)" : "Accent word (English)"}
              <input
                dir="ltr"
                value={getPath(["content", pageKey, "en", "accent"]) || ""}
                onChange={(e) =>
                  setPath(["content", pageKey, "en", "accent"], e.target.value)
                }
              />
            </label>
            <label className="wide">
              {ar ? "الوصف (عربي)" : "Description (Arabic)"}
              <textarea
                dir="rtl"
                rows={3}
                value={getPath(["content", pageKey, "ar", "description"]) || ""}
                onChange={(e) =>
                  setPath(
                    ["content", pageKey, "ar", "description"],
                    e.target.value,
                  )
                }
              />
            </label>
            <label className="wide">
              {ar ? "الوصف (إنجليزي)" : "Description (English)"}
              <textarea
                dir="ltr"
                rows={3}
                value={getPath(["content", pageKey, "en", "description"]) || ""}
                onChange={(e) =>
                  setPath(
                    ["content", pageKey, "en", "description"],
                    e.target.value,
                  )
                }
              />
            </label>
          </div>

          {/* Card titles/bodies for the active page (both locales) */}
          {cards.length > 0 && (
            <div className="mt-6">
              <div className="admin-kicker mb-3">
                {ar ? "بطاقات القسم" : "Section cards"}
              </div>
              <div className="space-y-4">
                {cards.map((c: any, i: number) => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/10 p-4"
                  >
                    <div className="text-[10px] font-mono text-ink-4 mb-2">
                      {c.number || `#${i + 1}`}
                    </div>
                    <div className="form-grid">
                      <label>
                        {ar ? "عنوان البطاقة (عربي)" : "Card title (Arabic)"}
                        <input
                          dir="rtl"
                          value={
                            getPath([
                              "content",
                              pageKey,
                              "ar",
                              "cards",
                              i,
                              "title",
                            ]) || ""
                          }
                          onChange={(e) =>
                            setPath(
                              ["content", pageKey, "ar", "cards", i, "title"],
                              e.target.value,
                            )
                          }
                        />
                      </label>
                      <label>
                        {ar
                          ? "عنوان البطاقة (إنجليزي)"
                          : "Card title (English)"}
                        <input
                          dir="ltr"
                          value={
                            getPath([
                              "content",
                              pageKey,
                              "en",
                              "cards",
                              i,
                              "title",
                            ]) || ""
                          }
                          onChange={(e) =>
                            setPath(
                              ["content", pageKey, "en", "cards", i, "title"],
                              e.target.value,
                            )
                          }
                        />
                      </label>
                      <label className="wide">
                        {ar ? "نص البطاقة (عربي)" : "Card body (Arabic)"}
                        <textarea
                          dir="rtl"
                          rows={2}
                          value={
                            getPath([
                              "content",
                              pageKey,
                              "ar",
                              "cards",
                              i,
                              "body",
                            ]) || ""
                          }
                          onChange={(e) =>
                            setPath(
                              ["content", pageKey, "ar", "cards", i, "body"],
                              e.target.value,
                            )
                          }
                        />
                      </label>
                      <label className="wide">
                        {ar ? "نص البطاقة (إنجليزي)" : "Card body (English)"}
                        <textarea
                          dir="ltr"
                          rows={2}
                          value={
                            getPath([
                              "content",
                              pageKey,
                              "en",
                              "cards",
                              i,
                              "body",
                            ]) || ""
                          }
                          onChange={(e) =>
                            setPath(
                              ["content", pageKey, "en", "cards", i, "body"],
                              e.target.value,
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.section>
      )}

      {/* ---------------- FOOTER ---------------- */}
      {tab === "footer" && (
        <motion.section
          className="admin-panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="admin-section-title">
            <div>
              <span className="admin-kicker">03 / FOOTER</span>
              <h3>{ar ? "بيانات التواصل والروابط" : "Contact & social"}</h3>
            </div>
          </div>
          <div className="form-grid">
            <label>
              {ar ? "البريد الإلكتروني" : "Email"}
              <input
                dir="ltr"
                value={getPath(["footer", "contact", "email"]) || ""}
                onChange={(e) =>
                  setPath(["footer", "contact", "email"], e.target.value)
                }
              />
            </label>
            <label>
              {ar ? "الهاتف" : "Phone"}
              <input
                dir="ltr"
                value={getPath(["footer", "contact", "phone"]) || ""}
                onChange={(e) =>
                  setPath(["footer", "contact", "phone"], e.target.value)
                }
              />
            </label>
            <label className="wide">
              {ar ? "العنوان (عربي)" : "Address (Arabic)"}
              <input
                dir="rtl"
                value={getPath(["footer", "ar", "contact", "address_ar"]) || ""}
                onChange={(e) =>
                  setPath(
                    ["footer", "ar", "contact", "address_ar"],
                    e.target.value,
                  )
                }
              />
            </label>
            <label className="wide">
              {ar ? "العنوان (إنجليزي)" : "Address (English)"}
              <input
                dir="ltr"
                value={getPath(["footer", "en", "contact", "address_en"]) || ""}
                onChange={(e) =>
                  setPath(
                    ["footer", "en", "contact", "address_en"],
                    e.target.value,
                  )
                }
              />
            </label>
            <label>
              LinkedIn
              <input
                dir="ltr"
                value={getPath(["footer", "social", "linkedin"]) || ""}
                onChange={(e) =>
                  setPath(["footer", "social", "linkedin"], e.target.value)
                }
              />
            </label>
            <label>
              X / Twitter
              <input
                dir="ltr"
                value={getPath(["footer", "social", "x"]) || ""}
                onChange={(e) =>
                  setPath(["footer", "social", "x"], e.target.value)
                }
              />
            </label>
            <label>
              GitHub
              <input
                dir="ltr"
                value={getPath(["footer", "social", "github"]) || ""}
                onChange={(e) =>
                  setPath(["footer", "social", "github"], e.target.value)
                }
              />
            </label>
          </div>
        </motion.section>
      )}

      {/* ---------------- SEO ---------------- */}
      {tab === "seo" && (
        <motion.section
          className="admin-panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="admin-section-title">
            <div>
              <span className="admin-kicker">04 / SEO METADATA</span>
              <h3>{ar ? "بيانات SEO لكل صفحة" : "Per-page SEO metadata"}</h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {["home", ...PAGE_KEYS].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setPageKey(k)}
                className={`px-3 py-1.5 rounded-md border text-xs capitalize transition-colors ${
                  pageKey === k
                    ? "border-[#2ED2FF]/60 bg-[#2ED2FF]/15 text-[#2ED2FF]"
                    : "border-white/10 text-ink-3 hover:text-ink-1"
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          <div className="form-grid">
            <label className="wide">
              {ar ? "عنوان SEO (عربي)" : "SEO title (Arabic)"}
              <input
                dir="rtl"
                value={getPath(["seo", pageKey, "ar", "title"]) || ""}
                onChange={(e) =>
                  setPath(["seo", pageKey, "ar", "title"], e.target.value)
                }
              />
            </label>
            <label className="wide">
              {ar ? "عنوان SEO (إنجليزي)" : "SEO title (English)"}
              <input
                dir="ltr"
                value={getPath(["seo", pageKey, "en", "title"]) || ""}
                onChange={(e) =>
                  setPath(["seo", pageKey, "en", "title"], e.target.value)
                }
              />
            </label>
            <label className="wide">
              {ar ? "وصف SEO (عربي)" : "SEO description (Arabic)"}
              <textarea
                dir="rtl"
                rows={2}
                value={getPath(["seo", pageKey, "ar", "description"]) || ""}
                onChange={(e) =>
                  setPath(["seo", pageKey, "ar", "description"], e.target.value)
                }
              />
            </label>
            <label className="wide">
              {ar ? "وصف SEO (إنجليزي)" : "SEO description (English)"}
              <textarea
                dir="ltr"
                rows={2}
                value={getPath(["seo", pageKey, "en", "description"]) || ""}
                onChange={(e) =>
                  setPath(["seo", pageKey, "en", "description"], e.target.value)
                }
              />
            </label>
          </div>
        </motion.section>
      )}

      <div className="form-actions">
        <button
          type="button"
          className="admin-primary"
          disabled={saving}
          onClick={save}
        >
          <Save size={14} />
          {saving
            ? ar
              ? "جارٍ الحفظ…"
              : "Saving…"
            : ar
              ? "حفظ المحتوى"
              : "Save content"}
        </button>
      </div>
    </div>
  );
}
