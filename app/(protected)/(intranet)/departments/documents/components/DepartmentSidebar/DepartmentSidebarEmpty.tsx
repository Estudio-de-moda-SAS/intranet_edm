"use client";

/**
 * @module DepartmentSidebarEmpty
 *
 * Estado vacío reutilizable para el Sidebar documental.
 *
 * @remarks
 * Este componente representa los diferentes estados en los que el
 * Sidebar no tiene información para mostrar.
 *
 * Su diseño es completamente genérico para permitir su reutilización
 * en distintos escenarios del módulo documental, como por ejemplo:
 *
 * - Catálogo vacío.
 * - Sin resultados de búsqueda.
 * - Error durante la carga.
 * - Biblioteca vacía.
 * - Carpeta sin documentos.
 *
 * El contenido mostrado es completamente configurable mediante
 * propiedades.
 */

import { FolderSearch } from "lucide-react";

export interface DepartmentSidebarEmptyProps {
  /**
   * Título principal.
   */
  title: string;

  /**
   * Descripción mostrada debajo del título.
   */
  description?: string;

  /**
   * Icono personalizado.
   *
   * Si no se especifica, se utilizará FolderSearch.
   */
  icon?: React.ReactNode;
}

export function DepartmentSidebarEmpty({
  title,
  description,
  icon,
}: DepartmentSidebarEmptyProps) {
  return (
    <div className="department-sidebar__empty">

      <div className="department-sidebar__empty-icon">
        {icon ?? <FolderSearch size={34} strokeWidth={1.7} />}
      </div>

      <h3 className="department-sidebar__empty-title">
        {title}
      </h3>

      {description && (
        <p className="department-sidebar__empty-description">
          {description}
        </p>
      )}

    </div>
  );
}