// app/product/components/ProductSamplesCard.tsx
"use client";

import { Scissors, CheckCircle2, XCircle, Clock } from "lucide-react";
import Link from "next/link";

type Sample = {
  id:         string;
  refCode:    string;
  refName:    string;
  supplier:   string;
  sentDate:   string;
  dueDate:    string;
  status:     "pending" | "approved" | "rejected" | "revision";
  round:      number;
};

const SAMPLES: Sample[] = [
  { id: "s1",  refCode: "VE-2508", refName: "Vestido lencero midi",        supplier: "Textiles Andino S.A.",  sentDate: "10 jun", dueDate: "20 jun", status: "pending",  round: 1 },
  { id: "s2",  refCode: "FA-2503", refName: "Falda plisada organza",       supplier: "Sedas del Valle",       sentDate: "08 jun", dueDate: "18 jun", status: "revision", round: 2 },
  { id: "s3",  refCode: "TR-2540", refName: "Traje de baño cut-out",       supplier: "Swimwear CO.",          sentDate: "05 jun", dueDate: "15 jun", status: "pending",  round: 1 },
  { id: "s4",  refCode: "CU-2542", refName: "Cubre-bikini kimono",         supplier: "Sedas del Valle",       sentDate: "04 jun", dueDate: "14 jun", status: "rejected", round: 1 },
  { id: "s5",  refCode: "BL-2501", refName: "Blusa lino perforada",        supplier: "Textiles Andino S.A.",  sentDate: "01 jun", dueDate: "11 jun", status: "approved", round: 2 },
  { id: "s6",  refCode: "PA-2517", refName: "Pantalón palazzo crêpe",      supplier: "Confecciones Bogotá",   sentDate: "01 jun", dueDate: "11 jun", status: "approved", round: 1 },
];

const STATUS_META = {
  pending:  { label: "Pendiente",   icon: <Clock       className="h-3.5 w-3.5 text-amber-500" />,  badge: "bg-amber-50   text-amber-700  border-amber-200"   },
  approved: { label: "Aprobada",    icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500"/>, badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rechazada",   icon: <XCircle     className="h-3.5 w-3.5 text-rose-500"   />,  badge: "bg-rose-50    text-rose-700   border-rose-200"    },
  revision: { label: "En revisión", icon: <Clock       className="h-3.5 w-3.5 text-sky-500"    />,  badge: "bg-sky-50     text-sky-700    border-sky-200"     },
};

const summaryCount = (status: Sample["status"]) =>
  SAMPLES.filter((s) => s.status === status).length;

type Props = { canApprove: boolean };

export default function ProductSamplesCard({ canApprove }: Props) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100">
            <Scissors className="h-3.5 w-3.5 text-stone-600" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Estado de muestras</h2>
            <p className="text-[11px] text-slate-400">Ciclo SS-25 · {SAMPLES.length} muestras activas</p>
          </div>
        </div>
        <Link href="/product/samples" className="text-[11px] font-medium text-amber-600 hover:text-amber-700">
          Ver todas →
        </Link>
      </div>

      {/* Summary pills */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(["pending", "revision", "approved", "rejected"] as const).map((s) => (
          <span
            key={s}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_META[s].badge}`}
          >
            {STATUS_META[s].icon}
            {summaryCount(s)} {STATUS_META[s].label}
          </span>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-stone-100">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50">
              {["Referencia", "Proveedor", "Enviada", "Vence", "Ronda", "Estado", ...(canApprove ? ["Acción"] : [])].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-stone-400 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {SAMPLES.map((s) => {
              const meta = STATUS_META[s.status];
              const isOverdue = s.status === "pending" || s.status === "revision";
              return (
                <tr key={s.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="px-3 py-2.5">
                    <p className="font-semibold text-stone-700 font-mono">{s.refCode}</p>
                    <p className="text-[10px] text-stone-400 truncate max-w-[120px]">{s.refName}</p>
                  </td>
                  <td className="px-3 py-2.5 text-stone-600 whitespace-nowrap">{s.supplier}</td>
                  <td className="px-3 py-2.5 text-stone-500 whitespace-nowrap">{s.sentDate}</td>
                  <td className={`px-3 py-2.5 whitespace-nowrap font-medium ${isOverdue ? "text-rose-600" : "text-stone-500"}`}>
                    {s.dueDate}
                  </td>
                  <td className="px-3 py-2.5 text-center text-stone-500">
                    <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold">
                      R{s.round}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.badge}`}>
                      {meta.icon}
                      {meta.label}
                    </span>
                  </td>
                  {canApprove && (
                    <td className="px-3 py-2.5">
                      {(s.status === "pending" || s.status === "revision") && (
                        <div className="flex gap-1.5">
                          <button className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors">
                            Aprobar
                          </button>
                          <button className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-700 hover:bg-rose-100 transition-colors">
                            Rechazar
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
