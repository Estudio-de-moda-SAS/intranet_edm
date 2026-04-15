/**
 * @module BudgetPageHeader
 * Encabezado principal de la sección de presupuesto del módulo financiero.
 *
 * @remarks
 * Este componente proporciona el contexto visual inicial
 * de la página de presupuesto.
 *
 * Incluye:
 *
 * - breadcrumb de navegación
 * - ícono representativo del módulo
 * - título principal de la vista
 * - descripción del alcance (año fiscal)
 *
 * Su función es orientar al usuario dentro del flujo
 * de gestión presupuestaria.
 */

// ✅ SERVER COMPONENT — sin "use client"
import { ChevronRight, PieChart } from 'lucide-react';
import Link from 'next/link';

/**
 * Encabezado de página para la gestión de presupuesto.
 *
 * @returns Bloque visual con breadcrumb, título e información descriptiva.
 *
 * @remarks
 * Este componente introduce la sección de presupuesto,
 * indicando la jerarquía de navegación y el contexto
 * temporal (año fiscal).
 *
 * Forma parte de la estructura base de la página
 * junto con:
 * - métricas (BudgetStatsStrip)
 * - dashboard (BudgetDashboard)
 *
 * @example
 * ```tsx
 * <BudgetPageHeader />
 * ```
 */
export function BudgetPageHeader() {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-2">
        <Link
          href="/departments/finance"
          className="hover:text-violet-600 transition-colors"
        >
          Finanzas
        </Link>

        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />

        <span className="text-indigo-600 font-medium">
          Presupuesto
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">
          <PieChart className="h-5 w-5 text-indigo-600" />
        </div>

        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900 leading-tight">
            Presupuesto
          </h1>

          <p className="text-[13px] text-slate-400 mt-0.5">
            Asignaciones y ejecución presupuestaria por departamento · Año fiscal 2026
          </p>
        </div>
      </div>
    </div>
  );
}