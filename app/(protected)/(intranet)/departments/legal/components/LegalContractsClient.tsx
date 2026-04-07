"use client";

import { AlertTriangle, Clock } from "lucide-react";
import { useState } from "react";
import type { LegalContract } from "@/lib/graph/departments/legal.service";
import { useSearchFilter } from "@/app/hooks/useSearchFilter";
import FilterBar from "@/app/components/ui/filters/FilterBar";

type ContractsClientProps = {
  contracts:  LegalContract[];
  STATUS_MAP: any;
  TYPE_LABEL: any;
};

function ExpiryBadge({ days }: { days: number }) {
  if (days < 0)
    return (
      <span className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold
                       bg-red-50 border-red-200 text-red-600
                       dark:bg-red-500/[0.10] dark:border-red-500/20 dark:text-red-400">
        <AlertTriangle size={10} /> Vencido
      </span>
    );

  if (days <= 15)
    return (
      <span className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold
                       bg-red-50 border-red-200 text-red-600
                       dark:bg-red-500/[0.10] dark:border-red-500/20 dark:text-red-400">
        <Clock size={10} /> {days}d
      </span>
    );

  if (days <= 30)
    return (
      <span className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold
                       bg-amber-50 border-amber-200 text-amber-600
                       dark:bg-amber-500/[0.10] dark:border-amber-500/20 dark:text-amber-400">
        <Clock size={10} /> {days}d
      </span>
    );

  return null;
}

export default function LegalContractsClient({ contracts, STATUS_MAP, TYPE_LABEL }: ContractsClientProps) {
  const [typeFilter, setTypeFilter] = useState("all");

  const { search, setSearch, filtered } = useSearchFilter(
    contracts,
    (c, search) =>
      c.title.toLowerCase().includes(search) ||
      c.counterparty.toLowerCase().includes(search)
  );

  const finalContracts = typeFilter === "all"
    ? filtered
    : filtered.filter((c) => c.type === typeFilter);

  return (
    <>
      <FilterBar
        search={search}
        setSearch={setSearch}
        searchPlaceholder="Buscar contrato o empresa..."
        filters={[{
          value: typeFilter,
          onChange: setTypeFilter,
          options: [
            { value: "all",              label: "Todos"            },
            { value: "cliente",          label: "Cliente"          },
            { value: "proveedor",        label: "Proveedor"        },
            { value: "laboral",          label: "Laboral"          },
            { value: "confidencialidad", label: "Confidencialidad" },
            { value: "licencia",         label: "Licencia"         },
          ],
        }]}
      />

      <ul className="divide-y divide-slate-50 dark:divide-[#21262d]">
        {finalContracts.map((c) => {
          const status = STATUS_MAP[c.status];
          return (
            <li key={c.id}
                className="flex items-start gap-3 px-5 py-3.5 transition-colors
                           hover:bg-slate-50/60 dark:hover:bg-[#1c2128]">
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-medium
                                text-slate-800 dark:text-[#e6edf3]">
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
        <div className="px-5 py-6 text-center text-xs
                        text-slate-400 dark:text-[#545d68]">
          No se encontraron contratos
        </div>
      )}
    </>
  );
}

