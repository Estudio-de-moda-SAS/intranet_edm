"use client";

import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { motion, type Variants } from "framer-motion";

type Trend = "up" | "down" | "neutral";

interface KPI {
  label:       string;
  value:       string;
  subtext:     string;
  trend:       Trend;
  trendValue:  string;
  positive:    boolean;
  dot?:        "green" | "yellow" | "red";
  borderColor: string;
}

const kpis: KPI[] = [
  { label: "Contratos activos",     value: "142", subtext: "Vigentes al día de hoy",    trend: "up",      trendValue: "+5 este mes",          positive: true,  dot: "green",  borderColor: "border-l-emerald-500" },
  { label: "Por vencer (30 días)",  value: "8",   subtext: "Requieren renovación",       trend: "up",      trendValue: "+3 vs semana pasada",   positive: false, dot: "yellow", borderColor: "border-l-amber-400"   },
  { label: "Contratos vencidos",    value: "3",   subtext: "Sin renovar — atención",     trend: "neutral", trendValue: "Sin cambio",            positive: false, dot: "red",    borderColor: "border-l-red-500"     },
  { label: "Solicitudes pendientes",value: "11",  subtext: "En espera de atención",      trend: "down",    trendValue: "−4 vs ayer",            positive: false, dot: "yellow", borderColor: "border-l-orange-400"  },
  { label: "Litigios activos",      value: "5",   subtext: "Casos en proceso",           trend: "neutral", trendValue: "Sin cambio",            positive: false, dot: "yellow", borderColor: "border-l-slate-400"   },
  { label: "Índice de cumplimiento",value: "97%", subtext: "Compliance corporativo",     trend: "up",      trendValue: "+1% este trimestre",    positive: true,  dot: "green",  borderColor: "border-l-sky-500"     },
];

const dotColors = {
  green:  "bg-emerald-400",
  yellow: "bg-amber-400",
  red:    "bg-red-400 animate-pulse",
};

const container: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const TrendIcon = ({ trend, isGood }: { trend: Trend; isGood: boolean }) => {
  if (trend === "neutral")
    return <Minus className="w-3.5 h-3.5 text-slate-400 dark:text-[#545d68]" />;
  if (trend === "up")
    return <ArrowUpRight className={`w-3.5 h-3.5 ${isGood ? "text-emerald-500 dark:text-emerald-400" : "text-red-400 dark:text-red-400"}`} />;
  return <ArrowDownRight className={`w-3.5 h-3.5 ${isGood ? "text-emerald-500 dark:text-emerald-400" : "text-red-400 dark:text-red-400"}`} />;
};

const isGoodTrend = (kpi: KPI): boolean => {
  if (kpi.trend === "neutral") return true;
  return kpi.positive ? kpi.trend === "up" : kpi.trend === "down";
};

