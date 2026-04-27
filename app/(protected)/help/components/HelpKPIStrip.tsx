/**
 * @module HelpKPIStrip
 * Franja de indicadores clave (KPIs) del Help Center.
 *
 * @remarks
 * Este componente define y renderiza los indicadores principales del
 * módulo de soporte, proporcionando una visión rápida del estado operativo.
 *
 * Incluye métricas como:
 *
 * - tickets abiertos
 * - tiempo promedio de respuesta
 * - tickets resueltos
 * - incidencias críticas
 *
 * Cada KPI contiene:
 *
 * - valor principal
 * - variación o contexto (delta)
 * - indicador de tendencia (positivo, negativo o neutro)
 * - configuración visual (colores, iconos, acentos)
 *
 * Este componente es un **Server Component**, ya que no maneja estado
 * ni lógica dinámica en el cliente.
 */

// app/(protected)/(intranet)/help/components/HelpKPIStrip.tsx

import { Ticket, Clock, CheckCircle, AlertTriangle } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Configuración de KPIs                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Lista de KPIs del módulo de soporte.
 *
 * @remarks
 * Cada elemento define:
 *
 * - `label`: nombre del indicador
 * - `value`: valor principal mostrado
 * - `delta`: variación o contexto
 * - `deltaUp`: tendencia (`true` subida, `false` bajada, `null` neutro)
 * - `icon`: icono representativo
 * - configuración visual (colores, acento superior)
 *
 * Esta estructura permite desacoplar la configuración de datos
 * de su representación visual.
 */
const kpis = [
  {
    label: "Tickets abiertos",
    value: "12",
    delta: "↓ 3 vs ayer",
    deltaUp: false,
    icon: Ticket,
    accent: "border-t-blue-600",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-700",
    valueColor: "text-blue-700",
  },
  {
    label: "Tiempo respuesta",
    value: "1h 24m",
    delta: "Promedio hoy",
    deltaUp: null,
    icon: Clock,
    accent: "border-t-amber-500",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-700",
    valueColor: "text-amber-700",
  },
  {
    label: "Resueltos hoy",
    value: "8",
    delta: "↑ 2 vs ayer",
    deltaUp: true,
    icon: CheckCircle,
    accent: "border-t-emerald-500",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
    valueColor: "text-emerald-700",
  },
  {
    label: "Incidencias críticas",
    value: "1",
    delta: "Sin cambios",
    deltaUp: null,
    icon: AlertTriangle,
    accent: "border-t-rose-500",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-700",
    valueColor: "text-rose-700",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Franja visual de KPIs del Help Center.
 *
 * @returns Grid responsive con indicadores clave.
 *
 * @remarks
 * Este componente:
 *
 * - renderiza los KPIs definidos en `kpis`
 * - aplica estilos consistentes para cada indicador
 * - adapta el layout de 2 a 4 columnas según el viewport
 *
 * La lógica de tendencia (`deltaUp`) controla el color del texto:
 *
 * - `true`  → positivo (verde)
 * - `false` → negativo (rojo)
 * - `null`  → neutro (gris)
 *
 * @example
 * ```tsx
 * <HelpKPIStrip />
 * ```
 */
export default function HelpKPIStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-6">
      {kpis.map(
        ({
          label,
          value,
          delta,
          deltaUp,
          icon: Icon,
          accent,
          iconBg,
          iconColor,
          valueColor,
        }) => (
          <div
            key={label}
            className={`rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-2 shadow-md border-t-[3px] ${accent}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                {label}
              </p>
              <span
                className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center`}
              >
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </span>
            </div>

            {/* Value */}
            <p className={`text-2xl font-bold ${valueColor} leading-none`}>
              {value}
            </p>

            {/* Delta */}
            <p
              className={`text-[11px] ${
                deltaUp === true
                  ? "text-emerald-600"
                  : deltaUp === false
                  ? "text-rose-500"
                  : "text-slate-400"
              }`}
            >
              {delta}
            </p>
          </div>
        )
      )}
    </div>
  );
}