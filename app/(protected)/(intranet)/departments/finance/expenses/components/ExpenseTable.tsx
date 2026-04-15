'use client';

/**
 * @module ExpenseTable
 * Tabla interactiva para la gestión de gastos del módulo financiero.
 *
 * @remarks
 * Este componente permite consultar, filtrar y gestionar
 * los gastos registrados por diferentes áreas de la organización.
 *
 * Incluye funcionalidades como:
 *
 * - búsqueda por múltiples campos
 * - filtrado por estado
 * - ordenamiento por columnas
 * - paginación
 * - panel de detalle del gasto
 * - panel lateral para registro de nuevos gastos
 * - visualización de soportes mediante visor PDF
 *
 * Además, incorpora lógica de negocio relacionada con
 * el nivel de aprobación requerido según el monto.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt, Search, Plus, ArrowUpDown, Download,
  Building2, Calendar, Eye, MoreHorizontal,
  CheckCircle2, Clock, XCircle, Banknote,
  ChevronLeft, ChevronRight, AlertCircle,
  X, FileText, Send, User, Info, FileEdit,
} from 'lucide-react';
import type { Expense, ExpenseStatus, ExpenseCategory, ExpenseDepartment } from '@/lib/graph/departments/finance.service';
import PdfViewerModal, { type PdfMetadata } from '@/app/components/pdf/PdfViewerModal';

/* -------------------------------------------------------------------------- */
/* Configuración                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Claves disponibles para ordenar la tabla de gastos.
 */
type SortKey = 'date' | 'amount' | 'number' | 'department';

/**
 * Dirección del ordenamiento aplicado.
 */
type SortDir = 'asc' | 'desc';

/**
 * Número máximo de gastos mostrados por página.
 */
const PAGE_SIZE = 8;

/**
 * Umbrales de aprobación según el monto del gasto.
 *
 * @remarks
 * Estos valores determinan automáticamente
 * el nivel de aprobación requerido:
 *
 * - `AUTO`: aprobación automática
 * - `MANAGER`: aprobación por gerente de área
 * - superior al anterior: aprobación por Finanzas / Gerencia
 */
const APPROVAL_THRESHOLDS = { AUTO: 500_000, MANAGER: 5_000_000 };

/**
 * Configuración visual por estado del gasto.
 *
 * @remarks
 * Este mapa traduce el estado funcional del gasto
 * a una representación visual consistente en badges.
 *
 * Incluye:
 * - etiqueta legible
 * - color del punto
 * - fondo del badge
 * - color del texto
 * - ícono asociado
 */
const STATUS_CFG: Record<ExpenseStatus, {
  label: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  icon: React.ElementType;
}> = {
  'Borrador': {
    label: 'Borrador',
    dotColor: 'bg-slate-400',
    badgeBg: 'bg-slate-50 border-slate-200',
    badgeText: 'text-slate-600',
    icon: FileEdit,
  },
  'Enviado': {
    label: 'Enviado',
    dotColor: 'bg-blue-400',
    badgeBg: 'bg-blue-50 border-blue-200',
    badgeText: 'text-blue-700',
    icon: Send,
  },
  'En revisión': {
    label: 'En revisión',
    dotColor: 'bg-amber-400',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-700',
    icon: Clock,
  },
  'Aprobado': {
    label: 'Aprobado',
    dotColor: 'bg-emerald-400',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-700',
    icon: CheckCircle2,
  },
  'Rechazado': {
    label: 'Rechazado',
    dotColor: 'bg-red-400',
    badgeBg: 'bg-red-50 border-red-200',
    badgeText: 'text-red-700',
    icon: XCircle,
  },
  'Pagado': {
    label: 'Pagado',
    dotColor: 'bg-teal-400',
    badgeBg: 'bg-teal-50 border-teal-200',
    badgeText: 'text-teal-700',
    icon: Banknote,
  },
};

/**
 * Configuración visual por nivel de aprobación.
 *
 * @remarks
 * Este chip representa el flujo de aprobación requerido
 * según el valor del gasto.
 */
const APPROVAL_CFG = {
  auto: {
    label: 'Auto',
    bg: 'bg-teal-50',
    text: 'text-teal-600',
    border: 'border-teal-200',
  },
  manager: {
    label: 'Gte. área',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
  },
  finance: {
    label: 'Finanzas',
    bg: 'bg-violet-50',
    text: 'text-violet-600',
    border: 'border-violet-200',
  },
};

