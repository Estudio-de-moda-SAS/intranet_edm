"use client";

import { motion, type Variants } from "framer-motion";
import type { ElementType } from "react";

export type DeptKpiItem = {
  label:       string;
  value:       string;
  sub:         string;
  icon:        ElementType;
  trend:       "up" | "down" | "neutral";
  borderColor: string;
  iconBg:      string;
  iconColor:   string;
};

type Props = { items: DeptKpiItem[] };

function TrendBadge({ trend }: { trend: DeptKpiItem["trend"] }) {
  if (trend === "up")
    return <span className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">▲</span>;
  if (trend === "down")
    return <span className="inline-flex items-center rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600">▼</span>;
  return <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">—</span>;
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// Mapea cualquier cantidad de items al grid-cols correcto en lg
const lgColsClass: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  7: "lg:grid-cols-7",
  8: "lg:grid-cols-8",
};

// En sm siempre la mitad redondeada arriba (máx 4) para no desbordarse
const smColsClass: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-3",
  6: "sm:grid-cols-3",
  7: "sm:grid-cols-4",
  8: "sm:grid-cols-4",
};

export function DepartmentKPIStrip({ items }: Props) {
  const count = items.length;
  const lgCols = lgColsClass[count] ?? "lg:grid-cols-6";
  const smCols = smColsClass[count] ?? "sm:grid-cols-3";

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={`relative z-10 grid grid-cols-2 gap-3 ${smCols} ${lgCols} -mt-5 mb-7`}
    >
      {items.map((kpi) => (
        <motion.div
          key={kpi.label}
          variants={card}
          className={`group relative flex flex-col gap-3 rounded-xl border border-l-4 ${kpi.borderColor} border-slate-200 bg-white p-4 shadow-sm cursor-default transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
        >
          <div className="flex items-start justify-between">
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${kpi.iconBg}`}>
              <kpi.icon className={`h-4 w-4 ${kpi.iconColor}`} />
            </span>
            <TrendBadge trend={kpi.trend} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 leading-none">{kpi.value}</p>
            <p className="mt-1 text-[11px] font-semibold text-slate-600 leading-tight">{kpi.label}</p>
            <p className="mt-0.5 text-[10px] text-slate-400 leading-tight">{kpi.sub}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}