/**
 * @module LegalRegulatoryAlerts
 * Panel de alertas regulatorias del módulo jurídico.
 *
 * @remarks
 * Este componente muestra un listado de alertas normativas relevantes,
 * priorizadas según su nivel de severidad.
 *
 * Incluye:
 * - Encabezado descriptivo del módulo
 * - Ordenamiento de alertas por prioridad
 * - Representación visual por severidad
 * - Información de vigencia y área impactada
 *
 * Está orientado a visibilizar cambios regulatorios o normativos
 * que requieren atención del área legal o de otras áreas relacionadas.
 */

import { ShieldAlert, AlertTriangle, Info } from "lucide-react";
import type { LegalData, RegulatoryAlert } from "@/lib/graph/departments/legal.service";

/**
 * Props del componente {@link LegalRegulatoryAlerts}.
 *
 * @property data Datos consolidados del módulo legal.
 */
type RegulatoryProps = {
  data: LegalData;
};

/**
 * Configuración visual de severidad para alertas regulatorias.
 *
 * @remarks
 * Este mapa traduce cada nivel de severidad del modelo
 * {@link RegulatoryAlert} a una representación visual consistente.
 *
 * Incluye:
 * - Ícono asociado
 * - Clases de color del ícono
 * - Fondo contextual
 * - Borde contextual
 * - Etiqueta legible
 * - Clases de badge
 */
const SEVERITY_MAP: Record<
  RegulatoryAlert["severity"],
  {
    Icon: React.ElementType;
    iconCls: string;
    bg: string;
    border: string;
    badge: string;
    badgeCls: string;
  }
> = {
  critical: {
    Icon: ShieldAlert,
    iconCls: "text-red-500 dark:text-red-400",
    bg: "bg-red-50/60 dark:bg-red-500/[0.06]",
    border: "border-red-100 dark:border-[#21262d]",
    badge: "Crítico",
    badgeCls:
      "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/[0.10] dark:text-red-400 dark:border-red-500/20",
  },
  warning: {
    Icon: AlertTriangle,
    iconCls: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-50/40 dark:bg-amber-500/[0.05]",
    border: "border-amber-100 dark:border-[#21262d]",
    badge: "Atención",
    badgeCls:
      "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/[0.10] dark:text-amber-400 dark:border-amber-500/20",
  },
  info: {
    Icon: Info,
    iconCls: "text-sky-500 dark:text-sky-400",
    bg: "bg-sky-50/40 dark:bg-sky-500/[0.05]",
    border: "border-sky-100 dark:border-[#21262d]",
    badge: "Informativo",
    badgeCls:
      "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/[0.10] dark:text-sky-400 dark:border-sky-500/20",
  },
};

/**
 * Panel de alertas regulatorias.
 *
 * @param props Propiedades del componente.
 * @returns Tarjeta con alertas normativas ordenadas por severidad.
 *
 * @remarks
 * Este componente:
 * - Obtiene las alertas regulatorias desde `data`
 * - Genera una copia ordenada por prioridad de severidad
 * - Usa un mapa visual para representar cada tipo de alerta
 * - Muestra título, descripción, vigencia y área asociada
 *
 * El orden aplicado prioriza:
 * 1. `critical`
 * 2. `warning`
 * 3. `info`
 *
 * @example
 * ```tsx
 * <LegalRegulatoryAlerts data={data} />
 * ```
 */
export default function LegalRegulatoryAlerts({ data }: RegulatoryProps) {
  /**
   * Alertas ordenadas por nivel de severidad.
   *
   * @remarks
   * Se crea una copia del arreglo original para evitar mutaciones directas
   * sobre la fuente de datos recibida por props.
   */
  const sorted = [...data.regulatoryAlerts].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div
      className="rounded-2xl border shadow-sm
                    border-slate-200 bg-white
                    dark:border-[#30363d] dark:bg-[#161b22]"
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-5 py-4
                      border-b border-slate-100 dark:border-[#21262d]"
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg
                         border border-slate-200 bg-slate-100
                         dark:border-[#30363d] dark:bg-[#21262d]"
        >
          <ShieldAlert size={16} className="text-slate-600 dark:text-[#768390]" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-[#e6edf3]">
            Alertas regulatorias
          </p>
          <p className="text-[11px] text-slate-400 dark:text-[#545d68]">
            Cambios normativos relevantes
          </p>
        </div>
      </div>

      {/* Alerts */}
      <ul className="divide-y divide-slate-50 dark:divide-[#21262d]">
        {sorted.map((alert) => {
          const s = SEVERITY_MAP[alert.severity];
          const Icon = s.Icon;

          return (
            <li key={alert.id} className={`px-5 py-4 ${s.bg}`}>
              <div className="flex items-start gap-3">
                <Icon size={15} className={`mt-0.5 shrink-0 ${s.iconCls}`} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-sm font-semibold leading-snug
                                  text-slate-800 dark:text-[#e6edf3]"
                    >
                      {alert.title}
                    </p>

                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${s.badgeCls}`}>
                      {s.badge}
                    </span>
                  </div>

                  <p
                    className="mt-1 text-[12px] leading-relaxed
                                text-slate-500 dark:text-[#768390]"
                  >
                    {alert.description}
                  </p>

                  <div className="mt-1.5 flex items-center gap-2">
                    <span
                      className="text-[11px] font-medium
                                     text-slate-600 dark:text-[#adbac7]"
                    >
                      Vigencia: {alert.effectiveDate}
                    </span>

                    <span className="text-[10px] text-slate-300 dark:text-[#444c56]">·</span>

                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${s.badgeCls}`}>
                      {alert.area}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}