/**
 * @module FacturasPage
 * Página principal de gestión de facturas del módulo financiero.
 *
 * @remarks
 * Este módulo define una ruta server de Next.js encargada de
 * renderizar la vista de facturas de proveedores.
 *
 * La página integra:
 *
 * - encabezado principal con contexto de navegación
 * - franja de indicadores clave de facturación
 * - tabla interactiva de facturas
 *
 * Su objetivo es centralizar la consulta y revisión
 * de facturas asociadas a proveedores del área financiera.
 */

// ✅ SERVER COMPONENT — sin "use client"
// Ruta: app/(protected)/(intranet)/departments/finance/facturas/page.tsx

import { InvoicePageHeader } from '@/app/(protected)/(intranet)/departments/finance/invoices/components/InvoicePageHeader';
import { InvoiceStatsStrip } from '@/app/(protected)/(intranet)/departments/finance/invoices/components/InvoiceStatsStrip';
import { InvoiceTable } from '@/app/(protected)/(intranet)/departments/finance/invoices/components/InvoiceTable';
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
  title: 'Facturas · Finanzas',
  description: 'Gestión de facturas de proveedores — Estudio de Moda',
};

/**
 * Página de facturas del módulo financiero.
 *
 * @returns Vista completa de facturas con encabezado, métricas y tabla interactiva.
 *
 * @remarks
 * Este componente:
 * - obtiene los datos financieros mediante {@link getFinanceData}
 * - renderiza un encabezado de página con contexto visual
 * - muestra una franja de indicadores basada en las facturas
 * - presenta una tabla interactiva para explorar el listado de facturas
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
export default async function FacturasPage() {
  /**
   * Datos financieros obtenidos desde el servicio backend.
   *
   * @remarks
   * En esta vista se consumen principalmente
   * las facturas disponibles en `data.invoices`.
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