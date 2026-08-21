import React from "react";

/**
 * @module PdfViewerModal/components/ToolbarBtn
 * Botón reutilizable para acciones de la barra superior.
 */

interface ToolbarBtnProps {
  /**
   * Acción al hacer click.
   */
  onClick?: () => void;

  /**
   * Tooltip nativo del botón.
   */
  title?: string;

  /**
   * Indica si el botón está deshabilitado.
   */
  disabled?: boolean;

  /**
   * Activa variante visual de peligro.
   */
  danger?: boolean;

  /**
   * Contenido interno del botón.
   */
  children: React.ReactNode;
}

/**
 * Botón pequeño reutilizable para la toolbar del visor.
 *
 * @param props Propiedades del componente.
 * @returns Botón de acción con variantes visuales.
 */
export function ToolbarBtn({
  onClick,
  title,
  disabled = false,
  danger = false,
  children,
}: ToolbarBtnProps) {
  const className = [
    "pdf-viewer-modal__toolbar-btn",
    disabled && "pdf-viewer-modal__toolbar-btn--disabled",
    danger && !disabled && "pdf-viewer-modal__toolbar-btn--danger",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button onClick={onClick} disabled={disabled} title={title} className={className}>
      {children}
    </button>
  );
}