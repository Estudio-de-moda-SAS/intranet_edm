// app/(protected)/(intranet)/departments/legal/components/LegalRequestsPanel.tsx
// SERVER COMPONENT
// Fuente de datos: SharePoint List "Solicitudes Jurídicas"

import { ClipboardList, ChevronRight } from "lucide-react";
import type { LegalData, LegalRequest } from "@/lib/graph/departments/legal.service";
import Link from "next/link";
import LegalRequestsClient from "./LegalRequestClient";

type Props = { data: LegalData };

const STATUS_MAP: Record<LegalRequest["status"], { label: string; cls: string }> = {
  pending:   { label: "Pendiente",   cls: "bg-orange-50 text-orange-700 border border-orange-200" },
  in_review: { label: "En revisión", cls: "bg-sky-50 text-sky-700 border border-sky-200" },
  completed: { label: "Completada",  cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  rejected:  { label: "Rechazada",   cls: "bg-red-50 text-red-700 border border-red-200" },
};

const PRIORITY_MAP: Record<LegalRequest["priority"], { dot: string; label: string }> = {
  low:    { dot: "bg-slate-300", label: "Baja" },
  medium: { dot: "bg-amber-400", label: "Media" },
  high:   { dot: "bg-orange-500", label: "Alta" },
  urgent: { dot: "bg-red-500 animate-pulse", label: "Urgente" },
};

const TYPE_LABEL: Record<LegalRequest["type"], string> = {
  revision_contrato: "Revisión de contrato",
  consulta_legal:    "Consulta legal",
  poder_notarial:    "Poder notarial",
  compliance:        "Compliance",
  otro:              "Otro",
};

export default function LegalRequestsPanel({ data }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
            <ClipboardList size={16} className="text-slate-600" />
          </span>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              Solicitudes jurídicas
            </p>

            <p className="text-[11px] text-slate-400">
              <span className="font-medium text-orange-600">
                {data.kpis.requestsPending}
              </span>{" "}
              pendientes de atención
            </p>
          </div>
        </div>

        <Link
          href="/legal/requests"
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Ver todas <ChevronRight size={14} />
        </Link>
      </div>

      {/* CLIENT COMPONENT */}
      <LegalRequestsClient
        requests={data.myRequests}
        STATUS_MAP={STATUS_MAP}
        PRIORITY_MAP={PRIORITY_MAP}
        TYPE_LABEL={TYPE_LABEL}
      />

      {/* Footer */}
      <div className="flex items-center justify-between rounded-b-2xl border-t border-slate-100 bg-slate-50/50 px-5 py-3">
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            {data.kpis.requestsThisMonth}
          </span>{" "}
          solicitudes recibidas este mes
        </p>

        <Link
          href="/legal/requests/new"
          className="rounded-lg bg-slate-700 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          + Nueva solicitud
        </Link>
      </div>

    </div>
  );
}