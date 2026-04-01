"use client";

import { motion, type Variants } from "framer-motion";
import {
  Users, TrendingUp, Calendar, Bell,
  FileText, ClipboardList, Clock, Award,
} from "lucide-react";
import type { ElementType } from "react";

type StatItem = {
  label:  string;
  value:  string;
  sub:    string;
  icon:   ElementType;
  accent: "violet" | "purple" | "fuchsia" | "indigo" | "sky" | "emerald" | "rose" | "amber";
  enabled: boolean;
};

const STATS: StatItem[] = [
  { label: "Empleados activos",    value: "1,284", sub: "+12 este mes",       icon: Users,         accent: "violet",  enabled: false  },
  { label: "Tareas pendientes",    value: "47",    sub: "−8 esta semana",      icon: ClipboardList, accent: "indigo",  enabled: true },
  { label: "Eventos próximos",     value: "6",     sub: "próximos 30 días",    icon: Calendar,      accent: "sky",     enabled: true },
  { label: "Noticias sin leer",    value: "13",    sub: "pendientes de leer",  icon: Bell,          accent: "fuchsia", enabled: true },
  { label: "Solicitudes abiertas", value: "28",    sub: "en gestión",          icon: FileText,      accent: "purple",  enabled: false },
  { label: "Documentos recientes", value: "94",    sub: "subidos este mes",    icon: TrendingUp,    accent: "emerald", enabled: true },
  { label: "Tiempo de respuesta",  value: "2.4h",  sub: "promedio del equipo", icon: Clock,         accent: "amber",   enabled: false },
  { label: "Reconocimientos",      value: "17",    sub: "en el último mes",    icon: Award,         accent: "rose",    enabled: false },
];

/*
  Cada accent define:
  - iconBg / iconRing:   fondo e hilo del ícono
  - iconColor:           color del ícono
  - valueBg / valueText: chip del valor numérico
  
  En dark: los pasteles se convierten en tintes semitransparentes
  y los textos se iluminan.
*/
const ACCENT_MAP: Record<StatItem["accent"], {
  iconBg: string; iconRing: string; iconColor: string;
  valueBg: string; valueText: string;
}> = {
  violet: {
    iconBg:    "bg-violet-100  dark:bg-violet-500/[0.12]",
    iconRing:  "ring-violet-50 dark:ring-violet-500/[0.06]",
    iconColor: "text-violet-600 dark:text-violet-400",
    valueBg:   "bg-violet-50   dark:bg-violet-500/[0.10]",
    valueText: "text-violet-700 dark:text-violet-300",
  },
  purple: {
    iconBg:    "bg-purple-100  dark:bg-purple-500/[0.12]",
    iconRing:  "ring-purple-50 dark:ring-purple-500/[0.06]",
    iconColor: "text-purple-600 dark:text-purple-400",
    valueBg:   "bg-purple-50   dark:bg-purple-500/[0.10]",
    valueText: "text-purple-700 dark:text-purple-300",
  },
  fuchsia: {
    iconBg:    "bg-fuchsia-100  dark:bg-fuchsia-500/[0.12]",
    iconRing:  "ring-fuchsia-50 dark:ring-fuchsia-500/[0.06]",
    iconColor: "text-fuchsia-600 dark:text-fuchsia-400",
    valueBg:   "bg-fuchsia-50   dark:bg-fuchsia-500/[0.10]",
    valueText: "text-fuchsia-700 dark:text-fuchsia-300",
  },
  indigo: {
    iconBg:    "bg-indigo-100  dark:bg-indigo-500/[0.12]",
    iconRing:  "ring-indigo-50 dark:ring-indigo-500/[0.06]",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    valueBg:   "bg-indigo-50   dark:bg-indigo-500/[0.10]",
    valueText: "text-indigo-700 dark:text-indigo-300",
  },
  sky: {
    iconBg:    "bg-sky-100  dark:bg-sky-500/[0.12]",
    iconRing:  "ring-sky-50 dark:ring-sky-500/[0.06]",
    iconColor: "text-sky-600 dark:text-sky-400",
    valueBg:   "bg-sky-50   dark:bg-sky-500/[0.10]",
    valueText: "text-sky-700 dark:text-sky-300",
  },
  emerald: {
    iconBg:    "bg-emerald-100  dark:bg-emerald-500/[0.12]",
    iconRing:  "ring-emerald-50 dark:ring-emerald-500/[0.06]",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    valueBg:   "bg-emerald-50   dark:bg-emerald-500/[0.10]",
    valueText: "text-emerald-700 dark:text-emerald-300",
  },
  amber: {
    iconBg:    "bg-amber-100  dark:bg-amber-500/[0.12]",
    iconRing:  "ring-amber-50 dark:ring-amber-500/[0.06]",
    iconColor: "text-amber-600 dark:text-amber-400",
    valueBg:   "bg-amber-50   dark:bg-amber-500/[0.10]",
    valueText: "text-amber-700 dark:text-amber-300",
  },
  rose: {
    iconBg:    "bg-rose-100  dark:bg-rose-500/[0.12]",
    iconRing:  "ring-rose-50 dark:ring-rose-500/[0.06]",
    iconColor: "text-rose-600 dark:text-rose-400",
    valueBg:   "bg-rose-50   dark:bg-rose-500/[0.10]",
    valueText: "text-rose-700 dark:text-rose-300",
  },
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export function AnimatedKPIStrip() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative z-10 grid gap-3 -mt-5 mb-7 justify-center
                 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]"
    >
      {STATS.filter(stat => stat.enabled).map((stat) => {
        const c = ACCENT_MAP[stat.accent];
        return (
          <motion.div
            key={stat.label}
            variants={card}
            className="group flex items-center gap-3.5 rounded-xl border px-4 py-3.5
                       cursor-default transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
                       border-slate-200   bg-white   shadow-sm
                       dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-[0_1px_3px_rgb(0_0_0/0.4)]
                       dark:hover:border-[#3d444d]"
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-4 ${c.iconBg} ${c.iconRing}`}>
              <stat.icon className={`h-4 w-4 ${c.iconColor}`} />
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className={`inline-block rounded-lg px-2 py-0.5 text-lg font-bold leading-snug ${c.valueBg} ${c.valueText}`}>
                  {stat.value}
                </span>
                <p className="truncate text-[10px] leading-tight
                              text-slate-400 dark:text-[#545d68]">
                  {stat.sub}
                </p>
              </div>
              <p className="mt-1 truncate text-[11px] font-semibold leading-tight
                            text-slate-600 dark:text-[#adbac7]">
                {stat.label}
              </p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}