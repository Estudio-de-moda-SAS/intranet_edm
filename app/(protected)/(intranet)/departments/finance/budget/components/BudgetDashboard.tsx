'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, AlertTriangle,
  CheckCircle2, TrendingUp,
  Info, BarChart3,
} from 'lucide-react';
import type { DepartmentBudget, BudgetQuarter } from '@/lib/graph/departments/finance.service';
import { getBudgetForQuarter, getBudgetStatus } from '@/lib/graph/departments/finance.service';

// ─── Config ───────────────────────────────────────────────────────────────────

const QUARTERS: BudgetQuarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

const QUARTER_LABELS: Record<BudgetQuarter, string> = {
  Q1: 'Q1 · Ene–Mar',
  Q2: 'Q2 · Abr–Jun',
  Q3: 'Q3 · Jul–Sep',
  Q4: 'Q4 · Oct–Dic',
};

const STATUS_CFG = {
  healthy:     { label: 'Saludable',    bar: 'bg-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200' },
  warning:     { label: 'En alerta',    bar: 'bg-amber-400',   text: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200'   },
  critical:    { label: 'Crítico',      bar: 'bg-red-400',     text: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-200'     },
  overbudget:  { label: 'Sobre límite', bar: 'bg-red-600',     text: 'text-red-800',     bg: 'bg-red-100',     border: 'border-red-300'     },
};

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    notation: 'compact',
  }).format(n);

