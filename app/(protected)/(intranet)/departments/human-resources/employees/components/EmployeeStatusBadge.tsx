// components/EmployeeStatusBadge.tsx

import type { Employee } from "@/types/employee";

type Props = { status: Employee["status"]; className?: string };

const CONFIG: Record<
  Employee["status"],
  { label: string; dot: string; bg: string; text: string }
> = {
  active:   { label: "Activo",       dot: "bg-green-500",  bg: "bg-green-50",  text: "text-green-800" },
  remote:   { label: "Remoto",       dot: "bg-blue-500",   bg: "bg-blue-50",   text: "text-blue-800"  },
  leave:    { label: "En licencia",  dot: "bg-amber-500",  bg: "bg-amber-50",  text: "text-amber-800" },
  inactive: { label: "Inactivo",     dot: "bg-slate-400",  bg: "bg-slate-100", text: "text-slate-600" },
};

export function EmployeeStatusBadge({ status, className = "" }: Props) {
  const c = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full
                  text-[11px] font-medium ${c.bg} ${c.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
}
