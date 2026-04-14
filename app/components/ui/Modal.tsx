/**
 * @module Modal
 * Componente cliente reutilizable para mostrar contenido en una ventana modal.
 *
 * @remarks
 * Este archivo implementa una estructura modal genérica con:
 * - portal a `document.body`,
 * - cierre por backdrop y tecla Escape,
 * - bloqueo de scroll del body,
 * - header, body y footer opcionales,
 * - tamaños predefinidos.
 */

// app/components/ui/Modal.tsx
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Tamaños soportados por el modal.
 */
export type ModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";

/**
 * Props del componente {@link Modal}.
 */
export interface ModalProps {
  /**
   * Indica si el modal está abierto.
   */
  open: boolean;

  /**
   * Callback ejecutado al cerrar el modal.
   */
  onClose: () => void;

  /**
   * Título principal del modal.
   */
  title?: string;

  /**
   * Subtítulo opcional.
   */
  subtitle?: string;

  /**
   * Contenido principal del modal.
   */
  children: React.ReactNode;

  /**
   * Contenido opcional del footer.
   */
  footer?: React.ReactNode;

  /**
   * Tamaño visual del modal.
   *
   * @defaultValue "sm"
   */
  size?: ModalSize;

  /**
   * Clase del color de la barra superior.
   *
   * @defaultValue "bg-violet-600"
   */
  accentColor?: string;

  /**
   * Indica si debe ocultarse el botón de cierre.
   *
   * @defaultValue false
   */
  hideCloseButton?: boolean;

  /**
   * Clases adicionales del panel principal.
   */
  className?: string;

  /**
   * Desactiva el cierre al hacer clic sobre el backdrop.
   *
   * @defaultValue false
   */
  disableBackdropClose?: boolean;

  /**
   * Desactiva el cierre mediante la tecla Escape.
   *
   * @defaultValue false
   */
  disableEscapeClose?: boolean;
}

/**
 * Mapa de clases por tamaño del modal.
 */
const SIZE_CLASSES: Record<ModalSize, string> = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full mx-4",
};

/**
 * Renderiza un modal reutilizable con portal, overlay y estructura fija.
 *
 * @param props Propiedades del componente.
 * @param props.open Estado de apertura.
 * @param props.onClose Función de cierre.
 * @param props.title Título del modal.
 * @param props.subtitle Subtítulo opcional.
 * @param props.children Contenido principal.
 * @param props.footer Footer opcional.
 * @param props.size Tamaño del modal.
 * @param props.accentColor Clase de color de la barra superior.
 * @param props.hideCloseButton Controla la visibilidad del botón cerrar.
 * @param props.className Clases adicionales del panel.
 * @param props.disableBackdropClose Desactiva cierre por backdrop.
 * @param props.disableEscapeClose Desactiva cierre con Escape.
 * @returns Modal renderizado en portal o `null` si no está abierto.
 *
 * @remarks
 * Flujo general:
 * 1. Espera a que el componente monte para evitar hydration mismatch con `createPortal`.
 * 2. Registra cierre por tecla Escape si está habilitado.
 * 3. Bloquea el scroll del `body` mientras el modal está abierto.
 * 4. Renderiza un overlay con cierre opcional por backdrop.
 * 5. Estructura el contenido en:
 *    - barra superior decorativa,
 *    - header fijo,
 *    - body con scroll,
 *    - footer fijo.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "sm",
  accentColor = "bg-violet-600",
  hideCloseButton = false,
  className = "",
  disableBackdropClose = false,
  disableEscapeClose = false,
}: ModalProps) {
  /**
   * Estado local para asegurar montaje en cliente antes de usar portal.
   */
  const [mounted, setMounted] = useState(false);

  /**
   * Marca el componente como montado.
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Maneja el cierre con tecla Escape.
   */
  useEffect(() => {
    if (!open || disableEscapeClose) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, disableEscapeClose]);

  /**
   * Bloquea el scroll del body mientras el modal está abierto.
   */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm"
      onClick={disableBackdropClose ? undefined : (e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`
          relative flex flex-col w-full ${SIZE_CLASSES[size]}
          max-h-[calc(100vh-3rem)]
          overflow-hidden rounded-2xl bg-white shadow-2xl
          ${className}
        `}
      >
        {/* Accent bar */}
        <div className={`h-1 w-full shrink-0 ${accentColor}`} />

        {/* Header */}
        {(title || !hideCloseButton) && (
          <div className="flex shrink-0 items-start justify-between px-6 pt-5 pb-0">
            {title && (
              <div>
                <h2 id="modal-title" className="text-base font-bold text-slate-800">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {!hideCloseButton && (
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-slate-100"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 border-t border-slate-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}