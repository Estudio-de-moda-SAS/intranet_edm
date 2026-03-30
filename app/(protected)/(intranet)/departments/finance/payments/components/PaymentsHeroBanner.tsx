// ✅ SERVER COMPONENT — sin "use client"
import Link from 'next/link';
import { ChevronRight, CreditCard, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Payment } from '@/lib/graph/departments/finance.service';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP',
    maximumFractionDigits: 0, notation: 'compact',
  }).format(n);

interface Props { payments: Payment[] }

export function PaymentsHeroBanner({ payments }: Props) {
  const pending   = payments.filter(p => p.status === 'Pendiente' || p.status === 'Programado');
  const inProcess = payments.filter(p => p.status === 'En proceso');
  const completed = payments.filter(p => p.status === 'Completado');

  const totalPending   = pending.reduce((s, p) => s + p.amount, 0);
  const totalCompleted = completed.reduce((s, p) => s + p.amount, 0);

  // Pagos que vencen en los próximos 7 días
  const today   = new Date();
  const in7days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const urgent  = pending.filter(p => new Date(p.dueDate) <= in7days);

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
            <p className="text-[11px] text-amber-200 mt-0.5">{pending.length} pago{pending.length !== 1 ? 's' : ''} pendientes</p>
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
