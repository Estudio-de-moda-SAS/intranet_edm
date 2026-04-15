/**
 * @module FinanceKPIs
 * Tarjetas resumen de indicadores financieros principales.
 *
 * @remarks
 * Este componente presenta una vista sintética de los KPIs
 * más relevantes del módulo financiero.
 *
 * Actualmente muestra tres métricas clave:
 *
 * - balance general
 * - ingresos
 * - gastos
 *
 * Su propósito es ofrecer una lectura rápida del estado
 * financiero consolidado a partir del objeto `summary`.
 */

import { FinanceSummary } from "@/types/finance";

/* -------------------------------------------------------------------------- */
/* Props                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Props del componente {@link FinanceKPIs}.
 *
 * @property summary Resumen financiero consolidado utilizado para alimentar los indicadores.
 */
interface FinanceKPIsProps {
  summary: FinanceSummary;
}

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Panel de KPIs financieros básicos.
 *
 * @param props Propiedades del componente.
 * @returns Grid de tarjetas con balance, ingresos y gastos.
 *
 * @remarks
 * Este componente consume un resumen financiero tipado
 * y distribuye sus valores en tres tarjetas visuales.
 *
 * Cada tarjeta mantiene una semántica cromática diferenciada:
 *
 * - balance: color neutro
 * - ingresos: color positivo
 * - gastos: color de salida o egreso
 *
 * Está diseñado como bloque de lectura ejecutiva rápida
 * dentro de dashboards o vistas principales del módulo.
 *
 * @example
 * ```tsx
 * <FinanceKPIs summary={summary} />
 * ```
 */
export default function FinanceKPIs({ summary }: FinanceKPIsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div
        className="rounded-xl border p-5
                      bg-white border-slate-200
                      dark:bg-[#161b22] dark:border-[#30363d]"
      >
        <p className="text-sm text-slate-500 dark:text-[#768390]">Balance</p>
        <p className="text-2xl font-semibold text-slate-800 dark:text-[#e6edf3]">
          ${summary.balance}
        </p>
      </div>

      <div
        className="rounded-xl border p-5
                      bg-white border-slate-200
                      dark:bg-[#161b22] dark:border-[#30363d]"
      >
        <p className="text-sm text-slate-500 dark:text-[#768390]">Ingresos</p>
        <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
          ${summary.income}
        </p>
      </div>

      <div
        className="rounded-xl border p-5
                      bg-white border-slate-200
                      dark:bg-[#161b22] dark:border-[#30363d]"
      >
        <p className="text-sm text-slate-500 dark:text-[#768390]">Gastos</p>
        <p className="text-2xl font-semibold text-rose-600 dark:text-rose-400">
          ${summary.expenses}
        </p>
      </div>
    </div>
  );
}