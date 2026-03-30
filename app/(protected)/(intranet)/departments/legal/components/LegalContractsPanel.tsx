// app/(protected)/(intranet)/departments/legal/components/LegalContractsPanel.tsx
// SERVER COMPONENT
// Fuente de datos: SharePoint List "Contratos" vía MS Graph → getLegalData().contracts

import { FileSignature, ChevronRight } from "lucide-react";
import type { LegalData, LegalContract } from "@/lib/graph/departments/legal.service";
import Link from "next/link";
import LegalContractsClient from "./LegalContractsClient";

type Props = { data: LegalData };

const STATUS_MAP: Record<
  LegalContract["status"],
  { label: string; cls: string }
> = {
  draft: { label: "Borrador", cls: "bg-slate-50 text-slate-600 border border-slate-200" },
  in_review: { label: "En revisión", cls: "bg-sky-50 text-sky-700 border border-sky-200" },
  pending_signature: { label: "Firma pendiente", cls: "bg-amber-50 text-amber-700 border border-amber-200" },
  active: { label: "Vigente", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  expired: { label: "Vencido", cls: "bg-red-50 text-red-700 border border-red-200" },
  cancelled: { label: "Cancelado", cls: "bg-slate-100 text-slate-500 border border-slate-200" },
};

const TYPE_LABEL: Record<LegalContract["type"], string> = {
  cliente: "Cliente",
  proveedor: "Proveedor",
  laboral: "Laboral",
  confidencialidad: "Confidencialidad",
  licencia: "Licencia",
  otro: "Otro",
};

export default function LegalContractsPanel({ data }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
            <FileSignature size={16} className="text-slate-600" />
          </span>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              Contratos activos
            </p>

            <p className="text-[11px] text-slate-400">
              <span className="font-medium text-amber-600">
                {data.kpis.contractsExpiringSoon}
              </span>{" "}
              por vencer ·{" "}
              <span className="font-medium text-red-600">
                {data.kpis.contractsExpired}
              </span>{" "}
              vencidos
            </p>
          </div>
        </div>

        <Link
          href="/legal/contracts"
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Ver todos <ChevronRight size={14} />
        </Link>
      </div>

      {/* CLIENT COMPONENT (Search + Filters + List) */}
      <LegalContractsClient
        contracts={data.contracts}
        STATUS_MAP={STATUS_MAP}
        TYPE_LABEL={TYPE_LABEL}
      />

      {/* Footer */}
      <div className="rounded-b-2xl border-t border-slate-100 bg-slate-50/50 px-5 py-3">
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            {data.kpis.contractsActive}
          </span>{" "}
          contratos vigentes en total
        </p>
      </div>

    </div>
  );
}