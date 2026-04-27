'use client';

/**
 * @module InvoiceTable
 * Tabla interactiva para la gestión y consulta de facturas de proveedores.
 *
 * @remarks
 * Este componente permite explorar el listado de facturas del área financiera
 * mediante una interfaz con herramientas de búsqueda, filtrado, ordenamiento
 * y navegación paginada.
 *
 * Incluye funcionalidades como:
 *
 * - búsqueda por número, proveedor, NIT o categoría
 * - filtrado por estado
 * - ordenamiento por columnas
 * - paginación
 * - panel lateral con detalle de factura
 * - apertura del documento asociado en visor PDF
 *
 * Está diseñado para facilitar la revisión operativa y documental
 * de las facturas registradas en el sistema.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Search, Download, Plus, ArrowUpDown,
  Building2, Calendar, Eye, MoreHorizontal,
  CheckCircle2, Clock, XCircle, Banknote,
  ChevronLeft, ChevronRight, AlertCircle,
  X,
} from 'lucide-react';
import type { Invoice, InvoiceStatus } from '@/lib/graph/departments/finance.service';
import PdfViewerModal from "@/app/components/pdf/PdfViewerModal";
import type { PdfMetadata } from "@/app/components/pdf/types";

/* -------------------------------------------------------------------------- */
/* Configuración                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Claves disponibles para ordenar la tabla de facturas.
 */
type SortKey = 'date' | 'amount' | 'number' | 'supplier';

/**
 * Dirección del ordenamiento aplicado.
 */
type SortDir = 'asc' | 'desc';

/**
 * Número máximo de facturas mostradas por página.
 */
const PAGE_SIZE = 8;

/**
 * Configuración visual por estado de factura.
 *
 * @remarks
 * Este mapa traduce el estado del modelo de negocio
 * a una representación visual consistente en badges e indicadores.
 *
 * Incluye:
 * - etiqueta legible
 * - color del punto
 * - fondo del badge
 * - color del texto
 * - ícono asociado
 */
const STATUS_CFG: Record<InvoiceStatus, {
  label: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  icon: React.ElementType;
}> = {
  'Pendiente': {
    label: 'Pendiente',
    dotColor: 'bg-amber-400',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-700',
    icon: Clock,
  },
  'Aprobada': {
    label: 'Aprobada',
    dotColor: 'bg-emerald-400',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-700',
    icon: CheckCircle2,
  },
  'Rechazada': {
    label: 'Rechazada',
    dotColor: 'bg-red-400',
    badgeBg: 'bg-red-50 border-red-200',
    badgeText: 'text-red-700',
    icon: XCircle,
  },
  'Pagada': {
    label: 'Pagada',
    dotColor: 'bg-violet-400',
    badgeBg: 'bg-violet-50 border-violet-200',
    badgeText: 'text-violet-700',
    icon: Banknote,
  },
  'Vencida': {
    label: 'Vencida',
    dotColor: 'bg-red-500',
    badgeBg: 'bg-red-50 border-red-300',
    badgeText: 'text-red-800',
    icon: AlertCircle,
  },
};

/**
 * Estados disponibles para el filtrado rápido.
 *
 * @remarks
 * Incluye la opción especial `all` para representar
 * la vista completa sin restricción por estado.
 */
const ALL_STATUSES: Array<InvoiceStatus | 'all'> = [
  'all',
  'Pendiente',
  'Aprobada',
  'Pagada',
  'Rechazada',
  'Vencida',
];

/* -------------------------------------------------------------------------- */
/* Formateadores                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Formatea un valor numérico como moneda COP.
 *
 * @param n Valor monetario a formatear.
 * @returns Cadena formateada en pesos colombianos.
 */
const fmtCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);

/**
 * Formatea una fecha ISO a una representación legible en español.
 *
 * @param iso Fecha en formato ISO.
 * @returns Fecha formateada con día, mes abreviado y año.
 */
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

/**
 * Determina si una factura debe considerarse vencida.
 *
 * @param inv Factura a evaluar.
 * @returns `true` si la factura está marcada como vencida.
 */
const isOverdue = (inv: Invoice) => inv.status === 'Vencida';

/* -------------------------------------------------------------------------- */
/* Adaptador a visor PDF                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Convierte una factura a metadatos consumibles por el visor PDF.
 *
 * @param inv Factura de origen.
 * @returns Metadatos compatibles con {@link PdfViewerModal}.
 *
 * @remarks
 * Cuando el servicio incluya una URL real en `attachmentUrl`,
 * esta función la propagará automáticamente como `previewUrl`
 * y `downloadUrl`.
 */
