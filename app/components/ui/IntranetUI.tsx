// components/ui/IntranetUI.tsx
// Componentes UI atómicos reutilizables en perfil, configuración y resto de la intranet

'use client';

import { Save, X } from 'lucide-react';

// ─── Toggle ───────────────────────────────────────────────────────

interface ToggleProps {
  value:    boolean;
  onChange: (v: boolean) => void;
  size?:    'sm' | 'md';
  disabled?: boolean;
}

export function Toggle({ value, onChange, size = 'md', disabled = false }: ToggleProps) {
  const track = size === 'sm' ? 'h-4 w-7'  : 'h-5 w-9';
  const thumb = size === 'sm' ? 'h-3 w-3'  : 'h-4 w-4';
  const tx    = size === 'sm' ? 'translate-x-3' : 'translate-x-4';

  return (
    <button
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={`
        relative inline-flex ${track} shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30
        disabled:opacity-40 disabled:cursor-not-allowed
        ${value ? 'bg-violet-600' : 'bg-slate-200'}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block ${thumb} transform rounded-full bg-white shadow
          transition-transform duration-200 ${value ? tx : 'translate-x-0'}
        `}
      />
    </button>
  );
}

// ─── SectionCard ─────────────────────────────────────────────────

interface SectionCardProps {
  children:  React.ReactNode;
  className?: string;
}

export function SectionCard({ children, className = '' }: SectionCardProps) {
  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────

interface SectionHeaderProps {
  icon:      React.ElementType;
  title:     string;
  subtitle?: string;
  iconBg?:   string;
  iconColor?: string;
}

export function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  iconBg    = 'bg-violet-50',
  iconColor = 'text-violet-600',
}: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div>
        <p className="text-[13px] font-bold text-slate-800">{title}</p>
        {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── RowSetting ───────────────────────────────────────────────────

interface RowSettingProps {
  label:        string;
  description?: string;
  children:     React.ReactNode;
  border?:      boolean;
}

export function RowSetting({ label, description, children, border = true }: RowSettingProps) {
  return (
    <div className={`flex items-center justify-between gap-6 px-6 py-4 ${border ? 'border-b border-slate-50' : ''}`}>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-slate-700">{label}</p>
        {description && (
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ─── EditableField ────────────────────────────────────────────────

interface EditableFieldProps {
  label:       string;
  value:       string;
  type?:       string;
  placeholder?: string;
  editing:     boolean;
  onEdit:      () => void;
  onChange:    (v: string) => void;
  onSave:      () => void;
  onCancel:    () => void;
}

export function EditableField({
  label, value, type = 'text', placeholder,
  editing, onEdit, onChange, onSave, onCancel,
}: EditableFieldProps) {
  return (
    <div className="group flex items-center justify-between gap-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        {editing ? (
          <input
            autoFocus
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-violet-300 bg-violet-50/30 px-3 py-1.5 text-[13px] text-slate-800 outline-none ring-2 ring-violet-500/20 transition-all"
          />
        ) : (
          <p className="text-[13px] text-slate-700 truncate">
            {value || <span className="italic text-slate-300">Sin completar</span>}
          </p>
        )}
      </div>

      <div className="shrink-0">
        {editing ? (
          <div className="flex gap-1">
            <button
              onClick={onSave}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onCancel}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onEdit}
            className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
            aria-label={`Editar ${label}`}
          >
            {/* Pencil inline para evitar import extra */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── SaveBar ──────────────────────────────────────────────────────

interface SaveBarProps {
  dirty:   boolean;
  onSave:  () => void;
  saved:   boolean;
}

export function SaveBar({ dirty, onSave, saved }: SaveBarProps) {
  if (!dirty && !saved) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-xl shadow-slate-200/60">
        {saved ? (
          <>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5 text-emerald-600">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-[13px] font-medium text-slate-700">Cambios guardados</p>
          </>
        ) : (
          <>
            <p className="text-[13px] text-slate-500">Tienes cambios sin guardar</p>
            <button
              onClick={onSave}
              className="rounded-xl bg-violet-600 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-violet-700 transition-colors shadow-sm shadow-violet-200"
            >
              Guardar
            </button>
          </>
        )}
      </div>
    </div>
  );
}