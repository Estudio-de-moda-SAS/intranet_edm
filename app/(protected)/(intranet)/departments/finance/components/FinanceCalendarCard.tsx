/**
 * @module FinanceCalendarCard
 * Tarjeta de calendario operativo del módulo financiero.
 *
 * @remarks
 * Este componente presenta una vista resumida de los próximos hitos,
 * vencimientos y eventos relevantes para el área de Finanzas.
 *
 * Su propósito es concentrar, en una tarjeta compacta, la agenda
 * operativa y regulatoria del módulo, facilitando la priorización
 * de actividades próximas.
 *
 * Incluye eventos tales como:
 *
 * - cierres contables o trimestrales
 * - obligaciones fiscales
 * - conciliaciones
 * - sesiones de junta
 * - auditorías
 *
 * La tarjeta enriquece cada evento con:
 *
 * - prioridad visual
 * - distancia temporal respecto a la fecha actual
 * - indicador de urgencia para vencimientos cercanos
 */

import { Calendar, ChevronRight as ChevronRightIcon } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Tipos de dominio                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Niveles de prioridad admitidos para un evento financiero.
 *
 * @remarks
 * La prioridad influye en la representación visual del evento
 * dentro de la interfaz.
 */
type EventPriority = "high" | "medium" | "low";

/**
 * Representa un evento del calendario financiero.
 *
 * @property id Identificador único del evento.
 * @property date Fecha breve formateada para visualización.
 * @property day Día numérico del evento.
 * @property month Mes numérico del evento.
 * @property title Nombre o descripción corta del evento.
 * @property tag Categoría funcional del evento.
 * @property priority Nivel de prioridad asociado.
 */
interface FinanceEvent {
  id: string;
  date: string;
  day: number;
  month: number;
  title: string;
  tag: string;
  priority: EventPriority;
}

/* -------------------------------------------------------------------------- */
/* Configuración visual                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Configuración del indicador puntual por prioridad.
 *
 * @remarks
 * Se utiliza como referencia rápida de criticidad
 * junto al título de cada evento.
 */
const PRIORITY_DOT: Record<EventPriority, string> = {
  high: "bg-rose-500",
  medium: "bg-amber-400",
  low: "bg-emerald-400",
};

/**
 * Configuración visual del badge por prioridad.
 *
 * @remarks
 * Define la apariencia de la etiqueta contextual del evento
 * en entornos claro y oscuro.
 */
const PRIORITY_BADGE: Record<EventPriority, string> = {
  high:
    "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/[0.10] dark:text-rose-400 dark:border-rose-500/20",
  medium:
    "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/[0.10] dark:text-amber-400 dark:border-amber-500/20",
  low:
    "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/[0.10] dark:text-emerald-400 dark:border-emerald-500/20",
};

/* -------------------------------------------------------------------------- */
/* Datos mock                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Colección estática de eventos financieros.
 *
 * @remarks
 * Actualmente este arreglo funciona como fuente de datos temporal
 * para la tarjeta de calendario.
 *
 * En producción, debería reemplazarse por información proveniente
 * de un servicio de agenda, calendario corporativo o backend financiero.
 */
const FINANCE_EVENTS: FinanceEvent[] = [
  {
    id: "e1",
    date: "28 mar",
    day: 28,
    month: 3,
    title: "Cierre Q1 2025",
    tag: "Cierre",
    priority: "high",
  },
  {
    id: "e2",
    date: "31 mar",
    day: 31,
    month: 3,
    title: "Reporte DIAN — IVA bimestral",
    tag: "Fiscal",
    priority: "high",
  },
  {
    id: "e3",
    date: "7 abr",
    day: 7,
    month: 4,
    title: "Presentación Junta Directiva",
    tag: "Junta",
    priority: "medium",
  },
  {
    id: "e4",
    date: "15 abr",
    day: 15,
    month: 4,
    title: "Conciliación bancaria abril",
    tag: "Contable",
    priority: "low",
  },
  {
    id: "e5",
    date: "22 abr",
    day: 22,
    month: 4,
    title: "Auditoría interna — inicio",
    tag: "Auditoría",
    priority: "high",
  },
  {
    id: "e6",
    date: "30 abr",
    day: 30,
    month: 4,
    title: "Cierre contable abril",
    tag: "Cierre",
    priority: "medium",
  },
];

/* -------------------------------------------------------------------------- */
/* Utilidades                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Calcula la cantidad de días faltantes para un evento.
 *
 * @param day Día del evento.
 * @param month Mes del evento.
 * @returns Número entero de días hasta la próxima ocurrencia del evento.
 *
 * @remarks
 * La función toma como referencia el año actual.
 * Si la fecha ya pasó, proyecta automáticamente el evento
 * al año siguiente para mantener una lógica cíclica de agenda.
 */
function daysAway(day: number, month: number): number {
  const now = new Date();
  const target = new Date(now.getFullYear(), month - 1, day);

  if (target < now) {
    target.setFullYear(now.getFullYear() + 1);
  }

  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
}

/* -------------------------------------------------------------------------- */
/* Props                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Props del componente {@link FinanceCalendarCard}.
 *
 * @property className Clases adicionales para personalización externa.
 */
