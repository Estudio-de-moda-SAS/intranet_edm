/**
 * @module LegalRequestClient
 * Cliente interactivo para filtrar y visualizar solicitudes jurídicas.
 *
 * @remarks
 * Este componente se encarga de la parte interactiva del panel de solicitudes
 * legales, permitiendo:
 *
 * - Buscar por título o departamento
 * - Filtrar por estado
 * - Renderizar la lista final de solicitudes
 * - Mostrar un estado vacío cuando no hay coincidencias
 *
 * La configuración visual de estados, prioridades y tipos se recibe
 * por props desde el contenedor padre.
 */

"use client";

import type { LegalRequest } from "@/lib/graph/departments/legal.service";
import { useSearchFilter } from "@/app/hooks/useSearchFilter";
import { useState } from "react";
import FilterBar from "@/app/components/ui/filters/FilterBar";

/**
 * Configuración visual de un estado de solicitud.
 *
 * @property label Texto legible para mostrar en la interfaz.
 * @property cls Clases CSS asociadas al badge del estado.
 */
type RequestStatusConfig = {
  label: string;
  cls: string;
};

/**
 * Configuración visual de una prioridad de solicitud.
 *
 * @property dot Clases CSS del punto indicador.
 * @property label Texto legible de la prioridad.
 */
type RequestPriorityConfig = {
  dot: string;
  label: string;
};

/**
 * Props del componente {@link LegalRequestsClient}.
 *
 * @property requests Lista de solicitudes jurídicas a mostrar.
 * @property STATUS_MAP Mapa visual de estados por tipo de estado.
 * @property PRIORITY_MAP Mapa visual de prioridades por tipo de prioridad.
 * @property TYPE_LABEL Etiquetas legibles por tipo de solicitud.
 */
type RequestsClientProps = {
  requests: LegalRequest[];
  STATUS_MAP: Record<LegalRequest["status"], RequestStatusConfig>;
  PRIORITY_MAP: Record<LegalRequest["priority"], RequestPriorityConfig>;
  TYPE_LABEL: Record<LegalRequest["type"], string>;
};

/**
 * Cliente de solicitudes jurídicas con búsqueda y filtros.
 *
 * @param props Propiedades del componente.
 * @returns Listado filtrable de solicitudes jurídicas.
 *
 * @remarks
 * Este componente:
 * - Mantiene el filtro de estado seleccionado
 * - Usa el hook {@link useSearchFilter} para búsqueda textual
 * - Filtra por coincidencia en título o departamento
 * - Combina búsqueda y filtro de estado
 * - Renderiza la lista final o un mensaje vacío
 *
 * La lógica visual de estados, prioridades y tipos se delega a los mapas
 * recibidos por props para mantener consistencia con el panel padre.
 *
 * @example
 * ```tsx
 * <LegalRequestsClient
 *   requests={requests}
 *   STATUS_MAP={STATUS_MAP}
 *   PRIORITY_MAP={PRIORITY_MAP}
 *   TYPE_LABEL={TYPE_LABEL}
 * />
 * ```
 */
export default function LegalRequestsClient({
  requests,
  STATUS_MAP,
  PRIORITY_MAP,
  TYPE_LABEL,
}: RequestsClientProps) {
  /**
   * Estado actualmente seleccionado para el filtro por status.
   *
   * @remarks
   * El valor `"all"` representa ausencia de filtro específico.
   */
  const [statusFilter, setStatusFilter] = useState("all");

  /**
   * Resultado del hook de búsqueda textual.
   *
   * @remarks
   * Filtra solicitudes por coincidencia en:
   * - título
   * - departamento
   */
  const { search, setSearch, filtered } = useSearchFilter(
    requests,
    (r, search) =>
      r.title.toLowerCase().includes(search) ||
      r.department.toLowerCase().includes(search)
  );

  /**
   * Solicitudes finales luego de aplicar búsqueda y filtro de estado.
   *
   * @remarks
   * Si el estado seleccionado es `"all"`, se conservan únicamente
   * los resultados de búsqueda. En caso contrario, se aplica un filtro
   * adicional por estado.
   */
  const finalRequests =
    statusFilter === "all"
      ? filtered
      : filtered.filter((r) => r.status === statusFilter);

  return (
    <>
      <FilterBar
        search={search}
        setSearch={setSearch}
        searchPlaceholder="Buscar solicitud o departamento..."
        filters={[
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "all", label: "Todos" },
              { value: "pending", label: "Pendiente" },
              { value: "in_review", label: "En revisión" },
              { value: "completed", label: "Completada" },
              { value: "rejected", label: "Rechazada" },
            ],
          },
        ]}
      />

      <ul className="divide-y divide-slate-50 dark:divide-[#21262d]">
        {finalRequests.map((req) => {
          const status = STATUS_MAP[req.status];
          const priority = PRIORITY_MAP[req.priority];

          return (
            <li
              key={req.id}
              className="flex items-start gap-3 px-5 py-3.5 transition-colors
                         hover:bg-slate-50/60 dark:hover:bg-[#1c2128]"
            >
              <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${priority.dot}`} />

              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-medium
                             text-slate-800 dark:text-[#e6edf3]"
                >
                  {req.title}
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400 dark:text-[#545d68]">
                  {req.id} · {TYPE_LABEL[req.type]} · {req.department}
                  {req.assignedTo && (
                    <>
                      {" "}·{" "}
                      <span className="text-slate-500 dark:text-[#768390]">
                        {req.assignedTo}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${status.cls}`}>
                  {status.label}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-[#545d68]">
                  Vence {req.dueDate}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {finalRequests.length === 0 && (
        <div
          className="px-5 py-6 text-center text-xs
                     text-slate-400 dark:text-[#545d68]"
        >
          No se encontraron solicitudes
        </div>
      )}
    </>
  );
}