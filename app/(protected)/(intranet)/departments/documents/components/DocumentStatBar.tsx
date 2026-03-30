// ─────────────────────────────────────────────────────────────────
// DocumentStatBar.tsx · Estudio de Moda S.A.S · Gestión Documental
// ─────────────────────────────────────────────────────────────────
"use client";

import { motion, type Variants } from "framer-motion";
import { FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react";

type Stat = {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  accent: string;
  iconBg: string;
  iconColor: string;
  highlight?: boolean;
};

const STATS: Stat[] = [
  {
    label: "Documentos activos",
    value: "1,248",
    sub: "Archivos disponibles en el sistema",
    icon: FileText,
    accent: "border-l-indigo-500",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    label: "Pendientes de aprobación",
    value: "42",
    sub: "Documentos en revisión o firma",
    icon: Clock,
    accent: "border-l-amber-500",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    highlight: true,
  },
  {
    label: "Aprobados este mes",
    value: "186",
    sub: "Documentos validados recientemente",
    icon: CheckCircle2,
    accent: "border-l-emerald-500",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    label: "Incumplimientos",
    value: "7",
    sub: "Documentos fuera de cumplimiento",
    icon: AlertCircle,
    accent: "border-l-red-500",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
  },
];

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const card: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export function DocumentStatBar() {
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
            s.highlight
              ? "border-amber-200 ring-1 ring-amber-100"
              : "border-slate-200"
          }`}
        >
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.iconBg}`}
          >
            <s.icon className={`h-4 w-4 ${s.iconColor}`} />
          </span>

          <div>
            <p
              className={`text-2xl font-bold leading-none ${
                s.highlight ? "text-amber-600" : "text-slate-800"
              }`}
            >
              {s.value}
            </p>

            <p className="mt-1 text-[11px] font-semibold text-slate-600 leading-tight">
              {s.label}
            </p>

            <p className="mt-0.5 text-[10px] text-slate-400 leading-tight">
              {s.sub}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}