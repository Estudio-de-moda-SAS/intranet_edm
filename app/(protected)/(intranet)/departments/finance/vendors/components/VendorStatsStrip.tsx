/**
 * @module VendorStatsStrip
 * Franja de métricas resumidas para proveedores del área financiera.
 *
 * @remarks
 * Este componente presenta indicadores agregados construidos a partir
 * de la lista de proveedores recibida.
 *
 * Incluye métricas como:
 *
 * - total de proveedores
 * - proveedores activos
 * - proveedores en revisión
 * - proveedores bloqueados o inactivos
 * - score promedio de evaluación
 * - facturación total acumulada
 *
 * Está pensado como una vista ejecutiva y rápida del estado general
 * del ecosistema de proveedores.
 */

// ✅ SERVER COMPONENT — sin "use client"
import { Building2, CheckCircle2, AlertTriangle, XCircle, Star, TrendingUp } from 'lucide-react';
import type { Vendor } from '@/lib/graph/departments/finance.service';

/**
 * Formatea un valor numérico como moneda COP en notación compacta.
 *
 * @param n Valor monetario a formatear.
 * @returns Cadena formateada en pesos colombianos.
 *
 * @remarks
 * Este formato se utiliza para mostrar cifras resumidas
 * en espacios reducidos dentro de tarjetas estadísticas.
 */
const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
    notation: 'compact',
  }).format(n);

/**
 * Calcula el promedio de evaluación de un proveedor.
 *
 * @param v Proveedor a evaluar.
 * @returns Puntaje promedio del proveedor o `0` si no tiene evaluación.
 *
 * @remarks
 * El promedio se obtiene a partir de cinco criterios:
 * calidad, entregas, precios, servicio y cumplimiento contractual.
 */
const avgScore = (v: Vendor) => v.score
  ? ((v.score.quality + v.score.delivery + v.score.pricing + v.score.service + v.score.compliance) / 5)
  : 0;

/**
 * Props del componente {@link VendorStatsStrip}.
 *
 * @property vendors Lista de proveedores sobre la que se calculan las estadísticas.
 */
interface Props {
  vendors: Vendor[];
}

/**
 * Franja de estadísticas de proveedores.
 *
 * @param props Propiedades del componente.
 * @returns Conjunto de tarjetas con métricas resumidas del módulo de proveedores.
 *
 * @remarks
 * Este componente agrupa y resume información relevante de los proveedores,
 * permitiendo una lectura rápida del estado operativo y financiero general.
 *
 * Entre los cálculos realizados se incluyen:
 * - conteo por estado
 * - conteo por tipo de proveedor
 * - suma total facturada
 * - promedio global de evaluación
 *
 * @example
 * ```tsx
 * <VendorStatsStrip vendors={vendors} />
 * ```
 */
export function VendorStatsStrip({ vendors }: Props) {
  /**
   * Proveedores en estado activo.
   */
  const active = vendors.filter(v => v.status === 'Activo');

  /**
   * Proveedores actualmente en revisión.
   */
  const review = vendors.filter(v => v.status === 'En revisión');

  /**
   * Proveedores no operativos.
   *
   * @remarks
   * Agrupa tanto proveedores bloqueados como inactivos
   * para una lectura más práctica del riesgo operativo.
   */
  const blocked = vendors.filter(v => v.status === 'Bloqueado' || v.status === 'Inactivo');

  /**
   * Proveedores clasificados como suministradores.
   */
  const suppliers = vendors.filter(v => v.type === 'Suministrador');

  /**
   * Proveedores clasificados como prestadores de servicios.
   */
  const services = vendors.filter(v => v.type === 'Proveedor de servicios');

  /**
   * Monto total facturado por todos los proveedores.
   */
  const totalBilled = vendors.reduce((s, v) => s + v.totalBilled, 0);

  /**
   * Proveedores que cuentan con evaluación registrada.
   */
  const withScore = vendors.filter(v => v.score);

  /**
   * Score promedio global entre los proveedores evaluados.
   *
   * @remarks
   * Solo se calcula con proveedores que poseen información de score.
   * Si no existe ninguno evaluado, el valor resultante es `0`.
   */
  const globalScore = withScore.length > 0
    ? withScore.reduce((s, v) => s + avgScore(v), 0) / withScore.length
    : 0;

  /**
   * Definición de tarjetas estadísticas a renderizar.
   *
   * @remarks
   * Cada objeto encapsula el contenido y la configuración visual
   * necesaria para representar una métrica en la interfaz.
   */
  const stats = [
    {
      label: 'Total proveedores',
      value: vendors.length,
      sub: `${suppliers.length} suministradores · ${services.length} servicios`,
      icon: Building2,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      border: 'border-cyan-100',
      blob: 'bg-cyan-400',
    },
    {
      label: 'Activos',
      value: active.length,
      sub: 'homologados y operativos',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      blob: 'bg-emerald-400',
    },
    {
      label: 'En revisión',
      value: review.length,
      sub: review.length > 0 ? 'requieren validación' : 'sin pendientes',
      icon: AlertTriangle,
      color: review.length > 0 ? 'text-amber-600' : 'text-slate-400',
      bg: review.length > 0 ? 'bg-amber-50' : 'bg-slate-50',
      border: review.length > 0 ? 'border-amber-100' : 'border-slate-200',
      blob: review.length > 0 ? 'bg-amber-400' : 'bg-slate-300',
    },
    {
      label: 'Bloqueados',
      value: blocked.length,
      sub: 'inactivos o suspendidos',
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-50',
      border: 'border-red-100',
      blob: 'bg-red-400',
    },
    {
      label: 'Score promedio',
      value: globalScore > 0 ? `${globalScore.toFixed(1)} / 5` : '—',
      sub: `${withScore.length} evaluados`,
      icon: Star,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-100',
      blob: 'bg-violet-400',
    },
    {
      label: 'Facturado total',
      value: fmt(totalBilled),
      sub: 'histórico acumulado',
      icon: TrendingUp,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      border: 'border-cyan-100',
      blob: 'bg-cyan-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6 mb-6">
      {stats.map(st => {
        const Icon = st.icon;

        return (
          <div
            key={st.label}
            className={`relative overflow-hidden rounded-2xl border ${st.border} ${st.bg} p-4`}
          >
            <div className={`pointer-events-none absolute -right-3 -top-3 h-14 w-14 rounded-full opacity-20 ${st.blob}`} />

            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 leading-tight pr-2">
                {st.label}
              </p>
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