'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Search, Download,
  CheckCircle2, Clock, Eye, Archive,
  Tag, User, Calendar, ChevronDown,
} from 'lucide-react';
import type { StrategicReport, ReportStatus} from '@/lib/graph/departments/finance.service';
import PdfViewerModal, { type PdfMetadata } from '@/app/components/pdf/PdfViewerModal';

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<ReportStatus, {
  label: string; bg: string; text: string; border: string; icon: React.ElementType;
}> = {
  'Completado':  { label: 'Completado',  bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
  'Pendiente':   { label: 'Pendiente',   bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   icon: Clock        },
  'En revisión': { label: 'En revisión', bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    icon: Eye          },
  'Archivado':   { label: 'Archivado',   bg: 'bg-slate-50',   text: 'text-slate-500',   border: 'border-slate-200',   icon: Archive      },
};

const TYPE_COLORS: Record<string, string> = {
  'Cierre mensual':        'bg-violet-50 text-violet-600 border-violet-200',
  'Proyección':            'bg-blue-50 text-blue-600 border-blue-200',
  'Análisis de gastos':    'bg-orange-50 text-orange-600 border-orange-200',
  'Flujo de caja':         'bg-teal-50 text-teal-600 border-teal-200',
  'Balance general':       'bg-indigo-50 text-indigo-600 border-indigo-200',
  'Estado de resultados':  'bg-emerald-50 text-emerald-600 border-emerald-200',
  'Presupuesto vs real':   'bg-rose-50 text-rose-600 border-rose-200',
  'Informe ejecutivo':     'bg-slate-100 text-slate-700 border-slate-300',
};

const ALL_STATUSES: Array<ReportStatus | 'all'> = ['all', 'Completado', 'Pendiente', 'En revisión', 'Archivado'];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

function reportToPdfMetadata(r: StrategicReport): PdfMetadata {
  const base: PdfMetadata = {
    id:         r.id,
    title:      r.title,
    category:   r.type,
    author:     r.author,
    updatedAt:  fmtDate(r.date),
    restricted: false,
  };

  if (r.size          !== undefined) base.size        = r.size;
  if (r.attachmentUrl !== undefined) {
    base.previewUrl  = r.attachmentUrl;
    base.downloadUrl = r.attachmentUrl;
  }

  return base;
}
// ─── Props ────────────────────────────────────────────────────────────────────

interface Props { reports: StrategicReport[] }

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ReportStatus }) {
  const cfg = STATUS_CFG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon className="h-3 w-3" />{cfg.label}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function ReportsList({ reports }: Props) {
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState<ReportStatus | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pdfMeta, setPdfMeta] = useState<PdfMetadata | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);

  const openPdf  = (r: StrategicReport) => { setPdfMeta(reportToPdfMetadata(r)); setPdfOpen(true); };
  const closePdf = () => { setPdfOpen(false); setTimeout(() => setPdfMeta(null), 300); };

  const filtered = useMemo(() => {
    let data = [...reports];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(r =>
        r.title.toLowerCase().includes(q)  ||
        r.type.toLowerCase().includes(q)   ||
        r.author.toLowerCase().includes(q) ||
        r.tags?.some(t => t.includes(q)),
      );
    }
    if (status !== 'all') data = data.filter(r => r.status === status);
    // Más recientes primero
    data.sort((a, b) => b.date.localeCompare(a.date));
    return data;
  }, [reports, search, status]);

  return (
    <>
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-100 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-[14px] font-bold text-slate-800">Historial de reportes</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">{filtered.length} reporte{filtered.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center px-5 py-3 border-b border-slate-50 bg-slate-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="search" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por título, tipo, autor…"
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-[13px] text-slate-700 placeholder:text-slate-400
                         focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/15 transition-all"
            />
          </div>

          {/* Status tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            {ALL_STATUSES.map(s => {
              const isAll  = s === 'all';
              const count  = isAll ? reports.length : reports.filter(r => r.status === s).length;
              const active = status === s;
              return (
                <button key={s} onClick={() => setStatus(s)}
                  className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[11px] font-medium whitespace-nowrap transition-all ${
                    active
                      ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600'
                  }`}>
                  {isAll ? 'Todos' : s}
                  <span className={`text-[10px] font-bold ${active ? 'text-white/75' : 'text-slate-400'}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-slate-50">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <FileText className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                <p className="text-[13px] text-slate-400">No se encontraron reportes.</p>
              </div>
            ) : filtered.map((r, i) => {
              const isOpen = expanded === r.id;
              const typeColor = TYPE_COLORS[r.type] ?? 'bg-slate-50 text-slate-600 border-slate-200';

              return (
                <motion.div key={r.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  {/* Row */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : r.id)}
                    className="w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-rose-50/30 transition-colors group"
                  >
                    {/* Icon */}
                    <div className={`mt-0.5 h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                      isOpen ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200 group-hover:bg-rose-50 group-hover:border-rose-200'
                    }`}>
                      <FileText className={`h-4 w-4 transition-colors ${isOpen ? 'text-rose-500' : 'text-slate-400 group-hover:text-rose-500'}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-slate-800 leading-snug truncate">{r.title}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${typeColor}`}>
                              {r.type}
                            </span>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400">
                              <User className="h-3 w-3" />{r.author}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Calendar className="h-3 w-3" />{fmtDate(r.date)}
                            </div>
                            {r.pages && (
                              <span className="text-[11px] text-slate-400">{r.pages} págs.</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={r.status} />
                          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-rose-100 bg-rose-50/30"
                      >
                        <div className="px-5 py-4 pl-[72px] space-y-3">
                          {/* Summary */}
                          {r.summary && (
                            <p className="text-[12px] text-slate-600 leading-relaxed">{r.summary}</p>
                          )}

                          {/* Tags */}
                          {r.tags && r.tags.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Tag className="h-3 w-3 text-slate-400" />
                              {r.tags.map(t => (
                                <span key={t} className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openPdf(r)}
                              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-[12px] font-semibold text-white hover:bg-rose-700 transition-colors shadow-sm"
                            >
                              <Eye className="h-3.5 w-3.5" /> Ver reporte
                            </button>
                            {r.attachmentUrl && (
                              <a href={r.attachmentUrl} download
                                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                                <Download className="h-3.5 w-3.5" /> Descargar
                              </a>
                            )}
                            {r.size && (
                              <span className="text-[11px] text-slate-400 ml-1">{r.size}</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <PdfViewerModal open={pdfOpen} onClose={closePdf} metadata={pdfMeta} />
    </>
  );
}
