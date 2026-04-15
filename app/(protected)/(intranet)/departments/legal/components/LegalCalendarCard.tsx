/**
 * @module LegalCalendarCard
 * Tarjeta de agenda jurídica con próximos eventos relevantes.
 *
 * @remarks
 * Este componente muestra una vista resumida de la agenda legal,
 * incluyendo eventos próximos como:
 *
 * - audiencias
 * - vencimientos contractuales
 * - plazos legales
 * - presentaciones
 * - renovaciones
 *
 * Está diseñado para ofrecer una lectura rápida de compromisos
 * próximos del área jurídica.
 */

import { CalendarDays } from "lucide-react";
import type { LegalData, LegalCalendarEvent } from "@/lib/graph/departments/legal.service";

/**
 * Props del componente {@link LegalCalendarCard}.
 *
 * @property data Datos consolidados del módulo legal.
 */
type CalendarProps = {
  data: LegalData;
};

/**
 * Configuración visual por tipo de evento de agenda.
 *
 * @remarks
 * Este mapa traduce el tipo interno del modelo {@link LegalCalendarEvent}
 * a una representación visual consistente en la interfaz.
 *
 * Incluye:
 * - etiqueta legible
 * - color del punto
 * - fondo del badge de fecha
 * - color de texto
 * - borde del badge
 */
const EVENT_TYPE_MAP: Record<
  LegalCalendarEvent["type"],
  { label: string; dot: string; bg: string; text: string; border: string }
> = {
  hearing: {
    label: "Audiencia",
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-500/[0.10]",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-100 dark:border-red-500/20",
  },
  contract_expiry: {
    label: "Vencimiento",
    dot: "bg-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/[0.10]",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-100 dark:border-amber-500/20",
  },
  deadline: {
    label: "Plazo legal",
    dot: "bg-orange-500",
    bg: "bg-orange-50 dark:bg-orange-500/[0.10]",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-100 dark:border-orange-500/20",
  },
  filing: {
    label: "Presentación",
    dot: "bg-sky-500",
    bg: "bg-sky-50 dark:bg-sky-500/[0.10]",
    text: "text-sky-700 dark:text-sky-400",
    border: "border-sky-100 dark:border-sky-500/20",
  },
  renewal: {
    label: "Renovación",
    dot: "bg-violet-500",
    bg: "bg-violet-50 dark:bg-violet-500/[0.10]",
    text: "text-violet-700 dark:text-violet-400",
    border: "border-violet-100 dark:border-violet-500/20",
  },
};

/**
 * Formatea una fecha ISO simple para mostrar día y mes abreviado.
 *
 * @param dateStr Fecha en formato de cadena.
 * @returns Objeto con día y mes formateados.
 *
 * @remarks
 * La fecha se interpreta agregando una hora fija (`T00:00:00`)
 * para evitar inconsistencias derivadas de parsing parcial.
 *
 * El formato de salida usa la localización `es-MX`.
 */
function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");

  return {
    day: date.toLocaleDateString("es-MX", { day: "numeric" }),
    month: date.toLocaleDateString("es-MX", { month: "short" }),
  };
}

/**
 * Tarjeta de agenda jurídica.
 *
 * @param props Propiedades del componente.
 * @returns Tarjeta con los próximos eventos de agenda del área legal.
 *
 * @remarks
 * Este componente:
 * - toma los eventos disponibles en `data.calendarEvents`
 * - los ordena cronológicamente por fecha
 * - limita la vista a los 6 próximos eventos
 * - aplica estilos visuales según el tipo de evento
 *
 * Cada elemento muestra:
 * - badge de fecha
 * - título del evento
 * - tipo de evento con semántica visual
 *
 * @example
 * ```tsx
 * <LegalCalendarCard data={data} />
 * ```
 */
export default function LegalCalendarCard({ data }: CalendarProps) {
  /**
   * Próximos eventos ordenados cronológicamente.
   *
   * @remarks
   * Se crea una copia del arreglo para evitar mutar directamente
   * los datos recibidos por props.
   */
  const upcoming = [...data.calendarEvents]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

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
          <CalendarDays size={16} className="text-slate-600 dark:text-[#768390]" />
        </span>

        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-[#e6edf3]">
            Agenda jurídica
          </p>
          <p className="text-[11px] text-slate-400 dark:text-[#545d68]">
            Audiencias, vencimientos y plazos
          </p>
        </div>
      </div>

      {/* Events */}
      <ul className="divide-y divide-slate-50 dark:divide-[#21262d]">
        {upcoming.map((event) => {
          const type = EVENT_TYPE_MAP[event.type];
          const { day, month } = formatDate(event.date);

          return (
            <li
              key={event.id}
              className="flex items-center gap-3 px-5 py-3 transition-colors
                           hover:bg-slate-50/60 dark:hover:bg-[#1c2128]"
            >
              {/* Date badge */}
              <div
                className={`flex w-11 shrink-0 flex-col items-center justify-center rounded-xl border py-1.5 ${type.bg} ${type.border}`}
              >
                <span className={`text-[10px] font-semibold uppercase ${type.text}`}>{month}</span>
                <span className={`text-base font-bold leading-none ${type.text}`}>{day}</span>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-medium
                              text-slate-800 dark:text-[#e6edf3]"
                >
                  {event.title}
                </p>

                <span className={`mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium ${type.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${type.dot}`} />
                  {type.label}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}