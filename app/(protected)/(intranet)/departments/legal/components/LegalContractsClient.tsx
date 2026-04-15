/**
 * @module LegalContractsClient
 * Cliente interactivo para visualizar y filtrar contratos jurídicos.
 *
 * @remarks
 * Este componente se encarga de la exploración interactiva del listado
 * de contratos, permitiendo:
 *
 * - búsqueda por título o contraparte
 * - filtro por tipo de contrato
 * - visualización de alertas de vencimiento
 * - renderizado de estados contractuales
 *
 * La configuración visual de estados y tipos se recibe desde el panel padre,
 * manteniendo separada la lógica de presentación de la lógica interactiva.
 */

"use client";

import { AlertTriangle, Clock } from "lucide-react";
import { useState } from "react";
import type { LegalContract } from "@/lib/graph/departments/legal.service";
import { useSearchFilter } from "@/app/hooks/useSearchFilter";
import FilterBar from "@/app/components/ui/filters/FilterBar";

/**
 * Configuración visual de un estado contractual.
 *
 * @property label Texto legible del estado.
 * @property cls Clases CSS asociadas al badge visual.
 */
type ContractStatusConfig = {
  label: string;
  cls: string;
};

/**
 * Props del componente {@link LegalContractsClient}.
 *
 * @property contracts Lista de contratos legales.
 * @property STATUS_MAP Mapa visual de estados contractuales.
 * @property TYPE_LABEL Etiquetas legibles por tipo de contrato.
 */
type ContractsClientProps = {
  contracts: LegalContract[];
  STATUS_MAP: Record<LegalContract["status"], ContractStatusConfig>;
  TYPE_LABEL: Record<LegalContract["type"], string>;
};

/**
 * Props del componente {@link ExpiryBadge}.
 *
 * @property days Días restantes hasta el vencimiento del contrato.
 */
type ExpiryBadgeProps = {
  days: number;
};

/**
 * Badge visual de vencimiento contractual.
 *
 * @param props Propiedades del componente.
 * @returns Indicador visual de vencimiento o proximidad de expiración.
 *
 * @remarks
 * Reglas aplicadas:
 * - `days < 0`: contrato vencido
 * - `days <= 15`: criticidad alta
 * - `days <= 30`: advertencia
 * - `days > 30`: no se muestra badge
 */
function ExpiryBadge({ days }: ExpiryBadgeProps) {
  if (days < 0) {
    return (
      <span
        className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold
                       bg-red-50 border-red-200 text-red-600
                       dark:bg-red-500/[0.10] dark:border-red-500/20 dark:text-red-400"
      >
        <AlertTriangle size={10} /> Vencido
      </span>
    );
  }

  if (days <= 15) {
    return (
      <span
        className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold
                       bg-red-50 border-red-200 text-red-600
                       dark:bg-red-500/[0.10] dark:border-red-500/20 dark:text-red-400"
      >
        <Clock size={10} /> {days}d
      </span>
    );
  }

  if (days <= 30) {
    return (
      <span
        className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold
                       bg-amber-50 border-amber-200 text-amber-600
                       dark:bg-amber-500/[0.10] dark:border-amber-500/20 dark:text-amber-400"
      >
        <Clock size={10} /> {days}d
      </span>
    );
  }

  return null;
}

/**
 * Cliente de contratos jurídicos con búsqueda y filtros.
 *
 * @param props Propiedades del componente.
 * @returns Listado filtrable de contratos legales.
 *
 * @remarks
 * Este componente:
 * - Mantiene el filtro activo por tipo de contrato
 * - Usa el hook {@link useSearchFilter} para búsqueda textual
 * - Filtra por coincidencia en título o contraparte
 * - Combina búsqueda y filtro por tipo
 * - Muestra alertas visuales según cercanía al vencimiento
 *
 * El estado visual de cada contrato se toma desde el mapa `STATUS_MAP`,
 * mientras que el tipo legible se resuelve con `TYPE_LABEL`.
 *
 * @example
 * ```tsx
 * <LegalContractsClient
 *   contracts={contracts}
 *   STATUS_MAP={STATUS_MAP}
 *   TYPE_LABEL={TYPE_LABEL}
 * />
 * ```
 */
export default function LegalContractsClient({
  contracts,
  STATUS_MAP,
  TYPE_LABEL,
}: ContractsClientProps) {
  /**
   * Filtro actual por tipo de contrato.
   *
   * @remarks
   * El valor `"all"` representa ausencia de filtro específico.
   */
  const [typeFilter, setTypeFilter] = useState("all");

  /**
   * Resultado del hook de búsqueda textual.
   *
   * @remarks
   * Filtra contratos por coincidencia en:
   * - título
   * - contraparte
   */
  const { search, setSearch, filtered } = useSearchFilter(
    contracts,
    (c, search) =>
      c.title.toLowerCase().includes(search) ||
      c.counterparty.toLowerCase().includes(search)
  );

  /**
   * Contratos finales tras aplicar búsqueda y filtro de tipo.
   *
   * @remarks
   * Si el filtro es `"all"`, se conservan únicamente
   * los resultados de búsqueda. En caso contrario,
   * se aplica un filtro adicional por tipo contractual.
   */
  const finalContracts =
    typeFilter === "all"
      ? filtered
      : filtered.filter((c) => c.type === typeFilter);

  return (
    <>
      <FilterBar
        search={search}
        setSearch={setSearch}
        searchPlaceholder="Buscar contrato o empresa..."
        filters={[
          {
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { value: "all", label: "Todos" },
              { value: "cliente", label: "Cliente" },
              { value: "proveedor", label: "Proveedor" },
              { value: "laboral", label: "Laboral" },
              { value: "confidencialidad", label: "Confidencialidad" },
              { value: "licencia", label: "Licencia" },
            ],
          },
        ]}
      />

      <ul className="divide-y divide-slate-50 dark:divide-[#21262d]">
        {finalContracts.map((c) => {
          const status = STATUS_MAP[c.status];

          return (
            <li
              key={c.id}
              className="flex items-start gap-3 px-5 py-3.5 transition-colors
                           hover:bg-slate-50/60 dark:hover:bg-[#1c2128]"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className="truncate text-sm font-medium
                                text-slate-800 dark:text-[#e6edf3]"
                  >
                    {c.title}
                  </p>
                  <ExpiryBadge days={c.daysUntilExpiry} />
                </div>

                <div className="mt-0.5 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-400 dark:text-[#545d68]">
                    {c.id} · {c.counterparty}
                  </span>
                  <span className="text-[10px] text-slate-300 dark:text-[#444c56]">·</span>
                  <span className="text-[11px] text-slate-400 dark:text-[#545d68]">
                    {TYPE_LABEL[c.type]}
                  </span>
                  <span className="text-[10px] text-slate-300 dark:text-[#444c56]">·</span>
                  <span className="text-[11px] text-slate-400 dark:text-[#545d68]">
                    {c.responsibleAttorney}
                  </span>
                </div>
              </div>

              <span className={`shrink-0 self-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${status.cls}`}>
                {status.label}
              </span>
            </li>
          );
        })}
      </ul>

      {finalContracts.length === 0 && (
        <div
          className="px-5 py-6 text-center text-xs
                        text-slate-400 dark:text-[#545d68]"
        >
          No se encontraron contratos
        </div>
      )}
    </>
  );
}