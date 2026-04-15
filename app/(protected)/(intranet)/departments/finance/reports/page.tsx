/**
 * @module ReportsPage
 * Página principal de reportes financieros del módulo de finanzas.
 *
 * @remarks
 * Este módulo define una ruta server de Next.js encargada de
 * renderizar la vista de reportes y análisis estratégico.
 *
 * La página integra:
 *
 * - banner principal con KPIs y contexto (hero)
 * - listado de reportes estratégicos disponibles
 * - panel de análisis con métricas e insights
 *
 * La información se obtiene desde el servicio financiero
 * y se distribuye a los componentes correspondientes.
 */

// ✅ SERVER COMPONENT — sin "use client"
// Ruta: app/(protected)/(intranet)/departments/finance/reports/page.tsx

import type { Metadata } from 'next';
import { getFinanceData } from '@/lib/graph/departments/finance.service';
import { AnimatedCard } from '@/app/components/ui/animated/AnimatedCard';
import { ReportsHeroBanner } from '@/app/(protected)/(intranet)/departments/finance/reports/components/ReportsHeroBanner';
import { ReportsList } from '@/app/(protected)/(intranet)/departments/finance/reports/components/ReportsList';
import { StrategicAnalysisPanel } from '@/app/(protected)/(intranet)/departments/finance/reports/components/StrategicAnalysisPanel';

/**
 * Metadatos de la página para SEO y configuración del documento.
 *
 * @remarks
 * Define el título y descripción utilizados por Next.js
 * en la cabecera del documento HTML.
 */
export const metadata: Metadata = {
  title: 'Reportes · Finanzas',
  description: 'Reportes financieros e análisis estratégico — Estudio de Moda',
};

/**
 * Página de reportes financieros.
 *
 * @returns Vista completa de reportes y análisis estratégico.
 *
 * @remarks
 * Este componente:
 * - obtiene los datos financieros mediante {@link getFinanceData}
 * - renderiza un banner superior con KPIs clave
 * - muestra la lista de reportes disponibles
 * - incluye un panel lateral con análisis estratégico
 *
 * La estructura se organiza en un grid responsivo:
 *
 * - 7 columnas para la lista de reportes
 * - 5 columnas para el panel analítico
 *
 * Se utilizan contenedores animados ({@link AnimatedCard})
 * para mejorar la experiencia visual en la carga de contenido.
 *
 * @example
 * ```tsx
 * // Renderizado automático por Next.js en la ruta correspondiente
 * ```
 */
export default async function ReportsPage() {
  /**
   * Datos financieros obtenidos desde el servicio backend.
   *
   * @remarks
   * Incluye:
   * - reportes estratégicos
   * - análisis estratégico consolidado
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

        {/* ── Hero banner con breadcrumb + KPIs inline ── */}
        <ReportsHeroBanner analysis={data.strategicAnalysis} />

        {/* ── Grid: lista de reportes + panel analítico ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* Lista de reportes — 7 columnas */}
          <div className="lg:col-span-7">
            <AnimatedCard delay={0.06}>
              <ReportsList reports={data.strategicReports} />
            </AnimatedCard>
          </div>

          {/* Panel de análisis estratégico — 5 columnas */}
          <aside className="lg:col-span-5">
            <AnimatedCard delay={0.14}>
              <StrategicAnalysisPanel analysis={data.strategicAnalysis} />
            </AnimatedCard>
          </aside>

        </div>
      </div>
    </main>
  );
}