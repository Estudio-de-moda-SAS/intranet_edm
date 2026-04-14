/**
 * @module PaymentsPage
 * Página principal de gestión de pagos del módulo financiero.
 *
 * @remarks
 * Este módulo define una ruta server de Next.js encargada de
 * renderizar la vista de pagos y proveedores asociados.
 *
 * La página integra:
 *
 * - banner principal con indicadores clave de pagos
 * - dashboard interactivo con información de pagos y proveedores
 *
 * Su objetivo es centralizar la visualización y gestión
 * de obligaciones financieras salientes.
 */

// ✅ SERVER COMPONENT — sin "use client"
// Ruta: app/(protected)/(intranet)/departments/finance/payments/page.tsx

import type { Metadata } from 'next';
import { getFinanceData } from '@/lib/graph/departments/finance.service';
import { AnimatedCard } from '@/app/components/ui/animated/AnimatedCard';
import { PaymentsHeroBanner } from '@/app/(protected)/(intranet)/departments/finance/payments/components/PaymentsHeroBanner';
import { PaymentsDashboard } from '@/app/(protected)/(intranet)/departments/finance/payments/components/PaymentsDashboard';

/**
 * Metadatos de la página para SEO y configuración del documento.
 *
 * @remarks
 * Define el título y descripción utilizados por Next.js
 * en la cabecera del documento HTML.
 */
export const metadata: Metadata = {
  title: 'Pagos · Finanzas',
  description: 'Gestión de pagos salientes y directorio de proveedores — Estudio de Moda',
};

/**
 * Página de pagos financieros.
 *
 * @returns Vista completa del módulo de pagos con resumen y dashboard.
 *
 * @remarks
 * Este componente:
 * - obtiene los datos financieros mediante {@link getFinanceData}
 * - renderiza un banner superior con KPIs relacionados a pagos
 * - muestra un dashboard interactivo con:
 *   - listado de pagos
 *   - información de proveedores
 *
 * La estructura es simple y está orientada a priorizar
 * la visualización del dashboard como bloque principal.
 *
 * Se utiliza {@link AnimatedCard} para mejorar la transición
 * visual del contenido al cargar la página.
 *
 * @example
 * ```tsx
 * // Renderizado automático por Next.js en la ruta correspondiente
 * ```
 */
export default async function PaymentsPage() {
  /**
   * Datos financieros obtenidos desde el servicio backend.
   *
   * @remarks
   * Incluye:
   * - pagos registrados
   * - proveedores asociados
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