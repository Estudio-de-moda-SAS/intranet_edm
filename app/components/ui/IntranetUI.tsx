/**
 * @module IntranetUI
 * Conjunto de componentes UI reutilizables para la intranet.
 *
 * @remarks
 * Este archivo agrupa componentes base orientados a configuración,
 * formularios y secciones internas, usando variables semánticas de tema
 * para adaptarse automáticamente al modo claro y oscuro.
 */

"use client";

// components/ui/IntranetUI.tsx
'use client';

import { Save, X } from 'lucide-react';

/**
 * Props del componente {@link Toggle}.
 */
interface ToggleProps {
  /**
   * Estado actual del switch.
   */
  value: boolean;

  /**
   * Callback ejecutado al cambiar el valor.
   */
  onChange: (v: boolean) => void;

  /**
   * Tamaño visual del switch.
   *
   * @defaultValue "md"
   */
  size?: 'sm' | 'md';

  /**
   * Indica si el control está deshabilitado.
   *
   * @defaultValue false
   */
  disabled?: boolean;
}

/**
 * Renderiza un interruptor visual para valores booleanos.
 *
 * @param props Propiedades del componente.
 * @param props.value Estado actual.
 * @param props.onChange Función de cambio.
 * @param props.size Tamaño del control.
 * @param props.disabled Estado deshabilitado.
 * @returns Botón con comportamiento de switch.
 *
 * @remarks
 * - Usa `role="switch"` y `aria-checked` para accesibilidad.
 * - Ajusta dimensiones según `size`.
 * - Invierte el valor actual al hacer clic.
 */
