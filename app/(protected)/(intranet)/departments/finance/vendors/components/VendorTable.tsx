'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Search, Plus, ArrowUpDown,
  Eye, MoreHorizontal, Star, CheckCircle2,
  AlertTriangle, XCircle, X, Mail, Phone,
  FileText, User,
  ChevronDown,
} from 'lucide-react';
import type { Vendor, VendorStatus } from '@/lib/graph/departments/finance.service';
import PdfViewerModal, { type PdfMetadata } from '@/app/components/pdf/PdfViewerModal';

// ─── Config ───────────────────────────────────────────────────────────────────

type SortKey = 'name' | 'score' | 'billed' | 'category';
type SortDir = 'asc' | 'desc';
const PAGE_SIZE = 8;

const STATUS_CFG: Record<VendorStatus, {
  label: string; bg: string; text: string; border: string; dot: string; icon: React.ElementType;
}> = {
  'Activo':      { label: 'Activo',      bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400', icon: CheckCircle2  },
  'En revisión': { label: 'En revisión', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-400',   icon: AlertTriangle },
  'Inactivo':    { label: 'Inactivo',    bg: 'bg-slate-50',   text: 'text-slate-500',   border: 'border-slate-200',   dot: 'bg-slate-300',   icon: XCircle       },
  'Bloqueado':   { label: 'Bloqueado',   bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-400',     icon: XCircle       },
};

const ALL_STATUSES: Array<VendorStatus | 'all'> = ['all', 'Activo', 'En revisión', 'Inactivo', 'Bloqueado'];
const ALL_TYPES = ['all', 'Proveedor de servicios', 'Suministrador'] as const;

const fmtCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const fmtCompact = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0, notation: 'compact' }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const avgScore = (v: Vendor) => v.score
  ? parseFloat(((v.score.quality + v.score.delivery + v.score.pricing + v.score.service + v.score.compliance) / 5).toFixed(1))
  : null;

const scoreColor = (s: number) =>
  s >= 4.5 ? 'text-emerald-600' : s >= 3.5 ? 'text-amber-600' : 'text-red-500';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props { vendors: Vendor[] }

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: VendorStatus }) {
  const cfg = STATUS_CFG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon className="h-3 w-3" />{cfg.label}
    </span>
  );
}

