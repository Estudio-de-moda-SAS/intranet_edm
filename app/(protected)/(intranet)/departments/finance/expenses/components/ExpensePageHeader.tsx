/**
 * @module ExpensePageHeader
 * Encabezado principal de la sección de gastos del módulo financiero.
 *
 * @remarks
 * Este componente presenta el contexto visual inicial
 * de la página de gastos operativos.
 *
 * Incluye:
 *
 * - breadcrumb de navegación
 * - ícono representativo del módulo
 * - título principal
 * - descripción breve de la funcionalidad de la vista
 *
 * Su propósito es orientar al usuario dentro del flujo
 * de gestión de gastos del área financiera.
 */

// ✅ SERVER COMPONENT — sin "use client"
import { ChevronRight, Receipt } from 'lucide-react';
import Link from 'next/link';

/**
 * Encabezado de página para la gestión de gastos.
 *
 * @returns Bloque visual con breadcrumb, título e información descriptiva.
 *
 * @remarks
 * Este componente funciona como introducción contextual
 * a la vista de gastos operativos.
 *
 * Refuerza la navegación jerárquica dentro del módulo financiero
 * y resume el objetivo funcional de la sección.
 *
 * @example
 * ```tsx
 * <ExpensePageHeader />
 * ```
 */
export function ExpensePageHeader() {
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
        <span className="text-violet-600 font-medium">Gastos operativos</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center shrink-0">
          <Receipt className="h-5 w-5 text-teal-600" />
        </div>
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900 leading-tight">
            Gestión de Gastos
          </h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Registra, aprueba y controla los gastos operativos de la empresa
          </p>
        </div>
      </div>
    </div>
  );
}