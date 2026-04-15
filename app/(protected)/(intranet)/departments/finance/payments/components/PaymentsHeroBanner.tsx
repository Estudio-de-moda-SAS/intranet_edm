/**
 * @module PaymentsHeroBanner
 * Banner principal de la sección de pagos del módulo financiero.
 *
 * @remarks
 * Este componente actúa como encabezado visual y ejecutivo
 * de la vista de pagos salientes.
 *
 * Incluye:
 *
 * - breadcrumb de navegación
 * - título principal del módulo
 * - resumen de registros disponibles
 * - indicadores clave de pagos pendientes, urgentes y completados
 * - alerta visual de pagos actualmente en proceso
 *
 * Su objetivo es ofrecer una lectura rápida del estado general
 * de las obligaciones de pago a proveedores.
 */

// ✅ SERVER COMPONENT — sin "use client"
import Link from 'next/link';
import { ChevronRight, CreditCard, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Payment } from '@/lib/graph/departments/finance.service';

/**
 * Formatea un valor numérico como moneda COP en notación compacta.
 *
 * @param n Valor monetario a formatear.
 * @returns Cadena formateada en pesos colombianos.
 *
 * @remarks
 * Se utiliza para mostrar montos agregados dentro
 * de los indicadores principales del banner.
 */
const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
    notation: 'compact',
  }).format(n);

/**
 * Props del componente {@link PaymentsHeroBanner}.
 *
 * @property payments Lista de pagos utilizada para construir los indicadores del banner.
 */
interface Props {
  payments: Payment[];
}

/**
 * Banner principal de pagos salientes.
 *
 * @param props Propiedades del componente.
 * @returns Encabezado visual con resumen ejecutivo del estado de pagos.
 *
 * @remarks
 * Este componente construye métricas clave a partir de la lista de pagos:
 *
 * - pagos pendientes o programados
 * - pagos en proceso
 * - pagos completados
 * - monto total pendiente
 * - monto total completado
 * - pagos urgentes con vencimiento próximo
 *
 * También resalta visualmente la existencia de pagos
 * en proceso de transferencia bancaria.
 *
 * @example
 * ```tsx
 * <PaymentsHeroBanner payments={payments} />
 * ```
 */
export function PaymentsHeroBanner({ payments }: Props) {
  /**
   * Pagos que aún no han sido completados y requieren seguimiento.
   *
   * @remarks
   * Incluye tanto pagos en estado `Pendiente`
   * como pagos `Programado`.
   */
  const pending = payments.filter(p => p.status === 'Pendiente' || p.status === 'Programado');

  /**
   * Pagos actualmente en proceso de ejecución o transferencia.
   */
  const inProcess = payments.filter(p => p.status === 'En proceso');

  /**
   * Pagos finalizados correctamente.
   */
  const completed = payments.filter(p => p.status === 'Completado');

  /**
   * Monto total acumulado de pagos pendientes o programados.
   */
  const totalPending = pending.reduce((s, p) => s + p.amount, 0);

  /**
   * Monto total acumulado de pagos completados.
   */
  const totalCompleted = completed.reduce((s, p) => s + p.amount, 0);

  /**
   * Fecha actual de referencia para calcular vencimientos próximos.
   */
  const today = new Date();

  /**
   * Fecha límite equivalente a los próximos siete días.
   *
   * @remarks
   * Se utiliza para identificar pagos urgentes
   * cuyo vencimiento está próximo.
   */
  const in7days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  /**
   * Pagos urgentes con vencimiento dentro de los próximos siete días.
   *
   * @remarks
   * Solo se consideran pagos que aún están pendientes
   * o programados.
   */
  const urgent = pending.filter(p => new Date(p.dueDate) <= in7days);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 mb-6 shadow-lg shadow-amber-200">
      {/* Blobs */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute right-16 -bottom-6 h-28 w-28 rounded-full bg-white/5" />

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[11px] text-amber-200 mb-4">
        <Link href="/departments/finance" className="hover:text-white transition-colors">
          Finanzas
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white font-medium">Pagos y proveedores</span>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Title */}
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-[24px] font-bold text-white tracking-tight leading-tight">
              Pagos salientes
            </h1>
          </div>
          <p className="text-[13px] text-amber-200 mt-1 ml-11">
            Gestión de pagos a proveedores · {payments.length} registros
          </p>
        </div>

        {/* KPI pills */}
        <div className="flex flex-wrap gap-3 lg:shrink-0">
          <div className="rounded-xl bg-white/15 backdrop-blur-sm px-4 py-3 min-w-[130px]">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="h-3.5 w-3.5 text-amber-200" />
              <p className="text-[10px] font-semibold text-amber-200 uppercase tracking-wide">Por pagar</p>
            </div>
            <p className="text-[20px] font-bold text-white leading-tight">{fmt(totalPending)}</p>
            <p className="text-[11px] text-amber-200 mt-0.5">
              {pending.length} pago{pending.length !== 1 ? 's' : ''} pendientes
            </p>
          </div>

          <div className="rounded-xl bg-white/15 backdrop-blur-sm px-4 py-3 min-w-[130px]">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertCircle className="h-3.5 w-3.5 text-amber-200" />
              <p className="text-[10px] font-semibold text-amber-200 uppercase tracking-wide">Urgentes</p>
            </div>
            <p className="text-[20px] font-bold text-white leading-tight">{urgent.length}</p>
            <p className="text-[11px] text-amber-200 mt-0.5">vencen en 7 días</p>
          </div>

          <div className="rounded-xl bg-white/15 backdrop-blur-sm px-4 py-3 min-w-[130px]">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-200" />
              <p className="text-[10px] font-semibold text-amber-200 uppercase tracking-wide">Pagado</p>
            </div>
            <p className="text-[20px] font-bold text-white leading-tight">{fmt(totalCompleted)}</p>
            <p className="text-[11px] text-amber-200 mt-0.5">{completed.length} completados</p>
          </div>
        </div>
      </div>

      {/* En proceso badge */}
      {inProcess.length > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
          <p className="text-[12px] text-amber-100 font-medium">
            {inProcess.length} pago{inProcess.length !== 1 ? 's' : ''} en proceso de transferencia bancaria
          </p>
        </div>
      )}
    </div>
  );
}