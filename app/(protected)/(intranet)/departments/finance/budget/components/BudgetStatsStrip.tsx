// ✅ SERVER COMPONENT — sin "use client"
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle2, BarChart3 } from 'lucide-react';
import type { DepartmentBudget } from '@/lib/graph/departments/finance.service';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    notation: 'compact',
  }).format(n);

interface Props { budgets: DepartmentBudget[] }

export function BudgetStatsStrip({ budgets }: Props) {
  // Totales anuales consolidados
  const totalAssigned = budgets.reduce((s, b) =>
    s + b.assignedQ1 + b.assignedQ2 + b.assignedQ3 + b.assignedQ4, 0);
  const totalExecuted = budgets.reduce((s, b) =>
    s + b.executedQ1 + b.executedQ2 + b.executedQ3 + b.executedQ4, 0);
  const totalAvailable = totalAssigned - totalExecuted;
  const globalPct      = Math.round((totalExecuted / totalAssigned) * 100);

  // Departamentos en alerta (>75% ejecutado en lo que va del año)
  const atRisk = budgets.filter(b => {
    const assigned = b.assignedQ1 + b.assignedQ2;
    const executed = b.executedQ1 + b.executedQ2;
    return assigned > 0 && (executed / assigned) >= 0.75;
  });

  // Mejor eficiencia: más cerca del 100% sin pasarse
  const healthyDepts = budgets.filter(b => {
    const assigned = b.assignedQ1 + b.assignedQ2;
    const executed = b.executedQ1 + b.executedQ2;
    const pct = assigned > 0 ? (executed / assigned) * 100 : 0;
    return pct >= 50 && pct < 75;
  });

  const stats = [
    {
      label:  'Presupuesto total',
      value:  fmt(totalAssigned),
      detail: 'asignado año fiscal 2026',
      icon:   DollarSign,
      color:  'text-indigo-600',
      bg:     'bg-indigo-50',
      border: 'border-indigo-100',
      blob:   'bg-indigo-400',
    },
    {
      label:  'Total ejecutado',
      value:  fmt(totalExecuted),
      detail: `${globalPct}% del presupuesto anual`,
      icon:   TrendingUp,
      color:  'text-violet-600',
      bg:     'bg-violet-50',
      border: 'border-violet-100',
      blob:   'bg-violet-400',
    },
    {
      label:  'Disponible',
      value:  fmt(totalAvailable),
      detail: 'restante para el año',
      icon:   BarChart3,
      color:  'text-emerald-600',
      bg:     'bg-emerald-50',
      border: 'border-emerald-100',
      blob:   'bg-emerald-400',
    },
    {
      label:  'Depts. en alerta',
      value:  atRisk.length,
      detail: atRisk.length > 0 ? atRisk.map(b => b.area).join(', ') : 'Todos bajo control',
      icon:   atRisk.length > 0 ? AlertTriangle : CheckCircle2,
      color:  atRisk.length > 0 ? 'text-amber-600' : 'text-emerald-600',
      bg:     atRisk.length > 0 ? 'bg-amber-50'    : 'bg-emerald-50',
      border: atRisk.length > 0 ? 'border-amber-100' : 'border-emerald-100',
      blob:   atRisk.length > 0 ? 'bg-amber-400'   : 'bg-emerald-400',
    },
    {
      label:  'Depts. saludables',
      value:  healthyDepts.length,
      detail: 'ejecución entre 50%–75%',
      icon:   CheckCircle2,
      color:  'text-teal-600',
      bg:     'bg-teal-50',
      border: 'border-teal-100',
      blob:   'bg-teal-400',
    },
    {
      label:  'Departamentos',
      value:  budgets.length,
      detail: 'con presupuesto activo',
      icon:   BarChart3,
      color:  'text-slate-600',
      bg:     'bg-slate-50',
      border: 'border-slate-200',
      blob:   'bg-slate-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6 mb-6">
      {stats.map(st => {
        const Icon = st.icon;
        return (
          <div key={st.label}
            className={`relative overflow-hidden rounded-2xl border ${st.border} ${st.bg} p-4`}>
            <div className={`pointer-events-none absolute -right-3 -top-3 h-14 w-14 rounded-full opacity-20 ${st.blob}`} />
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 leading-tight pr-2">
                {st.label}
              </p>
              <Icon className={`h-4 w-4 shrink-0 ${st.color} opacity-70`} />
            </div>
            <p className={`text-xl font-bold leading-none ${st.color}`}>{st.value}</p>
            <p className="mt-1.5 text-[11px] text-slate-400 leading-tight line-clamp-2">{st.detail}</p>
          </div>
        );
      })}
    </div>
  );
}
