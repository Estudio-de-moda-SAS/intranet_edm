// app/(protected)/(intranet)/help/components/HelpKPIStrip.tsx
// SERVER COMPONENT

import { Ticket, Clock, CheckCircle, AlertTriangle } from "lucide-react";

const kpis = [
  {
    label:    "Tickets abiertos",
    value:    "12",
    delta:    "↓ 3 vs ayer",
    deltaUp:  false,
    icon:     Ticket,
    accent:   "border-t-blue-600",
    iconBg:   "bg-blue-50",
    iconColor:"text-blue-700",
    valueColor:"text-blue-700",
  },
  {
    label:    "Tiempo respuesta",
    value:    "1h 24m",
    delta:    "Promedio hoy",
    deltaUp:  null,
    icon:     Clock,
    accent:   "border-t-amber-500",
    iconBg:   "bg-amber-50",
    iconColor:"text-amber-700",
    valueColor:"text-amber-700",
  },
  {
    label:    "Resueltos hoy",
    value:    "8",
    delta:    "↑ 2 vs ayer",
    deltaUp:  true,
    icon:     CheckCircle,
    accent:   "border-t-emerald-500",
    iconBg:   "bg-emerald-50",
    iconColor:"text-emerald-700",
    valueColor:"text-emerald-700",
  },
  {
    label:    "Incidencias críticas",
    value:    "1",
    delta:    "Sin cambios",
    deltaUp:  null,
    icon:     AlertTriangle,
    accent:   "border-t-rose-500",
    iconBg:   "bg-rose-50",
    iconColor:"text-rose-700",
    valueColor:"text-rose-700",
  },
] as const;

export default function HelpKPIStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-6">
      {kpis.map(({ label, value, delta, deltaUp, icon: Icon, accent, iconBg, iconColor, valueColor }) => (
        <div
          key={label}
          className={`rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-2 shadow-md border-t-[3px] ${accent}`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
              {label}
            </p>
            <span className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </span>
          </div>
          <p className={`text-2xl font-bold ${valueColor} leading-none`}>
            {value}
          </p>
          <p
            className={`text-[11px] ${
              deltaUp === true
                ? "text-emerald-600"
                : deltaUp === false
                ? "text-rose-500"
                : "text-slate-400"
            }`}
          >
            {delta}
          </p>
        </div>
      ))}
    </div>
  );
}