/**
 * Estados disponibles para el filtrado rápido.
 *
 * @remarks
 * Incluye la opción especial `all` para representar
 * la vista completa sin restricción por estado.
 */
const ALL_STATUSES: Array<ExpenseStatus | 'all'> = [
  'all', 'Borrador', 'Enviado', 'En revisión', 'Aprobado', 'Rechazado', 'Pagado',
];

/**
 * Categorías disponibles para el registro de gastos.
 */
const CATEGORIES: ExpenseCategory[] = [
  'Viáticos', 'Transporte', 'Alojamiento', 'Alimentación', 'Tecnología',
  'Papelería', 'Servicios', 'Mantenimiento', 'Marketing', 'Capacitación', 'Otros',
];

/**
 * Departamentos disponibles para asociar un gasto.
 */
const DEPARTMENTS: ExpenseDepartment[] = [
  'Finanzas', 'Logística', 'Marketing', 'Recursos Humanos',
  'Tecnología', 'Comercial', 'Jurídica', 'Gerencia',
];

/* -------------------------------------------------------------------------- */
/* Formateadores y adaptadores                                                 */
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
 * Convierte un gasto a metadatos compatibles con el visor PDF.
 *
 * @param exp Gasto de origen.
 * @returns Metadatos consumibles por {@link PdfViewerModal}.
 *
 * @remarks
 * Cuando el modelo incluya `attachmentUrl`,
 * este helper lo propagará automáticamente
 * como URL de vista previa y descarga.
 */
function expenseToPdfMetadata(exp: Expense): PdfMetadata {
  return {
    id: exp.number,
    title: `Soporte — ${exp.concept}`,
    category: exp.category,
    author: exp.submittedBy,
    updatedAt: fmtDate(exp.date),
    restricted: false,
    previewUrl: (exp as any).attachmentUrl ?? undefined,
    downloadUrl: (exp as any).attachmentUrl ?? undefined,
  };
}

/* -------------------------------------------------------------------------- */
/* Props                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Props del componente {@link ExpenseTable}.
 *
 * @property expenses Lista de gastos a mostrar.
 */
interface Props {
  expenses: Expense[];
}

/* -------------------------------------------------------------------------- */
/* Subcomponentes comunes                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Badge visual para representar el estado de un gasto.
 *
 * @param props Propiedades del componente.
 * @returns Etiqueta visual con ícono y estado del gasto.
 */
