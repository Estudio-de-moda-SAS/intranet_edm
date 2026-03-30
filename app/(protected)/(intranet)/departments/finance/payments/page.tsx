// ✅ SERVER COMPONENT — sin "use client"
// Ruta: app/(protected)/(intranet)/departments/finance/payments/page.tsx

import type { Metadata }         from 'next';
import { getFinanceData }        from '@/lib/graph/departments/finance.service';
import { AnimatedCard }          from '@/app/components/ui/animated/AnimatedCard';
import { PaymentsHeroBanner }    from '@/app/(protected)/(intranet)/departments/finance/payments/components/PaymentsHeroBanner';
import { PaymentsDashboard }     from '@/app/(protected)/(intranet)/departments/finance/payments/components/PaymentsDashboard';

export const metadata: Metadata = {
  title: 'Pagos · Finanzas',
  description: 'Gestión de pagos salientes y directorio de proveedores — Estudio de Moda',
};

export default async function PaymentsPage() {
  const data = await getFinanceData();

  return (
    <main
      className="min-h-screen w-full bg-[#f4f6f9]"
      style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
    >
      <div className="px-4 pb-10 pt-6 lg:px-14">

        {/* ── Hero banner: breadcrumb + KPIs urgentes ── */}
        <PaymentsHeroBanner payments={data.payments} />

        {/* ── Dashboard con tabs ── */}
        <AnimatedCard delay={0.08}>
          <PaymentsDashboard
            payments={data.payments}
            suppliers={data.suppliers}
          />
        </AnimatedCard>

      </div>
    </main>
  );
}