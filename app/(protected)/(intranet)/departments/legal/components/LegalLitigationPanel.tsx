import { Scale, ChevronRight, Gavel } from "lucide-react";
import type { LegalData, LegalLitigation } from "@/lib/graph/departments/legal.service";
import Link from "next/link";

type LitigationProps = { data: LegalData };

const LITIGATION_STATUS_MAP: Record<
  LegalLitigation["status"],
  { label: string; dot: string; cls: string }
> = {
  active:    { label: "Activo",       dot: "bg-amber-400 animate-pulse", cls: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/[0.10] dark:text-amber-400 dark:border-amber-500/20"     },
  suspended: { label: "Suspendido",   dot: "bg-slate-400",               cls: "bg-slate-50 text-slate-600 border border-slate-200 dark:bg-[#21262d] dark:text-[#768390] dark:border-[#30363d]"              },
  resolved:  { label: "Resuelto",     dot: "bg-emerald-400",             cls: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/[0.10] dark:text-emerald-400 dark:border-emerald-500/20" },
  appeal:    { label: "En apelación", dot: "bg-orange-400",              cls: "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/[0.10] dark:text-orange-400 dark:border-orange-500/20" },
};

const LITIGATION_TYPE_LABEL: Record<LegalLitigation["type"], string> = {
  civil:          "Civil",
  laboral:        "Laboral",
  mercantil:      "Mercantil",
  administrativo: "Administrativo",
};

export default function LegalLitigationPanel({ data }: LitigationProps) {
  return (
    <div className="rounded-2xl border shadow-sm
                    border-slate-200 bg-white
                    dark:border-[#30363d] dark:bg-[#161b22]">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4
                      border-b border-slate-100 dark:border-[#21262d]">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg
                           border border-slate-200 bg-slate-100
                           dark:border-[#30363d] dark:bg-[#21262d]">
            <Scale size={16} className="text-slate-600 dark:text-[#768390]" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-[#e6edf3]">
              Litigios en curso
            </p>
            <p className="text-[11px] text-slate-400 dark:text-[#545d68]">
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {data.kpis.litigationsActive}
              </span>{" "}
              casos activos
            </p>
          </div>
        </div>
        <Link
          href="/legal/litigations"
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors
                     text-slate-600 hover:bg-slate-100
                     dark:text-[#768390] dark:hover:bg-[#21262d] dark:hover:text-[#adbac7]"
        >
          Ver todos <ChevronRight size={14} />
        </Link>
      </div>

      {/* List */}
      <ul className="divide-y divide-slate-50 dark:divide-[#21262d]">
        {data.litigations.map((lit) => {
          const status = LITIGATION_STATUS_MAP[lit.status];
          return (
            <li key={lit.id}
                className="px-5 py-4 transition-colors
                           hover:bg-slate-50/60 dark:hover:bg-[#1c2128]">
              <div className="flex items-start gap-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${status.dot}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-snug
                                  text-slate-800 dark:text-[#e6edf3]">
                      {lit.title}
                    </p>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${status.cls}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 dark:text-[#545d68]">
                    {lit.caseNumber} · {LITIGATION_TYPE_LABEL[lit.type]} · {lit.court}
                  </p>
                  <div className="mt-1.5 flex items-center gap-3 flex-wrap">
                    {lit.nextHearing && (
                      <span className="flex items-center gap-1 text-[11px] font-medium
                                       text-slate-600 dark:text-[#adbac7]">
                        <Gavel size={11} className="text-slate-400 dark:text-[#545d68]" />
                        Próxima audiencia: {lit.nextHearing}
                      </span>
                    )}
                    {lit.externalCounsel && (
                      <span className="text-[11px] text-slate-400 dark:text-[#545d68]">
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

