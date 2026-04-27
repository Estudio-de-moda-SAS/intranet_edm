"use client";
/**
 * @module CumplimientoAlertasPanel
 * Panel de alertas regulatorias y vencimientos de cumplimiento.
 *
 * @remarks
 * Datos mock hasta que Graph/servicio de cumplimiento esté disponible.
 */

import { AlertTriangle, Clock, CheckCircle2, ExternalLink } from "lucide-react";

type AlertLevel = "critical" | "warning" | "ok";

interface RegulatoryAlert {
  id:         string;
  title:      string;
  body:       string;
  level:      AlertLevel;
  dueDate?:   string;
  daysLeft?:  number;
  entity:     string;
}

const MOCK_ALERTS: RegulatoryAlert[] = [
  {
    id:       "reg-001",
    title:    "Reporte operaciones sospechosas (UIAF)",
    body:     "Vence el plazo para el reporte trimestral de operaciones sospechosas.",
    level:    "critical",
    dueDate:  "2026-04-27",
    daysLeft: 12,
    entity:   "UIAF",
  },
  {
    id:       "reg-002",
    title:    "Actualización formulario vinculación clientes",
    body:     "Circular SFC 027/2025 exige actualización del formulario de conocimiento del cliente.",
    level:    "warning",
    dueDate:  "2026-05-15",
    daysLeft: 30,
    entity:   "SFC",
  },
  {
    id:       "reg-003",
    title:    "Capacitación anual SARLAFT",
    body:     "Plan de capacitación anual completado al 87%. Pendiente 12 empleados.",
    level:    "warning",
    dueDate:  "2026-06-30",
    daysLeft: 76,
    entity:   "Interna",
  },
  {
    id:       "reg-004",
    title:    "Reporte ROS Q4 2025",
    body:     "Reporte enviado y confirmado. No se requieren acciones adicionales.",
    level:    "ok",
    entity:   "UIAF",
  },
];

const LEVEL_STYLES: Record<AlertLevel, { border: string; bg: string; icon: string; badge: string; label: string }> = {
  critical: {
    border: "border-l-red-500",
    bg:     "bg-red-50/60 dark:bg-red-950/20",
    icon:   "text-red-500",
    badge:  "bg-red-100 text-red-700 border-red-200",
    label:  "Urgente",
  },
  warning: {
    border: "border-l-amber-500",
    bg:     "bg-amber-50/60 dark:bg-amber-950/20",
    icon:   "text-amber-500",
    badge:  "bg-amber-100 text-amber-700 border-amber-200",
    label:  "Atención",
  },
  ok: {
    border: "border-l-emerald-500",
    bg:     "bg-emerald-50/40 dark:bg-emerald-950/10",
    icon:   "text-emerald-500",
    badge:  "bg-emerald-100 text-emerald-700 border-emerald-200",
    label:  "Al día",
  },
};

const LEVEL_ICONS: Record<AlertLevel, React.FC<{ size?: number; className?: string }>> = {
  critical: AlertTriangle,
  warning:  Clock,
  ok:       CheckCircle2,
};

export function CumplimientoAlertasPanel() {
  const criticalCount = MOCK_ALERTS.filter((a) => a.level === "critical").length;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangle size={13} className="text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Alertas Regulatorias
          </p>
          <p className="text-[11px] text-slate-400">Obligaciones y vencimientos normativos</p>
        </div>
        {criticalCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {criticalCount}
          </span>
        )}
      </div>

      {/* Lista */}
      <div className="flex flex-col divide-y divide-slate-50 dark:divide-slate-700/50">
        {MOCK_ALERTS.map((alert) => {
          const style = LEVEL_STYLES[alert.level];
          const Icon  = LEVEL_ICONS[alert.level];
          return (
            <div
              key={alert.id}
              className={`flex gap-3 border-l-4 px-4 py-3 ${style.border} ${style.bg} transition-colors hover:brightness-[0.98]`}
            >
              <Icon size={14} className={`mt-0.5 shrink-0 ${style.icon}`} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                  <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">
                    {alert.title}
                  </p>
                  <span className={`rounded-full border px-1.5 py-0 text-[9px] font-semibold ${style.badge}`}>
                    {alert.entity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {alert.body}
                </p>
                {alert.dueDate && (
                  <p className="mt-1 text-[10px] text-slate-400">
                    Vence: {new Date(alert.dueDate).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}
                    {alert.daysLeft !== undefined && (
                      <span className={`ml-1 font-semibold ${alert.level === "critical" ? "text-red-600" : "text-amber-600"}`}>
                        ({alert.daysLeft} días)
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2 dark:border-slate-700">
        <p className="text-[11px] text-slate-400">
          {MOCK_ALERTS.filter((a) => a.level !== "ok").length} obligaciones pendientes
        </p>
        <button className="flex items-center gap-1 text-[11px] font-medium text-violet-600 hover:text-violet-800 transition-colors">
          Ver todas <ExternalLink size={10} />
        </button>
      </div>
    </div>
  );
}