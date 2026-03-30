'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, CheckCircle2, XCircle, Send,
  Building2, Search, Eye, Download, X,
  AlertCircle, Calendar, CreditCard,
  RefreshCw, 
  Landmark, Phone, Mail, 
} from 'lucide-react';
import type {
  Payment, PaymentStatus,
  Supplier,
} from '@/lib/graph/departments/finance.service';

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<PaymentStatus, {
  label: string; dotColor: string; badgeBg: string; badgeText: string;
  border: string; icon: React.ElementType;
}> = {
  'Pendiente':   { label: 'Pendiente',   dotColor: 'bg-amber-400',   badgeBg: 'bg-amber-50',   badgeText: 'text-amber-700',   border: 'border-amber-200',   icon: Clock        },
  'Programado':  { label: 'Programado',  dotColor: 'bg-blue-400',    badgeBg: 'bg-blue-50',    badgeText: 'text-blue-700',    border: 'border-blue-200',    icon: Calendar     },
  'En proceso':  { label: 'En proceso',  dotColor: 'bg-violet-400',  badgeBg: 'bg-violet-50',  badgeText: 'text-violet-700', border: 'border-violet-200',  icon: RefreshCw    },
  'Completado':  { label: 'Completado',  dotColor: 'bg-emerald-400', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700',border: 'border-emerald-200', icon: CheckCircle2 },
  'Rechazado':   { label: 'Rechazado',   dotColor: 'bg-red-400',     badgeBg: 'bg-red-50',     badgeText: 'text-red-700',    border: 'border-red-200',     icon: XCircle      },
};

const SUPPLIER_STATUS_CFG = {
  'Activo':      { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Inactivo':    { bg: 'bg-slate-50',   text: 'text-slate-500',   border: 'border-slate-200'   },
  'En revisión': { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'   },
};

type Tab = 'pending' | 'history' | 'suppliers';

const fmtCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const fmtCompact = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0, notation: 'compact' }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const isUrgent = (p: Payment) => {
  if (p.status !== 'Pendiente' && p.status !== 'Programado') return false;
  const diff = new Date(p.dueDate).getTime() - Date.now();
  return diff <= 7 * 24 * 60 * 60 * 1000;
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props { payments: Payment[]; suppliers: Supplier[] }

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = STATUS_CFG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap
                      ${cfg.badgeBg} ${cfg.badgeText} ${cfg.border}`}>
      <Icon className={`h-3 w-3 ${status === 'En proceso' ? 'animate-spin' : ''}`} />
      {cfg.label}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{children}</h3>;
}

// ─── Payment Drawer ───────────────────────────────────────────────────────────

function PaymentDrawer({ payment: p, onClose }: { payment: Payment; onClose: () => void }) {
  const cfg     = STATUS_CFG[p.status];
  const urgent  = isUrgent(p);

  return (
    <AnimatePresence>
      <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <motion.aside key="dr" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 z-50 h-full w-full max-w-[460px] bg-white shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1 w-full bg-amber-500 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="font-mono text-[15px] font-bold text-slate-800">{p.number}</p>
              <p className="text-[11px] text-slate-400">Ref. factura: {p.invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Status */}
          <div className={`rounded-xl border p-4 ${cfg.badgeBg} ${cfg.border}`}>
            <div className="flex items-center justify-between">
              <StatusBadge status={p.status} />
              {urgent && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full px-2.5 py-1">
                  <AlertCircle className="h-3 w-3" /> Urgente
                </span>
              )}
            </div>
            {p.approvedBy && (
              <p className="mt-2 text-[12px] text-slate-500">
                Aprobado por <span className="font-semibold text-slate-700">{p.approvedBy}</span>
              </p>
            )}
            {p.reference && (
              <p className="mt-1 text-[11px] text-slate-400 font-mono">Ref. bancaria: {p.reference}</p>
            )}
          </div>

          {/* Proveedor */}
          <section>
            <SectionLabel>Proveedor beneficiario</SectionLabel>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <p className="text-[14px] font-semibold text-slate-800">{p.supplier}</p>
              </div>
              <p className="text-[12px] text-slate-500 pl-5">NIT: {p.supplierNit}</p>
              <div className="flex items-center gap-2 pl-5">
                <Landmark className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <p className="text-[12px] text-slate-500">{p.supplierBank} · {p.supplierAccount}</p>
              </div>
            </div>
          </section>

          {/* Fechas */}
          <section>
            <SectionLabel>Fechas clave</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              {([
                ['Vencimiento', p.dueDate],
                ['Programado',  p.scheduledDate],
                ['Pagado',      p.paidDate],
              ] as [string, string | undefined][]).map(([label, date]) => (
                <div key={label} className={`rounded-xl border bg-slate-50/70 p-3 text-center ${
                  !date ? 'opacity-40' : ''
                } border-slate-100`}>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</p>
                  <p className="text-[12px] font-semibold text-slate-700 mt-1 leading-tight">
                    {date ? fmtDate(date) : '—'}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Monto y método */}
          <section>
            <SectionLabel>Detalle del pago</SectionLabel>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <div className="flex justify-between px-4 py-3 border-b border-slate-50">
                <span className="text-[13px] text-slate-500">Método</span>
                <span className="text-[13px] font-medium text-slate-700">{p.method}</span>
              </div>
              <div className="flex justify-between px-4 py-3 border-b border-slate-50">
                <span className="text-[13px] text-slate-500">Factura origen</span>
                <span className="text-[13px] font-mono font-medium text-slate-700">{p.invoiceNumber}</span>
              </div>
              <div className="flex justify-between px-4 py-3.5 bg-amber-50 border-t border-amber-100">
                <span className="text-[13px] font-bold text-amber-800">Total a pagar</span>
                <span className="text-[15px] font-bold text-amber-800">{fmtCOP(p.amount)}</span>
              </div>
            </div>
          </section>

          {p.notes && (
            <section>
              <SectionLabel>Observaciones</SectionLabel>
              <p className="text-[13px] text-slate-600 bg-slate-50 rounded-xl p-4 border border-slate-100 leading-relaxed">{p.notes}</p>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 flex gap-2.5 shrink-0">
          {p.status === 'Pendiente' && (
            <>
              <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2.5 text-[13px] font-semibold text-white hover:bg-amber-600 transition-colors shadow-sm">
                <Calendar className="h-4 w-4" /> Programar pago
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-[13px] font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm">
                <Send className="h-4 w-4" /> Pagar ahora
              </button>
            </>
          )}
          {p.status === 'Programado' && (
            <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-[13px] font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm">
              <Send className="h-4 w-4" /> Ejecutar pago
            </button>
          )}
          {p.status === 'Completado' && (
            <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
              <Download className="h-4 w-4" /> Comprobante
            </button>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

// ─── Supplier Drawer ──────────────────────────────────────────────────────────

function SupplierDrawer({ supplier: s, onClose }: { supplier: Supplier; onClose: () => void }) {
  const cfg = SUPPLIER_STATUS_CFG[s.status];
  return (
    <AnimatePresence>
      <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <motion.aside key="dr" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 z-50 h-full w-full max-w-[440px] bg-white shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1 w-full bg-amber-500 shrink-0" />
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-slate-800 leading-tight">{s.name}</p>
              <p className="text-[11px] text-slate-400">NIT: {s.nit}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Estado */}
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            {s.status}
          </span>

          {/* Contacto */}
          <section>
            <SectionLabel>Contacto</SectionLabel>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <p className="text-[13px] text-slate-700">{s.email}</p>
              </div>
              {s.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <p className="text-[13px] text-slate-700">{s.phone}</p>
                </div>
              )}
            </div>
          </section>

          {/* Datos bancarios */}
          <section>
            <SectionLabel>Datos bancarios</SectionLabel>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <div className="flex justify-between px-4 py-3 border-b border-slate-50">
                <span className="text-[13px] text-slate-500">Banco</span>
                <span className="text-[13px] font-medium text-slate-700">{s.bank}</span>
              </div>
              <div className="flex justify-between px-4 py-3 border-b border-slate-50">
                <span className="text-[13px] text-slate-500">Tipo</span>
                <span className="text-[13px] font-medium text-slate-700">{s.accountType}</span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-[13px] text-slate-500">Cuenta</span>
                <span className="text-[13px] font-mono font-semibold text-slate-700">{s.account}</span>
              </div>
            </div>
          </section>

          {/* Métricas */}
          <section>
            <SectionLabel>Histórico de pagos</SectionLabel>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <div className="flex justify-between px-4 py-3 border-b border-slate-50">
                <span className="text-[13px] text-slate-500">Total pagado</span>
                <span className="text-[13px] font-semibold text-emerald-600">{fmtCOP(s.totalPaid)}</span>
              </div>
              <div className="flex justify-between px-4 py-3 border-b border-slate-50">
                <span className="text-[13px] text-slate-500">Pendiente</span>
                <span className={`text-[13px] font-semibold ${s.totalPending > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {fmtCOP(s.totalPending)}
                </span>
              </div>
              <div className="flex justify-between px-4 py-3 border-b border-slate-50">
                <span className="text-[13px] text-slate-500">Facturas</span>
                <span className="text-[13px] font-medium text-slate-700">{s.invoiceCount}</span>
              </div>
              {s.lastPayment && (
                <div className="flex justify-between px-4 py-3">
                  <span className="text-[13px] text-slate-500">Último pago</span>
                  <span className="text-[13px] font-medium text-slate-700">{fmtDate(s.lastPayment)}</span>
                </div>
              )}
            </div>
          </section>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

// ─── Pending tab ──────────────────────────────────────────────────────────────

function PendingPayments({ payments, onSelect }: { payments: Payment[]; onSelect: (p: Payment) => void }) {
  const pending = payments
    .filter(p => p.status === 'Pendiente' || p.status === 'Programado' || p.status === 'En proceso')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  if (pending.length === 0) {
    return (
      <div className="py-16 text-center">
        <CheckCircle2 className="h-8 w-8 text-emerald-200 mx-auto mb-2" />
        <p className="text-[13px] text-slate-400">No hay pagos pendientes. ¡Todo al día!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pending.map((p, i) => {
        const urgent = isUrgent(p);
        return (
          <motion.div key={p.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(p)}
            className={`group rounded-2xl border bg-white p-4 cursor-pointer transition-all hover:shadow-md ${
              urgent ? 'border-amber-200 hover:border-amber-300' : 'border-slate-100 hover:border-amber-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`mt-0.5 h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  urgent ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  <CreditCard className={`h-4 w-4 ${urgent ? 'text-amber-500' : 'text-slate-400'}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-semibold text-slate-800">{p.supplier}</p>
                    {urgent && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                        <AlertCircle className="h-2.5 w-2.5" /> Urgente
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-[11px] font-mono text-slate-400">{p.invoiceNumber}</span>
                    <span className="text-[11px] text-slate-400">{p.method}</span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Vence {fmtDate(p.dueDate)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[15px] font-bold text-slate-800">{fmtCompact(p.amount)}</p>
                <div className="mt-1">
                  <StatusBadge status={p.status} />
                </div>
              </div>
            </div>

            {/* Acciones rápidas visibles en hover */}
            <div className="mt-3 pt-3 border-t border-slate-50 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {p.status === 'Pendiente' && (
                <>
                  <button onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 transition-colors">
                    <Calendar className="h-3 w-3" /> Programar
                  </button>
                  <button onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700 transition-colors">
                    <Send className="h-3 w-3" /> Pagar ahora
                  </button>
                </>
              )}
              {p.status === 'Programado' && (
                <button onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700 transition-colors">
                  <Send className="h-3 w-3" /> Ejecutar pago
                </button>
              )}
              <button onClick={e => { e.stopPropagation(); onSelect(p); }}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors ml-auto">
                <Eye className="h-3 w-3" /> Ver detalle
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── History tab ──────────────────────────────────────────────────────────────

function PaymentHistory({ payments, onSelect }: { payments: Payment[]; onSelect: (p: Payment) => void }) {
  const [search, setSearch] = useState('');

  const history = useMemo(() => {
    let data = payments.filter(p => p.status === 'Completado' || p.status === 'Rechazado');
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(p =>
        p.supplier.toLowerCase().includes(q) ||
        p.number.toLowerCase().includes(q)   ||
        p.invoiceNumber.toLowerCase().includes(q),
      );
    }
    return data.sort((a, b) => (b.paidDate ?? b.dueDate).localeCompare(a.paidDate ?? a.dueDate));
  }, [payments, search]);

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        <input type="search" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar en historial…"
          className="w-full sm:w-64 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400
                     focus:outline-none focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-500/15 transition-all" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              <th className="py-3 pl-5 pr-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">Pago</th>
              <th className="py-3 px-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">Proveedor</th>
              <th className="py-3 px-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">Fecha</th>
              <th className="py-3 px-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">Monto</th>
              <th className="py-3 px-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">Estado</th>
              <th className="py-3 pl-3 pr-5 w-12" />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="wait">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <p className="text-[13px] text-slate-400">No se encontraron pagos.</p>
                  </td>
                </tr>
              ) : history.map((p, i) => (
                <motion.tr key={p.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => onSelect(p)}
                  className="group border-b border-slate-50 last:border-0 hover:bg-amber-50/30 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 pl-5 pr-3">
                    <p className="font-mono text-[12px] font-semibold text-slate-700">{p.number}</p>
                    <p className="text-[11px] text-slate-400">{p.invoiceNumber}</p>
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="text-[13px] font-medium text-slate-700">{p.supplier}</p>
                    <p className="text-[11px] text-slate-400">{p.method}</p>
                  </td>
                  <td className="py-3.5 px-3 text-[12px] text-slate-500">
                    {p.paidDate ? fmtDate(p.paidDate) : '—'}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <p className="text-[14px] font-bold text-slate-800">{fmtCompact(p.amount)}</p>
                  </td>
                  <td className="py-3.5 px-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="py-3.5 pl-3 pr-5">
                    <button onClick={e => { e.stopPropagation(); onSelect(p); }}
                      className="opacity-0 group-hover:opacity-100 h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-amber-100 hover:text-amber-600 transition">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Suppliers tab ────────────────────────────────────────────────────────────

function SuppliersDirectory({ suppliers, onSelect }: { suppliers: Supplier[]; onSelect: (s: Supplier) => void }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return suppliers;
    const q = search.toLowerCase();
    return suppliers.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.nit.includes(q) ||
      s.category.toLowerCase().includes(q),
    );
  }, [suppliers, search]);

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        <input type="search" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar proveedor, NIT, categoría…"
          className="w-full sm:w-64 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400
                     focus:outline-none focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-500/15 transition-all" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((s, i) => {
          const cfg = SUPPLIER_STATUS_CFG[s.status];
          return (
            <motion.div key={s.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onSelect(s)}
              className="group rounded-2xl border border-slate-100 bg-white p-4 cursor-pointer hover:border-amber-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 truncate">{s.name}</p>
                    <p className="text-[11px] text-slate-400">{s.nit}</p>
                  </div>
                </div>
                <span className={`shrink-0 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                  {s.status}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mb-3">
                <span className="rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  {s.category}
                </span>
                <span className="text-[11px] text-slate-400">{s.bank} · {s.account}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-50">
                <div>
                  <p className="text-[10px] text-slate-400">Pagado</p>
                  <p className="text-[12px] font-semibold text-emerald-600">{fmtCompact(s.totalPaid)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Pendiente</p>
                  <p className={`text-[12px] font-semibold ${s.totalPending > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {fmtCompact(s.totalPending)}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function PaymentsDashboard({ payments, suppliers }: Props) {
  const [tab, setTab]                   = useState<Tab>('pending');
  const [selectedPayment, setPayment]   = useState<Payment | null>(null);
  const [selectedSupplier, setSupplier] = useState<Supplier | null>(null);

  const pendingCount = payments.filter(p =>
    p.status === 'Pendiente' || p.status === 'Programado' || p.status === 'En proceso'
  ).length;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'pending',   label: 'Pendientes',  count: pendingCount },
    { id: 'history',   label: 'Historial' },
    { id: 'suppliers', label: 'Proveedores', count: suppliers.length },
  ];

  return (
    <>
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-100 overflow-hidden">

        {/* Tab bar */}
        <div className="flex items-center border-b border-slate-100 px-5 pt-4 gap-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 pb-3 pt-1 text-[13px] font-semibold border-b-2 transition-all ${
                tab === t.id
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-slate-500 hover:text-amber-600'
              }`}>
              {t.label}
              {t.count !== undefined && (
                <span className={`text-[11px] font-bold rounded-full px-1.5 py-0.5 ${
                  tab === t.id ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            <motion.div key={tab}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
            >
              {tab === 'pending'   && <PendingPayments  payments={payments}   onSelect={setPayment}  />}
              {tab === 'history'   && <PaymentHistory   payments={payments}   onSelect={setPayment}  />}
              {tab === 'suppliers' && <SuppliersDirectory suppliers={suppliers} onSelect={setSupplier} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {selectedPayment  && <PaymentDrawer  payment={selectedPayment}   onClose={() => setPayment(null)}  />}
      {selectedSupplier && <SupplierDrawer supplier={selectedSupplier} onClose={() => setSupplier(null)} />}
    </>
  );
}
