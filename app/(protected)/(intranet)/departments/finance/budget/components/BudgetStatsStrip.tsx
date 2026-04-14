/**
 * @module BudgetStatsStrip
 * Franja de indicadores resumidos para la gestión presupuestaria.
 *
 * @remarks
 * Este componente presenta métricas consolidadas del presupuesto
 * anual del módulo financiero.
 *
 * Incluye indicadores como:
 *
 * - presupuesto total asignado
 * - total ejecutado
 * - presupuesto disponible
 * - departamentos en alerta
 * - departamentos saludables
 * - número total de departamentos con presupuesto
 *
 * Su propósito es ofrecer una lectura rápida del estado
 * global de ejecución presupuestaria.
 */

// ✅ SERVER COMPONENT — sin "use client"
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle2, BarChart3 } from 'lucide-react';
import type { DepartmentBudget } from '@/lib/graph/departments/finance.service';

/* -------------------------------------------------------------------------- */
/* Formateador                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Formatea un valor numérico como moneda COP en notación compacta.
 *
 * @param n Valor monetario a formatear.
 * @returns Cadena formateada en pesos colombianos.
 *
 * @remarks
 * Se utiliza para representar montos presupuestales
 * de forma resumida dentro de tarjetas estadísticas.
 */
const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
    notation: 'compact',
  }).format(n);

/* -------------------------------------------------------------------------- */
/* Props                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Props del componente {@link BudgetStatsStrip}.
 *
 * @property budgets Lista de presupuestos departamentales utilizada para calcular los indicadores.
 */
interface Props {
  budgets: DepartmentBudget[];
}

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Franja de estadísticas presupuestales.
 *
 * @param props Propiedades del componente.
 * @returns Conjunto de tarjetas con indicadores clave del estado del presupuesto.
 *
 * @remarks
 * Este componente resume la situación presupuestaria global
 * a partir de los presupuestos por departamento.
 *
 * Entre los cálculos realizados se incluyen:
 * - presupuesto anual asignado
 * - ejecución total acumulada
 * - disponibilidad restante
 * - porcentaje global de ejecución
 * - departamentos en riesgo
 * - departamentos con ejecución saludable
 *
 * @example
 * ```tsx
 * <BudgetStatsStrip budgets={budgets} />
 * ```
 */
export function BudgetStatsStrip({ budgets }: Props) {
  /**
   * Presupuesto total asignado del año.
   *
   * @remarks
   * Se calcula sumando las asignaciones de los cuatro trimestres
   * de todos los departamentos.
   */
  const totalAssigned = budgets.reduce((s, b) =>
    s + b.assignedQ1 + b.assignedQ2 + b.assignedQ3 + b.assignedQ4, 0);

  /**
   * Presupuesto total ejecutado del año.
   *
   * @remarks
   * Se calcula sumando la ejecución acumulada
   * de los cuatro trimestres.
   */
  const totalExecuted = budgets.reduce((s, b) =>
    s + b.executedQ1 + b.executedQ2 + b.executedQ3 + b.executedQ4, 0);

  /**
   * Presupuesto aún disponible para el resto del año.
   */
  const totalAvailable = totalAssigned - totalExecuted;

  /**
   * Porcentaje global de ejecución presupuestaria.
   */
  const globalPct = Math.round((totalExecuted / totalAssigned) * 100);

  /**
   * Departamentos en alerta presupuestal.
   *
   * @remarks
   * Se consideran en alerta los departamentos que,
   * con base en Q1 y Q2, ya han ejecutado al menos el 75%
   * del presupuesto asignado para ese período.
   */
  const atRisk = budgets.filter(b => {
    const assigned = b.assignedQ1 + b.assignedQ2;
    const executed = b.executedQ1 + b.executedQ2;
    return assigned > 0 && (executed / assigned) >= 0.75;
  });

  /**
   * Departamentos con ejecución saludable.
   *
   * @remarks
   * Se consideran saludables aquellos cuya ejecución,
   * en lo corrido de Q1 y Q2, se encuentra entre 50% y 75%
   * del presupuesto asignado.
   */
  const healthyDepts = budgets.filter(b => {
    const assigned = b.assignedQ1 + b.assignedQ2;
    const executed = b.executedQ1 + b.executedQ2;
    const pct = assigned > 0 ? (executed / assigned) * 100 : 0;
    return pct >= 50 && pct < 75;
  });

  /**
   * Definición de tarjetas estadísticas a renderizar.
   *
   * @remarks
   * Cada objeto encapsula el contenido y la configuración visual
   * de una métrica presupuestal.
   */
  const stats = [
    {
      label: 'Presupuesto total',
      value: fmt(totalAssigned),
      detail: 'asignado año fiscal 2026',
      icon: DollarSign,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      blob: 'bg-indigo-400',
    },
    {
      label: 'Total ejecutado',
      value: fmt(totalExecuted),
      detail: `${globalPct}% del presupuesto anual`,
      icon: TrendingUp,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-100',
      blob: 'bg-violet-400',
    },
    {
      label: 'Disponible',
      value: fmt(totalAvailable),
      detail: 'restante para el año',
      icon: BarChart3,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      blob: 'bg-emerald-400',
    },
    {
      label: 'Depts. en alerta',
      value: atRisk.length,
      detail: atRisk.length > 0 ? atRisk.map(b => b.area).join(', ') : 'Todos bajo control',
      icon: atRisk.length > 0 ? AlertTriangle : CheckCircle2,
      color: atRisk.length > 0 ? 'text-amber-600' : 'text-emerald-600',
      bg: atRisk.length > 0 ? 'bg-amber-50' : 'bg-emerald-50',
      border: atRisk.length > 0 ? 'border-amber-100' : 'border-emerald-100',
      blob: atRisk.length > 0 ? 'bg-amber-400' : 'bg-emerald-400',
    },
    {
      label: 'Depts. saludables',
      value: healthyDepts.length,
      detail: 'ejecución entre 50%–75%',
      icon: CheckCircle2,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      border: 'border-teal-100',
      blob: 'bg-teal-400',
    },
    {
      label: 'Departamentos',
      value: budgets.length,
      detail: 'con presupuesto activo',
      icon: BarChart3,
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      blob: 'bg-slate-400',
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
            <p className="mt-1.5 text-[11px] text-slate-400 leading-tight line-clamp-2">{st.detail}</p>
          </div>
        );
      })}
    </div>
  );
}