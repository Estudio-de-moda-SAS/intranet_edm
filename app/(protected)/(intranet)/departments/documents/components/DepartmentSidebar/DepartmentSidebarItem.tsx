"use client";

/**
 * @module DepartmentSidebarItem
 *
 * Representa una única área documental dentro del Sidebar del módulo
 * de Gestión Documental.
 *
 * @remarks
 * Este componente es completamente presentacional y reutilizable.
 *
 * No realiza consultas a Microsoft Graph ni conoce detalles sobre
 * SharePoint.
 *
 * Únicamente renderiza la información recibida mediante propiedades,
 * incluyendo el ícono correspondiente al área (resuelto a partir de
 * {@link DocumentDepartment.icon}).
 */

import { ChevronRight } from "lucide-react";

import { getDepartmentIcon } from "../../utils/getDepartmentIcon";
import type { DocumentDepartment } from "../../types/documentDepartment.types";

export interface DepartmentSidebarItemProps {
  /**
   * Área documental.
   */
  department: DocumentDepartment;

  /**
   * Indica si actualmente se encuentra seleccionada.
   */
  selected?: boolean;

  /**
   * Evento disparado al hacer clic.
   */
  onClick: () => void;
}

export function DepartmentSidebarItem({
  department,
  selected = false,
  onClick,
}: DepartmentSidebarItemProps) {
  const Icon = getDepartmentIcon(department.icon);

  return (
    <button
      type="button"
      className={[
        "department-sidebar__item",
        selected ? "department-sidebar__item--selected" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
    >
      <div className="department-sidebar__item-icon">
        <Icon size={17} strokeWidth={2} />
      </div>

      <div className="department-sidebar__item-content">
        <strong>{department.name}</strong>
      </div>

      <div className="department-sidebar__item-arrow">
        <ChevronRight size={16} />
      </div>
    </button>
  );
}