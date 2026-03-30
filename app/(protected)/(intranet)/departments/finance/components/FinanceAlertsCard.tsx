import { AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";

type Alert = {
  message: string;
  severity: "high" | "medium" | "low";
};

const ALERTS: Alert[] = [
  { message: "5 facturas vencidas",                 severity: "high"   },
  { message: "2 presupuestos excedidos",            severity: "high"   },
  { message: "3 pagos pendientes de aprobación",    severity: "medium" },
  { message: "Cierre contable en 3 días",           severity: "medium" },
  { message: "7 gastos sin categorizar",            severity: "low"    },
];

const SEVERITY = {
  high:   { dot: "bg-rose-400",   badge: "bg-rose-50 border-rose-100",   text: "text-rose-600",   label: "Alta"  },
  medium: { dot: "bg-amber-400",  badge: "bg-amber-50 border-amber-100", text: "text-amber-600",  label: "Media" },
  low:    { dot: "bg-slate-300",  badge: "bg-slate-50 border-slate-100", text: "text-slate-500",  label: "Baja"  },
};

export default function FinanceAlertsCard() {
  const highCount = ALERTS.filter((a) => a.severity === "high").length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
          </span>
          <h3 className="text-sm font-semibold text-slate-800">Alertas Financieras</h3>
        </div>
        {highCount > 0 && (
          <span className="rounded-full bg-rose-50 border border-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
            {highCount} urgentes
          </span>
        )}
      </div>

      {/* Alerts */}
      <ul className="divide-y divide-slate-50">
        {ALERTS.map((alert, i) => {
          const cfg = SEVERITY[alert.severity];
          return (
            <li key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
              <span className={`h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />
              <span className="flex-1 text-[13px] text-slate-700">{alert.message}</span>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cfg.badge} ${cfg.text}`}>
                {cfg.label}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className="border-t border-slate-100 px-5 py-3">
        <Link
          href="/finance/alerts"
          className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-violet-600 transition-colors"
        >
          Ver todas las alertas <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

    </div>
  );
}