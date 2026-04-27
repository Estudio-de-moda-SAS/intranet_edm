/**
 * @module ExpensesPage
 * Página principal de gestión de gastos del módulo financiero.
 *
 * @remarks
 * Este módulo define una ruta server de Next.js encargada de
 * renderizar la vista de gastos operativos del área financiera.
 *
 * La página integra:
 *
 * - encabezado principal con contexto de navegación
 * - franja de indicadores clave de gastos
 * - tabla interactiva de gastos operativos
 *
 * Su objetivo es centralizar la consulta y revisión
 * de gastos asociados a las operaciones del área financiera.
 */

// ✅ SERVER COMPONENT — sin "use client"
// Ruta: app/(protected)/(intranet)/departments/finance/expenses/page.tsx

import { ExpensePageHeader } from '@/app/(protected)/(intranet)/departments/finance/expenses/components/ExpensePageHeader';
import { ExpenseStatsStrip } from '@/app/(protected)/(intranet)/departments/finance/expenses/components/ExpenseStatsStrip';
import { ExpenseTable } from '@/app/(protected)/(intranet)/departments/finance/expenses/components/ExpenseTable';
import { AnimatedCard } from '@/app/components/ui/animated/AnimatedCard';
import { getFinanceData } from '@/lib/graph/departments/finance.service';

/**
 * Metadatos de la página para SEO y configuración del documento.
 *
 * @remarks
 * Define el título y la descripción usados por Next.js
 * en la cabecera del documento HTML.
 */
export const metadata = {
  title: 'Gastos · Finanzas',
  description: 'Gestión de gastos operativos — Estudio de Moda',
};

/**
 * Página de gastos del módulo financiero.
 *
 * @returns Vista completa de gastos con encabezado, métricas y tabla interactiva.
 *
 * @remarks
 * Este componente:
 * - obtiene los datos financieros mediante {@link getFinanceData}
 * - renderiza un encabezado de página con contexto visual
 * - muestra una franja de indicadores basada en los gastos
 * - presenta una tabla interactiva para explorar el listado de gastos
 *
 * La estructura está organizada para priorizar la lectura ejecutiva
 * mediante métricas rápidas y luego el análisis detallado en tabla.
 *
 * Se utiliza {@link AnimatedCard} para suavizar la aparición
 * del bloque principal de consulta.
 *
 * @example
 * ```tsx
 * // Renderizado automático por Next.js en la ruta correspondiente
 * ```
 */
export default async function ExpensesPage() {
  /**
   * Datos financieros obtenidos desde el servicio backend.
   *
   * @remarks
   * En esta vista se consumen principalmente
   * los gastos disponibles en `data.expenses`.
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

        {/* ── Page header: breadcrumb + título ── */}
        <ExpensePageHeader />

        {/* ── KPI strip — recibe expenses ya resueltas ── */}
        <ExpenseStatsStrip expenses={data.expenses} />

        {/* ── Tabla interactiva — recibe expenses ya resueltas ── */}
        <AnimatedCard delay={0.1}>
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm shadow-slate-100 p-5">
            <ExpenseTable expenses={data.expenses} />
          </div>
        </AnimatedCard>

      </div>
    </main>
  );
}