function StarRow({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`h-2.5 w-2.5 ${i <= Math.round(score) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{children}</h3>;
}

// ─── Vendor Drawer ────────────────────────────────────────────────────────────

function VendorDrawer({ vendor: v, onClose, onOpenPdf }: {
  vendor: Vendor; onClose: () => void; onOpenPdf: (m: PdfMetadata) => void;
}) {
  const cfg   = STATUS_CFG[v.status];
  const score = avgScore(v);
  const [docsOpen, setDocsOpen] = useState(false);

  return (
    <AnimatePresence>
      <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <motion.aside key="dr" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 z-50 h-full w-full max-w-[480px] bg-white shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1 w-full bg-cyan-500 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-slate-800 leading-tight">{v.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-[11px] text-slate-400">{v.code}</span>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] text-slate-400">{v.type === 'Suministrador' ? 'Suministrador' : 'Servicios'}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Estado + categoría */}
          <div className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
            <div className="flex items-center justify-between">
              <StatusBadge status={v.status} />
              <span className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200 rounded-full px-2.5 py-1">
                {v.category}
              </span>
            </div>
            {v.notes && (
              <p className="mt-2 text-[12px] text-slate-600 leading-snug">{v.notes}</p>
            )}
          </div>

          {/* Contacto principal */}
          <section>
            <SectionLabel>Contacto</SectionLabel>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
              {v.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <p className="text-[13px] text-slate-700">{v.email}</p>
                </div>
              )}
              {v.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <p className="text-[13px] text-slate-700">{v.phone}</p>
                </div>
              )}
              {v.city && (
                <p className="text-[12px] text-slate-400 pl-5">{v.address ? `${v.address}, ` : ''}{v.city}</p>
              )}
            </div>

            {/* Contactos adicionales */}
            {v.contacts.length > 0 && (
              <div className="mt-2 space-y-2">
                {v.contacts.map((c, i) => (
                  <div key={i} className="rounded-xl border border-slate-100 bg-white p-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-cyan-50 border border-cyan-100 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-cyan-600">
                        {c.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-slate-700">{c.name}</p>
                      <p className="text-[11px] text-slate-400">{c.role} · {c.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Datos bancarios */}
          <section>
            <SectionLabel>Datos bancarios</SectionLabel>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <div className="flex justify-between px-4 py-2.5 border-b border-slate-50">
                <span className="text-[13px] text-slate-500">Banco</span>
                <span className="text-[13px] font-medium text-slate-700">{v.bank}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5 border-b border-slate-50">
                <span className="text-[13px] text-slate-500">Tipo de cuenta</span>
                <span className="text-[13px] font-medium text-slate-700">{v.accountType}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-[13px] text-slate-500">Número</span>
                <span className="text-[13px] font-mono font-semibold text-slate-700">{v.account}</span>
              </div>
            </div>
          </section>

          {/* Historial financiero */}
          <section>
            <SectionLabel>Historial financiero</SectionLabel>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <div className="flex justify-between px-4 py-2.5 border-b border-slate-50">
                <span className="text-[13px] text-slate-500">Total facturado</span>
                <span className="text-[13px] font-semibold text-slate-700">{fmtCOP(v.totalBilled)}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5 border-b border-slate-50">
                <span className="text-[13px] text-slate-500">Total pagado</span>
                <span className="text-[13px] font-semibold text-emerald-600">{fmtCOP(v.totalPaid)}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5 border-b border-slate-50">
                <span className="text-[13px] text-slate-500">Pendiente</span>
                <span className={`text-[13px] font-semibold ${v.totalPending > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {fmtCOP(v.totalPending)}
                </span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-[13px] text-slate-500">Última factura</span>
                <span className="text-[13px] font-medium text-slate-700">
                  {v.lastInvoice ? fmtDate(v.lastInvoice) : '—'}
                </span>
              </div>
            </div>
          </section>

          {/* Evaluación */}
          {v.score && (
            <section>
              <SectionLabel>Evaluación de desempeño</SectionLabel>
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                {([
                  ['Calidad del producto/servicio', v.score.quality],
                  ['Cumplimiento de entregas',      v.score.delivery],
                  ['Competitividad de precios',     v.score.pricing],
                  ['Servicio y posventa',           v.score.service],
                  ['Cumplimiento contractual',      v.score.compliance],
                ] as [string, number][]).map(([label, val]) => (
                  <div key={label} className="px-4 py-2.5 border-b border-slate-50 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] text-slate-600">{label}</span>
                      <span className={`text-[12px] font-bold ${scoreColor(val)}`}>{val}/5</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${val >= 4 ? 'bg-emerald-400' : val >= 3 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${(val / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="px-4 py-3 bg-cyan-50 border-t border-cyan-100 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-500">Revisado por <span className="font-semibold text-slate-700">{v.score.reviewedBy}</span></p>
                    <p className="text-[11px] text-slate-400">{fmtDate(v.score.lastReview)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-400">Score global</p>
                    <p className={`text-[18px] font-bold ${scoreColor(score!)}`}>{score}</p>
                  </div>
                </div>
                {v.score.notes && (
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
                    <p className="text-[12px] text-slate-600 italic leading-relaxed">{v.score.notes}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Documentos */}
          {v.documents.length > 0 && (
            <section>
              <button
                onClick={() => setDocsOpen(d => !d)}
                className="w-full flex items-center justify-between mb-2"
              >
                <SectionLabel>Documentos ({v.documents.length})</SectionLabel>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${docsOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {docsOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="space-y-2">
                      {v.documents.map(doc => (
                        <div key={doc.id}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[12px] font-semibold text-slate-700 truncate">{doc.title}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400">{doc.type}</span>
                                {doc.expiresAt && (
                                  <span className={`text-[10px] font-medium ${
                                    new Date(doc.expiresAt) < new Date() ? 'text-red-500' : 'text-slate-400'
                                  }`}>
                                    Vence {fmtDate(doc.expiresAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
onClick={() => {
  const meta: PdfMetadata = {
    id:        doc.id,
    title:     doc.title,
    category:  doc.type,
    author:    v.name,
    updatedAt: fmtDate(doc.uploadedAt),
  };
  if (doc.attachmentUrl !== undefined) {
    meta.previewUrl  = doc.attachmentUrl;
    meta.downloadUrl = doc.attachmentUrl;
  }
  onOpenPdf(meta);
}}
                            className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-cyan-100 hover:text-cyan-600 transition shrink-0 ml-2"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 flex gap-2.5 shrink-0">
          <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-cyan-600 py-2.5 text-[13px] font-semibold text-white hover:bg-cyan-700 transition-colors shadow-sm">
            <User className="h-4 w-4" /> Editar proveedor
          </button>
          {v.status === 'Activo' && (
            <button className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors">
              <XCircle className="h-4 w-4" /> Bloquear
            </button>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

// ─── Sort button ──────────────────────────────────────────────────────────────

function SortBtn({ label, sortKey: active, onClick }: {
  label: string; sortKey: SortKey; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide transition-colors
      ${active ? 'text-cyan-600' : 'text-slate-400 hover:text-slate-600'}`}>
      {label}
      <ArrowUpDown className={`h-3 w-3 transition-opacity ${active ? 'opacity-100' : 'opacity-40'}`} />
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function VendorTable({ vendors }: Props) {
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState<VendorStatus | 'all'>('all');
  const [type, setType]         = useState<string>('all');
  const [sortKey, setSortKey]   = useState<SortKey>('score');
  const [sortDir, setSortDir]   = useState<SortDir>('desc');
  const [page, setPage]         = useState(1);
  const [selected, setSelected] = useState<Vendor | null>(null);
  const [pdfMeta, setPdfMeta]   = useState<PdfMetadata | null>(null);
  const [pdfOpen, setPdfOpen]   = useState(false);

  const openPdf  = (m: PdfMetadata) => { setPdfMeta(m); setPdfOpen(true); };
  const closePdf = () => { setPdfOpen(false); setTimeout(() => setPdfMeta(null), 300); };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let data = [...vendors];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(v =>
        v.name.toLowerCase().includes(q)     ||
        v.nit.includes(q)                    ||
        v.category.toLowerCase().includes(q) ||
        v.code.toLowerCase().includes(q),
      );
    }
    if (status !== 'all') data = data.filter(v => v.status === status);
    if (type   !== 'all') data = data.filter(v => v.type === type);
    data.sort((a, b) => {
      const [va, vb] =
        sortKey === 'name'     ? [a.name,       b.name]       :
        sortKey === 'billed'   ? [a.totalBilled, b.totalBilled]:
        sortKey === 'category' ? [a.category,    b.category]   :
                                 [avgScore(a) ?? 0, avgScore(b) ?? 0];
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    return data;
  }, [vendors, search, status, type, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input type="search" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Nombre, NIT, categoría, código…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400
                       focus:outline-none focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-500/15 transition-all" />
        </div>
        <button className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-3.5 py-2.5 text-[12px] font-semibold text-white hover:bg-cyan-700 transition shadow-sm shadow-cyan-200 shrink-0">
          <Plus className="h-3.5 w-3.5" /> Nuevo proveedor
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Status tabs */}
        {ALL_STATUSES.map(s => {
          const isAll  = s === 'all';
          const count  = isAll ? vendors.length : vendors.filter(v => v.status === s).length;
          const active = status === s;
          return (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-all ${
                active ? 'bg-cyan-600 border-cyan-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-cyan-300 hover:text-cyan-600'
              }`}>
              {!isAll && <span className={`h-2 w-2 rounded-full ${active ? 'bg-white/70' : STATUS_CFG[s as VendorStatus].dot}`} />}
              {isAll ? 'Todos' : s}
              <span className={`text-[10px] font-bold ${active ? 'text-white/75' : 'text-slate-400'}`}>{count}</span>
            </button>
          );
        })}
        {/* Type filter */}
        <div className="flex items-center gap-1 ml-2 border-l border-slate-200 pl-2">
          {ALL_TYPES.map(t => (
            <button key={t} onClick={() => { setType(t); setPage(1); }}
              className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap transition-all ${
                type === t ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
              }`}>
              {t === 'all' ? 'Todos los tipos' : t === 'Suministrador' ? 'Suministradores' : 'Servicios'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="py-3 pl-5 pr-3 text-left">
                  <SortBtn label="Proveedor"  sortKey="name"     active={sortKey==='name'}     onClick={() => toggleSort('name')}     />
                </th>
                <th className="py-3 px-3 text-left">
                  <SortBtn label="Categoría"  sortKey="category" active={sortKey==='category'} onClick={() => toggleSort('category')} />
                </th>
                <th className="py-3 px-3 text-left hidden lg:table-cell">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Tipo</span>
                </th>
                <th className="py-3 px-3 text-right">
                  <SortBtn label="Facturado"  sortKey="billed"   active={sortKey==='billed'}   onClick={() => toggleSort('billed')}  />
                </th>
                <th className="py-3 px-3 text-center">
                  <SortBtn label="Score"      sortKey="score"    active={sortKey==='score'}    onClick={() => toggleSort('score')}    />
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
                    <td colSpan={7} className="py-16 text-center">
                      <Building2 className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-[13px] text-slate-400">No se encontraron proveedores.</p>
                    </td>
                  </tr>
                ) : paged.map((v, idx) => {
                  const score = avgScore(v);
                  return (
                    <motion.tr key={v.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      onClick={() => setSelected(v)}
                      className="group border-b border-slate-50 last:border-0 hover:bg-cyan-50/30 cursor-pointer transition-colors"
                    >
                      {/* Proveedor */}
                      <td className="py-3.5 pl-5 pr-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-cyan-600">
                              {v.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-slate-800 leading-tight">{v.name}</p>
                            <p className="text-[11px] text-slate-400">{v.nit} · {v.code}</p>
                          </div>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="py-3.5 px-3">
                        <p className="text-[12px] font-medium text-slate-700">{v.category}</p>
                        {v.city && <p className="text-[11px] text-slate-400">{v.city}</p>}
                      </td>

                      {/* Tipo */}
                      <td className="py-3.5 px-3 hidden lg:table-cell">
                        <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                          v.type === 'Suministrador'
                            ? 'bg-orange-50 text-orange-600 border-orange-200'
                            : 'bg-blue-50 text-blue-600 border-blue-200'
                        }`}>
                          {v.type === 'Suministrador' ? 'Suministrador' : 'Servicios'}
                        </span>
                      </td>

                      {/* Facturado */}
                      <td className="py-3.5 px-3 text-right">
                        <p className="text-[13px] font-bold text-slate-800">{fmtCompact(v.totalBilled)}</p>
                        {v.totalPending > 0 && (
                          <p className="text-[11px] text-amber-600 font-medium">{fmtCompact(v.totalPending)} pend.</p>
                        )}
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-3 text-center">
                        {score !== null ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className={`text-[13px] font-bold ${scoreColor(score)}`}>{score}</span>
                            <StarRow score={score} />
                          </div>
                        ) : (
                          <span className="text-[12px] text-slate-300">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <StatusBadge status={v.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-3 pr-5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={e => { e.stopPropagation(); setSelected(v); }}
                            className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-cyan-100 hover:text-cyan-600 transition" title="Ver ficha">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={e => e.stopPropagation()}
                            className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 bg-slate-50/50">
            <p className="text-[12px] text-slate-400">
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} · página {page} de {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition">
                ‹</button>
              {Array.from({ length: totalPages }, (_, i) => i+1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className={`h-7 w-7 rounded-lg text-[12px] font-medium transition ${
                    n === page ? 'bg-cyan-600 text-white shadow-sm' : 'border border-slate-200 text-slate-500 hover:bg-white hover:text-cyan-600'
                  }`}>{n}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition">
                ›</button>
            </div>
          </div>
        )}
      </div>

      {selected && <VendorDrawer vendor={selected} onClose={() => setSelected(null)} onOpenPdf={openPdf} />}
      <PdfViewerModal open={pdfOpen} onClose={closePdf} metadata={pdfMeta} />
    </>
  );
}
