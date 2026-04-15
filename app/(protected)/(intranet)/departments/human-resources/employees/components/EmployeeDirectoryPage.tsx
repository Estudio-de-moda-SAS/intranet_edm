/**
 * @module EmployeeDirectory
 * Página principal para la visualización y gestión del directorio de empleados.
 *
 * @remarks
 * Este componente orquesta la experiencia completa del directorio,
 * integrando:
 * - Filtros y búsqueda
 * - Estadísticas agregadas
 * - Vista en grid o lista
 * - Agrupación por departamento
 * - Selección de empleado con detalle en drawer
 *
 * Se apoya en el hook {@link useEmployeeFilters} para encapsular
 * la lógica de filtrado, agrupación y estado de la UI.
 */

"use client";

import { useState } from "react";
import type { Employee } from "@/types/employee";
import { useEmployeeFilters } from "@/hooks/useEmployeeFilters";
import { DirectoryToolbar } from "./DirectoryToolbar";
import { DirectoryStatsBar } from "./DirectoryStatsBar";
import { EmployeeCard } from "./EmployeeCard";
import { EmployeeTable } from "./EmployeeTable";
import { EmployeeDrawer } from "./EmployeeDrawer";
import { DirectoryEmpty } from "./DirectoryEmpty";

/**
 * Props del componente {@link EmployeeDirectory}.
 *
 * @property employees Lista completa de empleados disponibles.
 */
type Props = { employees: Employee[] };

/**
 * Componente principal del directorio de empleados.
 *
 * @param props Propiedades del componente.
 * @returns Vista completa del directorio con filtros, agrupación y detalle.
 *
 * @remarks
 * Responsabilidades principales:
 * - Gestionar el estado de selección de empleado
 * - Integrar el hook de filtrado y agrupación
 * - Alternar entre vistas (`grid` y `list`)
 * - Renderizar estados vacíos cuando no hay resultados
 * - Delegar renderizado a subcomponentes especializados
 *
 * Flujo general:
 * 1. Se reciben empleados como entrada.
 * 2. Se procesan mediante {@link useEmployeeFilters}.
 * 3. Se renderizan agrupados por departamento.
 * 4. Se permite seleccionar un empleado para ver su detalle en el drawer.
 *
 * @example
 * ```tsx
 * <EmployeeDirectory employees={employees} />
 * ```
 */
export function EmployeeDirectory({ employees }: Props) {
  const {
    filters,
    viewMode,
    grouped,
    filtered,
    stats,
    hasActiveFilters,
    setQuery,
    setDepartmentId,
    setStatus,
    setViewMode,
    clearFilters,
  } = useEmployeeFilters(employees);

  const [selected, setSelected] = useState<Employee | null>(null);

  return (
    <>
      <DirectoryStatsBar stats={stats} />

      <DirectoryToolbar
        filters={filters}
        viewMode={viewMode}
        hasActiveFilters={hasActiveFilters}
        onQueryChange={setQuery}
        onDeptChange={setDepartmentId}
        onStatusChange={setStatus}
        onViewChange={setViewMode}
        onClear={clearFilters}
      />

      <div className="px-8 lg:px-10 py-7 min-h-[320px]">
        {filtered.length === 0 ? (
          <DirectoryEmpty
            hasFilters={hasActiveFilters}
            onClear={clearFilters}
          />
        ) : viewMode === "grid" ? (
          <GroupedGrid groups={grouped} onSelect={setSelected} />
        ) : (
          <GroupedList groups={grouped} onSelect={setSelected} />
        )}
      </div>

      <EmployeeDrawer
        employee={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

/**
 * Props del componente {@link GroupedGrid}.
 *
 * @property groups Empleados agrupados por departamento.
 * @property onSelect Callback al seleccionar un empleado.
 */
type GroupedGridProps = {
  groups: Record<string, Employee[]>;
  onSelect: (e: Employee) => void;
};

/**
 * Vista en formato grid del directorio agrupado por departamento.
 *
 * @param props Propiedades del componente.
 * @returns Secciones con tarjetas de empleados organizadas en grid.
 *
 * @remarks
 * Cada grupo representa un departamento y contiene:
 * - Encabezado con nombre y cantidad
 * - Grid responsivo de {@link EmployeeCard}
 */
function GroupedGrid({ groups, onSelect }: GroupedGridProps) {
  return (
    <div className="flex flex-col gap-10">
      {Object.entries(groups).map(([dept, emps]) => (
        <section key={dept}>
          <DeptHeader dept={dept} count={emps.length} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mt-4">
            {emps.map((emp) => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                onClick={onSelect}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/**
 * Props del componente {@link GroupedList}.
 *
 * @property groups Empleados agrupados por departamento.
 * @property onSelect Callback al seleccionar un empleado.
 */
type GroupedListProps = {
  groups: Record<string, Employee[]>;
  onSelect: (e: Employee) => void;
};

/**
 * Vista en formato lista del directorio agrupado por departamento.
 *
 * @param props Propiedades del componente.
 * @returns Secciones con tablas de empleados.
 *
 * @remarks
 * Cada grupo contiene una tabla renderizada mediante {@link EmployeeTable},
 * permitiendo interacción por fila.
 */
function GroupedList({ groups, onSelect }: GroupedListProps) {
  return (
    <div className="flex flex-col gap-10">
      {Object.entries(groups).map(([dept, emps]) => (
        <section key={dept}>
          <DeptHeader dept={dept} count={emps.length} />

          <div className="mt-4">
            <EmployeeTable employees={emps} onClick={onSelect} />
          </div>
        </section>
      ))}
    </div>
  );
}

/**
 * Props del componente {@link DeptHeader}.
 *
 * @property dept Nombre del departamento.
 * @property count Cantidad de empleados en el grupo.
 */
type DeptHeaderProps = {
  dept: string;
  count: number;
};

/**
 * Componente helper para encabezados de grupo por departamento.
 *
 * @param props Propiedades del encabezado.
 * @returns Encabezado visual con nombre del departamento y cantidad.
 *
 * @remarks
 * Incluye:
 * - Indicador visual (barra lateral)
 * - Nombre del departamento en estilo mono
 * - Separador visual horizontal
 * - Contador de elementos
 */
function DeptHeader({ dept, count }: DeptHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-violet-500 to-purple-400 flex-shrink-0" />

      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 font-mono whitespace-nowrap">
        {dept}
      </span>

      <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />

      <span className="text-[11px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-full">
        {count}
      </span>
    </div>
  );
}