// app/it/components/ITKPIStrip.tsx
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
    label: "Disponibilidad de sistemas",
    value: "99.92%",
    subtext: "Promedio últimos 30 días",
    trend: "up",
    trendValue: "+0.04%",
    positive: true,
    dot: "green",
    borderColor: "border-l-emerald-500",
  },
  {
    label: "MTTR",
    value: "18 min",
    subtext: "Tiempo medio de resolución",
    trend: "down",
    trendValue: "−3 min",
    positive: false,
    dot: "green",
    borderColor: "border-l-teal-500",
  },
  {
    label: "Tickets abiertos",
    value: "47",
    subtext: "12 de alta prioridad",
    trend: "down",
    trendValue: "−8 vs ayer",
    positive: false,
    dot: "yellow",
    borderColor: "border-l-amber-400",
  },
  {
    label: "Cumplimiento SLA",
    value: "96.3%",
    subtext: "Meta corporativa: 95%",
    trend: "up",
    trendValue: "+1.1%",
    positive: true,
    dot: "green",
    borderColor: "border-l-indigo-500",
  },
  {
    label: "Incidentes críticos",
    value: "2",
    subtext: "Activos en este momento",
    trend: "neutral",
    trendValue: "Sin cambio",
    positive: false,
    dot: "red",
    borderColor: "border-l-red-500",
  },
  {
    label: "Parches pendientes",
    value: "134",
    subtext: "Servidores sin actualizar",
    trend: "down",
    trendValue: "−21 esta semana",
    positive: false,
    dot: "yellow",
    borderColor: "border-l-slate-400",
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
  if (trend === "neutral") return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  if (trend === "up")
    return <ArrowUpRight className={`w-3.5 h-3.5 ${isGood ? "text-emerald-500" : "text-red-400"}`} />;
  return <ArrowDownRight className={`w-3.5 h-3.5 ${isGood ? "text-emerald-500" : "text-red-400"}`} />;
};

const isGoodTrend = (kpi: KPI): boolean => {
  if (kpi.trend === "neutral") return true;
  return kpi.positive ? kpi.trend === "up" : kpi.trend === "down";
};

export function ITKPIStrip() {
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