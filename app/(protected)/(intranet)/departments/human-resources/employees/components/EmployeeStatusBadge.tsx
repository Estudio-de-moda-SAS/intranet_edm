/**
 * @module EmployeeStatusBadge
 * Badge visual para representar el estado laboral de un empleado.
 *
 * @remarks
 * Este componente muestra un indicador compacto con:
 * - Color contextual según estado
 * - Punto visual (dot)
 * - Etiqueta legible
 *
 * Está diseñado para ser reutilizado en tablas, cards y vistas de perfil.
 */

import type { Employee } from "@/types/employee";

/**
 * Props del componente {@link EmployeeStatusBadge}.
 *
 * @property status Estado del empleado.
 * @property className Clases adicionales para personalización visual.
 */
type Props = {
  status: Employee["status"];
  className?: string;
};

/**
 * Configuración visual por estado de empleado.
 *
 * @remarks
 * Centraliza estilos para facilitar:
 * - Consistencia visual en toda la app
 * - Escalabilidad (agregar nuevos estados)
 * - Mantenimiento (cambio de colores global)
 */
const CONFIG: Record<
  Employee["status"],
  {
    /** Texto mostrado al usuario */
    label: string;

    /** Color del indicador puntual */
    dot: string;

    /** Fondo del badge */
    bg: string;

    /** Color del texto */
    text: string;
  }
> = {
  active: {
    label: "Activo",
    dot: "bg-green-500",
    bg: "bg-green-50",
    text: "text-green-800",
  },
  remote: {
    label: "Remoto",
    dot: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-800",
  },
  leave: {
    label: "En licencia",
    dot: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-800",
  },
  inactive: {
    label: "Inactivo",
    dot: "bg-slate-400",
    bg: "bg-slate-100",
    text: "text-slate-600",
  },
};

/**
 * Badge de estado de empleado.
 *
 * @param props Propiedades del componente.
 * @returns Elemento visual tipo badge con estado formateado.
 *
 * @example
 * ```tsx
 * <EmployeeStatusBadge status="active" />
 * ```
 *
 * @example
 * ```tsx
 * <EmployeeStatusBadge status="leave" className="text-xs" />
 * ```
 *
 * @remarks
 * - Usa un sistema de configuración (`CONFIG`) para desacoplar lógica y UI.
 * - Permite extensión sencilla agregando nuevos estados en el mapa.
 * - Pensado para consistencia en dashboards y tablas.
 */
export function EmployeeStatusBadge({ status, className = "" }: Props) {
  const config = CONFIG[status];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full
        text-[11px] font-medium
        ${config.bg} ${config.text} ${className}
      `}
    >
      <span
        className={`
          w-1.5 h-1.5 rounded-full flex-shrink-0
          ${config.dot}
        `}
      />
      {config.label}
    </span>
  );
}