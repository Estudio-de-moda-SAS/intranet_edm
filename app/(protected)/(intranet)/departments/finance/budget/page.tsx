// ✅ SERVER COMPONENT — sin "use client"
// Ruta: app/(protected)/(intranet)/departments/finance/budget/page.tsx

import type { Metadata }       from 'next';
import { getFinanceData }      from '@/lib/graph/departments/finance.service';
import { AnimatedCard }        from '@/app/components/ui/animated/AnimatedCard';
import { BudgetPageHeader }    from '@/app/(protected)/(intranet)/departments/finance/budget/components/BudgetPageHeader';
import { BudgetStatsStrip }    from '@/app/(protected)/(intranet)/departments/finance/budget/components/BudgetStatsStrip';
import { BudgetDashboard }     from '@/app/(protected)/(intranet)/departments/finance/budget/components/BudgetDashboard';

export const metadata: Metadata = {
  title: 'Presupuesto · Finanzas',
  description: 'Asignaciones y ejecución presupuestaria por departamento — Estudio de Moda',
};

export default async function BudgetPage() {
  const data = await getFinanceData();

  return (
    <main
      className="min-h-screen w-full bg-[#f4f6f9]"
      style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
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