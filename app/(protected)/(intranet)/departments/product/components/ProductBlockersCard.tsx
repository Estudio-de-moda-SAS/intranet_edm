// app/product/components/ProductBlockersCard.tsx
// CLIENT COMPONENT — Equivalente a FinanceAlertsCard
"use client";

import { ShieldAlert, ExternalLink } from "lucide-react";

type Blocker = {
  id:       string;
  title:    string;
  squad:    string;
  severity: "high" | "medium" | "low";
  href:     string;
};

const BLOCKERS: Blocker[] = [
  {
    id:       "blk-1",
    title:    "Dependencia externa: SDK de pagos desactualizado",
    squad:    "Platform",
    severity: "high",
    href:     "/product/blockers/blk-1",
  },
  {
    id:       "blk-2",
    title:    "Diseño UX de onboarding pendiente de aprobación",
    squad:    "Growth",
    severity: "medium",
    href:     "/product/blockers/blk-2",
  },
  {
    id:       "blk-3",
    title:    "Capacidad de staging insuficiente para load tests",
    squad:    "Mobile",
    severity: "medium",
    href:     "/product/blockers/blk-3",
  },
  {
    id:       "blk-4",
    title:    "Revisión legal del contrato API v2 pendiente",
    squad:    "Platform",
    severity: "low",
    href:     "/product/blockers/blk-4",
  },
];

const SEV = {
  high:   { label: "Alta",   cls: "bg-rose-50  text-rose-700  border-rose-100",  dot: "bg-rose-400"   },
  medium: { label: "Media",  cls: "bg-amber-50 text-amber-700 border-amber-100", dot: "bg-amber-400"  },
  low:    { label: "Baja",   cls: "bg-slate-50 text-slate-500 border-slate-200", dot: "bg-slate-300"  },
};

export default function ProductBlockersCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50">
          <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Blockers activos</h2>
          <p className="text-[11px] text-slate-400">{BLOCKERS.length} pendientes de resolución</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {BLOCKERS.map((b) => {
          const sev = SEV[b.severity];
          return (
            <a
              key={b.id}
              href={b.href}
              className="group flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5 hover:border-rose-200 hover:bg-rose-50/30 transition-colors"
            >
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${sev.dot}`} />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-slate-700 leading-snug truncate">
                  {b.title}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{b.squad}</p>
              </div>
              <div className="shrink-0 flex items-center gap-1.5">
                <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${sev.cls}`}>
                  {sev.label}
                </span>
                <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-rose-400 transition-colors" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
