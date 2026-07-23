"use client";

/**
 * @module DepartmentSidebar
 *
 * Sidebar principal del módulo de Gestión Documental.
 *
 * @remarks
 * Este componente representa el punto de entrada a la navegación
 * documental de la Intranet.
 *
 * Su responsabilidad consiste exclusivamente en presentar las áreas
 * documentales disponibles y permitir la navegación entre ellas.
 *
 * No contiene lógica relacionada con Microsoft Graph, SharePoint,
 * autorización o consultas remotas.
 *
 * Toda la información es recibida mediante propiedades o mediante
 * el hook {@link useDocumentDepartments}.
 */

import { useMemo, useState } from "react";
import { Building2, Search } from "lucide-react";

import { useDocumentDepartments } from "../../hooks/useDocumentDepartments";
import type { DocumentDepartment } from "../../types/documentDepartment.types";

import { DepartmentSidebarItem } from "./DepartmentSidebarItem";
import { DepartmentSidebarSkeleton } from "./DepartmentSidebarSkeleton";
import { DepartmentSidebarEmpty } from "./DepartmentSidebarEmpty";

import "./DepartmentSidebar.css";

export interface DepartmentSidebarProps {
  /**
   * Departamento actualmente seleccionado.
   */
  selectedDepartment?: DocumentDepartment;

  /**
   * Evento disparado al seleccionar un departamento.
   */
  onSelectDepartment: (department: DocumentDepartment) => void;
}

export function DepartmentSidebar({
  selectedDepartment,
  onSelectDepartment,
}: DepartmentSidebarProps) {
  const { departments, loading, error, search } = useDocumentDepartments();

  const [searchValue, setSearchValue] = useState("");

  /**
   * Cantidad de departamentos actualmente visibles.
   */
  const totalDepartments = useMemo(() => departments.length, [departments]);

  return (
    <aside className="department-sidebar">
      {/* ================= HEADER ================= */}

      <header className="department-sidebar__header">
        <div className="department-sidebar__title">
          <span className="department-sidebar__icon">
            <Building2 size={18} />
          </span>

          <div>
            <h2>Áreas documentales</h2>

            <p>
              {loading
                ? "Cargando..."
                : `${totalDepartments} área${totalDepartments === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>
      </header>

      {/* ================= BUSCADOR ================= */}

      <div className="department-sidebar__search">
        <Search size={16} />

        <input
          type="search"
          placeholder="Buscar área..."
          value={searchValue}
          onChange={async (event) => {
            const value = event.target.value;

            setSearchValue(value);

            await search(value);
          }}
        />
      </div>

      {/* ================= CONTENIDO ================= */}

      <div className="department-sidebar__body">
        {loading && <DepartmentSidebarSkeleton />}

        {!loading && error && (
          <DepartmentSidebarEmpty
            title="No fue posible cargar el catálogo."
            description={error}
          />
        )}

        {!loading && !error && departments.length === 0 && (
          <DepartmentSidebarEmpty
            title="No hay áreas disponibles."
            description="No existen áreas documentales configuradas."
          />
        )}

        {!loading &&
          !error &&
          departments.map((department) => (
            <DepartmentSidebarItem
              key={department.id}
              department={department}
              selected={department.id === selectedDepartment?.id}
              onClick={() => onSelectDepartment(department)}
            />
          ))}
      </div>
    </aside>
  );
}