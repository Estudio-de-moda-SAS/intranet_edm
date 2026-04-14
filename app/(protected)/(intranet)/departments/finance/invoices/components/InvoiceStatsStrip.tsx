/**
 * @module InvoiceStatsStrip
 * Franja de indicadores resumidos para facturas del módulo financiero.
 *
 * @remarks
 * Este componente presenta métricas agregadas construidas a partir
 * de la lista de facturas recibida.
 *
 * Incluye indicadores como:
 *
 * - total de facturas
 * - facturas pendientes
 * - facturas aprobadas
 * - monto pendiente
 * - monto pagado en el período
 * - facturas rechazadas
 *
 * Su objetivo es ofrecer una lectura rápida del estado general
 * de la operación de facturación.
 */

// ✅ SERVER COMPONENT — sin "use client"
// Recibe las invoices como prop desde page.tsx (que ya hizo el await)

import {
  FileText, Clock, CheckCircle2, Banknote, XCircle, AlertTriangle,
} from 'lucide-react';
import type { Invoice } from '@/lib/graph/departments/finance.service';

/* -------------------------------------------------------------------------- */
/* Formateador                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Formatea un valor numérico como moneda COP.
 *
 * @param n Valor monetario a formatear.
 * @returns Cadena formateada en pesos colombianos.
 *
 * @remarks
 * Cuando el valor es igual o superior a un millón,
 * se utiliza notación compacta para ahorrar espacio visual.
 */
const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
    notation: n >= 1_000_000 ? 'compact' : 'standard',
  }).format(n);

/* -------------------------------------------------------------------------- */
/* Props                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Props del componente {@link InvoiceStatsStrip}.
 *
 * @property invoices Lista de facturas utilizada para calcular los indicadores.
 */
interface Props {
  invoices: Invoice[];
}

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Franja de estadísticas de facturas.
 *
 * @param props Propiedades del componente.
 * @returns Conjunto de tarjetas con indicadores clave del estado de facturación.
 *
 * @remarks
 * Este componente resume la operación de facturas mediante
 * conteos y montos agregados.
 *
 * Entre los cálculos realizados se incluyen:
 * - conteo por estado
 * - total pendiente incluyendo vencidas
 * - total pagado en el período
 *
 * El monto pendiente se construye sumando tanto facturas
 * pendientes como facturas vencidas, incluyendo IVA.
 *
 * @example
 * ```tsx
 * <InvoiceStatsStrip invoices={invoices} />
 * ```
 */
export function InvoiceStatsStrip({ invoices }: Props) {
  /**
   * Facturas en estado pendiente.
   */
  const pending = invoices.filter(i => i.status === 'Pendiente');

  /**
   * Facturas aprobadas y listas para pago.
   */
  const approved = invoices.filter(i => i.status === 'Aprobada');

  /**
   * Facturas pagadas dentro del período mostrado.
   */
  const paid = invoices.filter(i => i.status === 'Pagada');

  /**
   * Facturas rechazadas que requieren revisión o corrección.
   */
  const rejected = invoices.filter(i => i.status === 'Rechazada');

  /**
   * Facturas vencidas.
   */
  const overdue = invoices.filter(i => i.status === 'Vencida');

  /**
   * Monto total pendiente de pago.
   *
   * @remarks
   * Incluye tanto facturas pendientes como vencidas,
   * y suma el subtotal más el IVA.
   */
  const amountPending = [...pending, ...overdue].reduce((s, i) => s + i.amount + i.tax, 0);

  /**
   * Monto total pagado en el período.
   *
   * @remarks
   * El cálculo incluye subtotal e IVA.
   */
  const amountPaid = paid.reduce((s, i) => s + i.amount + i.tax, 0);

  /**
   * Definición de tarjetas estadísticas a renderizar.
   *
   * @remarks
   * Cada objeto encapsula el contenido y la configuración visual
   * de una métrica dentro de la franja.
   */
  const stats = [
    {
      label: 'Total facturas',
      value: invoices.length,
      sub: 'en el período',
      icon: FileText,
      accent: 'bg-violet-500',
      textAccent: 'text-violet-600',
    },
    {
      label: 'Pendientes',
      value: pending.length,
      sub: overdue.length > 0
        ? `${overdue.length} vencida${overdue.length > 1 ? 's' : ''}`
        : 'Al día',
      icon: overdue.length > 0 ? AlertTriangle : Clock,
      accent: overdue.length > 0 ? 'bg-amber-500' : 'bg-amber-400',
      textAccent: overdue.length > 0 ? 'text-amber-600' : 'text-amber-500',
    },
    {
      label: 'Aprobadas',
      value: approved.length,
      sub: 'listas para pago',
      icon: CheckCircle2,
      accent: 'bg-emerald-500',
      textAccent: 'text-emerald-600',
    },
    {
      label: 'Monto pendiente',
      value: fmt(amountPending),
      sub: 'incl. IVA',
      icon: Clock,
      accent: 'bg-orange-400',
      textAccent: 'text-orange-600',
    },
    {
      label: 'Pagado (período)',
      value: fmt(amountPaid),
      sub: `${paid.length} factura${paid.length !== 1 ? 's' : ''}`,
      icon: Banknote,
      accent: 'bg-teal-500',
      textAccent: 'text-teal-600',
    },
    {
      label: 'Rechazadas',
      value: rejected.length,
      sub: 'requieren revisión',
      icon: XCircle,
      accent: 'bg-red-400',
      textAccent: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6 mb-6">
      {stats.map((st) => {
        const Icon = st.icon;

        return (
          <div
            key={st.label}
            className="relative overflow-hidden rounded-2xl border border-white bg-white p-4 shadow-sm shadow-slate-100"
          >
            <div className={`pointer-events-none absolute -right-3 -top-3 h-14 w-14 rounded-full opacity-[0.12] ${st.accent}`} />
            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-xl mb-2.5 ${st.accent} bg-opacity-[0.12]`}>
              <Icon className={`h-4 w-4 ${st.textAccent}`} />
            </div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 leading-none">
              {st.label}
            </p>
            <p className={`mt-1 text-xl font-bold leading-none ${st.textAccent}`}>
              {st.value}
            </p>
            {st.sub && (
              <p className="mt-1 text-[11px] text-slate-400 leading-tight">{st.sub}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}