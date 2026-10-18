"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, List, ArrowUpRight } from "lucide-react";
import ProjectCard from "./ProjectCard";
import { pick } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

type Props = {
  projects: any[];
  cats: any[];
  lang: Locale;
};

export default function PortfolioGallery({ projects, cats, lang }: Props) {
  const ar = lang === "ar";
  const [cf, setCf] = useState("");
  const [tf, setTf] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const techs = useMemo(
    () =>
      [
        ...new Set(
          projects.flatMap((p) =>
            p.project_technologies.map((x: any) => x.technology),
          ),
        ),
      ].sort(),
    [projects],
  );

  const list = useMemo(
    () =>
      projects.filter(
        (p) =>
          (!cf || p.category_id === cf) &&
          (!tf || p.project_technologies.some((x: any) => x.technology === tf)),
      ),
    [projects, cf, tf],
  );

  const L = {
    all: ar ? "كل الأقسام" : "All categories",
    allT: ar ? "كل التقنيات" : "All technologies",
    clear: ar ? "مسح" : "Clear",
    none: ar ? "لا توجد مشاريع مطابقة" : "No matching projects",
    grid: ar ? "شبكة" : "Grid",
    list: ar ? "قائمة" : "List",
    view: ar ? "عرض المشروع" : "View project",
  };

  const chip = (active: boolean) =>
    `px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
      active
        ? "bg-[#2ED2FF]/15 border-[#2ED2FF]/60 text-[#2ED2FF]"
        : "border-white/10 text-ink-3 hover:border-[#2ED2FF]/40 hover:text-ink-0"
    }`;

  return (
    <>
      {/* Controls */}
      <div className="mb-8 p-4 rounded-3xl glass border border-white/10 flex flex-wrap gap-3 items-center">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCf("")} className={chip(!cf)}>
            {L.all}
          </button>
          {cats.map((c) => (
            <button
              key={c.id}
              onClick={() => setCf(cf === c.id ? "" : c.id)}
              className={chip(cf === c.id)}
            >
              {pick(c, "name", lang)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ms-auto">
          <select
            value={tf}
            onChange={(e) => setTf(e.target.value)}
            aria-label={L.allT}
            className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-ink-1 text-xs focus:border-[#2ED2FF]/60 outline-none"
          >
            <option value="">{L.allT}</option>
            {techs.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>

          {(cf || tf) && (
            <button
              onClick={() => {
                setCf("");
                setTf("");
              }}
              className="px-3 py-2 rounded-xl text-xs text-ink-3 hover:text-ink-0 border border-white/10 transition-colors"
            >
              {L.clear} ×
            </button>
          )}

          <div className="flex rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={() => setView("grid")}
              aria-label={L.grid}
              aria-pressed={view === "grid"}
              className={`px-3 py-2 transition-colors ${
                view === "grid"
                  ? "bg-[#2ED2FF]/15 text-[#2ED2FF]"
                  : "text-ink-3"
              }`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setView("list")}
              aria-label={L.list}
              aria-pressed={view === "list"}
              className={`px-3 py-2 transition-colors ${
                view === "list"
                  ? "bg-[#2ED2FF]/15 text-[#2ED2FF]"
                  : "text-ink-3"
              }`}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      <p className="text-[11px] font-mono text-ink-4 mb-6">
        {list.length} / {projects.length}
      </p>

      {!list.length ? (
        <div className="p-16 text-center rounded-3xl border border-dashed border-white/10 text-ink-3">
          {L.none}
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4) }}
              >
                <ProjectCard p={p} lang={lang} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, x: ar ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3) }}
              >
                <Link
                  href={`/${lang}/projects/${p.id}`}
                  className="group flex items-center gap-4 p-4 rounded-2xl glass border border-white/10 hover:border-[#2ED2FF]/40 transition-colors"
                >
                  <span className="w-12 h-12 rounded-xl bg-[#2ED2FF]/10 border border-[#2ED2FF]/20 grid place-items-center text-[#2ED2FF] font-mono text-xs shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 min-w-0">
                    <b className="block text-ink-0 truncate">
                      {pick(p, "title", lang)}
                    </b>
                    <span className="block text-xs text-ink-4 truncate">
                      {pick(p, "summary", lang)}
                    </span>
                  </span>
                  <span className="hidden sm:flex flex-wrap gap-1.5 max-w-[220px]">
                    {p.project_technologies.slice(0, 3).map((x: any) => (
                      <span
                        key={x.technology}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono text-ink-4 border border-white/10"
                      >
                        {x.technology}
                      </span>
                    ))}
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="text-ink-4 group-hover:text-[#2ED2FF] transition-colors shrink-0"
                  />
                </Link>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </>
  );
}
