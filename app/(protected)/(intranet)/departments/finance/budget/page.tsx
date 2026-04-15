/**
 * @module BudgetPage
 * Página principal de gestión presupuestaria del módulo financiero.
 *
 * @remarks
 * Este archivo define la vista completa de presupuesto por departamento.
 *
 * Su responsabilidad es:
 *
 * - obtener los datos financieros desde el servicio
 * - componer la estructura visual de la página
 * - integrar los componentes de presentación (header, KPIs y dashboard)
 *
 * Es un Server Component, por lo que ejecuta el fetch de datos
 * directamente en el servidor antes del render.
 */

// ✅ SERVER COMPONENT — sin "use client"
// Ruta: app/(protected)/(intranet)/departments/finance/budget/page.tsx

import type { Metadata }       from 'next';
import { getFinanceData }      from '@/lib/graph/departments/finance.service';
import { AnimatedCard }        from '@/app/components/ui/animated/AnimatedCard';
import { BudgetPageHeader }    from '@/app/(protected)/(intranet)/departments/finance/budget/components/BudgetPageHeader';
import { BudgetStatsStrip }    from '@/app/(protected)/(intranet)/departments/finance/budget/components/BudgetStatsStrip';
import { BudgetDashboard }     from '@/app/(protected)/(intranet)/departments/finance/budget/components/BudgetDashboard';

/* -------------------------------------------------------------------------- */
/* Metadata                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Metadatos de la página para SEO y configuración del documento.
 */
export const metadata: Metadata = {
  title: 'Presupuesto · Finanzas',
  description: 'Asignaciones y ejecución presupuestaria por departamento — Estudio de Moda',
};

/* -------------------------------------------------------------------------- */
/* Página principal                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Página de presupuesto del módulo financiero.
 *
 * @returns Vista completa con header, KPIs y dashboard interactivo.
 *
 * @remarks
 * Flujo de la página:
 *
 * 1. Se obtiene la información financiera mediante `getFinanceData`
 * 2. Se extraen los presupuestos por departamento (`departmentBudgets`)
 * 3. Se renderizan tres bloques principales:
 *
 *    - {@link BudgetPageHeader}: breadcrumb y título
 *    - {@link BudgetStatsStrip}: métricas consolidadas
 *    - {@link BudgetDashboard}: visualización interactiva
 *
 * @example
 * ```tsx
 * <BudgetPage />
 * ```
 */
export default async function BudgetPage() {
  /**
   * Obtiene todos los datos financieros del sistema.
   *
   * @remarks
   * Este servicio centraliza la información del módulo financiero.
   * En este caso, se utilizan únicamente los presupuestos por departamento.
   */
  const data = await getFinanceData();

  return (
    <main
      className="min-h-screen w-full bg-[#f4f6f9]"
      style={{
        fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div className="px-4 pb-10 pt-6 lg:px-14">

        {/* ── Breadcrumb + título ── */}
        <BudgetPageHeader />

        {/* ── KPIs consolidados ── */}
        <BudgetStatsStrip budgets={data.departmentBudgets} />

        {/* ── Dashboard interactivo ── */}
        <AnimatedCard delay={0.08}>
          <BudgetDashboard budgets={data.departmentBudgets} />
        </AnimatedCard>

      </div>
    </main>
  );
}