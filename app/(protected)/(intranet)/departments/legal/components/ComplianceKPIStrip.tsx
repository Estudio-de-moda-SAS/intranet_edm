"use client";
/**
 * @module CumplimientoKPIStrip
 * Franja de indicadores de cumplimiento normativo (SARLAFT).
 *
 * @remarks
 * Datos mock hasta que Graph esté disponible.
 * Los valores se obtendrán desde el servicio de cumplimiento.
 */

import { ShieldCheck, AlertTriangle, Calendar, Clock, TrendingUp } from "lucide-react";
import { AnimatedSection } from "@/app/components/ui/animated/AnimatedSection";
import { AnimatedCard }    from "@/app/components/ui/animated/AnimatedCard";

interface KPI {
  label:     string;
  value:     string;
  sub?:      string;
  icon:      React.FC<{ size?: number; className?: string }>;
  color:     string;
  bgColor:   string;
  alert?:    boolean;
}

const KPIS: KPI[] = [
  {
    label:   "Nivel de Riesgo SARLAFT",
    value:   "Medio",
    sub:     "Evaluación Q1 2026",
    icon:    ShieldCheck,
    color:   "text-amber-700",
    bgColor: "from-amber-50 to-orange-50 border-amber-200",
  },
  {
    label:   "Reportes UIAF",
    value:   "Al día",
    sub:     "Último: Mar 2026",
    icon:    TrendingUp,
    color:   "text-emerald-700",
    bgColor: "from-emerald-50 to-teal-50 border-emerald-200",
  },
  {
    label:   "Próximo vencimiento",
    value:   "12 días",
    sub:     "Reporte trimestral",
    icon:    Clock,
    color:   "text-red-600",
    bgColor: "from-red-50 to-orange-50 border-red-200",
    alert:   true,
  },
  {
    label:   "Capacitaciones",
    value:   "87%",
    sub:     "Empleados al día",
    icon:    Calendar,
    color:   "text-violet-700",
    bgColor: "from-violet-50 to-purple-50 border-violet-200",
  },
  {
    label:   "Alertas activas",
    value:   "3",
    sub:     "Requieren atención",
    icon:    AlertTriangle,
    color:   "text-orange-600",
    bgColor: "from-orange-50 to-amber-50 border-orange-200",
    alert:   true,
  },
];

export function CumplimientoKPIStrip() {
  return (
    <AnimatedSection delay={0.1} stagger={0.07} className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 border border-violet-200">
          <ShieldCheck size={14} className="text-violet-700" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
            Indicadores de Cumplimiento
          </h2>
          <p className="text-[11px] text-slate-400 leading-tight">
            SARLAFT · Sistema Antilavado
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {KPIS.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <AnimatedCard key={i} delay={i * 0.07}>
              <div
                className={`relative flex flex-col gap-2 rounded-xl border bg-gradient-to-br px-4 py-3 ${kpi.bgColor}`}
              >
                {kpi.alert && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                )}
                <div className="flex items-center gap-2">
                  <Icon size={15} className={kpi.color} />
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">{kpi.label}</p>
                </div>
                <p className={`text-xl font-extrabold tracking-tight ${kpi.color}`}>{kpi.value}</p>
                {kpi.sub && (
                  <p className="text-[10px] text-slate-400">{kpi.sub}</p>
                )}
              </div>
            </AnimatedCard>
          );
        })}
      </div>
    </AnimatedSection>
  );
}