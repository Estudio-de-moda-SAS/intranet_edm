"use client";

// ✅ CLIENT COMPONENT — STATS vive aquí porque contiene iconos de Lucide.
//
// Nota: Logística usa 4 stats operativos (no 8 genéricos) con un diseño
// diferente al DepartmentKPIStrip — soporta `highlight` para el item
// de incidencias. Por eso tiene su propio componente en vez de reutilizar
// DepartmentKPIStrip.

import { motion, type Variants } from "framer-motion";
import { Truck, Clock, CheckCircle2, TrendingUp } from "lucide-react";

type StatItem = {
  label:      string;
  value:      string;
  sub:        string;
  icon:       React.ElementType;
  accent:     string;
  iconBg:     string;
  iconColor:  string;
  highlight?: boolean;
};

const STATS: StatItem[] = [
  {
    label:     "En tránsito ahora",
    value:     "341",
    sub:       "últimos 10 min",
    icon:      Truck,
    accent:    "border-l-sky-500",
    iconBg:    "bg-sky-50",
    iconColor: "text-sky-600",
  },
  {
    label:     "Con retraso / incidencia",
    value:     "18",
    sub:       "3 críticas · 15 menores",
    icon:      Clock,
    accent:    "border-l-rose-500",
    iconBg:    "bg-rose-100",
    iconColor: "text-rose-600",
    highlight: true,
  },
  {
    label:     "Entregados hoy",
    value:     "87",
    sub:       "tasa de éxito 97.2%",
    icon:      CheckCircle2,
    accent:    "border-l-emerald-500",
    iconBg:    "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    label:     "Tiempo medio entrega",
    value:     "2.0d",
    sub:       "−0.2d vs semana anterior",
    icon:      TrendingUp,
    accent:    "border-l-violet-500",
    iconBg:    "bg-violet-50",
    iconColor: "text-violet-600",
  },
];

const container: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export function LogisticsStatBar() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-4 -mt-6 mb-6"
    >
      {STATS.map((s) => (
        <motion.div
          key={s.label}
          variants={card}
          className={`flex flex-col gap-3 rounded-xl border border-l-4 ${s.accent} bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
            s.highlight ? "border-rose-200 ring-1 ring-rose-100" : "border-slate-200"
          }`}
        >
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.iconBg}`}>
            <s.icon className={`h-4 w-4 ${s.iconColor}`} />
          </span>
          <div>
            <p className={`text-2xl font-bold leading-none ${s.highlight ? "text-rose-600" : "text-slate-800"}`}>
              {s.value}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-slate-600 leading-tight">{s.label}</p>
            <p className="mt-0.5 text-[10px] text-slate-400 leading-tight">{s.sub}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}