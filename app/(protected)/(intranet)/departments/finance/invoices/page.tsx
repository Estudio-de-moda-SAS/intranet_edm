// ✅ SERVER COMPONENT — sin "use client"
// Ruta: app/(protected)/(intranet)/departments/finance/facturas/page.tsx

import { InvoicePageHeader } from '@/app/(protected)/(intranet)/departments/finance/invoices/components/InvoicePageHeader';
import { InvoiceStatsStrip } from '@/app/(protected)/(intranet)/departments/finance/invoices/components/InvoiceStatsStrip';
import { InvoiceTable }      from '@/app/(protected)/(intranet)/departments/finance/invoices/components/InvoiceTable';
import { AnimatedCard }      from '@/app/components/ui/animated/AnimatedCard';
import { getFinanceData }    from '@/lib/graph/departments/finance.service';

export const metadata = {
  title: 'Facturas · Finanzas',
  description: 'Gestión de facturas de proveedores — Estudio de Moda',
};

export default async function FacturasPage() {
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
        <InvoicePageHeader />

        {/* ── KPI strip — recibe invoices ya resueltas ── */}
        <InvoiceStatsStrip invoices={data.invoices} />

        {/* ── Tabla interactiva — recibe invoices ya resueltas ── */}
        <AnimatedCard delay={0.1}>
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm shadow-slate-100 p-5">
            <InvoiceTable invoices={data.invoices} />
          </div>
        </AnimatedCard>

      </div>
    </main>
  );
}