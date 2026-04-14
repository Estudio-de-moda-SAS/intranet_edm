/**
 * @module LegalDocumentsPanel
 * Panel principal de documentos jurídicos.
 *
 * @remarks
 * Este componente de servidor renderiza el contenedor principal
 * del módulo de documentos legales, incluyendo:
 *
 * - Encabezado descriptivo
 * - Acceso al listado completo de documentos
 * - Carga de documentos desde el proveedor correspondiente
 * - Delegación del render interactivo al componente cliente
 *
 * También define la configuración visual de categorías documentales,
 * permitiendo representar cada tipo de documento con una semántica visual consistente.
 */

import { FolderOpen, ChevronRight as ChevronRightIcon } from "lucide-react";
import type { LegalDocument } from "@/lib/graph/departments/legal.service";
import Link from "next/link";
import LegalDocumentsClient from "./LegalDocumentsClient";
import { getLegalDocuments } from "@/lib/documents/providers/legalDocuments.provider";

/**
 * Configuración visual por categoría documental.
 *
 * @remarks
 * Este mapa traduce cada categoría del modelo {@link LegalDocument}
 * a una representación visual consistente dentro del módulo de documentos.
 *
 * Incluye:
 * - etiqueta legible
 * - nombre del ícono asociado
 * - clases de color
 * - fondo contextual
 * - borde contextual
 */
const CATEGORY_MAP: Record<
  LegalDocument["category"],
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  contract_template: {
    label: "Plantilla",
    icon: "FileSignature",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/[0.10]",
    border: "border-blue-100 dark:border-blue-500/20",
  },
  policy: {
    label: "Política",
    icon: "ScrollText",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-500/[0.10]",
    border: "border-violet-100 dark:border-violet-500/20",
  },
  power_of_attorney: {
    label: "Poder notarial",
    icon: "FileText",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/[0.10]",
    border: "border-amber-100 dark:border-amber-500/20",
  },
  regulatory: {
    label: "Normatividad",
    icon: "ShieldCheck",
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-500/[0.10]",
    border: "border-teal-100 dark:border-teal-500/20",
  },
  form: {
    label: "Formato",
    icon: "ClipboardList",
    color: "text-slate-600 dark:text-[#768390]",
    bg: "bg-slate-100 dark:bg-[#21262d]",
    border: "border-slate-200 dark:border-[#30363d]",
  },
};

/**
 * Panel de documentos jurídicos.
 *
 * @returns Tarjeta contenedora con listado de documentos legales.
 *
 * @remarks
 * Este componente:
 * - Obtiene los documentos legales desde {@link getLegalDocuments}
 * - Renderiza el encabezado del módulo
 * - Proporciona acceso a la vista completa de documentos
 * - Delega el render detallado y la interacción al componente
 *   {@link LegalDocumentsClient}
 *
 * Al ser un Server Component, centraliza la carga inicial de datos
 * y deja la interacción de cliente encapsulada en el componente hijo.
 *
 * @example
 * ```tsx
 * <LegalDocumentsPanel />
 * ```
 */
export default async function LegalDocumentsPanel() {
  /**
   * Colección de documentos jurídicos obtenidos desde el proveedor.
   *
   * @remarks
   * Esta fuente alimenta el listado mostrado en el componente cliente.
   */
  const documents = await getLegalDocuments();

  return (
    <div
      className="rounded-2xl border overflow-hidden shadow-sm
                    border-slate-200 bg-white
                    dark:border-[#30363d] dark:bg-[#161b22]"
    >
      {/* Header */}
      <div
        className="flex flex-wrap items-start justify-between gap-3 px-5 py-4
                      border-b border-slate-100 dark:border-[#21262d]"
      >
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg
                           border border-slate-200 bg-slate-100
                           dark:border-[#30363d] dark:bg-[#21262d]"
          >
            <FolderOpen size={16} className="text-slate-600 dark:text-[#768390]" />
          </span>

          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-[#e6edf3]">
              Documentos jurídicos
            </p>
            <p className="text-[11px] text-slate-400 dark:text-[#545d68]">
              Plantillas, políticas y formatos
            </p>
          </div>
        </div>

        <Link
          href="/legal/documents"
          className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors
                     border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100
                     dark:border-[#30363d] dark:bg-[#1c2128] dark:text-[#adbac7] dark:hover:bg-[#21262d]"
        >
          Ver todos <ChevronRightIcon size={14} />
        </Link>
      </div>

      <LegalDocumentsClient
        documents={documents}
        CATEGORY_MAP={CATEGORY_MAP}
      />
    </div>
  );
}