export function LegalKPIStrip() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 -mt-5 mb-7"
    >
      {kpis.map((kpi) => {
        const good = isGoodTrend(kpi);
        return (
          <motion.div
            key={kpi.label}
            variants={cardVariant}
            className={`
              group relative flex flex-col gap-3 rounded-xl border-l-4 p-4 shadow-sm
              cursor-default transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
              ${kpi.borderColor}
              border border-slate-200 bg-white
              dark:border-[#30363d] dark:bg-[#161b22]
            `}
          >
            <div className="flex items-center gap-1.5">
              {kpi.dot && (
                <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${dotColors[kpi.dot]}`} />
              )}
              <span className="text-[11px] font-medium leading-tight line-clamp-1
                               text-slate-500 dark:text-[#768390]">
                {kpi.label}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold leading-none
                             text-slate-800 dark:text-[#e6edf3]">
                {kpi.value}
              </p>
              <p className="mt-0.5 text-[10px] leading-tight
                            text-slate-400 dark:text-[#545d68]">
                {kpi.subtext}
              </p>
            </div>
            <div className="flex items-center gap-0.5">
              <TrendIcon trend={kpi.trend} isGood={good} />
              <span className={`text-[10px] font-semibold ${
                good
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-500 dark:text-red-400"
              }`}>
                {kpi.trendValue}
              </span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}


// ─── LegalLitigationPanel.tsx ─────────────────────────────────────────────────

import { Scale, ChevronRight, Gavel } from "lucide-react";
import type { LegalData, LegalLitigation } from "@/lib/graph/departments/legal.service";
import Link from "next/link";

type LitigationProps = { data: LegalData };

const LITIGATION_STATUS_MAP: Record<
  LegalLitigation["status"],
  { label: string; dot: string; cls: string }
> = {
  active:    { label: "Activo",       dot: "bg-amber-400 animate-pulse", cls: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/[0.10] dark:text-amber-400 dark:border-amber-500/20"     },
  suspended: { label: "Suspendido",   dot: "bg-slate-400",               cls: "bg-slate-50 text-slate-600 border border-slate-200 dark:bg-[#21262d] dark:text-[#768390] dark:border-[#30363d]"              },
  resolved:  { label: "Resuelto",     dot: "bg-emerald-400",             cls: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/[0.10] dark:text-emerald-400 dark:border-emerald-500/20" },
  appeal:    { label: "En apelación", dot: "bg-orange-400",              cls: "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/[0.10] dark:text-orange-400 dark:border-orange-500/20" },
};

const LITIGATION_TYPE_LABEL: Record<LegalLitigation["type"], string> = {
  civil:          "Civil",
  laboral:        "Laboral",
  mercantil:      "Mercantil",
  administrativo: "Administrativo",
};

export default function LegalLitigationPanel({ data }: LitigationProps) {
  return (
    <div className="rounded-2xl border shadow-sm
                    border-slate-200 bg-white
                    dark:border-[#30363d] dark:bg-[#161b22]">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4
                      border-b border-slate-100 dark:border-[#21262d]">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg
                           border border-slate-200 bg-slate-100
                           dark:border-[#30363d] dark:bg-[#21262d]">
            <Scale size={16} className="text-slate-600 dark:text-[#768390]" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-[#e6edf3]">
              Litigios en curso
            </p>
            <p className="text-[11px] text-slate-400 dark:text-[#545d68]">
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {data.kpis.litigationsActive}
              </span>{" "}
              casos activos
            </p>
          </div>
        </div>
        <Link
          href="/legal/litigations"
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors
                     text-slate-600 hover:bg-slate-100
                     dark:text-[#768390] dark:hover:bg-[#21262d] dark:hover:text-[#adbac7]"
        >
          Ver todos <ChevronRight size={14} />
        </Link>
      </div>

      {/* List */}
      <ul className="divide-y divide-slate-50 dark:divide-[#21262d]">
        {data.litigations.map((lit) => {
          const status = LITIGATION_STATUS_MAP[lit.status];
          return (
            <li key={lit.id}
                className="px-5 py-4 transition-colors
                           hover:bg-slate-50/60 dark:hover:bg-[#1c2128]">
              <div className="flex items-start gap-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${status.dot}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-snug
                                  text-slate-800 dark:text-[#e6edf3]">
                      {lit.title}
                    </p>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${status.cls}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 dark:text-[#545d68]">
                    {lit.caseNumber} · {LITIGATION_TYPE_LABEL[lit.type]} · {lit.court}
                  </p>
                  <div className="mt-1.5 flex items-center gap-3 flex-wrap">
                    {lit.nextHearing && (
                      <span className="flex items-center gap-1 text-[11px] font-medium
                                       text-slate-600 dark:text-[#adbac7]">
                        <Gavel size={11} className="text-slate-400 dark:text-[#545d68]" />
                        Próxima audiencia: {lit.nextHearing}
                      </span>
                    )}
                    {lit.externalCounsel && (
                      <span className="text-[11px] text-slate-400 dark:text-[#545d68]">
                        Ext: {lit.externalCounsel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

