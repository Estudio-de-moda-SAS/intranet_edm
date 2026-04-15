/**
 * @module DirectoryToolbar
 * Barra de herramientas para búsqueda, filtrado y cambio de vista del directorio.
 *
 * @remarks
 * Este componente centraliza los controles de interacción del listado de empleados,
 * incluyendo:
 * - Campo de búsqueda
 * - Filtro por departamento
 * - Filtro por estado
 * - Acción para limpiar filtros
 * - Selector entre vista de cuadrícula y lista
 *
 * Recibe el estado actual y los callbacks desde el componente contenedor,
 * manteniendo una responsabilidad exclusivamente presentacional.
 */

"use client";

import {
  Search,
  X,
  LayoutGrid,
  List,
  SlidersHorizontal,
} from "lucide-react";
import {
  DEPT_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from "@/config/employeeFilters";
import type { FilterOption } from "@/config/employeeFilters";
import type { EmployeeFilters } from "@/types/employee";
import type { ViewMode } from "@/hooks/useEmployeeFilters";

/**
 * Props del componente {@link DirectoryToolbar}.
 *
 * @property filters Estado actual de los filtros aplicados.
 * @property viewMode Modo de visualización actual.
 * @property hasActiveFilters Indica si existe al menos un filtro activo.
 * @property onQueryChange Callback para actualizar la búsqueda textual.
 * @property onDeptChange Callback para actualizar el departamento seleccionado.
 * @property onStatusChange Callback para actualizar el estado seleccionado.
 * @property onViewChange Callback para cambiar el modo de visualización.
 * @property onClear Callback para limpiar todos los filtros.
 */
type Props = {
  filters: EmployeeFilters;
  viewMode: ViewMode;
  hasActiveFilters: boolean;
  onQueryChange: (q: string) => void;
  onDeptChange: (id: string) => void;
  onStatusChange: (st: string) => void;
  onViewChange: (v: ViewMode) => void;
  onClear: () => void;
};

/**
 * Clases base para el campo de búsqueda.
 *
 * @remarks
 * Incluye estilos de:
 * - Estado base
 * - Placeholder
 * - Focus accesible
 * - Transiciones visuales
 */
const INPUT_CLS =
  "w-full h-9 pl-9 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition";

/**
 * Clases base para los selectores de filtro.
 *
 * @remarks
 * Se utiliza en los filtros de departamento y estado.
 */
const SELECT_CLS =
  "h-9 pl-3 pr-8 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition cursor-pointer appearance-none";

/**
 * Componente de barra de herramientas del directorio.
 *
 * @param props Propiedades del componente.
 * @returns Controles de búsqueda, filtros y cambio de vista.
 *
 * @remarks
 * Este componente no administra estado interno de negocio; toda la interacción
 * se delega al componente padre mediante callbacks.
 *
 * Secciones principales:
 * - Búsqueda textual
 * - Filtros de selección
 * - Acción de limpieza
 * - Toggle entre vistas
 *
 * @example
 * ```tsx
 * <DirectoryToolbar
 *   filters={filters}
 *   viewMode={viewMode}
 *   hasActiveFilters={hasActiveFilters}
 *   onQueryChange={setQuery}
 *   onDeptChange={setDepartmentId}
 *   onStatusChange={setStatus}
 *   onViewChange={setViewMode}
 *   onClear={clearFilters}
 * />
 * ```
 */
export function DirectoryToolbar({
  filters,
  viewMode,
  hasActiveFilters,
  onQueryChange,
  onDeptChange,
  onStatusChange,
  onViewChange,
  onClear,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 px-8 lg:px-10 py-4 border-b border-slate-200/80 bg-slate-50/40">
      {/* Search */}
      <div className="relative flex-1 min-w-[220px] max-w-sm">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="search"
          value={filters.query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar por nombre, cargo o email…"
          className={INPUT_CLS}
        />
      </div>

      <div className="flex items-center gap-1.5 text-slate-400">
        <SlidersHorizontal size={13} />
      </div>

      {/* Dept */}
      <div className="relative">
        <select
          value={filters.departmentId}
          onChange={(e) => onDeptChange(e.target.value)}
          className={SELECT_CLS}
        >
          <option value="">Todos los departamentos</option>
          {DEPT_FILTER_OPTIONS.map((o: FilterOption) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </div>

      {/* Status */}
      <div className="relative">
        <select
          value={filters.status}
          onChange={(e) => onStatusChange(e.target.value)}
          className={SELECT_CLS}
        >
          <option value="">Todos los estados</option>
          {STATUS_FILTER_OPTIONS.map((o: FilterOption) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </div>

      {/* Clear */}
      {hasActiveFilters ? (
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-violet-700 bg-violet-50 border border-violet-200 rounded-xl hover:bg-violet-100 transition"
        >
          <X size={12} /> Limpiar filtros
        </button>
      ) : null}

      <div className="flex-1" />

      {/* View toggle */}
      <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
        <ViewBtn
          active={viewMode === "grid"}
          onClick={() => onViewChange("grid")}
          title="Cuadrícula"
          icon={<LayoutGrid size={14} />}
        />
        <ViewBtn
          active={viewMode === "list"}
          onClick={() => onViewChange("list")}
          title="Lista"
          icon={<List size={14} />}
        />
      </div>
    </div>
  );
}

/**
 * Props del componente {@link ViewBtn}.
 *
 * @property active Indica si el botón representa la vista actualmente activa.
 * @property onClick Callback ejecutado al seleccionar la vista.
 * @property title Texto descriptivo del botón.
 * @property icon Ícono visual asociado a la acción.
 */
type ViewBtnProps = {
  active: boolean;
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
};

/**
 * Botón auxiliar para alternar entre modos de visualización.
 *
 * @param props Propiedades del botón.
 * @returns Botón estilizado para selección de vista.
 *
 * @remarks
 * Este helper se utiliza dentro de {@link DirectoryToolbar}
 * para representar visualmente los modos:
 * - `grid`
 * - `list`
 *
 * Ajusta automáticamente su estilo según el estado `active`.
 */
function ViewBtn({ active, onClick, title, icon }: ViewBtnProps) {
  const cls = active
    ? "flex items-center justify-center w-8 h-8 rounded-lg bg-white text-violet-700 shadow-sm transition"
    : "flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 transition";

  return (
    <button onClick={onClick} title={title} className={cls}>
      {icon}
    </button>
  );
}