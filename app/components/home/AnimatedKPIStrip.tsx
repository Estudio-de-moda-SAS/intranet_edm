"use client";

// ✅ CLIENT COMPONENT — solo porque necesita staggerChildren de framer-motion.
//
// ⚠️  IMPORTANTE — Por qué STATS vive aquí y no en HomePageContent:
//    Los iconos de Lucide son componentes React (objetos con métodos).
//    Next.js no puede serializarlos para cruzar el boundary Server → Client.
//    Si intentas pasarlos como prop desde un Server Component obtienes:
//    "Only plain objects can be passed to Client Components from Server Components"
//    Solución: STATS vive directamente en este Client Component.

import { motion, type Variants } from "framer-motion";
import {
  Users, TrendingUp, Calendar, Bell,
  FileText, ClipboardList, Clock, Award,
} from "lucide-react";
import type { ElementType } from "react";

// ── Types ─────────────────────────────────────────────────────────

type StatItem = {
  label:  string;
  value:  string;
  sub:    string;
  icon:   ElementType;
  accent: "violet" | "purple" | "fuchsia" | "indigo" | "sky" | "emerald" | "rose" | "amber";
  enabled: boolean;
};

// ── KPI data ──────────────────────────────────────────────────────

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

// ── Accent map ────────────────────────────────────────────────────

const ACCENT_MAP: Record<StatItem["accent"], {
  iconBg: string; iconRing: string; iconColor: string;
  valueBg: string; valueText: string;
}> = {
  violet:  { iconBg: "bg-violet-100",  iconRing: "ring-violet-50",  iconColor: "text-violet-600",  valueBg: "bg-violet-50",  valueText: "text-violet-700"  },
  purple:  { iconBg: "bg-purple-100",  iconRing: "ring-purple-50",  iconColor: "text-purple-600",  valueBg: "bg-purple-50",  valueText: "text-purple-700"  },
  fuchsia: { iconBg: "bg-fuchsia-100", iconRing: "ring-fuchsia-50", iconColor: "text-fuchsia-600", valueBg: "bg-fuchsia-50", valueText: "text-fuchsia-700" },
  indigo:  { iconBg: "bg-indigo-100",  iconRing: "ring-indigo-50",  iconColor: "text-indigo-600",  valueBg: "bg-indigo-50",  valueText: "text-indigo-700"  },
  sky:     { iconBg: "bg-sky-100",     iconRing: "ring-sky-50",     iconColor: "text-sky-600",     valueBg: "bg-sky-50",     valueText: "text-sky-700"     },
  emerald: { iconBg: "bg-emerald-100", iconRing: "ring-emerald-50", iconColor: "text-emerald-600", valueBg: "bg-emerald-50", valueText: "text-emerald-700" },
  amber:   { iconBg: "bg-amber-100",   iconRing: "ring-amber-50",   iconColor: "text-amber-600",   valueBg: "bg-amber-50",   valueText: "text-amber-700"   },
  rose:    { iconBg: "bg-rose-100",    iconRing: "ring-rose-50",    iconColor: "text-rose-600",    valueBg: "bg-rose-50",    valueText: "text-rose-700"    },
};

// ── Animation Variants ────────────────────────────────────────────

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ── Component — sin props, STATS es interno ───────────────────────

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
            className="group flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm cursor-default transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.iconBg} ring-4 ${c.iconRing}`}>
              <stat.icon className={`h-4 w-4 ${c.iconColor}`} />
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className={`inline-block rounded-lg px-2 py-0.5 text-lg font-bold leading-snug ${c.valueBg} ${c.valueText}`}>
                  {stat.value}
                </span>
                <p className="truncate text-[10px] text-slate-400 leading-tight">{stat.sub}</p>
              </div>
              <p className="mt-1 truncate text-[11px] font-semibold text-slate-600 leading-tight">{stat.label}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}