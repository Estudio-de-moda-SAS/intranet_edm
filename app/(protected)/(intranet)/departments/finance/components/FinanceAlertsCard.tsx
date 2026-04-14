/**
 * @module FinanceAlertsCard
 * Tarjeta de alertas operativas y financieras del módulo de Finanzas.
 *
 * @remarks
 * Este componente presenta un resumen visual de alertas relevantes
 * para el seguimiento diario del área financiera.
 *
 * Su propósito es concentrar, en una sola vista, eventos que requieren
 * atención operativa o monitoreo preventivo, tales como:
 *
 * - facturas vencidas
 * - presupuestos excedidos
 * - pagos pendientes de aprobación
 * - hitos de cierre contable
 * - registros incompletos o sin clasificar
 *
 * La tarjeta clasifica cada alerta por severidad y destaca,
 * en el encabezado, la cantidad de incidencias críticas activas.
 */

import { AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";

/* -------------------------------------------------------------------------- */
/* Tipos de dominio                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Representa una alerta financiera mostrada en la interfaz.
 *
 * @property message Descripción breve de la incidencia o evento.
 * @property severity Nivel de criticidad asociado a la alerta.
 */
type Alert = {
  message: string;
  severity: "high" | "medium" | "low";
};

/* -------------------------------------------------------------------------- */
/* Datos mock                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Colección estática de alertas del módulo financiero.
 *
 * @remarks
 * Actualmente esta estructura funciona como fuente de datos temporal
 * para poblar la tarjeta durante desarrollo o prototipado.
 *
 * En un escenario productivo, este arreglo debería ser reemplazado
 * por datos provenientes de un servicio de monitoreo, backend
 * o sistema de auditoría financiera.
 */
const ALERTS: Alert[] = [
  { message: "5 facturas vencidas", severity: "high" },
  { message: "2 presupuestos excedidos", severity: "high" },
  { message: "3 pagos pendientes de aprobación", severity: "medium" },
  { message: "Cierre contable en 3 días", severity: "medium" },
  { message: "7 gastos sin categorizar", severity: "low" },
];

/* -------------------------------------------------------------------------- */
/* Configuración visual                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Configuración visual por nivel de severidad.
 *
 * @remarks
 * Este mapa transforma la criticidad lógica de la alerta
 * en una representación visual consistente dentro de la interfaz.
 *
 * Cada nivel define:
 *
 * - color del indicador puntual
 * - estilos del badge
 * - etiqueta legible para el usuario
 */
const SEVERITY = {
  high: {
    dot: "bg-rose-400",
    badge:
      "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-500/[0.10] dark:border-rose-500/20 dark:text-rose-400",
    label: "Alta",
  },
  medium: {
    dot: "bg-amber-400",
    badge:
      "bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-500/[0.10] dark:border-amber-500/20 dark:text-amber-400",
    label: "Media",
  },
  low: {
    dot: "bg-slate-300 dark:bg-[#444c56]",
    badge:
      "bg-slate-50 border-slate-100 text-slate-500 dark:bg-[#21262d] dark:border-[#30363d] dark:text-[#768390]",
    label: "Baja",
  },
};

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Tarjeta de alertas financieras.
 *
 * @returns Componente visual con resumen de alertas activas y acceso al listado completo.
 *
 * @remarks
 * Este componente:
 *
 * - presenta un encabezado con contexto funcional
 * - destaca el número de alertas de severidad alta
 * - lista las incidencias disponibles con su respectiva criticidad
 * - ofrece acceso a la vista completa de alertas
 *
 * La tarjeta está diseñada como un widget de monitoreo rápido,
 * orientado a facilitar priorización y supervisión operativa.
 *
 * @example
 * ```tsx
 * <FinanceAlertsCard />
 * ```
 */
export default function FinanceAlertsCard() {
  /**
   * Número de alertas críticas actualmente activas.
   *
   * @remarks
   * Este valor se utiliza para destacar en el encabezado
   * la cantidad de eventos que requieren atención prioritaria.
   */
  const highCount = ALERTS.filter((a) => a.severity === "high").length;

  return (
    <div
      className="rounded-xl border shadow-sm
                    bg-white border-slate-200
                    dark:bg-[#161b22] dark:border-[#30363d]"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4
                      border-b border-slate-100 dark:border-[#21262d]"
      >
        <div className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg
                           bg-rose-50 dark:bg-rose-500/[0.10]"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
          </span>

          <h3 className="text-sm font-semibold text-slate-800 dark:text-[#e6edf3]">
            Alertas Financieras
          </h3>
        </div>

        {highCount > 0 && (
          <span
            className="rounded-full border px-2 py-0.5 text-[11px] font-semibold
                           bg-rose-50 border-rose-100 text-rose-600
                           dark:bg-rose-500/[0.10] dark:border-rose-500/20 dark:text-rose-400"
          >
            {highCount} urgentes
          </span>
        )}
      </div>

      {/* Alerts */}
      <ul className="divide-y divide-slate-50 dark:divide-[#21262d]">
        {ALERTS.map((alert, i) => {
          /**
           * Configuración visual correspondiente
           * al nivel de severidad de la alerta actual.
           */
          const cfg = SEVERITY[alert.severity];

          return (
            <li
              key={i}
              className="flex items-center gap-3 px-5 py-3 transition-colors
                                   hover:bg-slate-50/50 dark:hover:bg-[#1c2128]"
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />

              <span className="flex-1 text-[13px] text-slate-700 dark:text-[#adbac7]">
                {alert.message}
              </span>

              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cfg.badge}`}
              >
                {cfg.label}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 dark:border-[#21262d]">
        <Link
          href="/finance/alerts"
          className="flex items-center gap-1 text-[11px] font-medium transition-colors
                     text-slate-400 hover:text-violet-600
                     dark:text-[#545d68] dark:hover:text-violet-400"
        >
          Ver todas las alertas <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}