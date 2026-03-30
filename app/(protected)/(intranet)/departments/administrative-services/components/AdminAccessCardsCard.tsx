// app/(protected)/(intranet)/departments/administrative/components/AdminAccessCardsCard.tsx
// SERVER COMPONENT
// Fuente de datos: SharePoint List "Tarjetas de Acceso" vía MS Graph → getAdminData().accessCardRequests

import { CreditCard, ShieldAlert } from "lucide-react";
import type { AdminData } from "@/lib/graph/departments/administrative.service";
import Link from "next/link";

type Props = { data: AdminData };

const TYPE_MAP = {
  new:          { label: "Nueva",       cls: "bg-sky-50    text-sky-700    border border-sky-200"    },
  replacement:  { label: "Reposición",  cls: "bg-amber-50  text-amber-700  border border-amber-200"  },
  deactivation: { label: "Baja",        cls: "bg-red-50    text-red-700    border border-red-200"    },
} as const;

const STATUS_MAP = {
  pending:   { label: "Pendiente",   dot: "bg-orange-400" },
  in_review: { label: "En revisión", dot: "bg-sky-400"    },
  approved:  { label: "Aprobada",    dot: "bg-emerald-400"},
  rejected:  { label: "Rechazada",   dot: "bg-red-400"    },
} as const;

export default function AdminAccessCardsCard({ data }: Props) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sky-50 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 border border-sky-100">
            <CreditCard size={16} className="text-sky-600" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Tarjetas de acceso</p>
            <p className="text-[11px] text-slate-400">Solicitudes recientes</p>
          </div>
        </div>
        {data.kpis.blockedAccesses > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-red-50 border border-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-600">
            <ShieldAlert size={12} />
            {data.kpis.blockedAccesses} bloqueados
          </span>
        )}
      </div>

      {/* List */}
      <ul className="divide-y divide-slate-50">
        {data.accessCardRequests.map((req) => {
          const type   = TYPE_MAP[req.type];
          const status = STATUS_MAP[req.status];
          return (
            <li key={req.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
              <span className={`h-2 w-2 shrink-0 rounded-full ${status.dot}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{req.employee}</p>
                <p className="text-[11px] text-slate-400">{req.department} · {req.requestedAt}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${type.cls}`}>
                  {type.label}
                </span>
                <span className="text-[11px] text-slate-400">{status.label}</span>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className="flex items-center justify-between rounded-b-2xl border-t border-sky-50 bg-sky-50/40 px-5 py-3">
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-sky-700">{data.kpis.activeAccessCards}</span> solicitudes activas
        </p>
        <Link
          href="/administrative/access-cards/new"
          className="rounded-lg bg-sky-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-sky-700 transition-colors"
        >
          + Solicitar
        </Link>
      </div>
    </div>
  );
}
