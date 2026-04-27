/**
 * @module HelpTicketsCard
 * Tarjeta de resumen de tickets activos del usuario.
 *
 * @remarks
 * Este componente presenta una vista resumida en formato de tabla
 * con los tickets actualmente asociados al usuario autenticado.
 *
 * Sus responsabilidades principales son:
 *
 * - consumir tickets desde el contexto de ayuda
 * - adaptar el modelo de datos original a una estructura visual simplificada
 * - mapear prioridad y estado a configuraciones de UI
 * - renderizar una tabla compacta con estado vacío cuando no existan tickets
 *
 * Actualmente parte de la transformación es temporal o simulada,
 * especialmente la prioridad visual, la cual se genera artificialmente
 * hasta contar con ese dato real en la fuente de datos.
 */

"use client";

import { useTickets } from "../context/HelpTicketsContext";

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Prioridades visuales soportadas por la tarjeta.
 *
 * @remarks
 * Actualmente estas prioridades se asignan de forma simulada
 * en el adaptador visual interno.
 */
type TicketPriority = "high" | "mid" | "low";

/**
 * Estados visuales soportados por la tarjeta.
 *
 * @remarks
 * Estos estados representan la capa de presentación, no necesariamente
 * el valor exacto persistido en la fuente de datos original.
 */
type TicketStatus = "open" | "progress" | "resolved" | "critical";

/**
 * Estructura de un ticket ya adaptado para renderizarse en la tabla.
 *
 * @property id Identificador corto mostrado en la interfaz.
 * @property title Título del ticket.
 * @property area Área responsable o relacionada con la solicitud.
 * @property priority Prioridad visual del ticket.
 * @property status Estado visual adaptado.
 * @property updated Fecha de actualización mostrada al usuario.
 */
interface MappedTicket {
  id: string;
  title: string;
  area: string;
  priority: TicketPriority;
  status: TicketStatus;
  updated: string;
}

/**
 * Configuración visual de un badge de estado.
 *
 * @property label Texto mostrado en la insignia.
 * @property classes Clases CSS aplicadas al badge.
 */
interface StatusBadgeConfig {
  label: string;
  classes: string;
}

/* -------------------------------------------------------------------------- */
/* Configuración visual                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Mapa de color visual para la prioridad del ticket.
 *
 * @remarks
 * Cada prioridad se representa mediante un punto de color dentro de la tabla.
 */
const PRIORITY_DOT: Record<TicketPriority, string> = {
  high: "bg-rose-500",
  mid: "bg-amber-500",
  low: "bg-emerald-500",
};

/**
 * Configuración visual para los estados mostrados en la tabla.
 *
 * @remarks
 * Define la etiqueta legible y las clases CSS del badge de estado.
 */
const STATUS_BADGE: Record<TicketStatus, StatusBadgeConfig> = {
  open: {
    label: "Abierto",
    classes: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  progress: {
    label: "En proceso",
    classes: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  resolved: {
    label: "Resuelto",
    classes: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  critical: {
    label: "Crítico",
    classes: "bg-rose-50 text-rose-700 border border-rose-200",
  },
};

/**
 * Adaptación de estados del dominio a estados visuales de la tarjeta.
 *
 * @remarks
 * Permite desacoplar los valores persistidos del backend o contexto
 * respecto a la representación final de la interfaz.
 */
const STATUS_MAP: Record<string, TicketStatus> = {
  open: "open",
  "in-progress": "progress",
  closed: "resolved",
};

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Tarjeta de tickets activos del usuario.
 *
 * @returns Tabla resumida con tickets activos o estado vacío.
 *
 * @remarks
 * Este componente consume el hook de tickets desde contexto y aplica
 * una transformación visual previa al renderizado.
 *
 * Flujo general:
 *
 * 1. Se obtienen los tickets desde {@link useTickets}
 * 2. Se transforman al formato visual esperado por la tabla
 * 3. Se resuelven prioridad y estado para la UI
 * 4. Se renderiza la tabla o un estado vacío
 *
 * @example
 * ```tsx
 * <HelpTicketsCard />
 * ```
 */
export default function HelpTicketsCard() {
  /**
   * Lista de tickets disponibles en el contexto.
   */
  const { tickets } = useTickets();

  /**
   * Tickets adaptados al formato visual de la tabla.
   *
   * @remarks
   * La prioridad actualmente se genera de forma temporal
   * con base en el índice del arreglo.
   */
  const mappedTickets: MappedTicket[] = tickets.map((ticket, index) => {
    /**
     * Prioridad simulada temporalmente.
     *
     * @remarks
     * Debe reemplazarse por un valor real cuando la fuente de datos
     * incluya prioridad persistida.
     */
    const priority: TicketPriority =
      index % 3 === 0 ? "high" : index % 3 === 1 ? "mid" : "low";

    return {
      id: `#${ticket.id.slice(0, 4)}`,
      title: ticket.title,
      area: ticket.area,
      priority,
      status: STATUS_MAP[ticket.status] ?? "open",
      updated: ticket.createdAt.toLocaleDateString(),
    };
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Mis tickets activos
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Solicitudes en curso asignadas a ti
          </p>
        </div>

        <button className="text-[11px] font-medium text-blue-600 hover:underline">
          Ver todos
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {["ID", "Solicitud", "Prioridad", "Estado", "Actualizado"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-5 py-3 text-left text-[10px] uppercase tracking-widest font-semibold text-slate-400"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {mappedTickets.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-6 text-center text-slate-400 text-sm"
                >
                  No hay tickets aún
                </td>
              </tr>
            ) : (
              mappedTickets.map((ticket) => {
                /**
                 * Configuración visual del estado actual.
                 */
                const badge = STATUS_BADGE[ticket.status];

                /**
                 * Color visual de la prioridad actual.
                 */
                const priorityDot = PRIORITY_DOT[ticket.priority];

                if (!badge || !priorityDot) return null;

                return (
                  <tr
                    key={ticket.id}
                    className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <span className="font-mono text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                        {ticket.id}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800 text-[13px]">
                        {ticket.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {ticket.area}
                      </p>
                    </td>

                    <td className="px-5 py-3">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${priorityDot}`}
                      />
                    </td>

                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-full ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-[12px] text-slate-400 whitespace-nowrap">
                      {ticket.updated}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}