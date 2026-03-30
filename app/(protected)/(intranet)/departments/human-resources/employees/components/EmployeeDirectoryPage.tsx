"use client";

import { useState }            from "react";
import type { Employee }       from "@/types/employee";
import { useEmployeeFilters }  from "@/hooks/useEmployeeFilters";
import { DirectoryToolbar }    from "./DirectoryToolbar";
import { DirectoryStatsBar }   from "./DirectoryStatsBar";
import { EmployeeCard }        from "./EmployeeCard";
import { EmployeeTable }       from "./EmployeeTable";
import { EmployeeDrawer }      from "./EmployeeDrawer";
import { DirectoryEmpty }      from "./DirectoryEmpty";

type Props = { employees: Employee[] };

export function EmployeeDirectory({ employees }: Props) {
  const { filters, viewMode, grouped, filtered, stats, hasActiveFilters, setQuery, setDepartmentId, setStatus, setViewMode, clearFilters } = useEmployeeFilters(employees);
  const [selected, setSelected] = useState<Employee | null>(null);

  return (
    <>
      <DirectoryStatsBar stats={stats} />
      <DirectoryToolbar
        filters={filters} viewMode={viewMode} hasActiveFilters={hasActiveFilters}
        onQueryChange={setQuery} onDeptChange={setDepartmentId} onStatusChange={setStatus}
        onViewChange={setViewMode} onClear={clearFilters}
      />

      <div className="px-8 lg:px-10 py-7 min-h-[320px]">
        {filtered.length === 0 ? (
          <DirectoryEmpty hasFilters={hasActiveFilters} onClear={clearFilters} />
        ) : viewMode === "grid" ? (
          <GroupedGrid groups={grouped} onSelect={setSelected} />
        ) : (
          <GroupedList groups={grouped} onSelect={setSelected} />
        )}
      </div>

      <EmployeeDrawer employee={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function GroupedGrid({ groups, onSelect }: { groups: Record<string, Employee[]>; onSelect: (e: Employee) => void }) {
  return (
    <div className="flex flex-col gap-10">
      {Object.entries(groups).map(([dept, emps]) => (
        <section key={dept}>
          <DeptHeader dept={dept} count={emps.length} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mt-4">
            {emps.map((emp) => <EmployeeCard key={emp.id} employee={emp} onClick={onSelect} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

function GroupedList({ groups, onSelect }: { groups: Record<string, Employee[]>; onSelect: (e: Employee) => void }) {
  return (
    <div className="flex flex-col gap-10">
      {Object.entries(groups).map(([dept, emps]) => (
        <section key={dept}>
          <DeptHeader dept={dept} count={emps.length} />
          <div className="mt-4"><EmployeeTable employees={emps} onClick={onSelect} /></div>
        </section>
      ))}
    </div>
  );
}

function DeptHeader({ dept, count }: { dept: string; count: number }) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-violet-500 to-purple-400 flex-shrink-0" />
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 font-mono whitespace-nowrap">
        {dept}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
      <span className="text-[11px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
    </div>
  );
}