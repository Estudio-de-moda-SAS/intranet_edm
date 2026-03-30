// app/components/ui/Modal.tsx
"use client";

import { useEffect, useState } from "react";
import { createPortal }        from "react-dom";
import { X }                   from "lucide-react";

export type ModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";

export interface ModalProps {
  open:                  boolean;
  onClose:               () => void;
  title?:                string;
  subtitle?:             string;
  children:              React.ReactNode;
  footer?:               React.ReactNode;
  size?:                 ModalSize;
  accentColor?:          string;
  hideCloseButton?:      boolean;
  className?:            string;
  disableBackdropClose?: boolean;
  disableEscapeClose?:   boolean;
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  xs:   "max-w-xs",
  sm:   "max-w-sm",
  md:   "max-w-md",
  lg:   "max-w-lg",
  xl:   "max-w-xl",
  full: "max-w-full mx-4",
};

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size                 = "sm",
  accentColor          = "bg-violet-600",
  hideCloseButton      = false,
  className            = "",
  disableBackdropClose = false,
  disableEscapeClose   = false,
}: ModalProps) {

  // Necesario para evitar hydration mismatch con createPortal
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Escape
  useEffect(() => {
    if (!open || disableEscapeClose) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, disableEscapeClose]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
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
      {/*
        Fix: el panel usa flex-col + max-h para no salirse de la pantalla.
        - max-h-[calc(100vh-3rem)]: deja 1.5rem de margen arriba y abajo
        - flex flex-col: permite que header y footer sean fijos y el body scrollee
      */}
      <div
        className={`
          relative flex flex-col w-full ${SIZE_CLASSES[size]}
          max-h-[calc(100vh-3rem)]
          overflow-hidden rounded-2xl bg-white shadow-2xl
          ${className}
        `}
      >
        {/* Accent bar — siempre visible, no scrollea */}
        <div className={`h-1 w-full shrink-0 ${accentColor}`} />

        {/* Header — fijo, no scrollea */}
        {(title || !hideCloseButton) && (
          <div className="flex shrink-0 items-start justify-between px-6 pt-5 pb-0">
            {title && (
              <div>
                <h2 id="modal-title" className="text-base font-bold text-slate-800">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-0.5 text-[11px] text-slate-400">{subtitle}</p>
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

        {/* Body — único que scrollea cuando el contenido es largo */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer — fijo, no scrollea */}
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