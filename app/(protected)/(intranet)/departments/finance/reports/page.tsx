// ✅ SERVER COMPONENT — sin "use client"
// Ruta: app/(protected)/(intranet)/departments/finance/reports/page.tsx

import type { Metadata }              from 'next';
import { getFinanceData }             from '@/lib/graph/departments/finance.service';
import { AnimatedCard }               from '@/app/components/ui/animated/AnimatedCard';
import { ReportsHeroBanner }          from '@/app/(protected)/(intranet)/departments/finance/reports/components/ReportsHeroBanner';
import { ReportsList }                from '@/app/(protected)/(intranet)/departments/finance/reports/components/ReportsList';
import { StrategicAnalysisPanel }     from '@/app/(protected)/(intranet)/departments/finance/reports/components/StrategicAnalysisPanel';

export const metadata: Metadata = {
  title: 'Reportes · Finanzas',
  description: 'Reportes financieros e análisis estratégico — Estudio de Moda',
};

export default async function ReportsPage() {
  const data = await getFinanceData();

  return (
    <main
      className="min-h-screen w-full bg-[#f4f6f9]"
      style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
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