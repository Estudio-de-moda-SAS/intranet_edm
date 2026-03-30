// app/(protected)/(intranet)/departments/legal/components/LegalLitigationPanel.tsx
// SERVER COMPONENT
// Fuente de datos: SharePoint List "Litigios" vía MS Graph → getLegalData().litigations

import { Scale, ChevronRight, Gavel } from "lucide-react";
import type { LegalData, LegalLitigation } from "@/lib/graph/departments/legal.service";
import Link from "next/link";

type Props = { data: LegalData };

const STATUS_MAP: Record<LegalLitigation["status"], { label: string; dot: string; cls: string }> = {
  active:    { label: "Activo",      dot: "bg-amber-400 animate-pulse", cls: "bg-amber-50  text-amber-700  border border-amber-200"  },
  suspended: { label: "Suspendido",  dot: "bg-slate-400",               cls: "bg-slate-50  text-slate-600  border border-slate-200"  },
  resolved:  { label: "Resuelto",    dot: "bg-emerald-400",             cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  appeal:    { label: "En apelación",dot: "bg-orange-400",              cls: "bg-orange-50 text-orange-700 border border-orange-200" },
};

const TYPE_LABEL: Record<LegalLitigation["type"], string> = {
  civil:          "Civil",
  laboral:        "Laboral",
  mercantil:      "Mercantil",
  administrativo: "Administrativo",
};

export default function LegalLitigationPanel({ data }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
            <Scale size={16} className="text-slate-600" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Litigios en curso</p>
            <p className="text-[11px] text-slate-400">
              <span className="font-medium text-amber-600">{data.kpis.litigationsActive}</span> casos activos
            </p>
          </div>
        </div>
        <Link
          href="/legal/litigations"
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Ver todos <ChevronRight size={14} />
        </Link>
      </div>

      {/* List */}
      <ul className="divide-y divide-slate-50">
        {data.litigations.map((lit) => {
          const status = STATUS_MAP[lit.status];
          return (
            <li
              key={lit.id}
              className="px-5 py-4 hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${status.dot}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-800 leading-snug">
                      {lit.title}
                    </p>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${status.cls}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {lit.caseNumber} · {TYPE_LABEL[lit.type]} · {lit.court}
                  </p>
                  <div className="mt-1.5 flex items-center gap-3 flex-wrap">
                    {lit.nextHearing && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
                        <Gavel size={11} className="text-slate-400" />
                        Próxima audiencia: {lit.nextHearing}
                      </span>
                    )}
                    {lit.externalCounsel && (
                      <span className="text-[11px] text-slate-400">
                        Ext: {lit.externalCounsel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
