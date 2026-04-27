/**
 * @module AdminDocumentsCenterCard
 * Tarjeta principal del centro de documentos del módulo de Servicios
 * Administrativos.
 *
 * Presenta una vista resumida de los documentos recientes del área, incluyendo:
 * - acceso al listado completo,
 * - agrupación visual por categoría,
 * - contador por tipo de documento,
 * - listado interactivo y visor PDF delegado al componente cliente.
 *
 * @remarks
 * Este componente consume documentos provenientes de la biblioteca documental
 * administrativa sincronizada vía Microsoft Graph.
 *
 * La información se obtiene desde {@link getAdminData} y utiliza:
 * - `data.recentDocuments` para el listado reciente,
 * - `data.kpis.documentsPublished` para el indicador mensual.
 *
 * El render interactivo del listado y la apertura del visor PDF se delegan a
 * {@link AdminDocumentsCenterClient}, manteniendo este componente enfocado en
 * estructura, agrupación y navegación.
 */

// AdminDocumentsCenterCard.tsx
// SERVER COMPONENT
// Fuente de datos: SharePoint Document Library vía MS Graph → getAdminData().recentDocuments

import { FolderOpen, ChevronRight, FileText, FileSpreadsheet, FileCode2, BookOpen } from "lucide-react";
import type { AdminDocumentCategory } from "@/lib/graph/departments/administrative.service";
import Link from "next/link";
import AdminDocumentsCenterClient from "./AdminDocumentsCenterClient";

/**
 * Propiedades de {@link AdminDocumentsCenterCard}.
 *
 * @property data Datos consolidados del módulo administrativo.
 */
type Props = { data: import("@/lib/graph/departments/administrative.service").AdminData };

/**
 * Mapa de presentación para las categorías documentales administrativas.
 *
 * @remarks
 * Traduce cada {@link AdminDocumentCategory} a una representación visual
 * consistente, incluyendo:
 * - etiqueta legible,
 * - ícono,
 * - color,
 * - fondo,
 * - borde.
 *
 * Se utiliza para construir las píldoras de filtro por categoría dentro
 * del centro de documentos.
 */
const CATEGORY_MAP: Record<
  AdminDocumentCategory,
  { label: string; Icon: React.ElementType; color: string; bg: string; border: string }
> = {
  policy:    { label: "Política",      Icon: BookOpen,        color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
  form:      { label: "Formulario",    Icon: FileSpreadsheet, color: "text-emerald-600",bg: "bg-emerald-50",border: "border-emerald-100" },
  procedure: { label: "Procedimiento", Icon: FileCode2,       color: "text-sky-600",    bg: "bg-sky-50",    border: "border-sky-100"    },
  template:  { label: "Plantilla",     Icon: FileText,        color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-100"  },
};

/**
 * Renderiza la tarjeta principal del centro de documentos administrativos.
 *
 * @param props Propiedades del componente.
 * @param props.data Datos administrativos requeridos para construir la tarjeta.
 * @returns Tarjeta con acceso al centro documental, filtros por categoría,
 * listado reciente y métricas resumidas.
 *
 * @remarks
 * El componente se estructura en cuatro bloques:
 *
 * 1. **Header**
 *    - título del bloque,
 *    - descripción funcional,
 *    - acceso rápido al listado completo.
 *
 * 2. **Category pills**
 *    - muestra categorías documentales disponibles,
 *    - calcula la cantidad de documentos por categoría,
 *    - permite navegación filtrada.
 *
 * 3. **Listado interactivo**
 *    - delega el render y visor PDF a {@link AdminDocumentsCenterClient}.
 *
 * 4. **Footer**
 *    - resume la cantidad de documentos publicados en el período actual.
 */
export default function AdminDocumentsCenterCard({ data }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
            <FolderOpen size={16} className="text-slate-600" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Centro de documentos</p>
            <p className="text-[11px] text-slate-400">Políticas, formatos, procedimientos y plantillas</p>
          </div>
        </div>
        <Link
          href="/administrative/documents"
          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Ver todos <ChevronRight size={14} />
        </Link>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 border-b border-slate-50 px-5 py-3">
        {(Object.entries(CATEGORY_MAP) as [AdminDocumentCategory, typeof CATEGORY_MAP[AdminDocumentCategory]][]).map(([key, cat]) => {
          const Icon  = cat.Icon;

          /**
           * Cantidad de documentos recientes pertenecientes a la categoría actual.
           */
          const count = data.recentDocuments.filter((d) => d.category === key).length;

          return (
            <Link
              key={key}
              href={`/administrative/documents?category=${key}`}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors hover:opacity-80 ${cat.bg} ${cat.border} ${cat.color}`}
            >
              <Icon size={11} />
              {cat.label}
              <span className="ml-0.5 opacity-60">({count})</span>
            </Link>
          );
        })}
      </div>

      {/* CLIENT — lista + visor PDF */}
      <AdminDocumentsCenterClient documents={data.recentDocuments} />

      {/* Footer */}
      <div className="rounded-b-2xl border-t border-slate-100 bg-slate-50/50 px-5 py-3">
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{data.kpis.documentsPublished ?? data.recentDocuments.length}</span>{" "}
          documentos publicados este mes
        </p>
      </div>

    </div>
  );
}