export function Toggle({ value, onChange, size = 'md', disabled = false }: ToggleProps) {
  const track = size === 'sm' ? 'h-4 w-7' : 'h-5 w-9';
  const thumb = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const tx = size === 'sm' ? 'translate-x-3' : 'translate-x-4';

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
        ${value ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-600'}
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

/**
 * Props del componente {@link SectionCard}.
 */
interface SectionCardProps {
  /**
   * Contenido interno de la tarjeta.
   */
  children: React.ReactNode;

  /**
   * Clases adicionales del contenedor.
   */
  className?: string;
}

/**
 * Contenedor base para secciones de la intranet.
 *
 * @param props Propiedades del componente.
 * @param props.children Contenido interno.
 * @param props.className Clases adicionales.
 * @returns Tarjeta base con estilos semánticos de tema.
 *
 * @remarks
 * Usa variables CSS como:
 * - `--bg-card`
 * - `--border`
 * - `--shadow-card`
 */
export function SectionCard({ children, className = '' }: SectionCardProps) {
  return (
    <div
      className={`rounded-2xl border ${className}`}
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Props del componente {@link SectionHeader}.
 */
interface SectionHeaderProps {
  /**
   * Icono principal del encabezado.
   */
  icon: React.ElementType;

  /**
   * Título de la sección.
   */
  title: string;

  /**
   * Texto secundario opcional.
   */
  subtitle?: string;

  /**
   * Clases del fondo del icono.
   */
  iconBg?: string;

  /**
   * Clases del color del icono.
   */
  iconColor?: string;
}

/**
 * Encabezado reutilizable para secciones internas.
 *
 * @param props Propiedades del componente.
 * @param props.icon Icono visual.
 * @param props.title Título principal.
 * @param props.subtitle Texto secundario opcional.
 * @param props.iconBg Fondo del contenedor del icono.
 * @param props.iconColor Color del icono.
 * @returns Encabezado con icono, título y subtítulo.
 */
export function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  iconBg = 'bg-violet-50 dark:bg-violet-500/10',
  iconColor = 'text-violet-600 dark:text-violet-400',
}: SectionHeaderProps) {
  return (
    <div
      className="flex items-center gap-3 border-b px-6 py-4"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div>
        <p className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </p>
        {subtitle && (
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Props del componente {@link RowSetting}.
 */
interface RowSettingProps {
  /**
   * Etiqueta principal del ajuste.
   */
  label: string;

  /**
   * Descripción opcional del ajuste.
   */
  description?: string;

  /**
   * Control o contenido asociado al ajuste.
   */
  children: React.ReactNode;

  /**
   * Define si se dibuja borde inferior.
   *
   * @defaultValue true
   */
  border?: boolean;
}

/**
 * Fila reutilizable para ajustes o configuraciones.
 *
 * @param props Propiedades del componente.
 * @param props.label Etiqueta principal.
 * @param props.description Texto secundario.
 * @param props.children Control asociado.
 * @param props.border Indica si lleva borde inferior.
 * @returns Fila de configuración con etiqueta y control.
 */
export function RowSetting({ label, description, children, border = true }: RowSettingProps) {
  return (
    <div
      className={`flex items-center justify-between gap-6 px-6 py-4 ${border ? 'border-b' : ''}`}
      style={border ? { borderColor: 'var(--border-subtle)' } : undefined}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </p>
        {description && (
          <p
            className="mt-0.5 text-[11px] leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/**
 * Props del componente {@link EditableField}.
 */
interface EditableFieldProps {
  /**
   * Etiqueta visible del campo.
   */
  label: string;

  /**
   * Valor actual del campo.
   */
  value: string;

  /**
   * Tipo del input HTML.
   *
   * @defaultValue "text"
   */
  type?: string;

  /**
   * Placeholder opcional.
   */
  placeholder?: string;

  /**
   * Indica si el campo está en modo edición.
   */
  editing: boolean;

  /**
   * Acción para entrar en modo edición.
   */
  onEdit: () => void;

  /**
   * Callback de cambio del valor.
   */
  onChange: (v: string) => void;

  /**
   * Acción de guardado.
   */
  onSave: () => void;

  /**
   * Acción de cancelación.
   */
  onCancel: () => void;
}

/**
 * Campo editable reutilizable con modos lectura y edición.
 *
 * @param props Propiedades del componente.
 * @returns Campo con acciones de editar, guardar y cancelar.
 *
 * @remarks
 * Flujo general:
 * - En modo lectura muestra el valor actual o un placeholder semántico.
 * - En modo edición renderiza un `input` controlado.
 * - Muestra acciones contextuales según el estado.
 */
export function EditableField({
  label,
  value,
  type = 'text',
  placeholder,
  editing,
  onEdit,
  onChange,
  onSave,
  onCancel,
}: EditableFieldProps) {
  return (
    <div className="group flex items-center justify-between gap-4 py-3">
      <div className="min-w-0 flex-1">
        <p
          className="mb-1 text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </p>

        {editing ? (
          <input
            autoFocus
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-violet-300 dark:border-violet-500/40
                       bg-violet-50/30 dark:bg-violet-500/10
                       px-3 py-1.5 text-[13px] outline-none
                       ring-2 ring-violet-500/20 transition-all"
            style={{ color: 'var(--text-primary)' }}
          />
        ) : (
          <p className="text-[13px] truncate" style={{ color: 'var(--text-secondary)' }}>
            {value || (
              <span style={{ color: 'var(--text-faint)' }} className="italic">
                Sin completar
              </span>
            )}
          </p>
        )}
      </div>

      <div className="shrink-0">
        {editing ? (
          <div className="flex gap-1">
            <button
              onClick={onSave}
              className="flex h-7 w-7 items-center justify-center rounded-lg
                         bg-violet-600 text-white hover:bg-violet-700 transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onCancel}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--bg-muted)',
                color: 'var(--text-muted)',
              }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onEdit}
            className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center
                       justify-center rounded-lg transition-all
                       hover:bg-slate-100 dark:hover:bg-slate-700"
            style={{ color: 'var(--text-muted)' }}
            aria-label={`Editar ${label}`}
          >
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

/**
 * Props del componente {@link SaveBar}.
 */
interface SaveBarProps {
  /**
   * Indica si existen cambios pendientes por guardar.
   */
  dirty: boolean;

  /**
   * Acción principal de guardado.
   */
  onSave: () => void;

  /**
   * Indica si ya se guardó correctamente.
   */
  saved: boolean;
}

/**
 * Barra flotante de guardado para formularios o configuraciones.
 *
 * @param props Propiedades del componente.
 * @returns Barra fija inferior con estado de guardado.
 *
 * @remarks
 * Comportamiento:
 * - Si no hay cambios ni confirmación de guardado, no renderiza nada.
 * - Si `saved` es `true`, muestra confirmación visual.
 * - Si `dirty` es `true`, muestra llamada a la acción para guardar.
 */
export function SaveBar({ dirty, onSave, saved }: SaveBarProps) {
  if (!dirty && !saved) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div
        className="flex items-center gap-3 rounded-2xl border px-5 py-3"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
          boxShadow: '0 8px 30px rgb(0 0 0 / 0.12)',
        }}
      >
        {saved ? (
          <>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              Cambios guardados
            </p>
          </>
        ) : (
          <>
            <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
              Tienes cambios sin guardar
            </p>
            <button
              onClick={onSave}
              className="rounded-xl bg-violet-600 px-4 py-1.5 text-[12px] font-semibold
                         text-white hover:bg-violet-700 transition-colors shadow-sm"
            >
              Guardar
            </button>
          </>
        )}
      </div>
    </div>
  );
}