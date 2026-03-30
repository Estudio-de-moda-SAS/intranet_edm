"use client";

import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

export default function DocumentOpsCenter() {
  const alerts = [
    {
      icon: AlertTriangle,
      text: "12 documentos vencen esta semana",
      color: "text-red-600",
    },
    {
      icon: Clock,
      text: "42 documentos pendientes de aprobación",
      color: "text-amber-600",
    },
    {
      icon: CheckCircle2,
      text: "186 aprobados este mes",
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">
        Centro de Operaciones
      </h3>

      <div className="space-y-3">
        {alerts.map((a, i) => {
          const Icon = a.icon;

          return (
            <div
              key={i}
              className="flex items-center gap-3 text-sm text-slate-700"
            >
              <Icon className={`h-4 w-4 ${a.color}`} />
              {a.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}