function invoiceToPdfMetadata(inv: Invoice): PdfMetadata {
  const base: PdfMetadata = {
    id: inv.number,
    title: `Factura ${inv.number} — ${inv.supplier}`,
    restricted: false,
    updatedAt: fmtDate(inv.issueDate),
    author: inv.supplier,
    category: inv.category,
  };

  const attachmentUrl = (inv as any).attachmentUrl;
  if (attachmentUrl !== undefined) {
    base.previewUrl = attachmentUrl;
    base.downloadUrl = attachmentUrl;
  }

  return base;
}

/* -------------------------------------------------------------------------- */
/* Props                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Props del componente {@link InvoiceTable}.
 *
 * @property invoices Lista de facturas a mostrar en la tabla.
 */
interface Props {
  invoices: Invoice[];
}

/* -------------------------------------------------------------------------- */
/* Subcomponentes                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Badge visual para representar el estado de una factura.
 *
 * @param props Propiedades del componente.
 * @returns Etiqueta visual con ícono y estado de la factura.
 */
function StatusBadge({ status }: { status: InvoiceStatus }) {
  const cfg = STATUS_CFG[status];
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap
                      ${cfg.badgeBg} ${cfg.badgeText}`}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

/**
 * Etiqueta visual para encabezados de sección dentro del drawer.
 *
 * @param props Propiedades del componente.
 * @returns Título pequeño en mayúsculas para organizar bloques de información.
 */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
      {children}
    </h3>
  );
}

/* -------------------------------------------------------------------------- */
/* Drawer de detalle                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Props del componente {@link InvoiceDrawer}.
 *
 * @property inv Factura seleccionada.
 * @property onClose Acción para cerrar el panel lateral.
 * @property onOpenPdf Acción para abrir el documento asociado en el visor.
 */
type InvoiceDrawerProps = {
  inv: Invoice;
  onClose: () => void;
  onOpenPdf: (metadata: PdfMetadata) => void;
};

/**
 * Panel lateral con el detalle de una factura.
 *
 * @param props Propiedades del componente.
 * @returns Drawer con información operativa, económica y documental de la factura.
 *
 * @remarks
 * Este componente muestra:
 * - estado de la factura
 * - aprobación o rechazo
 * - datos del proveedor
 * - fechas relevantes
 * - valores económicos
 * - observaciones
 *
 * También permite abrir el documento asociado
 * y acceder a acciones según el estado actual.
 */
function InvoiceDrawer({
  inv,
  onClose,
  onOpenPdf,
}: InvoiceDrawerProps) {
  const cfg = STATUS_CFG[inv.status];

  /**
   * Indica si la factura seleccionada se encuentra vencida.
   */
  const overdue = isOverdue(inv);

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.aside
        key="drawer"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 z-50 h-full w-full max-w-[460px] bg-white shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="font-mono text-[15px] font-bold text-slate-800">{inv.number}</p>
              <p className="text-[11px] text-slate-400">{inv.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Status banner */}
          <div className={`rounded-xl border p-4 ${cfg.badgeBg}`}>
            <div className="flex items-center justify-between">
              <StatusBadge status={inv.status} />
              {overdue && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full px-2.5 py-1">
                  <AlertCircle className="h-3 w-3" /> Vencida
                </span>
              )}
            </div>
            {inv.approvedBy && (
              <p className="mt-2 text-[12px] text-slate-500">
                Aprobado por <span className="font-semibold text-slate-700">{inv.approvedBy}</span>
              </p>
            )}
            {inv.rejectionReason && (
              <p className="mt-2 text-[12px] text-red-700 leading-snug flex items-start gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                {inv.rejectionReason}
              </p>
            )}
          </div>

          {/* Supplier */}
          <section>
            <SectionLabel>Proveedor</SectionLabel>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-1.5">
              <p className="text-[14px] font-semibold text-slate-800">{inv.supplier}</p>
              <p className="text-[12px] text-slate-500">NIT: {inv.supplierNit}</p>
              <p className="text-[12px] text-slate-500">{inv.supplierEmail}</p>
            </div>
          </section>

          {/* Dates */}
          <section>
            <SectionLabel>Fechas</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              {([
                ['Emisión', inv.issueDate],
                ['Vencimiento', inv.due],
                ['Recepción', inv.receivedDate],
              ] as [string, string][]).map(([label, date]) => (
                <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</p>
                  <p className="text-[12px] font-semibold text-slate-700 mt-1 leading-tight">{fmtDate(date)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Amounts */}
          <section>
            <SectionLabel>Valores</SectionLabel>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <div className="flex justify-between px-4 py-3 border-b border-slate-50">
                <span className="text-[13px] text-slate-500">Subtotal</span>
                <span className="text-[13px] font-medium text-slate-700">{fmtCOP(inv.amount)}</span>
              </div>
              <div className="flex justify-between px-4 py-3 border-b border-slate-50">
                <span className="text-[13px] text-slate-500">IVA (19%)</span>
                <span className="text-[13px] font-medium text-slate-700">{fmtCOP(inv.tax)}</span>
              </div>
              <div className="flex justify-between px-4 py-3.5 bg-violet-50 border-t border-violet-100">
                <span className="text-[13px] font-bold text-violet-800">Total</span>
                <span className="text-[15px] font-bold text-violet-800">{fmtCOP(inv.amount + inv.tax)}</span>
              </div>
            </div>
          </section>

          {/* Notes */}
          {inv.notes && (
            <section>
              <SectionLabel>Observaciones</SectionLabel>
              <p className="text-[13px] text-slate-600 bg-slate-50 rounded-xl p-4 border border-slate-100 leading-relaxed">
                {inv.notes}
              </p>
            </section>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-slate-100 px-6 py-4 flex gap-2.5 shrink-0">
          {inv.status === 'Pendiente' && (
            <>
              <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-[13px] font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm">
                <CheckCircle2 className="h-4 w-4" /> Aprobar
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 py-2.5 text-[13px] font-semibold text-red-700 hover:bg-red-100 transition-colors">
                <XCircle className="h-4 w-4" /> Rechazar
              </button>
            </>
          )}
          {inv.status === 'Aprobada' && (
            <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 py-2.5 text-[13px] font-semibold text-white hover:bg-violet-700 transition-colors shadow-sm">
              <Banknote className="h-4 w-4" /> Marcar como pagada
            </button>
          )}
          {inv.status === 'Vencida' && (
            <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2.5 text-[13px] font-semibold text-white hover:bg-amber-600 transition-colors shadow-sm">
              <AlertCircle className="h-4 w-4" /> Gestionar vencimiento
            </button>
          )}

          <button
            onClick={() => onOpenPdf(invoiceToPdfMetadata(inv))}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 transition-colors"
            title="Ver documento adjunto"
          >
            <FileText className="h-4 w-4" /> Ver doc
          </button>

          {(inv as any).attachmentUrl && (
            <a
              href={(inv as any).attachmentUrl}
              download
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              title="Descargar"
            >
              <Download className="h-4 w-4" />
            </a>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/* Botón de ordenamiento                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Props del componente {@link SortBtn}.
 *
 * @property label Texto visible del botón.
 * @property sortKey Clave de ordenamiento asociada al botón.
 * @property active Indica si el criterio se encuentra activo.
 * @property onClick Acción ejecutada al seleccionar el criterio.
 */
type SortBtnProps = {
  label: string;
  sortKey: SortKey;
  active: boolean;
  onClick: () => void;
};

/**
 * Botón reutilizable para activar el ordenamiento de la tabla.
 *
 * @param props Propiedades del componente.
 * @returns Botón con indicador visual del criterio activo.
 */
function SortBtn({
  label, sortKey: active, onClick,
}: SortBtnProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide transition-colors
                  ${active ? 'text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
    >
      {label}
      <ArrowUpDown className={`h-3 w-3 transition-opacity ${active ? 'opacity-100' : 'opacity-40'}`} />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Tabla principal de facturas.
 *
 * @param props Propiedades del componente.
 * @returns Vista tabular con búsqueda, filtros, ordenamiento, paginación y detalle.
 *
 * @remarks
 * Este componente administra el flujo principal de exploración
 * de facturas del módulo financiero.
 *
 * Mantiene estado para:
 * - texto de búsqueda
 * - filtro por estado
 * - ordenamiento
 * - página actual
 * - factura seleccionada
 * - visor documental
 *
 * El conjunto visible de facturas se memoiza con `useMemo`
 * para optimizar el rendimiento del render.
 *
 * @example
 * ```tsx
 * <InvoiceTable invoices={invoices} />
 * ```
 */
export function InvoiceTable({ invoices }: Props) {
  /**
   * Texto actual de búsqueda.
   */
  const [search, setSearch] = useState('');

  /**
   * Estado actualmente seleccionado para filtrar facturas.
   */
  const [status, setStatus] = useState<InvoiceStatus | 'all'>('all');

  /**
   * Clave actual de ordenamiento.
   */
  const [sortKey, setSortKey] = useState<SortKey>('date');

  /**
   * Dirección actual del ordenamiento.
   */
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  /**
   * Página actual de la tabla paginada.
   */
  const [page, setPage] = useState(1);

  /**
   * Factura seleccionada para mostrar en el drawer.
   */
  const [selected, setSelected] = useState<Invoice | null>(null);

  /**
   * Metadatos del documento actualmente abierto en el visor.
   */
  const [pdfMeta, setPdfMeta] = useState<PdfMetadata | null>(null);

  /**
   * Indica si el visor documental se encuentra abierto.
   */
  const [pdfOpen, setPdfOpen] = useState(false);

  /**
   * Abre el visor PDF con los metadatos indicados.
   *
   * @param metadata Metadatos del documento a visualizar.
   */
  const openPdf = (metadata: PdfMetadata) => {
    setPdfMeta(metadata);
    setPdfOpen(true);
  };

  /**
   * Cierra el visor PDF y limpia sus metadatos posteriormente.
   *
   * @remarks
   * Se utiliza un pequeño retraso para acompañar
   * la transición visual de cierre del modal.
   */
  const closePdf = () => {
    setPdfOpen(false);
    setTimeout(() => setPdfMeta(null), 300);
  };

  /**
   * Alterna el criterio y dirección de ordenamiento.
   *
   * @param key Nueva clave de ordenamiento solicitada.
   *
   * @remarks
   * Si el usuario vuelve a seleccionar la clave activa,
   * la dirección alterna entre ascendente y descendente.
   * Cuando cambia el criterio, la paginación vuelve a la primera página.
   */
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(1);
  };

  /**
   * Lista de facturas filtradas y ordenadas.
   *
   * @remarks
   * Este cálculo:
   * - aplica búsqueda por número, proveedor, NIT o categoría
   * - filtra por estado
   * - ordena según el criterio activo
   */
  const filtered = useMemo(() => {
    let data = [...invoices];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(i =>
        i.number.toLowerCase().includes(q) ||
        i.supplier.toLowerCase().includes(q) ||
        i.supplierNit.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
        i.category.toLowerCase().includes(q),
      );
    }

    if (status !== 'all') {
      data = data.filter(i => i.status === status);
    }

    data.sort((a, b) => {
      const [va, vb] =
        sortKey === 'date' ? [a.issueDate, b.issueDate] :
        sortKey === 'amount' ? [a.amount, b.amount] :
        sortKey === 'number' ? [a.number, b.number] :
        [a.supplier, b.supplier];

      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

    return data;
  }, [invoices, search, status, sortKey, sortDir]);

  /**
   * Número total de páginas disponibles.
   */
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  /**
   * Subconjunto de facturas correspondiente a la página actual.
   */
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /**
   * Actualiza el filtro por estado y reinicia la paginación.
   *
   * @param s Estado seleccionado.
   */
  const handleStatus = (s: InvoiceStatus | 'all') => {
    setStatus(s);
    setPage(1);
  };

  /**
   * Actualiza el texto de búsqueda y reinicia la paginación.
   *
   * @param v Nuevo texto de búsqueda.
   */
  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Buscar por número, proveedor…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5
                       text-[13px] text-slate-700 placeholder:text-slate-400
                       focus:outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-500/15
                       transition-all"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition shadow-sm">
            <Download className="h-3.5 w-3.5" /> Exportar
          </button>
          <button className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2.5 text-[12px] font-semibold text-white hover:bg-violet-700 transition shadow-sm shadow-violet-200">
            <Plus className="h-3.5 w-3.5" /> Nueva factura
          </button>
        </div>
      </div>

      {/* ── Status filter tabs ── */}
      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-0.5">
        {ALL_STATUSES.map(s => {
          const isAll = s === 'all';
          const cfg = isAll ? null : STATUS_CFG[s as InvoiceStatus];
          const count = isAll
            ? invoices.length
            : invoices.filter(i => i.status === s).length;
          const active = status === s;

          return (
            <button
              key={s}
              onClick={() => handleStatus(s)}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[12px] font-medium whitespace-nowrap transition-all
                ${active
                  ? 'bg-violet-600 border-violet-600 text-white shadow-sm shadow-violet-200'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600'
                }`}
            >
              {!isAll && cfg && (
                <span className={`h-2 w-2 rounded-full ${active ? 'bg-white/70' : cfg.dotColor}`} />
              )}
              {isAll ? 'Todas' : cfg!.label}
              <span className={`text-[11px] font-semibold ${active ? 'text-white/75' : 'text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="py-3 pl-5 pr-3 text-left">
                  <SortBtn label="Número" sortKey="number" active={sortKey === 'number'} onClick={() => toggleSort('number')} />
                </th>
                <th className="py-3 px-3 text-left">
                  <SortBtn label="Proveedor" sortKey="supplier" active={sortKey === 'supplier'} onClick={() => toggleSort('supplier')} />
                </th>
                <th className="py-3 px-3 text-left">
                  <SortBtn label="Fecha" sortKey="date" active={sortKey === 'date'} onClick={() => toggleSort('date')} />
                </th>
                <th className="py-3 px-3 text-right">
                  <SortBtn label="Monto" sortKey="amount" active={sortKey === 'amount'} onClick={() => toggleSort('amount')} />
                </th>
                <th className="py-3 px-3 text-left">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Estado</span>
                </th>
                <th className="py-3 pl-3 pr-5 w-16" />
              </tr>
            </thead>

            <tbody>
              <AnimatePresence mode="wait">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <FileText className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-[13px] text-slate-400">No se encontraron facturas con esos criterios.</p>
                    </td>
                  </tr>
                ) : (
                  paged.map((inv, idx) => (
                    <motion.tr
                      key={inv.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.2 }}
                      onClick={() => setSelected(inv)}
                      className="group border-b border-slate-50 last:border-0 hover:bg-violet-50/40 cursor-pointer transition-colors"
                    >
                      {/* Number + category */}
                      <td className="py-3.5 pl-5 pr-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                            <FileText className="h-3.5 w-3.5 text-violet-500" />
                          </div>
                          <div>
                            <p className="font-mono text-[13px] font-semibold text-slate-800">{inv.number}</p>
                            <p className="text-[11px] text-slate-400">{inv.category}</p>
                          </div>
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-start gap-2">
                          <Building2 className="mt-0.5 h-3.5 w-3.5 text-slate-300 shrink-0" />
                          <div>
                            <p className="text-[13px] font-medium text-slate-700">{inv.supplier}</p>
                            <p className="text-[11px] text-slate-400">{inv.supplierNit}</p>
                          </div>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                          <Calendar className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                          {fmtDate(inv.issueDate)}
                        </div>
                        <p className={`mt-0.5 pl-5 text-[11px] ${isOverdue(inv) ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                          {isOverdue(inv) ? '⚠ ' : ''}Vence: {fmtDate(inv.due)}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-3 text-right">
                        <p className="text-[14px] font-bold text-slate-800">{fmtCOP(inv.amount)}</p>
                        <p className="text-[11px] text-slate-400">IVA: {fmtCOP(inv.tax)}</p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <StatusBadge status={inv.status} />
                      </td>

                      {/* Row actions */}
                      <td className="py-3.5 pl-3 pr-5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={e => { e.stopPropagation(); setSelected(inv); }}
                            className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-violet-100 hover:text-violet-600 transition"
                            title="Ver detalle"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); openPdf(invoiceToPdfMetadata(inv)); }}
                            className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition"
                            title="Ver documento"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={e => e.stopPropagation()}
                            className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 bg-slate-50/50">
            <p className="text-[12px] text-slate-400">
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} · página {page} de {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-7 w-7 rounded-lg text-[12px] font-medium transition
                    ${n === page
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'border border-slate-200 text-slate-500 hover:bg-white hover:text-violet-600'
                    }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Drawer ── */}
      {selected && (
        <InvoiceDrawer
          inv={selected}
          onClose={() => setSelected(null)}
          onOpenPdf={openPdf}
        />
      )}

      {/* ── PDF / Office Viewer Modal ── */}
      <PdfViewerModal
        open={pdfOpen}
        onClose={closePdf}
        metadata={pdfMeta}
      />
    </>
  );
}