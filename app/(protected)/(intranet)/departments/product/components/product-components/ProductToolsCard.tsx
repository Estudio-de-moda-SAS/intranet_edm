"use client";

import { ExternalLink, Wrench } from "lucide-react";

/**
 * @module ProductToolsCard
 * Tarjeta de accesos rápidos a herramientas del equipo de Producto.
 */

/**
 * Representa una herramienta o recurso del stack de trabajo del equipo.
 *
 * @property name Nombre de la herramienta.
 * @property desc Descripción breve del uso principal.
 * @property href URL o destino del recurso.
 * @property external Indica si se trata de un enlace externo.
 */
type Tool = {
  name: string;
  desc: string;
  href: string;
  external: boolean;
};

/**
 * Dataset estático de herramientas del área de Producto.
 *
 * @remarks
 * Este arreglo agrupa accesos rápidos a plataformas
 * utilizadas habitualmente por el equipo en su flujo diario.
 */
const TOOLS: Tool[] = [
  {
    name: "Centric PLM",
    desc: "Gestión del ciclo de producto",
    href: "https://centric.acme.com",
    external: true,
  },
  {
    name: "Adobe Illustrator",
    desc: "Diseño de fichas y bocetos",
    href: "https://adobe.com/illustrator",
    external: true,
  },
  {
    name: "ERP Odoo",
    desc: "Referencias y BOM",
    href: "https://odoo.acme.com",
    external: true,
  },
  {
    name: "Teams",
    desc: "Comunicación de colecciones",
    href: "https://teams.microsoft.com",
    external: true,
  },
  {
    name: "SharePoint",
    desc: "Repositorio de fichas",
    href: "https://acme.sharepoint.com",
    external: true,
  },
  {
    name: "Trello",
    desc: "Seguimiento de muestras",
    href: "https://trello.com/acme",
    external: true,
  },
];

/**
 * Tarjeta de herramientas del equipo de Producto.
 *
 * @returns Un grid compacto con accesos rápidos al stack del área.
 *
 * @remarks
 * Este componente proporciona un acceso visual rápido a las principales
 * herramientas utilizadas por el equipo de Producto.
 *
 * Está orientado a centralizar recursos frecuentes de trabajo como:
 * - PLM
 * - diseño
 * - ERP
 * - comunicación
 * - repositorios documentales
 * - seguimiento operativo
 *
 * @example
 * ```tsx
 * <ProductToolsCard />
 * ```
 */
export function ProductToolsCard() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100">
          <Wrench className="h-3.5 w-3.5 text-stone-500" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Herramientas del equipo</h2>
          <p className="text-[11px] text-slate-400">Acceso rápido al stack de producto</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {TOOLS.map((t) => (
          <a
            key={t.name}
            href={t.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col rounded-xl border border-stone-100 bg-stone-50/60 px-3 py-2.5 hover:border-amber-300 hover:bg-amber-50/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-slate-700 truncate">{t.name}</span>
              <ExternalLink className="h-3 w-3 shrink-0 text-stone-300 group-hover:text-amber-500 transition-colors" />
            </div>
            <span className="mt-0.5 text-[10px] text-stone-400 truncate">{t.desc}</span>
          </a>
        ))}
      </div>
    </div>
  );
}