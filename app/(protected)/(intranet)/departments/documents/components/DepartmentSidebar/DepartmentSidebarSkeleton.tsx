"use client";

/**
 * @module DepartmentSidebarSkeleton
 *
 * Skeleton loader del Sidebar documental.
 *
 * @remarks
 * Renderiza una colección de elementos simulados mientras el catálogo
 * documental es cargado desde el servicio correspondiente.
 *
 * Su diseño replica la estructura visual de
 * {@link DepartmentSidebarItem} para reducir el cambio visual
 * cuando la información real termina de cargarse.
 */

const SKELETON_ITEMS = Array.from({ length: 7 });

export function DepartmentSidebarSkeleton() {
  return (
    <div className="department-sidebar__loading">

      {SKELETON_ITEMS.map((_, index) => (

        <div
          key={index}
          className="department-sidebar__skeleton-item"
        >

          {/* Icono */}

          <div className="department-sidebar__skeleton-icon" />

          {/* Texto */}

          <div className="department-sidebar__skeleton-content">

            <span className="department-sidebar__skeleton-title" />

            <span className="department-sidebar__skeleton-subtitle" />

          </div>

          {/* Flecha */}

          <div className="department-sidebar__skeleton-arrow" />

        </div>

      ))}

    </div>
  );
}