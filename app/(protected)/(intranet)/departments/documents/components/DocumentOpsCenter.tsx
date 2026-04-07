"use client";

import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

export default function DocumentOpsCenter() {
  const alerts = [
    { icon: AlertTriangle, text: "12 documentos vencen esta semana",       color: "text-red-600 dark:text-red-400"       },
    { icon: Clock,         text: "42 documentos pendientes de aprobación", color: "text-amber-600 dark:text-amber-400"   },
    { icon: CheckCircle2,  text: "186 aprobados este mes",                 color: "text-emerald-600 dark:text-emerald-400" },
  ];

  return (
    <div className="rounded-xl border p-5
                    bg-white border-slate-200
                    dark:bg-[#161b22] dark:border-[#30363d]">
      <h3 className="text-sm font-semibold mb-4
                     text-slate-800 dark:text-[#e6edf3]">
        Centro de Operaciones
      </h3>
      <div className="space-y-3">
        {alerts.map((a, i) => {
          const Icon = a.icon;
          return (
            <div key={i} className="flex items-center gap-3 text-sm
                                    text-slate-700 dark:text-[#adbac7]">
              <Icon className={`h-4 w-4 shrink-0 ${a.color}`} />
              {a.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}