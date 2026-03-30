// ✅ SERVER COMPONENT — sin "use client"
// Ruta: app/(protected)/(intranet)/departments/finance/vendors/page.tsx

import type { Metadata }          from 'next';
import Link                        from 'next/link';
import { ChevronRight, Building2 } from 'lucide-react';
import { getFinanceData }          from '@/lib/graph/departments/finance.service';
import { AnimatedCard }            from '@/app/components/ui/animated/AnimatedCard';
import { VendorStatsStrip }        from '@/app/(protected)/(intranet)/departments/finance/vendors/components/VendorStatsStrip';
import { VendorTable }             from '@/app/(protected)/(intranet)/departments/finance/vendors/components/VendorTable';
import { VendorRankingPanel }      from '@/app/(protected)/(intranet)/departments/finance/vendors/components/VendorRankingPanel';

export const metadata: Metadata = {
  title: 'Proveedores · Finanzas',
  description: 'Gestión de proveedores y suministradores — Estudio de Moda',
};

export default async function VendorsPage() {
  const data = await getFinanceData();

  return (
    <main
      className="min-h-screen w-full bg-[#f4f6f9]"
      style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
    >
      <div className="px-4 pb-10 pt-6 lg:px-14">

        {/* ── Page header — sin hero banner, más sobrio para un módulo de gestión ── */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-2">
            <Link href="/departments/finance" className="hover:text-cyan-600 transition-colors">
              Finanzas
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-cyan-600 font-medium">Proveedores y suministradores</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-100 border border-cyan-200 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-[26px] font-bold tracking-tight text-slate-900 leading-tight">
                Proveedores y suministradores
              </h1>
              <p className="text-[13px] text-slate-400 mt-0.5">
                Directorio maestro, evaluación de desempeño y gestión documental
              </p>
            </div>
          </div>
        </div>

        {/* ── KPI strip ── */}
        <VendorStatsStrip vendors={data.vendors} />

        {/* ── Grid principal: tabla + ranking ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* Tabla — 8 columnas */}
          <div className="lg:col-span-8">
            <AnimatedCard delay={0.06}>
              <div className="rounded-2xl bg-white border border-slate-100 shadow-sm shadow-slate-100 p-5">
                <VendorTable vendors={data.vendors} />
              </div>
            </AnimatedCard>
          </div>

          {/* Ranking y categorías — 4 columnas */}
          <aside className="lg:col-span-4">
            <AnimatedCard delay={0.14}>
              <VendorRankingPanel vendors={data.vendors} />
            </AnimatedCard>
          </aside>

        </div>
      </div>
    </main>
  );
}