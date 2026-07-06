"use client";

import type { ReactNode } from "react";

interface ToolbarIconButtonProps {
  /**
   * Icono mostrado dentro del botón.
   */
  icon: ReactNode;

  /**
   * Texto mostrado en el tooltip.
   */
  label: string;

  /**
   * Acción al hacer clic.
   */
  onClick: () => void;

  /**
   * Estado activo.
   */
  active?: boolean;

  /**
   * Estado deshabilitado.
   */
  disabled?: boolean;

  /**
   * Tamaño del botón.
   */
  size?: "sm" | "md";

  /**
   * Variante visual.
   */
  variant?: "default" | "primary";
}

export function ToolbarIconButton({
  icon,
  label,
  onClick,
  active = false,
  disabled = false,
  size = "md",
  variant = "default",
}: ToolbarIconButtonProps) {
  return (
    <div className="organization-toolbar-icon-button__wrapper">
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        className={[
          "organization-toolbar-icon-button",
          `organization-toolbar-icon-button--${size}`,
          `organization-toolbar-icon-button--${variant}`,
          active ? "organization-toolbar-icon-button--active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {icon}
      </button>

      <span className="organization-toolbar-tooltip">
        {label}
      </span>
    </div>
  );
}