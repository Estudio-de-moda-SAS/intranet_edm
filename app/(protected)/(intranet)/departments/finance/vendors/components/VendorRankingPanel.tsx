/**
 * @module VendorRankingPanel
 * Panel de ranking y distribución analítica de proveedores.
 *
 * @remarks
 * Este componente presenta una vista resumida de desempeño y facturación
 * de proveedores del área financiera.
 *
 * Incluye dos enfoques principales:
 *
 * - ranking de proveedores mejor evaluados
 * - distribución de facturación acumulada por categoría
 *
 * Su objetivo es facilitar una lectura comparativa del rendimiento
 * y del peso financiero de los proveedores más relevantes.
 */

// ✅ SERVER COMPONENT — sin "use client"
import { Star, TrendingUp, Award } from 'lucide-react';
import type { Vendor } from '@/lib/graph/departments/finance.service';

/**
 * Formatea un valor numérico como moneda COP en notación compacta.
 *
 * @param n Valor monetario a formatear.
 * @returns Cadena formateada en pesos colombianos.
 *
 * @remarks
 * Se utiliza para mostrar montos acumulados de manera resumida
 * dentro del panel analítico.
 */
const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
    notation: 'compact',
  }).format(n);

/**
 * Calcula el score promedio de un proveedor.
 *
 * @param v Proveedor a evaluar.
 * @returns Promedio numérico con un decimal o `0` si no tiene evaluación.
 *
 * @remarks
 * El cálculo incluye cinco dimensiones:
 * calidad, entregas, precios, servicio y cumplimiento contractual.
 */
const avgScore = (v: Vendor) => v.score
  ? parseFloat(((v.score.quality + v.score.delivery + v.score.pricing + v.score.service + v.score.compliance) / 5).toFixed(1))
  : 0;

/**
 * Devuelve la clase de color de texto según el score.
 *
 * @param s Puntaje promedio.
 * @returns Clase CSS asociada al nivel del score.
 *
 * @remarks
 * La representación visual diferencia:
 * - scores altos
 * - scores medios
 * - scores bajos
 */
const scoreColor = (s: number) =>
  s >= 4.5 ? 'text-emerald-600' : s >= 3.5 ? 'text-amber-600' : 'text-red-500';

/**
 * Devuelve la clase de fondo y borde según el score.
 *
 * @param s Puntaje promedio.
 * @returns Clases CSS para fondo y borde del badge.
 */
const scoreBg = (s: number) =>
  s >= 4.5 ? 'bg-emerald-50 border-emerald-200' : s >= 3.5 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

/**
 * Props del componente {@link VendorRankingPanel}.
 *
 * @property vendors Lista de proveedores utilizada para construir el ranking y la distribución.
 */
interface Props {
  vendors: Vendor[];
}

/**
 * Fila visual de estrellas para representar un score.
 *
 * @param props Propiedades del componente.
 * @returns Conjunto de cinco estrellas con relleno según el valor recibido.
 *
 * @remarks
 * El número de estrellas activas se define redondeando
 * el score al entero más cercano.
 */
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

/**
 * Panel de ranking de proveedores y análisis por categoría.
 *
 * @param props Propiedades del componente.
 * @returns Panel con ranking por score y distribución de facturación por categoría.
 *
 * @remarks
 * Este componente construye dos vistas complementarias:
 *
 * - un top 5 de proveedores activos mejor evaluados
 * - una clasificación de categorías con mayor facturación acumulada
 *
 * Además, si existe al menos un proveedor rankeado, se muestra
 * un desglose detallado del score del proveedor mejor posicionado.
 *
 * @example
 * ```tsx
 * <VendorRankingPanel vendors={vendors} />
 * ```
 */
export function VendorRankingPanel({ vendors }: Props) {
  /**
   * Top 5 de proveedores activos ordenados por score promedio.
   *
   * @remarks
   * Solo se consideran proveedores:
   * - con evaluación registrada
   * - en estado activo
   *
   * A cada proveedor se le agrega el valor `avg`
   * para facilitar el ordenamiento y renderizado.
   */
  const ranked = vendors
    .filter(v => v.score && v.status === 'Activo')
    .map(v => ({ ...v, avg: avgScore(v) }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

  /**
   * Agrupación de proveedores por categoría.
   *
   * @remarks
   * Para cada categoría se consolida:
   * - cantidad de proveedores
   * - facturación total acumulada
   */
  const byCat = vendors.reduce<Record<string, { count: number; billed: number }>>((acc, v) => {
    if (!acc[v.category]) {
      acc[v.category] = { count: 0, billed: 0 };
    }

    const entry = acc[v.category];

    if (entry) {
      entry.count += 1;
      entry.billed += v.totalBilled;
    }

    return acc;
  }, {});

  /**
   * Lista de categorías ordenadas por facturación acumulada.
   *
   * @remarks
   * Se limita a las cinco categorías con mayor peso financiero.
   */
  const catList = Object.entries(byCat)
    .sort((a, b) => b[1].billed - a[1].billed)
    .slice(0, 5);

  /**
   * Valor máximo de facturación entre las categorías mostradas.
   *
   * @remarks
   * Se usa como referencia para calcular el ancho relativo
   * de las barras visuales de comparación.
   */
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
              <span
                className={`text-[11px] font-bold w-5 shrink-0 ${
                  i === 0 ? 'text-amber-500' : 'text-slate-300'
                }`}
              >
                #{i + 1}
              </span>

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
            <p className="text-[11px] text-slate-400 mb-2.5">
              Detalle {ranked[0].name.split(' ')[0]}
            </p>

            {([
              ['Calidad', ranked[0].score!.quality],
              ['Entrega', ranked[0].score!.delivery],
              ['Precio', ranked[0].score!.pricing],
              ['Servicio', ranked[0].score!.service],
              ['Cumplimiento', ranked[0].score!.compliance],
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
            /**
             * Porcentaje relativo de facturación frente a la categoría líder.
             */
            const pct = Math.round((data.billed / maxBilled) * 100);

            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[12px] font-medium text-slate-700 truncate">{cat}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{data.count}</span>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-600 shrink-0 ml-2">
                    {fmt(data.billed)}
                  </span>
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