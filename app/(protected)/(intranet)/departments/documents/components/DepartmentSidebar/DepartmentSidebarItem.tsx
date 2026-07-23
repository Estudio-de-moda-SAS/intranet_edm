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
 * Únicamente renderiza la información recibida mediante propiedades.
 */

import {
  ChevronRight,
  FolderOpen,
} from "lucide-react";

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
  return (
    <button
      type="button"
      className={[
        "department-sidebar__item",
        selected
          ? "department-sidebar__item--selected"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
    >
      {/* Icono */}

      <div className="department-sidebar__item-icon">
        <FolderOpen size={18} />
      </div>

      {/* Información */}

      <div className="department-sidebar__item-content">

        <strong>
          {department.name}
        </strong>

        {department.description && (
          <span>
            {department.description}
          </span>
        )}

      </div>

      {/* Flecha */}

      <div className="department-sidebar__item-arrow">
        <ChevronRight size={18} />
      </div>
    </button>
  );
}