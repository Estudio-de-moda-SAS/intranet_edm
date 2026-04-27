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
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg transition ${
        disabled
          ? "text-slate-300 dark:text-[#30363d] cursor-not-allowed"
          : danger
            ? "text-slate-500 dark:text-[#768390] hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/[0.10] dark:hover:text-rose-400"
            : "text-slate-500 dark:text-[#768390] hover:bg-slate-100 dark:hover:bg-[#21262d] dark:hover:text-[#adbac7]"
      }`}
    >
      {children}
    </button>
  );
}