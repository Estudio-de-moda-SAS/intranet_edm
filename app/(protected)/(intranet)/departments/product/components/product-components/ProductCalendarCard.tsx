"use client";

import { CalendarDays } from "lucide-react";

/**
 * @module ProductCalendarCard
 * Tarjeta de calendario de temporada del módulo de Producto.
 */

/**
 * Representa un evento relevante del calendario de temporada.
 *
 * @property date Fecha abreviada del evento.
 * @property title Título o descripción del hito.
 * @property type Tipo de evento dentro del calendario.
 *
 * @remarks
 * Este tipo modela hitos clave del flujo de temporada,
 * como cierres, fittings, entregas, revisiones o lanzamientos.
 */
type CalEvent = {
  date: string;
  title: string;
  type: "deadline" | "launch" | "review" | "fitting" | "delivery";
};

/**
 * Dataset estático de eventos del calendario de temporada.
 *
 * @remarks
 * Contiene hitos representativos del ciclo operativo de Producto
 * para las temporadas activas.
 */
const CAL_EVENTS: CalEvent[] = [
  { date: "18 jun", title: "Cierre de fichas SS-25 — última fecha", type: "deadline" },
  { date: "20 jun", title: "Fitting colección principal SS-25", type: "fitting" },
  { date: "24 jun", title: "Entrega de muestras Resort-25 R2", type: "delivery" },
  { date: "28 jun", title: "Revisión final con dirección comercial", type: "review" },
  { date: "15 jul", title: "Lanzamiento SS-25 — tiendas nacionales", type: "launch" },
];

/**
 * Clases visuales asociadas a cada tipo de evento del calendario.
 */
const CAL_TYPE_COLORS: Record<CalEvent["type"], string> = {
  deadline: "bg-rose-100 text-rose-700",
  launch: "bg-emerald-100 text-emerald-700",
  review: "bg-sky-100 text-sky-700",
  fitting: "bg-violet-100 text-violet-700",
  delivery: "bg-amber-100 text-amber-700",
};

/**
 * Etiquetas visibles asociadas a cada tipo de evento del calendario.
 */
const CAL_TYPE_LABEL: Record<CalEvent["type"], string> = {
  deadline: "Cierre",
  launch: "Lanzamiento",
  review: "Revisión",
  fitting: "Fitting",
  delivery: "Entrega",
};

/**
 * Tarjeta de calendario de temporada del módulo de Producto.
 *
 * @returns Un listado visual de hitos relevantes de temporada.
 *
 * @remarks
 * Este componente presenta eventos clave del calendario operativo
 * del área de Producto, organizados como una lista compacta.
 *
 * Permite visualizar rápidamente:
 * - fechas de cierre
 * - fittings
 * - entregas de muestras
 * - revisiones internas
 * - lanzamientos comerciales
 *
 * @example
 * ```tsx
 * <ProductCalendarCard />
 * ```
 */
export function ProductCalendarCard() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50">
          <CalendarDays className="h-3.5 w-3.5 text-amber-600" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Calendario de temporada</h2>
          <p className="text-[11px] text-slate-400">Hitos SS-25 y Resort-25</p>
        </div>
      </div>

      <div className="space-y-2">
        {CAL_EVENTS.map((ev, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-stone-100 bg-stone-50/50 px-3 py-2 hover:border-amber-200 transition-colors"
          >
            <span className="w-12 shrink-0 text-[11px] font-semibold text-stone-500 text-center leading-tight">
              {ev.date}
            </span>
            <p className="flex-1 text-[12px] font-medium text-slate-700 truncate">{ev.title}</p>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${CAL_TYPE_COLORS[ev.type]}`}
            >
              {CAL_TYPE_LABEL[ev.type]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}