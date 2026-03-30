// app/(protected)/(intranet)/help/components/HelpAlertsPanel.tsx
// SERVER COMPONENT

import { TriangleAlert, Megaphone, ShieldCheck } from "lucide-react";

const alerts = [
  { icon: TriangleAlert, iconBg: "bg-amber-50", iconColor: "text-amber-600", title: "Mantenimiento SAP programado",    time: "Hoy 22:00 – 24:00 · Sin acceso"  },
  { icon: Megaphone,     iconBg: "bg-blue-50",  iconColor: "text-blue-600",  title: "Actualización Windows Defender", time: "Mar 18 · Reinicio requerido"      },
  { icon: ShieldCheck,   iconBg: "bg-amber-50", iconColor: "text-amber-600", title: "Renovación certificados SSL",     time: "Mar 22 · Sin impacto visible"     },
] as const;

export default function HelpAlertsPanel() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">
          Alertas y mantenimientos
        </h3>
      </div>

      <ul className="divide-y divide-slate-100">
        {alerts.map(({ icon: Icon, iconBg, iconColor, title, time }) => (
          <li key={title} className="flex items-start gap-3 px-5 py-3.5">
            <span className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </span>
            <div>
              <p className="text-[12px] font-semibold text-slate-800">{title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}