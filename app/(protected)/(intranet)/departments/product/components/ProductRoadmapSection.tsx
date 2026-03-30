// app/product/components/ProductRoadmapSection.tsx
// CLIENT COMPONENT
"use client";

import { Map, ChevronRight } from "lucide-react";
import Link from "next/link";

type Initiative = {
  id:       string;
  name:     string;
  squad:    string;
  status:   "done" | "in-progress" | "planned" | "blocked";
  quarter:  string;
  progress: number; // 0–100
  tags:     string[];
};

const INITIATIVES: Initiative[] = [
  {
    id:       "init-1",
    name:     "Onboarding v3 — nuevo flujo de activación",
    squad:    "Growth",
    status:   "in-progress",
    quarter:  "Q2 2025",
    progress: 62,
    tags:     ["Retention", "Web"],
  },
  {
    id:       "init-2",
    name:     "API pública v2 — endpoints REST + Webhooks",
    squad:    "Platform",
    status:   "in-progress",
    quarter:  "Q2 2025",
    progress: 38,
    tags:     ["Dev-facing", "B2B"],
  },
  {
    id:       "init-3",
    name:     "Dashboard analytics para clientes",
    squad:    "Core Product",
    status:   "planned",
    quarter:  "Q3 2025",
    progress: 0,
    tags:     ["Analytics", "Enterprise"],
  },
  {
    id:       "init-4",
    name:     "Motor de búsqueda semántica",
    squad:    "AI/ML",
    status:   "planned",
    quarter:  "Q3 2025",
    progress: 0,
    tags:     ["AI", "Search"],
  },
  {
    id:       "init-5",
    name:     "App móvil — MVP iOS & Android",
    squad:    "Mobile",
    status:   "blocked",
    quarter:  "Q2 2025",
    progress: 15,
    tags:     ["Mobile", "MVP"],
  },
  {
    id:       "init-6",
    name:     "SSO / SAML enterprise",
    squad:    "Platform",
    status:   "done",
    quarter:  "Q1 2025",
    progress: 100,
    tags:     ["Security", "Enterprise"],
  },
];

const STATUS_META = {
  "done":        { label: "Completado",   dot: "bg-emerald-400", bar: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  "in-progress": { label: "En curso",     dot: "bg-sky-400",     bar: "bg-sky-400",     badge: "bg-sky-50 text-sky-700 border-sky-100" },
  "planned":     { label: "Planificado",  dot: "bg-slate-300",   bar: "bg-slate-200",   badge: "bg-slate-50 text-slate-500 border-slate-200" },
  "blocked":     { label: "Bloqueado",    dot: "bg-rose-400",    bar: "bg-rose-400",    badge: "bg-rose-50 text-rose-700 border-rose-100" },
};

export default function ProductRoadmapSection() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50">
            <Map className="h-3.5 w-3.5 text-sky-600" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Roadmap de iniciativas</h2>
            <p className="text-[11px] text-slate-400">Seguimiento por squad y trimestre</p>
          </div>
        </div>
        <Link
          href="/product/roadmap"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-600 hover:text-sky-700"
        >
          Ver completo <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Initiatives list */}
      <div className="space-y-3">
        {INITIATIVES.map((init) => {
          const meta = STATUS_META[init.status];
          return (
            <div
              key={init.id}
              className="group flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 hover:border-sky-200 hover:bg-sky-50/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-slate-800 leading-snug truncate">
                      {init.name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {init.squad} · {init.quarter}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.badge}`}
                  >
                    {meta.label}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              {init.status !== "planned" && (
                <div className="flex items-center gap-2 pl-4">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${meta.bar} transition-all`}
                      style={{ width: `${init.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 w-7 text-right">
                    {init.progress}%
                  </span>
                </div>
              )}

              {/* Tags */}
              <div className="flex items-center gap-1.5 pl-4">
                {init.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
