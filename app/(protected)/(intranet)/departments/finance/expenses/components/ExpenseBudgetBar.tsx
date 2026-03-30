// ✅ SERVER COMPONENT — sin "use client"
// Sidebar enriquecido: top gastos por área + barras de presupuesto + top solicitantes
import { Building2, User } from 'lucide-react';
import type { Expense, Budget } from '@/lib/graph/departments/finance.service';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    notation: 'compact',
  }).format(n);

interface Props {
  expenses: Expense[];
  budgets:  Budget[];
}

export function ExpenseBudgetBar({ expenses, budgets }: Props) {
  const active = expenses.filter(e => e.status !== 'Rechazado' && e.status !== 'Borrador');

  // Gasto ejecutado por área
  const byArea = active.reduce<Record<string, number>>((acc, e) => {
    acc[e.department] = (acc[e.department] ?? 0) + e.amount;
    return acc;
  }, {});

  // Top 4 solicitantes por monto
const byPerson = active.reduce<Record<string, { name: string; total: number; count: number }>>((acc, e) => {
  if (!acc[e.submittedBy]) acc[e.submittedBy] = { name: e.submittedBy, total: 0, count: 0 };
  const entry = acc[e.submittedBy];
  if (entry) {
    entry.total += e.amount;
    entry.count += 1;
  }
  return acc;
}, {});
  const topPersons = Object.values(byPerson)
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  const maxPersonTotal = topPersons[0]?.total ?? 1;

  return (
    <div className="space-y-4">

      {/* ── Presupuesto por área ── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-7 w-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center">
            <Building2 className="h-3.5 w-3.5 text-teal-500" />
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-slate-800">Presupuesto por área</h2>
            <p className="text-[11px] text-slate-400">Ejecución del período</p>
          </div>
        </div>

        <div className="space-y-4">
          {budgets.map(b => {
            const assignedCOP = b.assigned * 4_000;
            const spent       = byArea[b.area] ?? 0;
            const pct         = Math.min(100, Math.round((spent / assignedCOP) * 100));

            return (
              <div key={b.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-medium text-slate-700">{b.area}</span>
                  <span className={`text-[11px] font-bold rounded-full px-2 py-0.5 ${
                    pct >= 90 ? 'bg-red-50 text-red-600 border border-red-200'     :
                    pct >= 70 ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                'bg-teal-50 text-teal-600 border border-teal-200'
                  }`}>
                    {pct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 90 ? 'bg-red-400' :
                      pct >= 70 ? 'bg-amber-400' :
                                  'bg-teal-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-slate-400">{fmt(spent)}</span>
                  <span className="text-[10px] text-slate-300">{fmt(assignedCOP)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Top solicitantes ── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-7 w-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-violet-500" />
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-slate-800">Top solicitantes</h2>
            <p className="text-[11px] text-slate-400">Por monto total gestionado</p>
          </div>
        </div>

        <div className="space-y-3">
          {topPersons.map((p, i) => {
            const pct = Math.round((p.total / maxPersonTotal) * 100);
            return (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-bold text-slate-300 w-4 shrink-0">#{i + 1}</span>
                    <span className="text-[12px] font-medium text-slate-700 truncate">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-[11px] text-slate-400">{p.count} gasto{p.count !== 1 ? 's' : ''}</span>
                    <span className="text-[11px] font-semibold text-slate-600">{fmt(p.total)}</span>
                  </div>
                </div>
                <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-300 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}