/**
 * @module EmployeeTable
 * Tabla interactiva para visualizar el listado de empleados.
 *
 * @remarks
 * Este componente renderiza una tabla responsiva con información básica
 * de empleados, incluyendo:
 * - Nombre y avatar
 * - Cargo
 * - Email (visible desde md)
 * - Ubicación (visible desde lg)
 * - Estado laboral
 *
 * Cada fila es interactiva y permite seleccionar un empleado mediante click
 * o teclado (Enter), delegando la acción al handler recibido por props.
 */

"use client";

import type { Employee }       from "@/types/employee";
import { EmployeeAvatar }      from "./EmployeeAvatar";
import { EmployeeStatusBadge } from "./EmployeeStatusBadge";
import { ChevronRight }        from "lucide-react";

/**
 * Props del componente {@link EmployeeTable}.
 *
 * @property employees Lista de empleados a renderizar en la tabla.
 * @property onClick Función callback ejecutada al seleccionar un empleado.
 */
type Props = {
  employees: Employee[];
  onClick: (employee: Employee) => void;
};

/**
 * Componente de tabla de empleados.
 *
 * @param props Propiedades del componente.
 * @returns Tabla interactiva con información de empleados.
 *
 * @remarks
 * Características principales:
 * - Navegación accesible (click + teclado).
 * - Adaptación responsive mediante columnas condicionales.
 * - Delegación de render de avatar y estado a subcomponentes especializados.
 *
 * @example
 * ```tsx
 * <EmployeeTable
 *   employees={employees}
 *   onClick={(emp) => console.log(emp)}
 * />
 * ```
 */
export function EmployeeTable({ employees, onClick }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200/80 overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-slate-50 to-slate-50/60 border-b border-slate-200/80">
            <TH>Empleado</TH>
            <TH>Cargo</TH>
            <TH hide="md">Email</TH>
            <TH hide="lg">Ubicación</TH>
            <TH>Estado</TH>
            <TH><span /></TH>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {employees.map((emp) => (
            <tr
              key={emp.id}
              onClick={() => onClick(emp)}
              onKeyDown={(e) => { if (e.key === "Enter") onClick(emp); }}
              role="button"
              tabIndex={0}
              aria-label={`Ver perfil de ${emp.displayName}`}
              className="bg-white hover:bg-violet-50/50 cursor-pointer transition-colors duration-100 group"
            >
              {/* Nombre + Avatar */}
              <td className="px-5 py-3.5 align-middle">
                <div className="flex items-center gap-3">
                  <EmployeeAvatar employee={emp} size="sm" />
                  <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                    {emp.displayName}
                  </span>
                </div>
              </td>

              {/* Cargo */}
              <td className="px-4 py-3.5 text-sm text-slate-500 align-middle">
                {emp.jobTitle}
              </td>

              {/* Email */}
              <td className="px-4 py-3.5 align-middle hidden md:table-cell">
                <span className="text-xs font-mono text-slate-500">
                  {emp.mail}
                </span>
              </td>

              {/* Ubicación */}
              <td className="px-4 py-3.5 text-sm text-slate-500 align-middle hidden lg:table-cell">
                {emp.officeLocation ?? "—"}
              </td>

              {/* Estado */}
              <td className="px-4 py-3.5 align-middle">
                <EmployeeStatusBadge status={emp.status} />
              </td>

              {/* Acción */}
              <td className="px-4 py-3.5 align-middle w-8">
                <ChevronRight
                  size={15}
                  className="text-slate-300 group-hover:text-violet-500 transition-colors"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Props del componente {@link TH}.
 *
 * @property children Contenido del encabezado.
 * @property hide Define el breakpoint en el que se oculta la columna.
 */
type THProps = {
  children: React.ReactNode;
  hide?: "md" | "lg";
};

/**
 * Componente helper para encabezados de tabla.
 *
 * @param props Propiedades del encabezado.
 * @returns Elemento `<th>` estilizado y responsivo.
 *
 * @remarks
 * Permite ocultar columnas según breakpoint:
 * - `md`: se oculta en pantallas pequeñas
 * - `lg`: se oculta en pantallas medianas
 */
function TH({ children, hide }: THProps) {
  const base =
    "px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono";

  const cls =
    hide === "md"
      ? `${base} hidden md:table-cell`
      : hide === "lg"
      ? `${base} hidden lg:table-cell`
      : base;

  return <th className={cls}>{children}</th>;
}