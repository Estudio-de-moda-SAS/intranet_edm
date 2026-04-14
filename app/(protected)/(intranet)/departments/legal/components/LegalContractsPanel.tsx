/**
 * @module LegalContractsPanel
 * Panel de contratos del módulo jurídico.
 *
 * @remarks
 * Este componente renderiza el contenedor principal para la visualización
 * de contratos legales, incluyendo:
 *
 * - Encabezado con indicadores resumidos
 * - Acceso al listado completo de contratos
 * - Configuración visual de estados y tipos
 * - Delegación del render interactivo al componente cliente
 * - Resumen final de contratos vigentes
 *
 * Actúa como punto de integración entre los datos del servicio legal
 * y la interfaz de usuario del módulo de contratos.
 */

import { FileSignature, ChevronRight } from "lucide-react";
import type { LegalData, LegalContract } from "@/lib/graph/departments/legal.service";
import Link from "next/link";
import LegalContractsClient from "./LegalContractsClient";

/**
 * Props del componente {@link LegalContractsPanel}.
 *
 * @property data Datos consolidados del módulo jurídico.
 */
type ContractsPanelProps = {
  data: LegalData;
};

/**
 * Configuración visual por estado de contrato.
 *
 * @remarks
 * Este mapa traduce el estado interno del modelo {@link LegalContract}
 * a una etiqueta visible y un conjunto de clases CSS para su badge.
 */
const STATUS_MAP: Record<
  LegalContract["status"],
  { label: string; cls: string }
> = {
  draft: {
    label: "Borrador",
    cls: "bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-500/[0.10] dark:text-[#768390] dark:border-slate-500/20",
  },
  in_review: {
    label: "En revisión",
    cls: "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/[0.10] dark:text-sky-400 dark:border-sky-500/20",
  },
  pending_signature: {
    label: "Firma pendiente",
    cls: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/[0.10] dark:text-amber-400 dark:border-amber-500/20",
  },
  active: {
    label: "Vigente",
    cls: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/[0.10] dark:text-emerald-400 dark:border-emerald-500/20",
  },
  expired: {
    label: "Vencido",
    cls: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/[0.10] dark:text-red-400 dark:border-red-500/20",
  },
  cancelled: {
    label: "Cancelado",
    cls: "bg-slate-100 text-slate-500 border border-slate-200 dark:bg-[#21262d] dark:text-[#545d68] dark:border-[#30363d]",
  },
};

/**
 * Etiquetas legibles por tipo de contrato.
 *
 * @remarks
 * Convierte los tipos internos del modelo en textos más claros
 * para mostrar en la interfaz.
 */
const TYPE_LABEL: Record<LegalContract["type"], string> = {
  cliente: "Cliente",
  proveedor: "Proveedor",
  laboral: "Laboral",
  confidencialidad: "Confidencialidad",
  licencia: "Licencia",
  otro: "Otro",
};

/**
 * Panel de contratos jurídicos.
 *
 * @param props Propiedades del componente.
 * @returns Tarjeta con resumen y listado de contratos legales.
 *
 * @remarks
 * Este componente:
 * - Muestra indicadores de contratos por vencer y vencidos
 * - Pasa la colección de contratos al componente {@link LegalContractsClient}
 * - Define la semántica visual de estados y tipos
 * - Presenta un resumen final del total de contratos vigentes
 *
 * La parte interactiva del listado queda encapsulada en el componente cliente,
 * mientras este panel conserva el rol de contenedor estructural.
 *
 * @example
 * ```tsx
 * <LegalContractsPanel data={data} />
 * ```
 */
export default function LegalContractsPanel({ data }: ContractsPanelProps) {
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
            <FileSignature size={16} className="text-slate-600 dark:text-[#768390]" />
          </span>

          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-[#e6edf3]">
              Contratos activos
            </p>
            <p className="text-[11px] text-slate-400 dark:text-[#545d68]">
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {data.kpis.contractsExpiringSoon}
              </span>{" "}
              por vencer ·{" "}
              <span className="font-medium text-red-600 dark:text-red-400">
                {data.kpis.contractsExpired}
              </span>{" "}
              vencidos
            </p>
          </div>
        </div>

        <Link
          href="/legal/contracts"
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors
                     text-slate-600 hover:bg-slate-100
                     dark:text-[#768390] dark:hover:bg-[#21262d] dark:hover:text-[#adbac7]"
        >
          Ver todos <ChevronRight size={14} />
        </Link>
      </div>

      <LegalContractsClient
        contracts={data.contracts}
        STATUS_MAP={STATUS_MAP}
        TYPE_LABEL={TYPE_LABEL}
      />

      {/* Footer */}
      <div
        className="rounded-b-2xl px-5 py-3
                      border-t border-slate-100 bg-slate-50/50
                      dark:border-[#21262d] dark:bg-[#1c2128]/50"
      >
        <p className="text-xs text-slate-500 dark:text-[#545d68]">
          <span className="font-semibold text-slate-700 dark:text-[#adbac7]">
            {data.kpis.contractsActive}
          </span>{" "}
          contratos vigentes en total
        </p>
      </div>
    </div>
  );
}