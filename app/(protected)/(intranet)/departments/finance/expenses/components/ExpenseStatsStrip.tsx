// ✅ SERVER COMPONENT — sin "use client"
// Layout diferenciado: scroll horizontal con cards más anchas en vez de grid 6 cols
import {
  Receipt, Clock, CheckCircle2, Banknote,
  XCircle, TrendingUp,
} from 'lucide-react';
import type { Expense } from '@/lib/graph/departments/finance.service';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    notation: n >= 1_000_000 ? 'compact' : 'standard',
  }).format(n);

interface Props { expenses: Expense[] }

export function ExpenseStatsStrip({ expenses }: Props) {
  const pending  = expenses.filter(e => e.status === 'Enviado' || e.status === 'En revisión');
  const approved = expenses.filter(e => e.status === 'Aprobado');
  const paid     = expenses.filter(e => e.status === 'Pagado');
  const rejected = expenses.filter(e => e.status === 'Rechazado');
  const draft    = expenses.filter(e => e.status === 'Borrador');

  const totalSpent   = [...approved, ...paid].reduce((s, e) => s + e.amount, 0);
  const totalPending = pending.reduce((s, e) => s + e.amount, 0);

  const stats = [
    {
      label:   'Total gastos',
      value:   expenses.length,
      detail:  'registrados en el período',
      icon:    Receipt,
      color:   'text-teal-600',
      bg:      'bg-teal-50',
      border:  'border-teal-100',
      blob:    'bg-teal-400',
    },
    {
      label:   'En espera',
      value:   pending.length,
      detail:  fmt(totalPending) + ' por aprobar',
      icon:    Clock,
      color:   'text-amber-600',
      bg:      'bg-amber-50',
      border:  'border-amber-100',
      blob:    'bg-amber-400',
    },
    {
      label:   'Aprobados',
      value:   approved.length,
      detail:  'listos para desembolso',
      icon:    CheckCircle2,
      color:   'text-emerald-600',
      bg:      'bg-emerald-50',
      border:  'border-emerald-100',
      blob:    'bg-emerald-400',
    },
    {
      label:   'Total ejecutado',
      value:   fmt(totalSpent),
      detail:  'aprobado + pagado',
      icon:    TrendingUp,
      color:   'text-violet-600',
      bg:      'bg-violet-50',
      border:  'border-violet-100',
      blob:    'bg-violet-400',
    },
    {
      label:   'Pagados',
      value:   paid.length,
      detail:  `${paid.length} desembolso${paid.length !== 1 ? 's' : ''} completados`,
      icon:    Banknote,
      color:   'text-blue-600',
      bg:      'bg-blue-50',
      border:  'border-blue-100',
      blob:    'bg-blue-400',
    },
    {
      label:   'Rechazados',
      value:   rejected.length,
      detail:  draft.length > 0 ? `+ ${draft.length} borrador${draft.length !== 1 ? 'es' : ''}` : 'requieren revisión',
      icon:    XCircle,
      color:   'text-red-500',
      bg:      'bg-red-50',
      border:  'border-red-100',
      blob:    'bg-red-400',
    },
  ];

  return (
    // Scroll horizontal en móvil, flex wrap en desktop
    <div className="flex gap-3 overflow-x-auto pb-1 mb-6 scrollbar-none">
      {stats.map(st => {
        const Icon = st.icon;
        return (
          <div
            key={st.label}
            className={`relative overflow-hidden shrink-0 rounded-2xl border ${st.border} ${st.bg} p-4 min-w-[160px] flex-1`}
          >
            <div className={`pointer-events-none absolute -right-4 -bottom-4 h-16 w-16 rounded-full opacity-20 ${st.blob}`} />
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{st.label}</p>
              <Icon className={`h-4 w-4 ${st.color} opacity-70`} />
            </div>
            <p className={`text-2xl font-bold leading-none ${st.color}`}>{st.value}</p>
            <p className="mt-1.5 text-[11px] text-slate-400 leading-tight">{st.detail}</p>
          </div>
        );
      })}
    </div>
  );
}