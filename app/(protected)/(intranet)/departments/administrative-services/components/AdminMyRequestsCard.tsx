/**
 * @module AdminMyRequestsCard
 * Tarjeta de visualización de solicitudes del usuario dentro del módulo administrativo.
 *
 * Muestra un listado resumido de las solicitudes creadas por el usuario actual,
 * incluyendo estado, prioridad y fecha de vencimiento.
 *
 * @remarks
 * Este componente consume datos provenientes de MS Graph (SharePoint List)
 * a través de `getAdminData().myRequests`.
 *
 * Se utiliza principalmente en el dashboard administrativo como vista rápida
 * del estado de trámites activos.
 */

// app/(protected)/(intranet)/departments/administrative/components/AdminMyRequestsCard.tsx
// SERVER COMPONENT
// Fuente de datos: SharePoint List vía MS Graph → getAdminData().myRequests

import { ClipboardList, ChevronRight } from "lucide-react";
import type { AdminData } from "@/lib/graph/departments/administrative.service";
import Link from "next/link";

/**
 * Props del componente {@link AdminMyRequestsCard}.
 *
 * @property data Objeto agregado con información administrativa del usuario,
 * incluyendo solicitudes (`myRequests`) y métricas (`kpis`).
 */
type Props = { data: AdminData };

/**
 * Mapa de estados de solicitudes a etiquetas y estilos visuales.
 *
 * @remarks
 * Permite desacoplar la lógica de backend (`status`) de la representación visual.
 */
const STATUS_MAP = {
  pending:   { label: "Pendiente",    cls: "bg-orange-50 text-orange-700 border border-orange-200" },
  in_review: { label: "En revisión",  cls: "bg-sky-50    text-sky-700    border border-sky-200"    },
  approved:  { label: "Aprobada",     cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  rejected:  { label: "Rechazada",    cls: "bg-red-50    text-red-700    border border-red-200"    },
} as const;

/**
 * Mapa de prioridades a indicadores visuales (dot).
 *
 * @remarks
 * Se utiliza un punto de color para representar rápidamente la urgencia:
 * - gris: baja
 * - amarillo: media
 * - rojo: alta
 */
const PRIORITY_DOT = {
  low:    "bg-slate-300",
  medium: "bg-amber-400",
  high:   "bg-red-500",
} as const;

/**
 * Renderiza la tarjeta "Mis solicitudes".
 *
 * @param props Propiedades del componente.
 * @param props.data Datos administrativos del usuario.
 *
 * @returns Tarjeta con listado de solicitudes activas y acceso a navegación completa.
 *
 * @remarks
 * Este componente:
 * - recorre `data.myRequests`,
 * - mapea estados usando {@link STATUS_MAP},
 * - representa prioridad mediante {@link PRIORITY_DOT},
 * - y muestra métricas agregadas desde `data.kpis`.
 */
export default function AdminMyRequestsCard({ data }: Props) {
  return (
    <div className="rounded-2xl border border-amber-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-50 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 border border-amber-100">
            <ClipboardList size={16} className="text-amber-600" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Mis solicitudes</p>
            <p className="text-[11px] text-slate-400">Estado de tus trámites activos</p>
          </div>
        </div>

        {/* Navegación a listado completo */}
        <Link
          href="/administrative/requests"
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 transition-colors"
        >
          Ver todas <ChevronRight size={14} />
        </Link>
      </div>

      {/* Listado de solicitudes */}
      <ul className="divide-y divide-slate-50">
        {data.myRequests.map((req) => {
          const status = STATUS_MAP[req.status];

          return (
            <li
              key={req.id}
              className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
            >
              {/* Indicador de prioridad */}
              <span
                className={`mt-2 h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[req.priority]}`}
              />

              {/* Información principal */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">
                  {req.title}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {req.id} · {req.category} · Vence {req.dueDate}
                </p>
              </div>

              {/* Estado */}
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${status.cls}`}
              >
                {status.label}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Footer con KPI */}
      <div className="flex items-center justify-between rounded-b-2xl border-t border-amber-50 bg-amber-50/40 px-5 py-3">
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-amber-700">
            {data.kpis.pendingApprovals}
          </span>{" "}
          pendientes de aprobación este mes
        </p>

        {/* Acción rápida */}
        <Link
          href="/administrative/requests/new"
          className="rounded-lg bg-amber-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-amber-700 transition-colors"
        >
          + Nueva
        </Link>
      </div>
    </div>
  );
}