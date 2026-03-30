// ✅ SERVER COMPONENT — sin "use client"
import Link from 'next/link';
import { ChevronRight, BarChart2, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import type { StrategicAnalysis } from '@/lib/graph/departments/finance.service';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP',
    maximumFractionDigits: 0, notation: 'compact',
  }).format(n);

interface Props { analysis: StrategicAnalysis }

export function ReportsHeroBanner({ analysis: a }: Props) {
  const isPositive = a.variacionMes >= 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 to-pink-700 p-6 mb-6 shadow-lg shadow-rose-200">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -right-2 bottom-0 h-24 w-24 rounded-full bg-white/5" />

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[11px] text-rose-200 mb-4">
        <Link href="/departments/finance" className="hover:text-white transition-colors">
          Finanzas
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white font-medium">Reportes y análisis</span>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left — title */}
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center">
              <BarChart2 className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-[24px] font-bold text-white tracking-tight leading-tight">
              Reportes financieros
            </h1>
          </div>
          <p className="text-[13px] text-rose-200 mt-1 ml-11">
            Historial de reportes y análisis estratégico · {a.currentMonth}
          </p>
        </div>

        {/* Right — KPI pills */}
        <div className="flex flex-wrap gap-3 lg:shrink-0">
          {/* Ingresos */}
          <div className="rounded-xl bg-white/15 backdrop-blur-sm px-4 py-3 min-w-[120px]">
            <p className="text-[10px] font-semibold text-rose-200 uppercase tracking-wide">Ingresos</p>
            <p className="text-[20px] font-bold text-white leading-tight mt-0.5">{fmt(a.ingresosMes)}</p>
            <div className={`flex items-center gap-1 mt-0.5 text-[11px] font-semibold ${
              isPositive ? 'text-emerald-300' : 'text-red-300'
            }`}>
              {isPositive
                ? <TrendingUp className="h-3 w-3" />
                : <TrendingDown className="h-3 w-3" />
              }
              {isPositive ? '+' : ''}{a.variacionMes}% vs mes ant.
            </div>
          </div>

          {/* Utilidad */}
          <div className="rounded-xl bg-white/15 backdrop-blur-sm px-4 py-3 min-w-[120px]">
            <p className="text-[10px] font-semibold text-rose-200 uppercase tracking-wide">Utilidad neta</p>
            <p className="text-[20px] font-bold text-white leading-tight mt-0.5">{fmt(a.utilidadMes)}</p>
            <p className="text-[11px] text-rose-200 mt-0.5">Margen {a.margenNeto.toFixed(1)}%</p>
          </div>

          {/* Gastos */}
          <div className="rounded-xl bg-white/15 backdrop-blur-sm px-4 py-3 min-w-[120px]">
            <p className="text-[10px] font-semibold text-rose-200 uppercase tracking-wide">Gastos</p>
            <p className="text-[20px] font-bold text-white leading-tight mt-0.5">{fmt(a.gastosMes)}</p>
            <p className="text-[11px] text-rose-200 mt-0.5">{Math.round((a.gastosMes / a.ingresosMes) * 100)}% de ingresos</p>
          </div>
        </div>
      </div>

      {/* Bottom — generar reporte CTA */}
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-rose-200">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Genera nuevos reportes desde las herramientas financieras</span>
        </div>
        <Link
          href="/departments/finance#herramientas"
          className="flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 px-3.5 py-2 text-[12px] font-semibold text-white transition-colors"
        >
          Ir al generador
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
