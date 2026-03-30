// ✅ SERVER COMPONENT — sin "use client"
import { Building2, CheckCircle2, AlertTriangle, XCircle, Star, TrendingUp } from 'lucide-react';
import type { Vendor } from '@/lib/graph/departments/finance.service';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP',
    maximumFractionDigits: 0, notation: 'compact',
  }).format(n);

const avgScore = (v: Vendor) => v.score
  ? ((v.score.quality + v.score.delivery + v.score.pricing + v.score.service + v.score.compliance) / 5)
  : 0;

interface Props { vendors: Vendor[] }

export function VendorStatsStrip({ vendors }: Props) {
  const active    = vendors.filter(v => v.status === 'Activo');
  const review    = vendors.filter(v => v.status === 'En revisión');
  const blocked   = vendors.filter(v => v.status === 'Bloqueado' || v.status === 'Inactivo');
  const suppliers = vendors.filter(v => v.type === 'Suministrador');
  const services  = vendors.filter(v => v.type === 'Proveedor de servicios');

  const totalBilled  = vendors.reduce((s, v) => s + v.totalBilled, 0);
  const withScore    = vendors.filter(v => v.score);
  const globalScore  = withScore.length > 0
    ? withScore.reduce((s, v) => s + avgScore(v), 0) / withScore.length
    : 0;

  const stats = [
    {
      label: 'Total proveedores',
      value: vendors.length,
      sub:   `${suppliers.length} suministradores · ${services.length} servicios`,
      icon:  Building2,
      color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100', blob: 'bg-cyan-400',
    },
    {
      label: 'Activos',
      value: active.length,
      sub:   'homologados y operativos',
      icon:  CheckCircle2,
      color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', blob: 'bg-emerald-400',
    },
    {
      label: 'En revisión',
      value: review.length,
      sub:   review.length > 0 ? 'requieren validación' : 'sin pendientes',
      icon:  AlertTriangle,
      color: review.length > 0 ? 'text-amber-600' : 'text-slate-400',
      bg:    review.length > 0 ? 'bg-amber-50'    : 'bg-slate-50',
      border:review.length > 0 ? 'border-amber-100' : 'border-slate-200',
      blob:  review.length > 0 ? 'bg-amber-400'   : 'bg-slate-300',
    },
    {
      label: 'Bloqueados',
      value: blocked.length,
      sub:   'inactivos o suspendidos',
      icon:  XCircle,
      color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', blob: 'bg-red-400',
    },
    {
      label: 'Score promedio',
      value: globalScore > 0 ? `${globalScore.toFixed(1)} / 5` : '—',
      sub:   `${withScore.length} evaluados`,
      icon:  Star,
      color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', blob: 'bg-violet-400',
    },
    {
      label: 'Facturado total',
      value: fmt(totalBilled),
      sub:   'histórico acumulado',
      icon:  TrendingUp,
      color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100', blob: 'bg-cyan-400',
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
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 leading-tight pr-2">{st.label}</p>
              <Icon className={`h-4 w-4 shrink-0 ${st.color} opacity-70`} />
            </div>
            <p className={`text-xl font-bold leading-none ${st.color}`}>{st.value}</p>
            <p className="mt-1.5 text-[11px] text-slate-400 leading-tight line-clamp-2">{st.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
