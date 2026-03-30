// app/(protected)/(intranet)/departments/legal/components/LegalRegulatoryAlerts.tsx
// SERVER COMPONENT

import { ShieldAlert, AlertTriangle, Info } from "lucide-react";
import type { LegalData, RegulatoryAlert } from "@/lib/graph/departments/legal.service";

type Props = { data: LegalData };

const SEVERITY_MAP: Record<
  RegulatoryAlert["severity"],
  { Icon: React.ElementType; iconCls: string; bg: string; border: string; badge: string; badgeCls: string }
> = {
  critical: {
    Icon: ShieldAlert,
    iconCls: "text-red-500",
    bg: "bg-red-50/60",
    border: "border-red-100",
    badge: "Crítico",
    badgeCls: "bg-red-50 text-red-700 border border-red-200",
  },
  warning: {
    Icon: AlertTriangle,
    iconCls: "text-amber-500",
    bg: "bg-amber-50/40",
    border: "border-amber-100",
    badge: "Atención",
    badgeCls: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  info: {
    Icon: Info,
    iconCls: "text-sky-500",
    bg: "bg-sky-50/40",
    border: "border-sky-100",
    badge: "Informativo",
    badgeCls: "bg-sky-50 text-sky-700 border border-sky-200",
  },
};

export default function LegalRegulatoryAlerts({ data }: Props) {
  const sorted = [...data.regulatoryAlerts].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
          <ShieldAlert size={16} className="text-slate-600" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">Alertas regulatorias</p>
          <p className="text-[11px] text-slate-400">Cambios normativos relevantes</p>
        </div>
      </div>

      {/* Alerts */}
      <ul className="divide-y divide-slate-50">
        {sorted.map((alert) => {
          const s = SEVERITY_MAP[alert.severity];
          const Icon = s.Icon;
          return (
            <li key={alert.id} className={`px-5 py-4 ${s.bg}`}>
              <div className="flex items-start gap-3">
                <Icon size={15} className={`mt-0.5 shrink-0 ${s.iconCls}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                      {alert.title}
                    </p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${s.badgeCls}`}>
                      {s.badge}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                    {alert.description}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[11px] font-medium text-slate-600">
                      Vigencia: {alert.effectiveDate}
                    </span>
                    <span className="text-[10px] text-slate-300">·</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${s.badgeCls}`}>
                      {alert.area}
                    </span>
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