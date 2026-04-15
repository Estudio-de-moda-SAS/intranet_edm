/**
 * @module AdminCalendarCard
 * Tarjeta de calendario del módulo de Servicios Administrativos.
 *
 * Muestra una vista resumida de las próximas fechas clave del área,
 * tales como nómina, vencimientos, cierres y recordatorios.
 *
 * @remarks
 * Este componente consume los eventos de calendario desde {@link AdminData},
 * específicamente desde `data.calendarEvents`, y presenta una selección
 * ordenada de los eventos más próximos.
 *
 * La fuente funcional de datos corresponde al calendario administrativo
 * sincronizado vía Microsoft Graph.
 */

// app/(protected)/(intranet)/departments/administrative/components/AdminCalendarCard.tsx
// SERVER COMPONENT
// Fuente de datos: Outlook Calendar vía MS Graph → getAdminData().calendarEvents

import { CalendarDays } from "lucide-react";
import type { AdminData, AdminCalendarEvent } from "@/lib/graph/departments/administrative.service";

/**
 * Propiedades de {@link AdminCalendarCard}.
 *
 * @property data Datos consolidados del módulo administrativo.
 */
type Props = { data: AdminData };

/**
 * Mapa de presentación para los tipos de eventos del calendario administrativo.
 *
 * @remarks
 * Asocia cada tipo de evento a:
 * - una etiqueta legible,
 * - un color de punto indicador,
 * - estilos de fondo, texto y borde.
 *
 * Esto permite representar visualmente la naturaleza de cada evento de forma
 * consistente en la interfaz.
 */
const EVENT_TYPE_MAP: Record<
  AdminCalendarEvent["type"],
  { label: string; dot: string; bg: string; text: string; border: string }
> = {
  payroll:  { label: "Nómina",       dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
  deadline: { label: "Vencimiento",  dot: "bg-red-500",     bg: "bg-red-50",     text: "text-red-700",     border: "border-red-100"     },
  closure:  { label: "Cierre",       dot: "bg-orange-500",  bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-100"  },
  reminder: { label: "Recordatorio", dot: "bg-sky-500",     bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-100"     },
};

/**
 * Formatea una fecha ISO corta para mostrarla en formato legible.
 *
 * @param dateStr Fecha en formato `YYYY-MM-DD`.
 * @returns Fecha formateada en español abreviado, por ejemplo `12 ene`.
 *
 * @remarks
 * Se utiliza para construir el badge visual de fecha dentro de la tarjeta
 * de eventos.
 */
function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Renderiza una tarjeta con las próximas fechas clave del calendario
 * administrativo.
 *
 * @param props Propiedades del componente.
 * @param props.data Datos administrativos requeridos para construir la tarjeta.
 * @returns Tarjeta con listado resumido de eventos próximos.
 *
 * @remarks
 * El componente:
 * - toma los eventos desde `data.calendarEvents`,
 * - los ordena cronológicamente,
 * - selecciona los cinco más próximos,
 * - y los presenta con un formato visual según su tipo.
 */
export default function AdminCalendarCard({ data }: Props) {
  /**
   * Lista de próximos eventos administrativos.
   *
   * @remarks
   * Se ordena por fecha ascendente y se limita a los cinco eventos más cercanos.
   */
  const upcoming = [...data.calendarEvents]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
          <CalendarDays size={16} className="text-slate-600" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">Calendario administrativo</p>
          <p className="text-[11px] text-slate-400">Próximas fechas clave</p>
        </div>
      </div>

      {/* Events */}
      <ul className="divide-y divide-slate-50">
        {upcoming.map((event) => {
          const type = EVENT_TYPE_MAP[event.type];
          return (
            <li
              key={event.id}
              className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors"
            >
              {/* Date badge */}
              <div className={`flex w-11 shrink-0 flex-col items-center justify-center rounded-xl border py-1.5 ${type.bg} ${type.border}`}>
                <span className={`text-[10px] font-semibold uppercase ${type.text}`}>
                  {formatDate(event.date).split(" ")[1]}
                </span>
                <span className={`text-base font-bold leading-none ${type.text}`}>
                  {formatDate(event.date).split(" ")[0]}
                </span>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">
                  {event.title}
                </p>
                <span
                  className={`mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium ${type.text}`}
                >
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