// ✅ SERVER COMPONENT — sin "use client"
// Ruta: app/(protected)/(intranet)/departments/finance/expenses/page.tsx

import type { Metadata }         from 'next';
import { getFinanceData }        from '@/lib/graph/departments/finance.service';
import { AnimatedCard }          from '@/app/components/ui/animated/AnimatedCard';
import { ExpensePageHeader }     from '@/app/(protected)/(intranet)/departments/finance/expenses/components/ExpensePageHeader';
import { ExpenseStatsStrip }     from '@/app/(protected)/(intranet)/departments/finance/expenses/components/ExpenseStatsStrip';
import { ExpenseBudgetBar }      from '@/app/(protected)/(intranet)/departments/finance/expenses/components/ExpenseBudgetBar';
import { ExpenseTable }          from '@/app/(protected)/(intranet)/departments/finance/expenses/components/ExpenseTable';

export const metadata: Metadata = {
  title: 'Gastos · Finanzas',
  description: 'Registro y control de gastos operativos — Estudio de Moda',
};

export default async function ExpensesPage() {
  const data = await getFinanceData();

  return (
    <main
      className="min-h-screen w-full bg-[#f4f6f9]"
      style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
    >
      <div className="px-4 pb-10 pt-6 lg:px-14">

        {/* ── Breadcrumb + título ── */}
        <ExpensePageHeader />

        {/* ── KPI strip ── */}
        <ExpenseStatsStrip expenses={data.expenses} />

        {/* ── Grid: tabla principal + presupuesto por área ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* Tabla — ocupa 8 columnas */}
          <div className="lg:col-span-8">
            <AnimatedCard delay={0.08}>
              <div className="rounded-2xl bg-white border border-slate-100 shadow-sm shadow-slate-100 p-5">
                <ExpenseTable expenses={data.expenses} />
              </div>
            </AnimatedCard>
          </div>

          {/* Sidebar — presupuesto por área */}
          <aside className="lg:col-span-4">
            <AnimatedCard delay={0.16}>
              <ExpenseBudgetBar expenses={data.expenses} budgets={data.budgets} />
            </AnimatedCard>
          </aside>

        </div>
      </div>
    </main>
  );
}