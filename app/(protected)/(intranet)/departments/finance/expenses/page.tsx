/**
 * @module InvoicePageHeader
 * Encabezado principal de la sección de facturas del módulo financiero.
 *
 * @remarks
 * Este componente presenta el contexto visual inicial
 * de la página de facturas de proveedores.
 *
 * Incluye:
 *
 * - breadcrumb de navegación
 * - ícono representativo del módulo
 * - título principal
 * - descripción breve de la funcionalidad de la vista
 *
 * Su propósito es orientar al usuario dentro del flujo
 * de gestión de facturas del área financiera.
 */

import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';

/**
 * Encabezado de página para la gestión de facturas.
 *
 * @returns Bloque visual con breadcrumb, título e información descriptiva.
 *
 * @remarks
 * Este componente funciona como introducción contextual
 * a la vista de facturas de proveedores.
 *
 * Refuerza la navegación jerárquica dentro del módulo financiero
 * y resume el propósito operativo de la sección.
 *
 * @example
 * ```tsx
 * <InvoicePageHeader />
 * ```
 */
export function InvoicePageHeader() {
  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-2">
        <Link
          href="/departments/finance"
          className="hover:text-violet-600 transition-colors"
        >
          Finanzas
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="text-violet-600 font-medium">Facturas de proveedores</span>
      </div>

      {/* Title row */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center shrink-0">
          <FileText className="h-5 w-5 text-violet-600" />
        </div>
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900 leading-tight">
            Gestión de Facturas
          </h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Administra, aprueba y hace seguimiento a las facturas de proveedores
          </p>
        </div>
      </div>
    </div>
  );
}