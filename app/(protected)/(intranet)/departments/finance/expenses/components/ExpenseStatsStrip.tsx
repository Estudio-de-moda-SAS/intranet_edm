/**
 * @module ExpenseStatsStrip
 * Franja de indicadores resumidos para gastos del módulo financiero.
 *
 * @remarks
 * Este componente presenta métricas agregadas construidas a partir
 * de la lista de gastos recibida.
 *
 * Incluye indicadores como:
 *
 * - total de gastos
 * - gastos en espera de aprobación
 * - gastos aprobados
 * - total ejecutado
 * - gastos pagados
 * - gastos rechazados
 *
 * A diferencia de otras franjas estadísticas del módulo,
 * este componente utiliza un layout horizontal desplazable
 * para priorizar amplitud visual en cada tarjeta.
 */

// ✅ SERVER COMPONENT — sin "use client"
// Layout diferenciado: scroll horizontal con cards más anchas en vez de grid 6 cols
import {
  Receipt, Clock, CheckCircle2, Banknote,
  XCircle, TrendingUp,
} from 'lucide-react';
import type { Expense } from '@/lib/graph/departments/finance.service';

/* -------------------------------------------------------------------------- */
/* Formateador                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Formatea un valor numérico como moneda COP.
 *
 * @param n Valor monetario a formatear.
 * @returns Cadena formateada en pesos colombianos.
 *
 * @remarks
 * Cuando el valor es igual o superior a un millón,
 * se utiliza notación compacta para optimizar el espacio visual.
 */
const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
    notation: n >= 1_000_000 ? 'compact' : 'standard',
  }).format(n);

/* -------------------------------------------------------------------------- */
/* Props                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Props del componente {@link ExpenseStatsStrip}.
 *
 * @property expenses Lista de gastos utilizada para calcular los indicadores.
 */
interface Props {
  expenses: Expense[];
}

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Franja de estadísticas de gastos.
 *
 * @param props Propiedades del componente.
 * @returns Conjunto horizontal de tarjetas con indicadores clave del estado de gastos.
 *
 * @remarks
 * Este componente resume la operación de gastos mediante
 * conteos y montos agregados.
 *
 * Entre los cálculos realizados se incluyen:
 * - gastos en espera de aprobación
 * - gastos aprobados
 * - gastos pagados
 * - gastos rechazados
 * - borradores
 * - total ejecutado
 *
 * El total ejecutado se calcula a partir de la suma
 * de gastos aprobados y pagados.
 *
 * @example
 * ```tsx
 * <ExpenseStatsStrip expenses={expenses} />
 * ```
 */
export function ExpenseStatsStrip({ expenses }: Props) {
  /**
   * Gastos en espera de aprobación.
   *
   * @remarks
   * Incluye gastos en estado `Enviado`
   * y `En revisión`.
   */
  const pending = expenses.filter(e => e.status === 'Enviado' || e.status === 'En revisión');

  /**
   * Gastos aprobados y listos para desembolso.
   */
  const approved = expenses.filter(e => e.status === 'Aprobado');

  /**
   * Gastos ya pagados.
   */
  const paid = expenses.filter(e => e.status === 'Pagado');

  /**
   * Gastos rechazados.
   */
  const rejected = expenses.filter(e => e.status === 'Rechazado');

  /**
   * Gastos aún en estado de borrador.
   */
  const draft = expenses.filter(e => e.status === 'Borrador');

  /**
   * Monto total ejecutado.
   *
   * @remarks
   * Suma gastos aprobados y pagados.
   */
  const totalSpent = [...approved, ...paid].reduce((s, e) => s + e.amount, 0);

  /**
   * Monto total actualmente pendiente de aprobación.
   */
  const totalPending = pending.reduce((s, e) => s + e.amount, 0);

  /**
   * Definición de tarjetas estadísticas a renderizar.
   *
   * @remarks
   * Cada objeto encapsula el contenido y la configuración visual
   * de una métrica dentro de la franja.
   */
  const stats = [
    {
      label: 'Total gastos',
      value: expenses.length,
      detail: 'registrados en el período',
      icon: Receipt,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      border: 'border-teal-100',
      blob: 'bg-teal-400',
    },
    {
      label: 'En espera',
      value: pending.length,
      detail: fmt(totalPending) + ' por aprobar',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      blob: 'bg-amber-400',
    },
    {
      label: 'Aprobados',
      value: approved.length,
      detail: 'listos para desembolso',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      blob: 'bg-emerald-400',
    },
    {
      label: 'Total ejecutado',
      value: fmt(totalSpent),
      detail: 'aprobado + pagado',
      icon: TrendingUp,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-100',
      blob: 'bg-violet-400',
    },
    {
      label: 'Pagados',
      value: paid.length,
      detail: `${paid.length} desembolso${paid.length !== 1 ? 's' : ''} completados`,
      icon: Banknote,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      blob: 'bg-blue-400',
    },
    {
      label: 'Rechazados',
      value: rejected.length,
      detail: draft.length > 0 ? `+ ${draft.length} borrador${draft.length !== 1 ? 'es' : ''}` : 'requieren revisión',
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-50',
      border: 'border-red-100',
      blob: 'bg-red-400',
    },
  ];

  return (
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