/**
 * @module EmployeeCard
 * Tarjeta individual para representar un empleado dentro del directorio.
 *
 * @remarks
 * Este componente muestra información resumida de un empleado en formato tarjeta,
 * incluyendo:
 * - Avatar
 * - Nombre y cargo
 * - Estado laboral
 * - Información de contacto básica
 *
 * La tarjeta es completamente interactiva y actúa como botón para seleccionar
 * un empleado y visualizar su detalle.
 */

"use client";

import type { Employee } from "@/types/employee";
import { EmployeeAvatar } from "./EmployeeAvatar";
import { EmployeeStatusBadge } from "./EmployeeStatusBadge";
import { Mail, MapPin } from "lucide-react";

/**
 * Props del componente {@link EmployeeCard}.
 *
 * @property employee Objeto con la información del empleado a renderizar.
 * @property onClick Función callback ejecutada al seleccionar la tarjeta.
 */
type Props = {
  employee: Employee;
  onClick: (employee: Employee) => void;
};

/**
 * Clases base para el contenedor de la tarjeta.
 *
 * @remarks
 * Incluye estilos para:
 * - Estado normal
 * - Hover (resaltado visual)
 * - Focus accesible
 * - Transiciones suaves
 */
const CARD_CLS =
  "group relative w-full text-left bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col gap-3 hover:border-violet-300 hover:shadow-sm hover:shadow-violet-100/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-all duration-150 overflow-hidden";

/**
 * Clases para la barra decorativa superior.
 *
 * @remarks
 * Se activa en hover como indicador visual de interacción.
 */
const ACCENT_CLS =
  "absolute top-0 left-0 right-0 h-[2px] bg-transparent group-hover:bg-violet-600 transition-colors duration-200";

/**
 * Componente de tarjeta de empleado.
 *
 * @param props Propiedades del componente.
 * @returns Botón estilizado que representa un empleado.
 *
 * @remarks
 * Características principales:
 * - Componente accesible basado en `<button>`
 * - Feedback visual en hover y focus
 * - Delega avatar y estado a subcomponentes
 * - Muestra información compacta y truncada cuando es necesario
 *
 * @example
 * ```tsx
 * <EmployeeCard
 *   employee={employee}
 *   onClick={(emp) => setSelected(emp)}
 * />
 * ```
 */
export function EmployeeCard({ employee, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={() => onClick(employee)}
      className={CARD_CLS}
    >
      <span className={ACCENT_CLS} />

      <div className="flex items-start justify-between gap-2">
        <EmployeeAvatar employee={employee} size="md" />
        <EmployeeStatusBadge status={employee.status} />
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-900 leading-tight">
          {employee.displayName}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
          {employee.jobTitle}
        </p>
      </div>

      <div className="border-t border-slate-100 pt-3 flex flex-col gap-1.5">
        <MetaRow icon={<Mail size={11} />} text={employee.mail} />

        {employee.officeLocation ? (
          <MetaRow
            icon={<MapPin size={11} />}
            text={employee.officeLocation}
          />
        ) : null}
      </div>
    </button>
  );
}

/**
 * Props del componente {@link MetaRow}.
 *
 * @property icon Ícono representativo del dato.
 * @property text Texto a mostrar.
 */
type MetaRowProps = {
  icon: React.ReactNode;
  text: string;
};

/**
 * Componente helper para mostrar información secundaria del empleado.
 *
 * @param props Propiedades del elemento.
 * @returns Fila compacta con ícono y texto.
 *
 * @remarks
 * Se utiliza para datos como:
 * - Email
 * - Ubicación
 *
 * Incluye:
 * - Tipografía monoespaciada para consistencia visual
 * - Truncamiento de texto largo
 * - Alineación horizontal con ícono
 */
function MetaRow({ icon, text }: MetaRowProps) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono truncate">
      <span className="text-slate-400 flex-shrink-0">{icon}</span>
      <span className="truncate">{text}</span>
    </span>
  );
}