function StatusBadge({ status }: { status: ExpenseStatus }) {
  const cfg = STATUS_CFG[status];
  const Icon = cfg.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${cfg.badgeBg} ${cfg.badgeText}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

/**
 * Chip visual para representar el nivel de aprobación.
 *
 * @param props Propiedades del componente.
 * @returns Indicador compacto del flujo de aprobación requerido.
 *
 * @remarks
 * Este elemento aporta una capa adicional de semántica visual
 * frente a otros módulos como facturas o pagos.
 */
function ApprovalChip({ level }: { level: Expense['approvalLevel'] }) {
  const cfg = APPROVAL_CFG[level];

  return (
    <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

/**
 * Etiqueta visual para encabezados de sección.
 *
 * @param props Propiedades del componente.
 * @returns Título pequeño en mayúsculas para agrupar bloques de información.
 */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
      {children}
    </h3>
  );
}

/* -------------------------------------------------------------------------- */
/* Panel de registro                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Props del componente {@link RegisterExpensePanel}.
 *
 * @property onClose Acción para cerrar el panel lateral.
 */
type RegisterExpensePanelProps = {
  onClose: () => void;
};

/**
 * Panel lateral para registrar un nuevo gasto.
 *
 * @param props Propiedades del componente.
 * @returns Formulario lateral de creación de gasto.
 *
 * @remarks
 * Este componente permite:
 * - capturar la información principal del gasto
 * - seleccionar categoría y departamento
 * - definir monto y fecha
 * - adjuntar soporte documental
 * - mostrar dinámicamente el nivel de aprobación requerido
 *
 * El nivel de aprobación depende del monto ingresado
 * y se calcula en tiempo real.
 */
function RegisterExpensePanel({ onClose }: RegisterExpensePanelProps) {
  /**
   * Valor de monto ingresado en el formulario.
   */
  const [amount, setAmount] = useState('');

  /**
   * Valor numérico del monto, normalizado a partir del texto ingresado.
   */
  const numAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;

  /**
   * Nivel de aprobación calculado automáticamente según el monto.
   *
   * @remarks
   * Reglas aplicadas:
   * - menor a `AUTO` → automática
   * - menor a `MANAGER` → gerente de área
   * - superior → finanzas / gerencia
   */
  const approvalLvl =
    numAmount < APPROVAL_THRESHOLDS.AUTO ? 'auto' :
    numAmount < APPROVAL_THRESHOLDS.MANAGER ? 'manager' : 'finance';

  return (
    <AnimatePresence>
      <motion.div
        key="panel-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.aside
        key="panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 z-50 h-full w-full max-w-[480px] bg-white shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-1 w-full bg-teal-500 shrink-0" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
              <Plus className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-slate-800">Registrar gasto</p>
              <p className="text-[11px] text-slate-400">Complete los campos requeridos</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
              Concepto <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Descripción del gasto…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400
                         focus:outline-none focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-500/15 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                Categoría <span className="text-red-400">*</span>
              </label>
              <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] text-slate-700
                                 focus:outline-none focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-500/15 transition-all">
                <option value="">Seleccionar…</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                Área <span className="text-red-400">*</span>
              </label>
              <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] text-slate-700
                                 focus:outline-none focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-500/15 transition-all">
                <option value="">Seleccionar…</option>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                Monto (COP) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-7 pr-4 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400
                             focus:outline-none focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-500/15 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                Fecha del gasto <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] text-slate-700
                           focus:outline-none focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-500/15 transition-all"
              />
            </div>
          </div>

          {/* Nivel de aprobación dinámico */}
          {numAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border p-3.5 flex items-start gap-2.5 ${
                approvalLvl === 'auto' ? 'bg-teal-50 border-teal-200' :
                approvalLvl === 'manager' ? 'bg-amber-50 border-amber-200' :
                'bg-violet-50 border-violet-200'
              }`}
            >
              <Info className={`h-4 w-4 mt-0.5 shrink-0 ${
                approvalLvl === 'auto' ? 'text-teal-500' :
                approvalLvl === 'manager' ? 'text-amber-500' : 'text-violet-500'
              }`}
              />
              <div>
                <p className={`text-[12px] font-semibold ${
                  approvalLvl === 'auto' ? 'text-teal-700' :
                  approvalLvl === 'manager' ? 'text-amber-700' : 'text-violet-700'
                }`}
                >
                  {approvalLvl === 'auto' && 'Aprobación automática'}
                  {approvalLvl === 'manager' && 'Requiere aprobación del gerente de área'}
                  {approvalLvl === 'finance' && 'Requiere aprobación de Finanzas + Gerencia'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {approvalLvl === 'auto' && 'Monto menor a $500.000 COP.'}
                  {approvalLvl === 'manager' && 'Monto entre $500.000 y $5.000.000 COP.'}
                  {approvalLvl === 'finance' && 'Monto superior a $5.000.000 COP.'}
                </p>
              </div>
            </motion.div>
          )}

          {/* Soporte */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
              Soporte / recibo <span className="text-slate-400 font-normal">(PDF, imagen)</span>
            </label>
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center hover:border-teal-300 hover:bg-teal-50/30 transition-colors cursor-pointer">
              <FileText className="h-6 w-6 text-slate-300 mx-auto mb-2" />
              <p className="text-[12px] text-slate-500">
                Arrastra el archivo aquí o{' '}
                <span className="text-teal-600 font-semibold">selecciona desde tu equipo</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">PDF, JPG, PNG · máx. 10 MB</p>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
              Observaciones <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Información adicional para el aprobador…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400 resize-none
                         focus:outline-none focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-500/15 transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 flex gap-2.5 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-700 py-2.5 text-[13px] font-semibold text-white hover:bg-slate-600 transition-colors">
            <FileEdit className="h-4 w-4" /> Borrador
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 py-2.5 text-[13px] font-semibold text-white hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200">
            <Send className="h-4 w-4" /> Enviar
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/* Drawer de detalle                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Props del componente {@link ExpenseDrawer}.
 *
 * @property exp Gasto seleccionado.
 * @property onClose Acción para cerrar el panel lateral.
 * @property onOpenPdf Acción para abrir el soporte asociado.
 */
type ExpenseDrawerProps = {
  exp: Expense;
  onClose: () => void;
  onOpenPdf: (m: PdfMetadata) => void;
};

/**
 * Drawer lateral con el detalle completo de un gasto.
 *
 * @param props Propiedades del componente.
 * @returns Panel lateral con información operativa, económica y documental.
 *
 * @remarks
 * Este componente muestra:
 * - estado del gasto
 * - nivel de aprobación
 * - solicitante
 * - fechas principales
 * - detalle económico
 * - observaciones
 *
 * También presenta acciones contextuales
 * según el estado actual del gasto.
 */
function ExpenseDrawer({ exp, onClose, onOpenPdf }: ExpenseDrawerProps) {
  const cfg = STATUS_CFG[exp.status];

  return (
    <AnimatePresence>
      <motion.div
        key="ov"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.aside
        key="dr"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 z-50 h-full w-full max-w-[460px] bg-white shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1 w-full bg-teal-500 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-teal-500" />
            </div>
            <div>
              <p className="font-mono text-[15px] font-bold text-slate-800">{exp.number}</p>
              <p className="text-[11px] text-slate-400">{exp.category} · {exp.department}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Status + approval */}
          <div className={`rounded-xl border p-4 ${cfg.badgeBg}`}>
            <div className="flex items-center justify-between">
              <StatusBadge status={exp.status} />
              <ApprovalChip level={exp.approvalLevel} />
            </div>
            {exp.approvedBy && (
              <p className="mt-2 text-[12px] text-slate-500">
                Aprobado por <span className="font-semibold text-slate-700">{exp.approvedBy}</span>
                {exp.approvedAt && <span> · {fmtDate(exp.approvedAt)}</span>}
              </p>
            )}
            {exp.rejectionReason && (
              <p className="mt-2 text-[12px] text-red-700 flex items-start gap-1.5 leading-snug">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                {exp.rejectionReason}
              </p>
            )}
          </div>

          {/* Solicitante */}
          <section>
            <SectionLabel>Solicitante</SectionLabel>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-1.5">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <p className="text-[14px] font-semibold text-slate-800">{exp.submittedBy}</p>
              </div>
              <p className="text-[12px] text-slate-500 pl-5">{exp.submittedByEmail}</p>
              <p className="text-[12px] text-slate-500 pl-5">{exp.department}</p>
            </div>
          </section>

          {/* Fechas */}
          <section>
            <SectionLabel>Fechas</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {([['Fecha del gasto', exp.date], ['Fecha de envío', exp.submittedAt]] as [string, string][])
                .map(([l, d]) => (
                  <div key={l} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">{l}</p>
                    <p className="text-[12px] font-semibold text-slate-700 mt-1">{fmtDate(d)}</p>
                  </div>
                ))}
            </div>
          </section>

          {/* Monto */}
          <section>
            <SectionLabel>Detalle del gasto</SectionLabel>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <div className="flex justify-between px-4 py-3 border-b border-slate-50">
                <span className="text-[13px] text-slate-500">Concepto</span>
                <span className="text-[13px] font-medium text-slate-700 text-right max-w-[220px]">{exp.concept}</span>
              </div>
              <div className="flex justify-between px-4 py-3 border-b border-slate-50">
                <span className="text-[13px] text-slate-500">Categoría</span>
                <span className="text-[13px] font-medium text-slate-700">{exp.category}</span>
              </div>
              <div className="flex justify-between px-4 py-3 border-b border-slate-50">
                <span className="text-[13px] text-slate-500">Nivel aprobación</span>
                <ApprovalChip level={exp.approvalLevel} />
              </div>
              <div className="flex justify-between px-4 py-3.5 bg-teal-50 border-t border-teal-100">
                <span className="text-[13px] font-bold text-teal-800">Total</span>
                <span className="text-[15px] font-bold text-teal-800">{fmtCOP(exp.amount)}</span>
              </div>
            </div>
          </section>

          {exp.notes && (
            <section>
              <SectionLabel>Observaciones</SectionLabel>
              <p className="text-[13px] text-slate-600 bg-slate-50 rounded-xl p-4 border border-slate-100 leading-relaxed">
                {exp.notes}
              </p>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 flex gap-2.5 shrink-0">
          {exp.status === 'En revisión' && (
            <>
              <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-[13px] font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm">
                <CheckCircle2 className="h-4 w-4" /> Aprobar
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 py-2.5 text-[13px] font-semibold text-red-700 hover:bg-red-100 transition-colors">
                <XCircle className="h-4 w-4" /> Rechazar
              </button>
            </>
          )}
          {exp.status === 'Borrador' && (
            <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-[13px] font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm">
              <Send className="h-4 w-4" /> Enviar para aprobación
            </button>
          )}
          {exp.status === 'Aprobado' && (
            <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 py-2.5 text-[13px] font-semibold text-white hover:bg-teal-700 transition-colors shadow-sm">
              <Banknote className="h-4 w-4" /> Marcar como pagado
            </button>
          )}
          <button
            onClick={() => onOpenPdf(expenseToPdfMetadata(exp))}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 transition-colors"
            title="Ver soporte"
          >
            <FileText className="h-4 w-4" /> Soporte
          </button>
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
 * @property sortKey Clave de ordenamiento asociada.
 * @property active Indica si el criterio está activo.
 * @property onClick Acción a ejecutar al seleccionar el botón.
 */
type SortBtnProps = {
  label: string;
  sortKey: SortKey;
  active: boolean;
  onClick: () => void;
};

/**
 * Botón reutilizable para ordenar la tabla.
 *
 * @param props Propiedades del componente.
 * @returns Botón con indicador visual del criterio activo.
 */
function SortBtn({ label, sortKey: active, onClick }: SortBtnProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide transition-colors
      ${active ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
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
 * Tabla principal de gastos.
 *
 * @param props Propiedades del componente.
 * @returns Vista tabular con búsqueda, filtros, ordenamiento, paginación y detalle.
 *
 * @remarks
 * Este componente administra el flujo principal de consulta
 * y gestión de gastos del módulo financiero.
 *
 * Mantiene estado para:
 * - búsqueda
 * - filtro por estado
 * - ordenamiento
 * - paginación
 * - gasto seleccionado
 * - visor PDF
 * - apertura del panel de registro
 *
 * El conjunto visible de gastos se memoiza con `useMemo`
 * para optimizar el rendimiento del render.
 *
 * @example
 * ```tsx
 * <ExpenseTable expenses={expenses} />
 * ```
 */
export function ExpenseTable({ expenses }: Props) {
  /**
   * Texto actual de búsqueda.
   */
  const [search, setSearch] = useState('');

  /**
   * Estado actualmente seleccionado como filtro.
   */
  const [status, setStatus] = useState<ExpenseStatus | 'all'>('all');

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
   * Gasto seleccionado para mostrar en el drawer.
   */
  const [selected, setSelected] = useState<Expense | null>(null);

  /**
   * Metadatos del soporte actualmente abierto en el visor.
   */
  const [pdfMeta, setPdfMeta] = useState<PdfMetadata | null>(null);

  /**
   * Indica si el visor PDF se encuentra abierto.
   */
  const [pdfOpen, setPdfOpen] = useState(false);

  /**
   * Indica si el panel lateral de registro se encuentra abierto.
   */
  const [formOpen, setFormOpen] = useState(false);

  /**
   * Abre el visor PDF con los metadatos indicados.
   *
   * @param m Metadatos del documento a visualizar.
   */
  const openPdf = (m: PdfMetadata) => {
    setPdfMeta(m);
    setPdfOpen(true);
  };

  /**
   * Cierra el visor PDF y limpia sus metadatos posteriormente.
   */
  const closePdf = () => {
    setPdfOpen(false);
    setTimeout(() => setPdfMeta(null), 300);
  };

  /**
   * Alterna el criterio y dirección de ordenamiento.
   *
   * @param key Nueva clave de ordenamiento.
   *
   * @remarks
   * Si el criterio ya está activo, alterna entre ascendente
   * y descendente. Cuando cambia el criterio, la paginación
   * vuelve a la primera página.
   */
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(1);
  };

  /**
   * Lista de gastos filtrados y ordenados.
   *
   * @remarks
   * Este cálculo:
   * - aplica búsqueda por número, concepto, solicitante, área y categoría
   * - filtra por estado
   * - ordena según el criterio activo
   */
  const filtered = useMemo(() => {
    let data = [...expenses];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(e =>
        e.number.toLowerCase().includes(q) ||
        e.concept.toLowerCase().includes(q) ||
        e.submittedBy.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q),
      );
    }

    if (status !== 'all') {
      data = data.filter(e => e.status === status);
    }

    data.sort((a, b) => {
      const [va, vb] =
        sortKey === 'date' ? [a.date, b.date] :
        sortKey === 'amount' ? [a.amount, b.amount] :
        sortKey === 'number' ? [a.number, b.number] :
        [a.department, b.department];

      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

    return data;
  }, [expenses, search, status, sortKey, sortDir]);

  /**
   * Número total de páginas disponibles.
   */
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  /**
   * Subconjunto de gastos correspondiente a la página actual.
   */
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Concepto, área, solicitante…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400
                       focus:outline-none focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-500/15 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition shadow-sm">
            <Download className="h-3.5 w-3.5" /> Exportar
          </button>
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2.5 text-[12px] font-semibold text-white hover:bg-teal-700 transition shadow-sm shadow-teal-200"
          >
            <Plus className="h-3.5 w-3.5" /> Registrar gasto
          </button>
        </div>
      </div>

      {/* ── Status tabs ── */}
      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-0.5">
        {ALL_STATUSES.map(s => {
          const isAll = s === 'all';
          const cfg = isAll ? null : STATUS_CFG[s as ExpenseStatus];
          const count = isAll ? expenses.length : expenses.filter(e => e.status === s).length;
          const active = status === s;

          return (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[12px] font-medium whitespace-nowrap transition-all
                ${active ? 'bg-teal-600 border-teal-600 text-white shadow-sm shadow-teal-200'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-teal-300 hover:text-teal-600'}`}
            >
              {!isAll && cfg && <span className={`h-2 w-2 rounded-full ${active ? 'bg-white/70' : cfg.dotColor}`} />}
              {isAll ? 'Todos' : cfg!.label}
              <span className={`text-[11px] font-semibold ${active ? 'text-white/75' : 'text-slate-400'}`}>{count}</span>
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
                  <SortBtn label="Área" sortKey="department" active={sortKey === 'department'} onClick={() => toggleSort('department')} />
                </th>
                <th className="py-3 px-3 text-left hidden lg:table-cell">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Solicitante</span>
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
                <th className="py-3 pl-3 pr-5 w-20" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <Receipt className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-[13px] text-slate-400">No se encontraron gastos con esos criterios.</p>
                    </td>
                  </tr>
                ) : paged.map((exp, idx) => (
                  <motion.tr
                    key={exp.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.2 }}
                    onClick={() => setSelected(exp)}
                    className="group border-b border-slate-50 last:border-0 hover:bg-teal-50/30 cursor-pointer transition-colors"
                  >
                    {/* Número */}
                    <td className="py-3.5 pl-5 pr-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                          <Receipt className="h-3.5 w-3.5 text-teal-500" />
                        </div>
                        <div>
                          <p className="font-mono text-[13px] font-semibold text-slate-800">{exp.number}</p>
                          <p className="text-[11px] text-slate-400">{exp.category}</p>
                        </div>
                      </div>
                    </td>

                    {/* Área */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-start gap-2">
                        <Building2 className="mt-0.5 h-3.5 w-3.5 text-slate-300 shrink-0" />
                        <p className="text-[13px] font-medium text-slate-700">{exp.department}</p>
                      </div>
                    </td>

                    {/* Solicitante */}
                    <td className="py-3.5 px-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-bold text-slate-500">
                            {exp.submittedBy.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[12px] text-slate-600">{exp.submittedBy}</p>
                      </div>
                    </td>

                    {/* Fecha */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                        <Calendar className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                        {fmtDate(exp.date)}
                      </div>
                      <p className="mt-0.5 pl-5 text-[11px] text-slate-400 truncate max-w-[140px]">{exp.concept}</p>
                    </td>

                    {/* Monto + nivel aprobación */}
                    <td className="py-3.5 px-3 text-right">
                      <p className="text-[14px] font-bold text-slate-800">{fmtCOP(exp.amount)}</p>
                      <div className="flex justify-end mt-0.5">
                        <ApprovalChip level={exp.approvalLevel} />
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 px-3">
                      <StatusBadge status={exp.status} />
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 pl-3 pr-5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={e => { e.stopPropagation(); setSelected(exp); }}
                          className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-teal-100 hover:text-teal-600 transition"
                          title="Ver detalle"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); openPdf(expenseToPdfMetadata(exp)); }}
                          className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition"
                          title="Ver soporte"
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
                ))}
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
                  className={`h-7 w-7 rounded-lg text-[12px] font-medium transition ${
                    n === page ? 'bg-teal-600 text-white shadow-sm' : 'border border-slate-200 text-slate-500 hover:bg-white hover:text-teal-600'
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

      {selected && <ExpenseDrawer exp={selected} onClose={() => setSelected(null)} onOpenPdf={openPdf} />}
      {formOpen && <RegisterExpensePanel onClose={() => setFormOpen(false)} />}
      <PdfViewerModal open={pdfOpen} onClose={closePdf} metadata={pdfMeta} />
    </>
  );
}