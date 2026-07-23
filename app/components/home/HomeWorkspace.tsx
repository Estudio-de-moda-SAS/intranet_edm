/**
 * @module HomeWorkspace
 * Bloque principal de productividad del home.
 *
 * @remarks
 * Este componente reemplaza el carrusel informativo del home por un espacio
 * operativo orientado al trabajo diario del usuario.
 *
 * Incluye:
 * - buscador visual de la intranet,
 * - descripción contextual,
 * - accesos rápidos a módulos internos.
 *
 * Nota de layout: "Acciones rápidas" pasó de 2 a 3 columnas — con 5
 * módulos, 2 columnas dejaba siempre un único item huérfano en la última
 * fila (2+2+1). Con 3 columnas queda 3+2, visualmente más equilibrado.
 */

"use client";

import { Search } from "lucide-react";
import { QuickLinksSection } from "@/app/components/ui/QuickLinksSection";
import { homeWorkspaceLinks } from "@/app/components/home/config/homeQuickLinks";
import { useGlobalSearch } from "@/app/hooks/useGlobalSearch";
import GlobalSearchResults from "@/app/components/ui/search/GlobalSearchResults";
import { useAppSession } from "@/lib/useAppSession";
import type { AccessLevel } from "@/lib/roles";
import { useEffect, useRef } from "react";

/**
 * Renderiza el workspace principal del home.
 *
 * @returns Sección visual con buscador y acciones rápidas internas.
 *
 * @remarks
 * Este bloque no requiere backend ni base de datos. Actualmente el buscador
 * funciona como elemento visual preparado para integrarse con la búsqueda
 * global existente o futura.
 */
export function HomeWorkspace() {
  
const { user: sessionUser } = useAppSession();
const accessLevel: AccessLevel = sessionUser?.accessLevel ?? "employee";
const { query, setQuery, results } = useGlobalSearch(accessLevel);
/**
 * Referencia del contenedor de búsqueda.
 *
 * @remarks
 * Se utiliza para detectar clics fuera del buscador
 * y cerrar automáticamente los resultados.
 */
const searchContainerRef = useRef<HTMLDivElement>(null);
/**
 * Cierra los resultados cuando el usuario hace clic
 * fuera del área de búsqueda.
 */
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      searchContainerRef.current &&
      !searchContainerRef.current.contains(event.target as Node)
    ) {
      setQuery("");
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
  };
}, [setQuery]);
/**
 * Permite cerrar los resultados mediante Escape.
 */
useEffect(() => {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setQuery("");
    }
  };

  window.addEventListener("keydown", handleEsc);

  return () => {
    window.removeEventListener("keydown", handleEsc);
  };
}, [setQuery]);

  return (
   <section
    className="
    h-full
    flex
    flex-col
    rounded-xl
    border
    shadow-sm
    overflow-hidden
    border-slate-200
    bg-white
    dark:border-[#30363d]
    dark:bg-[#161b22]"
    >
      {/* Encabezado del workspace */}
      <div className="px-5 py-5 border-b border-slate-100 dark:border-[#21262d]">
        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase
                         bg-violet-50 text-violet-600
                         dark:bg-violet-500/[0.12] dark:text-violet-400">
          Portal corporativo
        </span>

        <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-900 dark:text-[#e6edf3]">
          Mi Workspace
        </h3>

        <p className="mt-1 max-w-xl text-sm text-slate-500 dark:text-[#8b949e]">
          Busca aplicaciones, documentos, tickets o tableros corporativos desde un solo lugar.
        </p>

        {/* Buscador visual del workspace */}
       <div
  ref={searchContainerRef}
  className="mt-5 relative z-20"
>
  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

  <input
    type="search"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Buscar en la intranet..."
    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none
               text-slate-700 placeholder:text-slate-400
               transition-all duration-200
               focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100
               dark:border-[#30363d] dark:bg-[#1c2128] dark:text-[#cdd9e5]
               dark:placeholder:text-[#545d68] dark:focus:border-violet-500/60 dark:focus:ring-violet-500/[0.12]"
  />

  {query && (
    <GlobalSearchResults
      results={results}
      query={query}
      onSelect={() => setQuery("")}
    />
  )}
</div>
      </div>

      {/* Acciones internas de la intranet */}
      <div className="p-3">
  <QuickLinksSection
    quickLinks={homeWorkspaceLinks}
    title="Acciones rápidas"
    subtitle="Accede a los módulos principales de la intranet"
    badgeLabel={`${homeWorkspaceLinks.length} módulos`}
    showFavorites={false}
    columns={3}
  />
</div>
    </section>
  );
}