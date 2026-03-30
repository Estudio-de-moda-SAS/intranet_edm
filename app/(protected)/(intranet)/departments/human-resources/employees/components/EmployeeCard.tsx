"use client";

import type { Employee }       from "@/types/employee";
import { EmployeeAvatar }      from "./EmployeeAvatar";
import { EmployeeStatusBadge } from "./EmployeeStatusBadge";
import { Mail, MapPin }        from "lucide-react";

type Props = { employee: Employee; onClick: (employee: Employee) => void };

const CARD_CLS = "group relative w-full text-left bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col gap-3 hover:border-violet-300 hover:shadow-sm hover:shadow-violet-100/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-all duration-150 overflow-hidden";
const ACCENT_CLS = "absolute top-0 left-0 right-0 h-[2px] bg-transparent group-hover:bg-violet-600 transition-colors duration-200";

export function EmployeeCard({ employee, onClick }: Props) {
  return (
    <button type="button" onClick={() => onClick(employee)} className={CARD_CLS}>
      <span className={ACCENT_CLS} />

      <div className="flex items-start justify-between gap-2">
        <EmployeeAvatar employee={employee} size="md" />
        <EmployeeStatusBadge status={employee.status} />
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-900 leading-tight">{employee.displayName}</p>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{employee.jobTitle}</p>
      </div>

      <div className="border-t border-slate-100 pt-3 flex flex-col gap-1.5">
        <MetaRow icon={<Mail size={11} />} text={employee.mail} />
        {employee.officeLocation ? <MetaRow icon={<MapPin size={11} />} text={employee.officeLocation} /> : null}
      </div>
    </button>
  );
}

function MetaRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono truncate">
      <span className="text-slate-400 flex-shrink-0">{icon}</span>
      <span className="truncate">{text}</span>
    </span>
  );
}