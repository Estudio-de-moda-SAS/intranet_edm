/**
 * @module PoliciesCard
 * Componente para mostrar accesos rápidos a políticas y procedimientos.
 *
 * @remarks
 * Este archivo renderiza una tarjeta lateral con enlaces a documentos
 * institucionales relevantes, organizada en formato compacto.
 */

import { ShieldCheck, ArrowRight, FileText, Scale, Lock } from "lucide-react";
import Link from "next/link";

/**
 * Lista de accesos rápidos a políticas institucionales.
 */
const POLICIES = [
  { icon: FileText, label: "Reglamento Interno", href: "#" },
  { icon: Scale,    label: "Código de Ética",    href: "#" },
  { icon: Lock,     label: "Seguridad Info.",    href: "#" },
];

/**
 * Renderiza la tarjeta lateral de políticas y procedimientos.
 *
 * @returns Tarjeta con encabezado y grid de accesos rápidos.
 *
 * @remarks
 * - Incluye un encabezado con enlace general.
 * - Muestra una grilla de enlaces individuales.
 * - Cada política incluye icono y etiqueta.
 */
export function PoliciesCardAside() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm
                    border-slate-200 bg-white
                    dark:border-[#30363d] dark:bg-[#161b22]">

      {/* Barra de acento */}
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl
                      bg-gradient-to-b from-violet-500 to-violet-300" />

      {/* Header */}
      <div className="flex items-center justify-between border-b pl-4 pr-3 py-3
                      border-slate-100 dark:border-[#21262d]">
        <div className="flex items-center gap-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg
                           bg-violet-50 dark:bg-violet-500/[0.12]">
            <ShieldCheck className="h-3 w-3 text-violet-600 dark:text-violet-400" />
          </span>
          <h2 className="text-[11px] font-bold leading-tight
                         text-slate-800 dark:text-[#e6edf3]">
            Políticas y
            <br />
            Procedimientos
          </h2>
        </div>

        <Link
          href="#"
          className="flex items-center gap-0.5 text-[10px] font-medium transition-colors shrink-0
                     text-slate-400 hover:text-violet-600
                     dark:text-[#545d68] dark:hover:text-violet-400"
        >
          Ver todos <ArrowRight className="h-2.5 w-2.5" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-1.5 p-3 flex-1">
        {POLICIES.map(({ icon: Icon, label, href }) => (
          <Link
            key={label}
            href={href}
            className="group flex flex-col items-center justify-center gap-1.5
                       rounded-xl border px-2 py-3 transition-all
                       border-slate-100 bg-slate-50
                       hover:border-violet-200 hover:bg-violet-50
                       dark:border-[#21262d] dark:bg-[#1c2128]
                       dark:hover:border-violet-500/30 dark:hover:bg-violet-500/[0.06]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 transition-all
                             bg-white ring-slate-100 group-hover:ring-violet-200
                             dark:bg-[#161b22] dark:ring-[#30363d] dark:group-hover:ring-violet-500/30">
              <Icon
                className="h-4 w-4 transition-colors
                           text-slate-400 group-hover:text-violet-600
                           dark:text-[#545d68] dark:group-hover:text-violet-400"
              />
            </span>
            <span
              className="text-[10px] font-semibold leading-tight text-center transition-colors
                         text-slate-500 group-hover:text-violet-700
                         dark:text-[#768390] dark:group-hover:text-violet-400"
            >
              {label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}