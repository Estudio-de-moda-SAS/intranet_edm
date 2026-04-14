/**
 * @module DocumentQuickLinksStrip
 * Barra de accesos rápidos para el módulo de Gestión Documental.
 *
 * @remarks
 * Este componente renderiza un conjunto de acciones frecuentes del usuario
 * dentro del sistema documental, facilitando la navegación hacia:
 * - creación de documentos,
 * - exploración del repositorio,
 * - gestión de aprobaciones,
 * - búsqueda avanzada.
 *
 * Está diseñado como un bloque compacto reutilizable dentro del dashboard
 * principal del módulo de documentos.
 */

"use client";

import { FilePlus, FolderOpen, CheckCircle2, Search } from "lucide-react";
import Link from "next/link";

/**
 * Representa un acceso rápido dentro del módulo documental.
 *
 * @property label Texto visible del enlace.
 * @property icon Icono asociado a la acción.
 * @property href Ruta de navegación dentro del sistema.
 */
type QuickLink = {
  label: string;
  icon: React.ElementType;
  href: string;
};

/**
 * Configuración de accesos rápidos del módulo documental.
 *
 * @remarks
 * Define las acciones principales disponibles para el usuario desde
 * la vista inicial del sistema documental.
 *
 * Puede evolucionar dinámicamente en el futuro según:
 * - nivel de acceso (`AccessLevel`),
 * - permisos,
 * - o contexto del usuario.
 */
const DOCUMENT_QUICK_LINKS: QuickLink[] = [
  { label: "Nuevo documento", icon: FilePlus,     href: "/documentos/nuevo"       },
  { label: "Repositorio",     icon: FolderOpen,   href: "/documentos/repositorio" },
  { label: "Aprobaciones",    icon: CheckCircle2, href: "/documentos/aprobaciones"},
  { label: "Buscar",          icon: Search,       href: "/documentos/buscar"      },
];

/**
 * Barra de accesos rápidos del módulo documental.
 *
 * @returns Componente visual con enlaces de navegación rápida.
 *
 * @remarks
 * Este componente permite al usuario ejecutar rápidamente las acciones
 * más comunes sin necesidad de navegar por menús complejos.
 *
 * Características:
 * - Diseño responsive mediante `flex-wrap`.
 * - Estilos adaptados a modo claro y oscuro.
 * - Uso de iconografía consistente (`lucide-react`).
 *
 * @example
 * ```tsx
 * <DocumentQuickLinksStrip />
 * ```
 */
export default function DocumentQuickLinksStrip() {
  return (
    <div className="flex flex-wrap gap-3">
      {DOCUMENT_QUICK_LINKS.map((link, i) => {
        const Icon = link.icon;
        return (
          <Link
            key={i}
            href={link.href}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-colors
                       border-slate-200 bg-white text-slate-700 hover:bg-slate-50
                       dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#adbac7]
                       dark:hover:bg-[#21262d] dark:hover:border-[#444c56]"
          >
            <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}