// app/(protected)/(intranet)/departments/administrative/components/AdminVisitorLogCard.tsx
// SERVER COMPONENT
// Fuente de datos: SharePoint List "Visitantes" vía MS Graph → getAdminData().visitorLog

import { UserCheck, ChevronRight } from "lucide-react";
import type { AdminData } from "@/lib/graph/departments/administrative.service";
import Link from "next/link";

type Props = { data: AdminData };

export default function AdminVisitorLogCard({ data }: Props) {
  const inside   = data.visitorLog.filter((v) => v.status === "inside").length;
  const departed = data.visitorLog.filter((v) => v.status === "departed").length;

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-50 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100">
            <UserCheck size={16} className="text-emerald-600" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Visitantes de hoy</p>
            <p className="text-[11px] text-slate-400">
              <span className="font-medium text-emerald-600">{inside} dentro</span>
              {" · "}
              {departed} salidos
            </p>
          </div>
        </div>
        <Link
          href="/administrative/visitors"
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
        >
          Ver todos <ChevronRight size={14} />
        </Link>
      </div>

      {/* Log */}
      <ul className="divide-y divide-slate-50">
        {data.visitorLog.map((v) => (
          <li key={v.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors">
            {/* Status dot */}
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                v.status === "inside" ? "bg-emerald-400 animate-pulse" : "bg-slate-300"
              }`}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{v.visitorName}</p>
              <p className="text-[11px] text-slate-400 truncate">
                {v.company ? `${v.company} · ` : ""}Visita a {v.host}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[11px] font-medium text-slate-600">
                {v.checkIn}{v.checkOut ? ` – ${v.checkOut}` : ""}
              </p>
              <p className={`text-[10px] font-medium ${v.status === "inside" ? "text-emerald-600" : "text-slate-400"}`}>
                {v.status === "inside" ? "En instalaciones" : "Salió"}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* Footer CTA */}
      <div className="flex items-center justify-between rounded-b-2xl border-t border-emerald-50 bg-emerald-50/40 px-5 py-3">
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-emerald-700">{data.kpis.visitorsToday}</span> visitantes registrados hoy
        </p>
        <Link
          href="/administrative/visitors/new"
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700 transition-colors"
        >
          + Pre-registrar
        </Link>
      </div>
    </div>
  );
}
