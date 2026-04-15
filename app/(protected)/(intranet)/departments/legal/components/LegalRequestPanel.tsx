/**
 * @module LegalRequestsPanel
 * Panel de solicitudes jurídicas con resumen, estado y acceso rápido.
 *
 * @remarks
 * Este componente renderiza un panel principal para visualizar solicitudes
 * jurídicas del usuario, incluyendo:
 *
 * - Encabezado con contador de pendientes
 * - Listado de solicitudes delegadas a un componente cliente
 * - Mapas de presentación para estado, prioridad y tipo
 * - Acciones de navegación hacia listado completo y creación de nueva solicitud
 *
 * El componente actúa como contenedor visual y punto de integración
 * entre los datos del servicio legal y la interfaz del usuario.
 */

import { ClipboardList, ChevronRight as ChevronRightIcon2 } from "lucide-react";
import type { LegalData, LegalRequest } from "@/lib/graph/departments/legal.service";
import Link from "next/link";
import LegalRequestsClient from "./LegalRequestClient";

/**
 * Props del componente {@link LegalRequestsPanel}.
 *
 * @property data Datos consolidados del módulo legal.
 */
type RequestsPanelProps = {
  data: LegalData;
};

/**
 * Mapa visual de estados de solicitudes jurídicas.
 *
 * @remarks
 * Traduce cada estado interno del modelo {@link LegalRequest}
 * a una etiqueta visible y a un conjunto de clases CSS para su representación.
 */
const REQUEST_STATUS_MAP: Record<
  LegalRequest["status"],
  { label: string; cls: string }
> = {
  pending: {
    label: "Pendiente",
    cls: "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/[0.10] dark:text-orange-400 dark:border-orange-500/20",
  },
  in_review: {
    label: "En revisión",
    cls: "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/[0.10] dark:text-sky-400 dark:border-sky-500/20",
  },
  completed: {
    label: "Completada",
    cls: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/[0.10] dark:text-emerald-400 dark:border-emerald-500/20",
  },
  rejected: {
    label: "Rechazada",
    cls: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/[0.10] dark:text-red-400 dark:border-red-500/20",
  },
};

/**
 * Mapa visual de prioridades de solicitudes.
 *
 * @remarks
 * Se utiliza para representar la prioridad con un punto de color
 * y una etiqueta legible para el usuario.
 */
const REQUEST_PRIORITY_MAP: Record<
  LegalRequest["priority"],
  { dot: string; label: string }
> = {
  low: {
    dot: "bg-slate-300 dark:bg-[#444c56]",
    label: "Baja",
  },
  medium: {
    dot: "bg-amber-400",
    label: "Media",
  },
  high: {
    dot: "bg-orange-500",
    label: "Alta",
  },
  urgent: {
    dot: "bg-red-500 animate-pulse",
    label: "Urgente",
  },
};

/**
 * Etiquetas legibles por tipo de solicitud jurídica.
 *
 * @remarks
 * Convierte los tipos internos del modelo en textos más amigables
 * para la interfaz de usuario.
 */
const REQUEST_TYPE_LABEL: Record<LegalRequest["type"], string> = {
  revision_contrato: "Revisión de contrato",
  consulta_legal: "Consulta legal",
  poder_notarial: "Poder notarial",
  compliance: "Compliance",
  otro: "Otro",
};

/**
 * Panel de solicitudes jurídicas del usuario.
 *
 * @param props Propiedades del componente.
 * @returns Panel con resumen de solicitudes y acciones de navegación.
 *
 * @remarks
 * Este componente:
 * - Muestra el total de solicitudes pendientes
 * - Delega el render del listado al componente {@link LegalRequestsClient}
 * - Proporciona mapas de configuración para estado, prioridad y tipo
 * - Presenta navegación hacia el listado completo y al formulario de nueva solicitud
 *
 * La parte interactiva y de render detallado del listado queda encapsulada
 * en el componente cliente hijo, mientras este panel conserva el rol de
 * contenedor estructural y presentacional.
 *
 * @example
 * ```tsx
 * <LegalRequestsPanel data={data} />
 * ```
 */
export default function LegalRequestsPanel({ data }: RequestsPanelProps) {
  return (
    <div
      className="rounded-2xl border shadow-sm
                    border-slate-200 bg-white
                    dark:border-[#30363d] dark:bg-[#161b22]"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4
                      border-b border-slate-100 dark:border-[#21262d]"
      >
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg
                           border border-slate-200 bg-slate-100
                           dark:border-[#30363d] dark:bg-[#21262d]"
          >
            <ClipboardList size={16} className="text-slate-600 dark:text-[#768390]" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-[#e6edf3]">
              Solicitudes jurídicas
            </p>
            <p className="text-[11px] text-slate-400 dark:text-[#545d68]">
              <span className="font-medium text-orange-600 dark:text-orange-400">
                {data.kpis.requestsPending}
              </span>{" "}
              pendientes de atención
            </p>
          </div>
        </div>

        <Link
          href="/legal/requests"
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors
                     text-slate-600 hover:bg-slate-100
                     dark:text-[#768390] dark:hover:bg-[#21262d] dark:hover:text-[#adbac7]"
        >
          Ver todas <ChevronRightIcon2 size={14} />
        </Link>
      </div>

      <LegalRequestsClient
        requests={data.myRequests}
        STATUS_MAP={REQUEST_STATUS_MAP}
        PRIORITY_MAP={REQUEST_PRIORITY_MAP}
        TYPE_LABEL={REQUEST_TYPE_LABEL}
      />

      {/* Footer */}
      <div
        className="flex items-center justify-between rounded-b-2xl px-5 py-3
                      border-t border-slate-100 bg-slate-50/50
                      dark:border-[#21262d] dark:bg-[#1c2128]/50"
      >
        <p className="text-xs text-slate-500 dark:text-[#545d68]">
          <span className="font-semibold text-slate-700 dark:text-[#adbac7]">
            {data.kpis.requestsThisMonth}
          </span>{" "}
          solicitudes recibidas este mes
        </p>

        <Link
          href="/legal/requests/new"
          className="rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors
                     bg-slate-700 text-white hover:bg-slate-800
                     dark:bg-[#30363d] dark:text-[#e6edf3] dark:hover:bg-[#444c56]"
        >
          + Nueva solicitud
        </Link>
      </div>
    </div>
  );
}