const fmtFull = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props { budgets: DepartmentBudget[] }

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function BudgetDrawer({
  budget, quarter, onClose,
}: { budget: DepartmentBudget; quarter: BudgetQuarter; onClose: () => void }) {
  const q       = getBudgetForQuarter(budget, quarter);
  const scfg    = STATUS_CFG[q.status];
  const allQ    = QUARTERS.map(qt => ({ qt, ...getBudgetForQuarter(budget, qt) }));
  const annualAssigned = budget.assignedQ1 + budget.assignedQ2 + budget.assignedQ3 + budget.assignedQ4;
  const annualExecuted = budget.executedQ1 + budget.executedQ2 + budget.executedQ3 + budget.executedQ4;
  const annualPct      = Math.round((annualExecuted / annualAssigned) * 100);

  return (
    <AnimatePresence>
      <motion.div key="ov"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.aside key="dr"
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 z-50 h-full w-full max-w-[480px] bg-white shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Accent bar */}
        <div className="h-1 w-full bg-indigo-500 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-slate-800">{budget.department}</p>
              <p className="text-[11px] text-slate-400">Detalle presupuestario · {QUARTER_LABELS[quarter]}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Status banner */}
          <div className={`rounded-xl border p-4 ${scfg.bg} ${scfg.border}`}>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${scfg.bg} ${scfg.border} ${scfg.text}`}>
                {q.pct >= 90 ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                {scfg.label}
              </span>
              <span className={`text-[20px] font-bold ${scfg.text}`}>{q.pct}%</span>
            </div>
            {q.projectionPct > 100 && (
              <p className="mt-2 text-[12px] text-red-700 flex items-start gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                Al ritmo actual, se proyecta ejecutar el <strong>{q.projectionPct}%</strong> del presupuesto anual.
              </p>
            )}
          </div>

          {/* Resumen trimestre seleccionado */}
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {QUARTER_LABELS[quarter]}
            </h3>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              {[
                ['Asignado',    fmtFull(q.assigned)],
                ['Ejecutado',   fmtFull(q.executed)],
                ['Disponible',  fmtFull(q.available)],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between px-4 py-3 border-b border-slate-50 last:border-0">
                  <span className="text-[13px] text-slate-500">{l}</span>
                  <span className="text-[13px] font-semibold text-slate-700">{v}</span>
                </div>
              ))}
              <div className="px-4 py-3 bg-indigo-50 border-t border-indigo-100">
                <div className="flex justify-between mb-2">
                  <span className="text-[12px] font-bold text-indigo-800">Ejecución</span>
                  <span className="text-[12px] font-bold text-indigo-800">{q.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-indigo-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${STATUS_CFG[q.status].bar}`}
                    style={{ width: `${Math.min(100, q.pct)}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Evolución trimestral */}
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Evolución anual
            </h3>
            <div className="rounded-xl border border-slate-100 bg-white overflow-hidden">
              {allQ.map(({ qt, assigned, executed, pct, status }) => {
                const isCurrent = qt === quarter;
                const isPast    = assigned > 0 && executed > 0;
                const isFuture  = executed === 0 && assigned > 0;
                return (
                  <div key={qt} className={`px-4 py-3 border-b border-slate-50 last:border-0 ${isCurrent ? 'bg-indigo-50/60' : ''}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[12px] font-semibold ${isCurrent ? 'text-indigo-700' : 'text-slate-600'}`}>
                          {qt}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-600 font-semibold rounded-full px-1.5 py-0.5">
                            actual
                          </span>
                        )}
                        {isFuture && (
                          <span className="text-[10px] text-slate-400">sin ejecutar</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">{fmt(executed)} / {fmt(assigned)}</span>
                        {isPast && (
                          <span className={`text-[11px] font-bold ${STATUS_CFG[status].text}`}>{pct}%</span>
                        )}
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFuture ? 'bg-slate-200' : STATUS_CFG[status].bar
                        }`}
                        style={{ width: isFuture ? '0%' : `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Líneas de gasto */}
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Líneas de gasto
            </h3>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              {budget.lines.map((line, i) => {
                const linePct = line.assigned > 0
                  ? Math.min(100, Math.round((line.executed / line.assigned) * 100)) : 0;
                const lineStatus = getBudgetStatus(linePct);
                return (
                  <div key={i} className="px-4 py-3 border-b border-slate-50 last:border-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] font-medium text-slate-700">{line.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">{fmt(line.executed)} / {fmt(line.assigned)}</span>
                        <span className={`text-[11px] font-bold ${STATUS_CFG[lineStatus].text}`}>{linePct}%</span>
                      </div>
                    </div>
                    <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${STATUS_CFG[lineStatus].bar}`}
                        style={{ width: `${linePct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Resumen anual */}
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Resumen anual consolidado
            </h3>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <div className="flex justify-between px-4 py-3 border-b border-slate-50">
                <span className="text-[13px] text-slate-500">Asignado total</span>
                <span className="text-[13px] font-semibold text-slate-700">{fmtFull(annualAssigned)}</span>
              </div>
              <div className="flex justify-between px-4 py-3 border-b border-slate-50">
                <span className="text-[13px] text-slate-500">Ejecutado YTD</span>
                <span className="text-[13px] font-semibold text-slate-700">{fmtFull(annualExecuted)}</span>
              </div>
              <div className="flex justify-between px-4 py-3.5 bg-indigo-50 border-t border-indigo-100">
                <span className="text-[13px] font-bold text-indigo-800">Ejecución YTD</span>
                <span className="text-[15px] font-bold text-indigo-800">{annualPct}%</span>
              </div>
            </div>
          </section>

          {/* Responsable */}
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Responsable
            </h3>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-indigo-600">
                  {budget.owner.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800">{budget.owner}</p>
                <p className="text-[11px] text-slate-400">{budget.ownerEmail}</p>
              </div>
            </div>
          </section>

          {/* Notas */}
          {budget.notes && (
            <section>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Notas</h3>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 flex items-start gap-2">
                <Info className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <p className="text-[13px] text-slate-600 leading-relaxed">{budget.notes}</p>
              </div>
            </section>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

// ─── Budget Card ──────────────────────────────────────────────────────────────

function BudgetCard({
  budget, quarter, onClick,
}: { budget: DepartmentBudget; quarter: BudgetQuarter; onClick: () => void }) {
  const q    = getBudgetForQuarter(budget, quarter);
  const scfg = STATUS_CFG[q.status];
  const annualAssigned = budget.assignedQ1 + budget.assignedQ2 + budget.assignedQ3 + budget.assignedQ4;
  const annualExecuted = budget.executedQ1 + budget.executedQ2 + budget.executedQ3 + budget.executedQ4;
  const annualPct      = Math.round((annualExecuted / annualAssigned) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100 cursor-pointer hover:border-indigo-200 hover:shadow-indigo-50 transition-all"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[14px] font-bold text-slate-800">{budget.department}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="text-[8px] font-bold text-slate-500">
                {budget.owner.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{budget.owner}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${scfg.bg} ${scfg.border} ${scfg.text}`}>
          {q.pct >= 90 && <AlertTriangle className="h-2.5 w-2.5" />}
          {scfg.label}
        </span>
      </div>

      {/* Trimestre actual — barra principal */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-slate-500">{QUARTER_LABELS[quarter]}</span>
          <span className={`text-[13px] font-bold ${scfg.text}`}>{q.pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, q.pct)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`h-full rounded-full ${scfg.bar}`}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-400">{fmt(q.executed)} ejecutado</span>
          <span className="text-[10px] text-slate-400">{fmt(q.assigned)} asignado</span>
        </div>
      </div>

      {/* Mini barras trimestrales */}
      <div className="grid grid-cols-4 gap-1 mb-4">
        {QUARTERS.map(qt => {
          const qData   = getBudgetForQuarter(budget, qt);
          const isActive = qt === quarter;
          const isEmpty  = qData.executed === 0;
          return (
            <div key={qt} className="text-center">
              <div className={`h-1 rounded-full mb-1 ${
                isEmpty  ? 'bg-slate-100' :
                isActive ? STATUS_CFG[qData.status].bar :
                           STATUS_CFG[qData.status].bar + ' opacity-40'
              }`} style={{ width: `${isEmpty ? 100 : Math.min(100, qData.pct)}%` }} />
              <span className={`text-[9px] font-medium ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>{qt}</span>
            </div>
          );
        })}
      </div>

      {/* Footer: disponible + YTD */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div>
          <p className="text-[10px] text-slate-400">Disponible trimestre</p>
          <p className="text-[13px] font-semibold text-slate-700">{fmt(q.available)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400">Ejecución YTD</p>
          <p className={`text-[13px] font-semibold ${getBudgetStatus(annualPct) === 'healthy' ? 'text-emerald-600' : 'text-amber-600'}`}>
            {annualPct}%
          </p>
        </div>
      </div>

      {/* Proyección alerta */}
      {q.projectionPct > 100 && (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
          <TrendingUp className="h-3.5 w-3.5 text-red-500 shrink-0" />
          <p className="text-[11px] font-semibold text-red-600">
            Proyección anual: {q.projectionPct}% — riesgo de sobrecosto
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function BudgetDashboard({ budgets }: Props) {
  const [quarter, setQuarter]   = useState<BudgetQuarter>('Q1');
  const [selected, setSelected] = useState<DepartmentBudget | null>(null);
  const [sortBy, setSortBy]     = useState<'dept' | 'pct' | 'amount'>('pct');

  const sorted = [...budgets].sort((a, b) => {
    if (sortBy === 'dept')   return a.department.localeCompare(b.department);
    if (sortBy === 'amount') {
      const aQ = getBudgetForQuarter(a, quarter);
      const bQ = getBudgetForQuarter(b, quarter);
      return bQ.assigned - aQ.assigned;
    }
    // pct — más críticos primero
    const aQ = getBudgetForQuarter(a, quarter);
    const bQ = getBudgetForQuarter(b, quarter);
    return bQ.pct - aQ.pct;
  });

  return (
    <>
      {/* ── Controls ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">

        {/* Quarter selector */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 w-fit">
          {QUARTERS.map(q => (
            <button
              key={q}
              onClick={() => setQuarter(q)}
              className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                quarter === q
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-slate-400">Ordenar por:</span>
          {([['pct', 'Ejecución'], ['amount', 'Monto'], ['dept', 'Departamento']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                sortBy === key
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Cards grid ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {sorted.map((b, i) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <BudgetCard
              budget={b}
              quarter={quarter}
              onClick={() => setSelected(b)}
            />
          </motion.div>
        ))}
      </div>

      {/* ── Drawer ── */}
      {selected && (
        <BudgetDrawer
          budget={selected}
          quarter={quarter}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
