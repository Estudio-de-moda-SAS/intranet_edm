import { Bell, Target, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";

// ── Alerts ────────────────────────────────────────────────────────

type Alert = { message: string; severity: "high" | "medium" | "low" };

const ALERTS: Alert[] = [
  { message: "3 pedidos sin confirmar hace +48h",      severity: "high"   },
  { message: "Meta mensual al 87% — faltan 5 días",    severity: "medium" },
  { message: "Cliente Arturo Calle sin contacto 15d",  severity: "high"   },
  { message: "Stock bajo en 4 referencias clave",      severity: "medium" },
  { message: "Propuesta OC-2024-0830 vence mañana",    severity: "medium" },
];

const SEV = {
  high:   { dot: "bg-rose-400",   badge: "bg-rose-50 border-rose-100",   text: "text-rose-600",   label: "Alta"  },
  medium: { dot: "bg-amber-400",  badge: "bg-amber-50 border-amber-100", text: "text-amber-600",  label: "Media" },
  low:    { dot: "bg-slate-300",  badge: "bg-slate-50 border-slate-100", text: "text-slate-500",  label: "Baja"  },
};

export function CommercialAlertsCard() {
  const highCount = ALERTS.filter((a) => a.severity === "high").length;
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50">
            <Bell className="h-3.5 w-3.5 text-rose-500" />
          </span>
          <h3 className="text-sm font-semibold text-slate-800">Alertas Comerciales</h3>
        </div>
        {highCount > 0 && (
          <span className="rounded-full bg-rose-50 border border-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
            {highCount} urgentes
          </span>
        )}
      </div>
      <ul className="divide-y divide-slate-50">
        {ALERTS.map((a, i) => {
          const cfg = SEV[a.severity];
          return (
            <li key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
              <span className={`h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />
              <span className="flex-1 text-[12px] text-slate-700 leading-snug">{a.message}</span>
              <span className={`shrink-0 rounded-full border px-2 py-px text-[10px] font-semibold ${cfg.badge} ${cfg.text}`}>
                {cfg.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Goals ─────────────────────────────────────────────────────────

type Goal = { label: string; current: number; target: number; unit: string; color: string };

const GOALS: Goal[] = [
  { label: "Ventas mensuales",    current: 348,  target: 400,  unit: "k", color: "bg-emerald-500" },
  { label: "Nuevos clientes",     current: 28,   target: 40,   unit: "",  color: "bg-violet-500"  },
  { label: "Tasa de cierre",      current: 34,   target: 40,   unit: "%", color: "bg-sky-500"     },
  { label: "NPS",                 current: 72,   target: 80,   unit: "",  color: "bg-amber-500"   },
];

export function CommercialGoalsCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
            <Target className="h-3.5 w-3.5 text-emerald-600" />
          </span>
          <h3 className="text-sm font-semibold text-slate-800">Metas del Mes</h3>
        </div>
        <Link href="/comercial/metas" className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-emerald-600 transition-colors">
          Detalle <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="p-5 space-y-4">
        {GOALS.map((g) => {
          const pct = Math.round((g.current / g.target) * 100);
          return (
            <div key={g.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-medium text-slate-700">{g.label}</span>
                <span className="text-[12px] font-bold text-slate-800 tabular-nums">
                  {g.current}{g.unit} <span className="font-normal text-slate-400">/ {g.target}{g.unit}</span>
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full rounded-full ${g.color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <div className="mt-0.5 flex items-center justify-between">
                <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${pct >= 90 ? "text-emerald-600" : pct >= 70 ? "text-amber-600" : "text-rose-500"}`}>
                  <TrendingUp className="h-2.5 w-2.5" />{pct}%
                </span>
                <span className="text-[10px] text-slate-400">Falta: {g.target - g.current}{g.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}