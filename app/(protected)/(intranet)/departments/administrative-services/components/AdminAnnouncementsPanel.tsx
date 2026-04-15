/**
 * @module AdminAnnouncementsPanel
 * Panel de avisos del módulo de Servicios Administrativos.
 *
 * Muestra comunicados relevantes del área, priorizando aquellos marcados
 * como fijados para que aparezcan primero en la interfaz.
 *
 * @remarks
 * Este componente consume la colección `announcements` desde {@link AdminData}
 * y aplica una ordenación visual simple para destacar los avisos con mayor
 * importancia operativa.
 *
 * Se renderiza como Server Component y forma parte del sidebar informativo
 * del módulo administrativo.
 */

// app/(protected)/(intranet)/departments/administrative/components/AdminAnnouncementsPanel.tsx
// SERVER COMPONENT

import { Megaphone, Pin } from "lucide-react";
import type { AdminData } from "@/lib/graph/departments/administrative.service";

/**
 * Propiedades de {@link AdminAnnouncementsPanel}.
 *
 * @property data Datos consolidados del módulo administrativo.
 */
type Props = { data: AdminData };

/**
 * Renderiza el panel de avisos del área administrativa.
 *
 * @param props Propiedades del componente.
 * @param props.data Datos administrativos requeridos para construir el panel.
 * @returns Tarjeta con el listado de avisos y comunicados del área.
 *
 * @remarks
 * El componente:
 * - obtiene los avisos desde `data.announcements`,
 * - ordena primero los avisos fijados,
 * - presenta título, cuerpo y fecha de publicación,
 * - resalta visualmente los elementos marcados como importantes.
 */
export default function AdminAnnouncementsPanel({ data }: Props) {
  /**
   * Lista de avisos ordenada, priorizando los elementos fijados.
   *
   * @remarks
   * La ordenación coloca primero los avisos con `pinned = true`, manteniendo
   * después el resto en su orden relativo.
   */
  const sorted = [...data.announcements].sort((a, b) =>
    a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1,
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 border border-amber-100">
          <Megaphone size={16} className="text-amber-600" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">Avisos del área</p>
          <p className="text-[11px] text-slate-400">Comunicados importantes</p>
        </div>
      </div>

      {/* Announcements */}
      <ul className="divide-y divide-slate-50">
        {sorted.map((ann) => (
          <li key={ann.id} className="px-5 py-4">
            <div className="flex items-start gap-2">
              {ann.pinned && (
                <Pin size={13} className="mt-0.5 shrink-0 text-amber-500" />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">
                    {ann.title}
                  </p>
                  {ann.pinned && (
                    <span className="rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                      Fijado
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                  {ann.body}
                </p>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  {ann.publishedAt}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}