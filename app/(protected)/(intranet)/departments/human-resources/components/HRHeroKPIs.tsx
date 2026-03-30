"use client";

import { motion, type Variants } from "framer-motion";
import {
  Users, UserCheck, UserX, Clock,
  TrendingUp, Award, CalendarDays, BookOpen,
} from "lucide-react";

type HeroKpi = {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  bar: string;
};

const HERO_KPIS: HeroKpi[] = [
  { label: "Empleados activos", value: "284", sub: "+6 este mes", icon: Users, bar: "bg-violet-400" },
  { label: "Tasa de retención", value: "94%", sub: "últimos 12 meses", icon: UserCheck, bar: "bg-emerald-400" },
  { label: "Rotación mensual", value: "2.1%", sub: "-0.4% vs mes ant.", icon: UserX, bar: "bg-rose-400" },
  { label: "Ausentismo", value: "1.8%", sub: "promedio mensual", icon: Clock, bar: "bg-amber-400" },
  { label: "Vacantes abiertas", value: "12", sub: "4 en proceso final", icon: TrendingUp, bar: "bg-sky-400" },
  { label: "En capacitación", value: "48", sub: "3 programas activos", icon: BookOpen, bar: "bg-indigo-400" },
  { label: "Solicitudes pendientes", value: "23", sub: "requieren acción", icon: CalendarDays, bar: "bg-orange-400" },
  { label: "Reconocimientos", value: "17", sub: "este mes", icon: Award, bar: "bg-pink-400" },
];

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.15,
    },
  },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function HRHeroKPIs() {
  return (
    <motion.div
      className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {HERO_KPIS.map((kpi) => (
        <motion.div
          key={kpi.label}
          variants={cardVariant}
          className="group relative flex flex-col gap-2.5 overflow-hidden rounded-2xl border bg-white/[0.07] backdrop-blur-sm border-white/[0.08] p-4 cursor-default transition-all duration-200 hover:bg-white/[0.12] hover:border-white/[0.14] hover:scale-[1.02]"
        >
          <span className={`absolute inset-x-0 top-0 h-[2px] ${kpi.bar} opacity-70`} />

          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
            <kpi.icon className="h-4 w-4 text-white/80" />
          </span>

          <div>
            <p className="text-xl font-bold text-white leading-none">{kpi.value}</p>
            <p className="mt-0.5 text-[11px] font-medium text-white/65 leading-tight">{kpi.label}</p>
            <p className="mt-0.5 text-[10px] text-white/35 leading-tight">{kpi.sub}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}