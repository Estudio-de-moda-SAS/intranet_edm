// app/(protected)/(intranet)/departments/legal/components/LegalKPIStrip.tsx
"use client";

import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { motion, type Variants } from "framer-motion";

type Trend = "up" | "down" | "neutral";

interface KPI {
  label: string;
  value: string;
  subtext: string;
  trend: Trend;
  trendValue: string;
  positive: boolean;
  dot?: "green" | "yellow" | "red";
  borderColor: string;
}

const kpis: KPI[] = [
  {
    label: "Contratos activos",
    value: "142",
    subtext: "Vigentes al día de hoy",
    trend: "up",
    trendValue: "+5 este mes",
    positive: true,
    dot: "green",
    borderColor: "border-l-emerald-500",
  },
  {
    label: "Por vencer (30 días)",
    value: "8",
    subtext: "Requieren renovación",
    trend: "up",
    trendValue: "+3 vs semana pasada",
    positive: false,
    dot: "yellow",
    borderColor: "border-l-amber-400",
  },
  {
    label: "Contratos vencidos",
    value: "3",
    subtext: "Sin renovar — atención",
    trend: "neutral",
    trendValue: "Sin cambio",
    positive: false,
    dot: "red",
    borderColor: "border-l-red-500",
  },
  {
    label: "Solicitudes pendientes",
    value: "11",
    subtext: "En espera de atención",
    trend: "down",
    trendValue: "−4 vs ayer",
    positive: false,
    dot: "yellow",
    borderColor: "border-l-orange-400",
  },
  {
    label: "Litigios activos",
    value: "5",
    subtext: "Casos en proceso",
    trend: "neutral",
    trendValue: "Sin cambio",
    positive: false,
    dot: "yellow",
    borderColor: "border-l-slate-400",
  },
  {
    label: "Índice de cumplimiento",
    value: "97%",
    subtext: "Compliance corporativo",
    trend: "up",
    trendValue: "+1% este trimestre",
    positive: true,
    dot: "green",
    borderColor: "border-l-sky-500",
  },
];

const dotColors = {
  green:  "bg-emerald-400",
  yellow: "bg-amber-400",
  red:    "bg-red-400 animate-pulse",
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const TrendIcon = ({ trend, isGood }: { trend: Trend; isGood: boolean }) => {
  if (trend === "neutral")
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  if (trend === "up")
    return <ArrowUpRight className={`w-3.5 h-3.5 ${isGood ? "text-emerald-500" : "text-red-400"}`} />;
  return <ArrowDownRight className={`w-3.5 h-3.5 ${isGood ? "text-emerald-500" : "text-red-400"}`} />;
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
            variants={card}
            className={`group relative flex flex-col gap-3 rounded-xl border border-l-4 ${kpi.borderColor} border-slate-200 bg-white p-4 shadow-sm cursor-default transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
          >
            <div className="flex items-center gap-1.5">
              {kpi.dot && (
                <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${dotColors[kpi.dot]}`} />
              )}
              <span className="text-[11px] font-medium text-slate-500 leading-tight line-clamp-1">
                {kpi.label}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 leading-none">{kpi.value}</p>
              <p className="mt-0.5 text-[10px] text-slate-400 leading-tight">{kpi.subtext}</p>
            </div>
            <div className="flex items-center gap-0.5">
              <TrendIcon trend={kpi.trend} isGood={good} />
              <span className={`text-[10px] font-semibold ${good ? "text-emerald-600" : "text-red-500"}`}>
                {kpi.trendValue}
              </span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}