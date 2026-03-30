// ✅ SERVER COMPONENT — sin "use client"
import { Star, TrendingUp, Award } from 'lucide-react';
import type { Vendor } from '@/lib/graph/departments/finance.service';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP',
    maximumFractionDigits: 0, notation: 'compact',
  }).format(n);

const avgScore = (v: Vendor) => v.score
  ? parseFloat(((v.score.quality + v.score.delivery + v.score.pricing + v.score.service + v.score.compliance) / 5).toFixed(1))
  : 0;

const scoreColor = (s: number) =>
  s >= 4.5 ? 'text-emerald-600' : s >= 3.5 ? 'text-amber-600' : 'text-red-500';

const scoreBg = (s: number) =>
  s >= 4.5 ? 'bg-emerald-50 border-emerald-200' : s >= 3.5 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

interface Props { vendors: Vendor[] }

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`h-3 w-3 ${i <= Math.round(score) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
        />
      ))}
    </div>
  );
}

export function VendorRankingPanel({ vendors }: Props) {
  // Top 5 por score
  const ranked = vendors
    .filter(v => v.score && v.status === 'Activo')
    .map(v => ({ ...v, avg: avgScore(v) }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

  // Distribución por categoría
const byCat = vendors.reduce<Record<string, { count: number; billed: number }>>((acc, v) => {
  if (!acc[v.category]) acc[v.category] = { count: 0, billed: 0 };
  const entry = acc[v.category];
  if (entry) {
    entry.count  += 1;
    entry.billed += v.totalBilled;
  }
  return acc;
}, {});
  const catList = Object.entries(byCat)
    .sort((a, b) => b[1].billed - a[1].billed)
    .slice(0, 5);

  const maxBilled = catList[0]?.[1].billed ?? 1;

  return (
    <div className="space-y-4">

      {/* ── Top proveedores por score ── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-7 w-7 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center">
            <Award className="h-3.5 w-3.5 text-cyan-600" />
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-slate-800">Mejor evaluados</h2>
            <p className="text-[11px] text-slate-400">Score promedio activos</p>
          </div>
        </div>

        <div className="space-y-3">
          {ranked.map((v, i) => (
            <div key={v.id} className="flex items-center gap-3">
              <span className={`text-[11px] font-bold w-5 shrink-0 ${
                i === 0 ? 'text-amber-500' : 'text-slate-300'
              }`}>#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-slate-700 truncate">{v.name}</p>
                <StarRating score={v.avg} />
              </div>
              <span className={`shrink-0 rounded-lg border px-2 py-0.5 text-[11px] font-bold ${scoreBg(v.avg)} ${scoreColor(v.avg)}`}>
                {v.avg}
              </span>
            </div>
          ))}
        </div>

        {/* Score breakdown del #1 */}
        {ranked[0] && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 mb-2.5">Detalle {ranked[0].name.split(' ')[0]}</p>
            {([
              ['Calidad',        ranked[0].score!.quality],
              ['Entrega',        ranked[0].score!.delivery],
              ['Precio',         ranked[0].score!.pricing],
              ['Servicio',       ranked[0].score!.service],
              ['Cumplimiento',   ranked[0].score!.compliance],
            ] as [string, number][]).map(([label, val]) => (
              <div key={label} className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] text-slate-500 w-20 shrink-0">{label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-cyan-400"
                    style={{ width: `${(val / 5) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-600 w-4 text-right">{val}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Por categoría ── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-7 w-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center">
            <TrendingUp className="h-3.5 w-3.5 text-violet-500" />
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-slate-800">Por categoría</h2>
            <p className="text-[11px] text-slate-400">Facturado acumulado</p>
          </div>
        </div>

        <div className="space-y-3.5">
          {catList.map(([cat, data]) => {
            const pct = Math.round((data.billed / maxBilled) * 100);
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[12px] font-medium text-slate-700 truncate">{cat}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{data.count}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 shrink-0 ml-2">{fmt(data.billed)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-cyan-300 transition-all duration-500"
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
