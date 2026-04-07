"use client";

import { Search, X, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { DEPT_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from "@/config/employeeFilters";
import type { FilterOption } from "@/config/employeeFilters";
import type { EmployeeFilters } from "@/types/employee";
import type { ViewMode }        from "@/hooks/useEmployeeFilters";

type Props = {
  filters:          EmployeeFilters;
  viewMode:         ViewMode;
  hasActiveFilters: boolean;
  onQueryChange:    (q: string)   => void;
  onDeptChange:     (id: string)  => void;
  onStatusChange:   (st: string)  => void;
  onViewChange:     (v: ViewMode) => void;
  onClear:          ()            => void;
};

const INPUT_CLS  = "w-full h-9 pl-9 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition";
const SELECT_CLS = "h-9 pl-3 pr-8 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition cursor-pointer appearance-none";

export function DirectoryToolbar({ filters, viewMode, hasActiveFilters, onQueryChange, onDeptChange, onStatusChange, onViewChange, onClear }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 px-8 lg:px-10 py-4 border-b border-slate-200/80 bg-slate-50/40">

      {/* Search */}
      <div className="relative flex-1 min-w-[220px] max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input type="search" value={filters.query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Buscar por nombre, cargo o email…" className={INPUT_CLS} />
      </div>

      <div className="flex items-center gap-1.5 text-slate-400">
        <SlidersHorizontal size={13} />
      </div>

      {/* Dept */}
      <div className="relative">
        <select value={filters.departmentId} onChange={(e) => onDeptChange(e.target.value)} className={SELECT_CLS}>
          <option value="">Todos los departamentos</option>
          {DEPT_FILTER_OPTIONS.map((o: FilterOption) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
        </span>
      </div>

      {/* Status */}
      <div className="relative">
        <select value={filters.status} onChange={(e) => onStatusChange(e.target.value)} className={SELECT_CLS}>
          <option value="">Todos los estados</option>
          {STATUS_FILTER_OPTIONS.map((o: FilterOption) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
        </span>
      </div>

      {/* Clear */}
      {hasActiveFilters ? (
        <button onClick={onClear} className="flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-violet-700 bg-violet-50 border border-violet-200 rounded-xl hover:bg-violet-100 transition">
          <X size={12} /> Limpiar filtros
        </button>
      ) : null}

      <div className="flex-1" />

      {/* View toggle */}
      <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
        <ViewBtn active={viewMode === "grid"} onClick={() => onViewChange("grid")} title="Cuadrícula" icon={<LayoutGrid size={14} />} />
        <ViewBtn active={viewMode === "list"} onClick={() => onViewChange("list")} title="Lista"      icon={<List size={14} />} />
      </div>

    </div>
  );
}

function ViewBtn({ active, onClick, title, icon }: { active: boolean; onClick: () => void; title: string; icon: React.ReactNode }) {
  const cls = active
    ? "flex items-center justify-center w-8 h-8 rounded-lg bg-white text-violet-700 shadow-sm transition"
    : "flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 transition";
  return <button onClick={onClick} title={title} className={cls}>{icon}</button>;
}