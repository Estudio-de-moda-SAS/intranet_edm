// ✅ SERVER COMPONENT — sin "use client"
import { TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import type { StrategicAnalysis } from '@/lib/graph/departments/finance.service';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP',
    maximumFractionDigits: 0, notation: 'compact',
  }).format(n);

interface Props { analysis: StrategicAnalysis }

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
      {children}
    </h3>
  );
}

export function StrategicAnalysisPanel({ analysis: a }: Props) {
  const maxVal = Math.max(...a.trend.map(t => t.ingresos), 1);

  return (
    <div className="space-y-4">

      {/* ── Tendencia 6 meses ── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-100 p-5">
        <SectionLabel>Tendencia 6 meses</SectionLabel>

        {/* Mini chart — barras apiladas */}
        <div className="flex items-end gap-1.5 h-24 mb-2">
          {a.trend.map((t, i) => {
            const ingPct  = (t.ingresos / maxVal) * 100;
            const gastPct = (t.gastos   / maxVal) * 100;
            const isLast  = i === a.trend.length - 1;
            return (
              <div key={t.month} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full flex flex-col gap-0.5 justify-end" style={{ height: '76px' }}>
                  <div
                    className={`w-full rounded-t-sm ${isLast ? 'bg-rose-500' : 'bg-rose-300'}`}
                    style={{ height: `${(ingPct * 60) / 100}px`, minHeight: 2 }}
                  />
                  <div
                    className={`w-full rounded-b-sm ${isLast ? 'bg-slate-400' : 'bg-slate-200'}`}
                    style={{ height: `${(gastPct * 60) / 100}px`, minHeight: 2 }}
                  />
                </div>
                <span className={`text-[9px] font-medium ${isLast ? 'text-rose-600' : 'text-slate-400'}`}>
                  {t.month}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className="h-2 w-2 rounded-sm bg-rose-400 inline-block" />Ingresos
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className="h-2 w-2 rounded-sm bg-slate-300 inline-block" />Gastos
          </span>
        </div>

        {/* Tabla resumen */}
        <div className="mt-4 rounded-xl border border-slate-100 overflow-hidden">
          {a.trend.slice(-3).reverse().map((t, i) => (
            <div key={t.month}
              className={`flex items-center justify-between px-3 py-2.5 border-b border-slate-50 last:border-0 ${i === 0 ? 'bg-rose-50/50' : ''}`}>
              <span className={`text-[12px] font-semibold ${i === 0 ? 'text-rose-700' : 'text-slate-600'}`}>
                {t.month}
              </span>
              <div className="flex items-center gap-3 text-right">
                <div>
                  <p className="text-[10px] text-slate-400">Ingresos</p>
                  <p className="text-[12px] font-semibold text-slate-700">{fmt(t.ingresos)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Utilidad</p>
                  <p className={`text-[12px] font-semibold ${t.utilidad >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {fmt(t.utilidad)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Alertas estratégicas ── */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50/50 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-7 w-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <SectionLabel>Alertas estratégicas</SectionLabel>
        </div>
        <div className="space-y-2.5">
          {a.topAlerts.map((alert, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-white p-3">
              <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[9px] font-bold text-amber-700">{i + 1}</span>
              </div>
              <p className="text-[12px] text-slate-700 leading-snug">{alert}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Oportunidades ── */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-7 w-7 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center">
            <Lightbulb className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <SectionLabel>Oportunidades</SectionLabel>
        </div>
        <div className="space-y-2.5">
          {a.topOpportunities.map((opp, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-white p-3">
              <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp className="h-3 w-3 text-emerald-600" />
              </div>
              <p className="text-[12px] text-slate-700 leading-snug">{opp}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
