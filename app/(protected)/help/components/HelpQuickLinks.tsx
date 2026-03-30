// app/(protected)/(intranet)/help/components/HelpQuickLinks.tsx
// SERVER COMPONENT

import { ChevronRight } from "lucide-react";

const links = [
  { label: "Portal de tickets",     dot: "bg-blue-600",   href: "#" },
  { label: "Centro de software",    dot: "bg-emerald-500",href: "#" },
  { label: "Solicitar equipos",     dot: "bg-amber-500",  href: "#" },
  { label: "Gestión de licencias",  dot: "bg-violet-500", href: "#" },
  { label: "Reporte de incidentes", dot: "bg-rose-500",   href: "#" },
  { label: "Base de conocimiento",  dot: "bg-cyan-500",   href: "#" },
] as const;

export default function HelpQuickLinks() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">
          Accesos rápidos
        </h3>
      </div>

      <ul className="divide-y divide-slate-100">
        {links.map(({ label, dot, href }) => (
          <li key={label}>
            <a
              href={href}
              className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                <span className="text-[12px] font-medium text-slate-700 group-hover:text-blue-700 transition-colors">
                  {label}
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}