/**
 * @module financeVendorsPage
 * Página de gestión de proveedores y suministradores del módulo de Finanzas.
 *
 * @remarks
 * Este archivo define la vista principal del submódulo de proveedores
 * dentro del área de Finanzas.
 *
 * La página está orientada a gestión operativa y consulta, por lo que
 * adopta una estructura más sobria que la homepage principal del módulo.
 *
 * Su responsabilidad principal es:
 * - definir los metadatos de la página
 * - obtener los datos financieros requeridos
 * - renderizar la vista de proveedores con una composición estructurada
 *
 * La interfaz se organiza en tres bloques principales:
 * - encabezado de página con breadcrumb
 * - franja de métricas del módulo de proveedores
 * - grid principal con tabla y panel lateral de ranking
 *
 * El componente se ejecuta en servidor, permitiendo resolver
 * la carga inicial de datos antes del render.
 */

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

/**
 * Metadatos de la página de proveedores.
 *
 * @remarks
 * Estos metadatos se utilizan para definir el título y la descripción
 * de la página en el contexto del navegador y de la aplicación.
 */
export const metadata: Metadata = {
  title: 'Proveedores · Finanzas',
  description: 'Gestión de proveedores y suministradores — Estudio de Moda',
};

/**
 * Página principal del submódulo de proveedores y suministradores.
 *
 * @returns La vista de gestión de proveedores del módulo de Finanzas.
 *
 * @remarks
 * Este componente actúa como punto de entrada de la vista de proveedores
 * y coordina dos responsabilidades principales:
 *
 * 1. **Obtención de datos**
 *    Recupera la información financiera mediante {@link getFinanceData},
 *    incluyendo el conjunto de proveedores consumido por los componentes hijos.
 *
 * 2. **Composición de la interfaz**
 *    Organiza la página en una estructura funcional de gestión:
 *    - encabezado con breadcrumb y contexto visual
 *    - franja de KPIs de proveedores
 *    - tabla principal de registros
 *    - panel lateral de ranking y apoyo analítico
 *
 * A diferencia de otras vistas más orientadas a presentación ejecutiva,
 * esta página privilegia una estructura más sobria y utilitaria,
 * adecuada para tareas de control, consulta y seguimiento documental.
 *
 * @example
 * ```tsx
 * <VendorsPage />
 * ```
 */
export default async function VendorsPage() {
  /**
   * Dataset financiero cargado para la página.
   *
   * @remarks
   * La propiedad `vendors` de este objeto alimenta los componentes
   * especializados del submódulo de proveedores.
   */
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