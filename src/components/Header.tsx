"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pick, tr } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import CommandPalette from "./CommandPalette";

type HeaderProps = {
  lang: Locale;
  cats: any[];
};

const COMPANY_LINKS = [
  { href: "about", key: "about" },
  { href: "services", key: "services" },
  { href: "industries", key: "industries" },
  { href: "process", key: "process" },
  { href: "insights", key: "insights" },
  { href: "case-studies", labelAr: "دراسات الحالة", labelEn: "Case studies" },
  { href: "careers", labelAr: "الوظائف", labelEn: "Careers" },
  { href: "faq", labelAr: "الأسئلة الشائعة", labelEn: "FAQ" },
  { href: "contact", key: "contact" },
];

export default function Header({ lang, cats }: HeaderProps) {
  const T = tr(lang);
  const ar = lang === "ar";
  const pathname = usePathname() || `/${lang}`;
  const other = ar ? "en" : "ar";
  const alt = pathname.replace(/^\/(ar|en)/, "/" + other);

  const [scrolled, setScrolled] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setCompanyOpen(false);
    setCatsOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleTheme = () => {
    const h = document.documentElement;
    const v = h.dataset.theme === "dark" ? "light" : "dark";
    h.dataset.theme = v;
    try {
      localStorage.theme = v;
    } catch {}
  };

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className={`relative ${
            scrolled
              ? "bg-[var(--bg-glass)] backdrop-blur-2xl border-b border-violet-500/15 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
              : "bg-transparent border-b border-transparent"
          } transition-all duration-300`}
        >
          {/* Glow line */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-px bg-grad-signal opacity-0"
            animate={{ opacity: scrolled ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          <div className="wrap-wide flex items-center h-[76px] gap-6">
            {/* Logo */}
            <Link href={`/${lang}`} aria-label="Archai home" className="flex items-center gap-3 shrink-0 group">
              <motion.div
                className="relative w-10 h-10 rounded-xl overflow-hidden"
                whileHover={{ scale: 1.08, rotate: -3 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="/assets/logo.png"
                  alt="Archai"
                  className="w-full h-full object-contain"
                />
                <motion.div
                  className="absolute inset-0 bg-grad-primary opacity-0 group-hover:opacity-30 blur-xl"
                  animate={{ opacity: [0, 0.15, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>
              <div className="hidden sm:block">
                <div className="font-mono text-[11px] font-bold tracking-[0.2em] text-ink-0">
                  ARCHAI
                </div>
                <div className="font-mono text-[9px] tracking-[0.15em] text-ink-4">
                  INTEGRATED SYSTEMS
                </div>
              </div>
            </Link>

            {/* Center nav (desktop) */}
            <nav className="hidden lg:flex items-center gap-1 mx-auto" aria-label="Main">
              {/* Categories */}
              {cats.length > 0 && (
                <div
                  className="relative"
                  onMouseEnter={() => setCatsOpen(true)}
                  onMouseLeave={() => setCatsOpen(false)}
                >
                  <button className="px-3 py-2 text-sm font-medium text-ink-2 hover:text-ink-0 transition-colors flex items-center gap-1.5 rounded-lg hover:bg-violet-500/8">
                    {T("categories")}
                    <motion.svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      animate={{ rotate: catsOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </motion.svg>
                  </button>

                  <AnimatePresence>
                    {catsOpen && (
                      <motion.div
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-3"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="w-[420px] p-3 rounded-2xl bg-[var(--bg-1)] border border-violet-500/20 shadow-[0_24px_64px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
                          <div className="grid grid-cols-2 gap-1.5">
                            {cats.map((c) => (
                              <Link
                                key={c.id}
                                href={`/${lang}/categories/${c.slug}`}
                                className="group/cat flex items-center gap-3 p-3 rounded-xl hover:bg-violet-500/10 transition-colors"
                              >
                                <span className="w-9 h-9 grid place-items-center rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 group-hover/cat:bg-grad-primary group-hover/cat:text-white transition-all">
                                  {c.icon || "◆"}
                                </span>
                                <span className="text-sm font-medium text-ink-1 group-hover/cat:text-ink-0">
                                  {pick(c, "name", lang)}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <Link
                href={`/${lang}/services`}
                className="px-3 py-2 text-sm font-medium text-ink-2 hover:text-ink-0 transition-colors rounded-lg hover:bg-violet-500/8"
              >
                {T("services")}
              </Link>

              <Link
                href={`/${lang}/industries`}
                className="px-3 py-2 text-sm font-medium text-ink-2 hover:text-ink-0 transition-colors rounded-lg hover:bg-violet-500/8"
              >
                {T("industries")}
              </Link>

              <Link
                href={`/${lang}#list`}
                className="px-3 py-2 text-sm font-medium text-ink-2 hover:text-ink-0 transition-colors rounded-lg hover:bg-violet-500/8"
              >
                {T("projects")}
              </Link>

              {/* Company dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setCompanyOpen(true)}
                onMouseLeave={() => setCompanyOpen(false)}
              >
                <button className="px-3 py-2 text-sm font-medium text-ink-2 hover:text-ink-0 transition-colors flex items-center gap-1.5 rounded-lg hover:bg-violet-500/8">
                  {T("company")}
                  <motion.svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    animate={{ rotate: companyOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </motion.svg>
                </button>

                <AnimatePresence>
                  {companyOpen && (
                    <motion.div
                      className="absolute top-full right-0 pt-3"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="w-[240px] p-2 rounded-2xl bg-[var(--bg-1)] border border-violet-500/20 shadow-[0_24px_64px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
                        {COMPANY_LINKS.map((item) => {
                          const label = item.key
                            ? T(item.key)
                            : ar
                            ? item.labelAr
                            : item.labelEn;
                          return (
                            <Link
                              key={item.href}
                              href={`/${lang}/${item.href}`}
                              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-ink-2 hover:text-ink-0 hover:bg-violet-500/10 transition-colors group/link"
                            >
                              <span>{label}</span>
                              <span className="text-ink-4 group-hover/link:text-violet-300 transition-colors text-xs">
                                ↗
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Command palette */}
              <button
                onClick={() => setCmdOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 h-9 rounded-lg border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 text-ink-3 hover:text-ink-1 transition-colors text-xs font-mono"
                aria-label="Open command palette"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4-4" />
                </svg>
                <kbd className="px-1.5 py-0.5 rounded border border-violet-500/20 text-[9px]">
                  ⌘K
                </kbd>
              </button>

              {/* Language */}
              <Link
                href={alt}
                hrefLang={other}
                aria-label={T("lang")}
                className="w-9 h-9 grid place-items-center rounded-lg border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 text-ink-2 hover:text-ink-0 text-xs font-bold transition-colors"
                onClick={() => {
                  document.cookie = `lang=${other};path=/;max-age=31536000`;
                }}
              >
                {other === "en" ? "EN" : "ع"}
              </Link>

              {/* Theme */}
              <button
                onClick={toggleTheme}
                aria-label={T("theme")}
                className="w-9 h-9 grid place-items-center rounded-lg border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 text-ink-2 hover:text-ink-0 transition-colors"
              >
                <motion.svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </motion.svg>
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Menu"
                className="lg:hidden w-9 h-9 grid place-items-center rounded-lg border border-violet-500/20 bg-violet-500/5 text-ink-0"
              >
                <motion.svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  animate={mobileOpen ? "open" : "closed"}
                >
                  <motion.path
                    d="M3 6h18"
                    variants={{
                      closed: { d: "M3 6h18" },
                      open: { d: "M4 6l16 12" },
                    }}
                  />
                  <motion.path
                    d="M3 12h18"
                    variants={{
                      closed: { opacity: 1 },
                      open: { opacity: 0 },
                    }}
                  />
                  <motion.path
                    d="M3 18h18"
                    variants={{
                      closed: { d: "M3 18h18" },
                      open: { d: "M4 18l16-12" },
                    }}
                  />
                </motion.svg>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[90] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="absolute top-[76px] right-0 bottom-0 w-[85%] max-w-[380px] bg-[var(--bg-1)] border-l border-violet-500/20 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
            >
              <nav className="p-6 space-y-1">
                {cats.length > 0 && (
                  <>
                    <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-ink-4">
                      {T("categories")}
                    </div>
                    {cats.map((c) => (
                      <Link
                        key={c.id}
                        href={`/${lang}/categories/${c.slug}`}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-ink-1 hover:bg-violet-500/10 transition-colors"
                      >
                        <span className="w-8 h-8 grid place-items-center rounded-lg bg-violet-500/10 text-violet-300">
                          {c.icon || "◆"}
                        </span>
                        {pick(c, "name", lang)}
                      </Link>
                    ))}
                    <div className="h-px bg-violet-500/15 my-3" />
                  </>
                )}

                {COMPANY_LINKS.map((item) => {
                  const label = item.key
                    ? T(item.key)
                    : ar
                    ? item.labelAr
                    : item.labelEn;
                  return (
                    <Link
                      key={item.href}
                      href={`/${lang}/${item.href}`}
                      className="block px-3 py-3 rounded-xl text-ink-1 hover:bg-violet-500/10 transition-colors"
                    >
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <CommandPalette lang={lang} cats={cats} open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
}