/**
 * @module HelpQuickLinks
 * Tarjeta de accesos rápidos del módulo de ayuda.
 *
 * @remarks
 * Este componente renderiza una lista de enlaces directos a las
 * funcionalidades más utilizadas del sistema de soporte, tales como:
 *
 * - portal de tickets
 * - centro de software
 * - solicitudes de equipos
 * - gestión de licencias
 * - reporte de incidentes
 * - base de conocimiento
 *
 * Es un **Server Component**, por lo que:
 *
 * - no maneja estado ni hooks
 * - su contenido es estático o configurable
 * - actúa como capa de navegación rápida dentro del módulo
 */

// app/(protected)/(intranet)/help/components/HelpQuickLinks.tsx

import { ChevronRight } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Estructura de un enlace rápido.
 *
 * @property label Texto visible del enlace.
 * @property dot Clase CSS del indicador visual (color).
 * @property href Ruta de navegación.
 */
type QuickLink = {
  label: string;
  dot: string;
  href: string;
};

/* -------------------------------------------------------------------------- */
/* Datos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Lista de accesos rápidos disponibles.
 *
 * @remarks
 * Actualmente es una configuración estática. En el futuro puede migrarse a:
 *
 * - configuración centralizada
 * - CMS
 * - permisos por usuario
 * - feature flags
 */
const links: readonly QuickLink[] = [
  { label: "Portal de tickets",     dot: "bg-blue-600",    href: "#" },
  { label: "Centro de software",    dot: "bg-emerald-500", href: "#" },
  { label: "Solicitar equipos",     dot: "bg-amber-500",   href: "#" },
  { label: "Gestión de licencias",  dot: "bg-violet-500",  href: "#" },
  { label: "Reporte de incidentes", dot: "bg-rose-500",    href: "#" },
  { label: "Base de conocimiento",  dot: "bg-cyan-500",    href: "#" },
] as const;

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Tarjeta de accesos rápidos del sistema de ayuda.
 *
 * @returns Lista de enlaces navegables con indicadores visuales.
 *
 * @remarks
 * Este componente renderiza:
 *
 * - un encabezado con el título de la sección
 * - una lista de enlaces interactivos
 * - indicadores visuales (dots) por tipo de acción
 *
 * Cada elemento actúa como punto de entrada rápido a funcionalidades
 * clave del ecosistema de soporte.
 *
 * @example
 * ```tsx
 * <HelpQuickLinks />
 * ```
 */
export default function HelpQuickLinks() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">
          Accesos rápidos
        </h3>
      </div>

      {/* Links */}
      <ul className="divide-y divide-slate-100">
        {links.map(({ label, dot, href }) => (
          <li key={label}>
            <a
              href={href}
              className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`}
                />
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