interface CalendarProps {
  className?: string;
}

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Tarjeta de calendario financiero.
 *
 * @param props Propiedades del componente.
 * @returns Tarjeta con próximos eventos y vencimientos del área financiera.
 *
 * @remarks
 * Este componente:
 *
 * - toma la colección de eventos financieros
 * - calcula la distancia temporal de cada evento respecto al presente
 * - ordena los eventos por cercanía
 * - resalta visualmente aquellos con proximidad crítica
 *
 * Se considera urgente un evento cuya ocurrencia
 * se encuentra a tres días o menos.
 *
 * @example
 * ```tsx
 * <FinanceCalendarCard />
 * ```
 *
 * @example
 * ```tsx
 * <FinanceCalendarCard className="h-full" />
 * ```
 */
export function FinanceCalendarCard({ className = "" }: CalendarProps) {
  /**
   * Colección de eventos enriquecida con distancia temporal,
   * ordenada de forma ascendente por proximidad.
   */
  const events = FINANCE_EVENTS
    .map((e) => ({ ...e, daysAway: daysAway(e.day, e.month) }))
    .sort((a, b) => a.daysAway - b.daysAway);

  return (
    <div
      className={`rounded-2xl border overflow-hidden shadow-sm
                     bg-white border-slate-200
                     dark:bg-[#161b22] dark:border-[#30363d] ${className}`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pt-4 pb-3
                      border-b border-slate-100 dark:border-[#21262d]"
      >
        <div className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg
                           bg-violet-50 dark:bg-violet-500/[0.12]"
          >
            <Calendar className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
          </span>

          <div>
            <h3 className="text-[12.5px] font-semibold text-slate-800 dark:text-[#e6edf3]">
              Calendario Financiero
            </h3>
            <p className="text-[10.5px] text-slate-400 dark:text-[#545d68]">
              Próximos eventos y vencimientos
            </p>
          </div>
        </div>

        <a
          href="/finance/calendar"
          className="flex items-center gap-0.5 text-[11px] font-medium transition-colors
                      text-violet-600 hover:text-violet-700
                      dark:text-violet-400 dark:hover:text-violet-300"
        >
          Ver todo <ChevronRightIcon className="h-3 w-3" />
        </a>
      </div>

      {/* Event list */}
      <ul className="divide-y divide-slate-50 dark:divide-[#21262d]" role="list">
        {events.map((event) => {
          /**
           * Determina si el evento debe resaltarse como urgente.
           *
           * @remarks
           * Se considera urgente cuando faltan tres días o menos
           * para su ocurrencia.
           */
          const isUrgent = event.daysAway <= 3;

          return (
            <li
              key={event.id}
              className="flex items-center gap-3 px-4 py-2.5 transition-colors group
                           hover:bg-slate-50 dark:hover:bg-[#1c2128]"
            >
              {/* Date chip */}
              <div
                className={`flex w-11 shrink-0 flex-col items-center rounded-lg py-1 ${
                  isUrgent
                    ? "bg-rose-50 dark:bg-rose-500/[0.10]"
                    : "bg-slate-50 dark:bg-[#21262d]"
                }`}
              >
                <span
                  className={`text-[13px] font-bold leading-tight ${
                    isUrgent
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-slate-700 dark:text-[#adbac7]"
                  }`}
                >
                  {event.date.split(" ")[0]}
                </span>

                <span
                  className={`text-[9px] font-medium uppercase tracking-wide ${
                    isUrgent
                      ? "text-rose-400 dark:text-rose-500"
                      : "text-slate-400 dark:text-[#545d68]"
                  }`}
                >
                  {event.date.split(" ")[1]}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${PRIORITY_DOT[event.priority]}`}
                    aria-hidden
                  />
                  <p
                    className="text-[12px] font-medium truncate
                                text-slate-700 dark:text-[#cdd9e5]"
                  >
                    {event.title}
                  </p>
                </div>

                <div className="mt-0.5 flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center rounded border px-1.5 py-px text-[9.5px] font-semibold ${PRIORITY_BADGE[event.priority]}`}
                  >
                    {event.tag}
                  </span>

                  <span
                    className={`text-[10px] ${
                      isUrgent
                        ? "font-semibold text-rose-500 dark:text-rose-400"
                        : "text-slate-400 dark:text-[#545d68]"
                    }`}
                  >
                    {event.daysAway === 0
                      ? "Hoy"
                      : event.daysAway === 1
                        ? "Mañana"
                        : `en ${event.daysAway} días`}
                  </span>
                </div>
              </div>

              <ChevronRightIcon
                className="h-3 w-3 shrink-0 transition-colors
                                           text-slate-300 group-hover:text-violet-400
                                           dark:text-[#444c56] dark:group-hover:text-violet-400"
              />
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div
        className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60
                      dark:border-[#21262d] dark:bg-[#1c2128]/50"
      >
        <a
          href="/finance/calendar/add"
          className="flex items-center gap-1 text-[11px] font-medium transition-colors
                      text-slate-500 hover:text-violet-600
                      dark:text-[#545d68] dark:hover:text-violet-400"
        >
          <span
            className="flex h-4 w-4 items-center justify-center rounded text-[10px] font-bold
                           bg-slate-200 text-slate-500
                           dark:bg-[#30363d] dark:text-[#768390]"
          >
            +
          </span>
          Agregar evento al calendario
        </a>
      </div>
    </div>
  );
}