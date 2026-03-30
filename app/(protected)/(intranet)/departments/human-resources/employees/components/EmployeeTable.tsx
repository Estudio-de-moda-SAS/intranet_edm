"use client";

import type { Employee }       from "@/types/employee";
import { EmployeeAvatar }      from "./EmployeeAvatar";
import { EmployeeStatusBadge } from "./EmployeeStatusBadge";
import { ChevronRight }        from "lucide-react";

type Props = { employees: Employee[]; onClick: (employee: Employee) => void };

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
              <td className="px-5 py-3.5 align-middle">
                <div className="flex items-center gap-3">
                  <EmployeeAvatar employee={emp} size="sm" />
                  <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">{emp.displayName}</span>
                </div>
              </td>
              <td className="px-4 py-3.5 text-sm text-slate-500 align-middle">{emp.jobTitle}</td>
              <td className="px-4 py-3.5 align-middle hidden md:table-cell">
                <span className="text-xs font-mono text-slate-500">{emp.mail}</span>
              </td>
              <td className="px-4 py-3.5 text-sm text-slate-500 align-middle hidden lg:table-cell">{emp.officeLocation ?? "—"}</td>
              <td className="px-4 py-3.5 align-middle"><EmployeeStatusBadge status={emp.status} /></td>
              <td className="px-4 py-3.5 align-middle w-8">
                <ChevronRight size={15} className="text-slate-300 group-hover:text-violet-500 transition-colors" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TH({ children, hide }: { children: React.ReactNode; hide?: "md" | "lg" }) {
  const base = "px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono";
  const cls  = hide === "md" ? `${base} hidden md:table-cell` : hide === "lg" ? `${base} hidden lg:table-cell` : base;
  return <th className={cls}>{children}</th>;
}