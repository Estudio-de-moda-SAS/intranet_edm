"use client";

/**
 * @module BoardsClientShell
 * @remarks
 * Shell de cliente completo para la ruta `/boards`.
 *
 * Layout:
 * - Barra de búsqueda y filtros — filtra los tableros por nombre, descripción, etiquetas y área operativa
 * - Grilla de cards — una tarjeta por tablero, que abre directamente el link oficial de SharePoint / Microsoft 365
 * - Paginación — máximo 12 tableros por página
 */

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, ExternalLink, Search, ChevronLeft, ChevronRight } from "lucide-react";

import {
  POWERBI_DASHBOARDS,
  POWERBI_AREAS,
  type PowerBIDashboard,
  type PowerBIArea,
} from "@/config/powerbi.catalog";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BoardsClientShellProps {
  /**
   * Nivel de acceso resuelto en el servidor — se pasa desde el Server Component.
   * Reservado para futura visibilidad de tableros según rol (ej. tableros solo para admins).
   */
  accessLevel: string;
}

// ---------------------------------------------------------------------------
// Mapa de color por área — tono sólido usado en el ícono de cada card.
// Se mantiene sincronizado con la identidad de departamentos ya usada en la intranet.
// ---------------------------------------------------------------------------

const AREA_ACCENT: Record<string, string> = {
  Comercial: "bg-blue-600 text-white",
  "E-Commerce": "bg-cyan-600 text-white",
  Finanzas: "bg-emerald-600 text-white",
  RRHH: "bg-rose-600 text-white",
  Logística: "bg-orange-500 text-white",
  Compras: "bg-amber-500 text-slate-900",
  CRM: "bg-amber-500 text-slate-900",
  TI: "bg-violet-600 text-white",
  Tiendas: "bg-pink-600 text-white",
  Jurídico: "bg-slate-600 text-white",
  Producto: "bg-purple-600 text-white",
  "Servicios Administrativos": "bg-teal-600 text-white",
  Corporativo: "bg-indigo-600 text-white",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Deriva las iniciales visibles en el ícono a partir del título del tablero. */
function getInitials(title: string): string {
  return title
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
}

// ---------------------------------------------------------------------------
// Paginación
// ---------------------------------------------------------------------------

/** Cantidad máxima de tableros que se muestran por página en la grilla. */
const BOARDS_PER_PAGE = 12;

// ---------------------------------------------------------------------------
// Búsqueda y filtros de tableros
// ---------------------------------------------------------------------------

type FilterArea = PowerBIArea | "Todos";

interface BoardsToolbarProps {
  areas: PowerBIArea[];
  active: FilterArea;
  search: string;
  onSearchChange: (value: string) => void;
  onAreaChange: (area: FilterArea) => void;
}

function BoardsToolbar({
  areas,
  active,
  search,
  onSearchChange,
  onAreaChange,
}: BoardsToolbarProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const filters: FilterArea[] = ["Todos", ...areas];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/30">
            <LayoutGrid className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </span>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Mis Tableros
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Crea y consulta tableros compartidos
            </p>
          </div>
        </div>

        <div className="relative w-full shrink-0 sm:w-72 lg:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Buscar tablero..."
            style={{
              paddingLeft: "2.5rem",
              boxShadow: isSearchFocused
                ? "0 0 0 4px rgba(196, 181, 253, 0.35)"
                : "none",
            }}
            className="h-11 w-full min-w-0 rounded-full border-none bg-slate-100/80 pr-4 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:bg-white dark:bg-slate-800/60 dark:text-slate-200 dark:focus:bg-slate-900"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => {
          const isActive = active === item;

          return (
            <button
              key={item}
              type="button"
              onClick={() => onAreaChange(item)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150 ${
                isActive
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-violet-950/40"
                  : "bg-slate-100 text-slate-500 hover:bg-violet-50 hover:text-violet-600 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-violet-950/30 dark:hover:text-violet-300"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card de tablero
// ---------------------------------------------------------------------------

function BoardCard({ dashboard }: { dashboard: PowerBIDashboard }) {
  const hasValidUrl =
    dashboard.reportUrl &&
    dashboard.reportUrl.trim() !== "" &&
    dashboard.reportUrl.trim() !== "t";

  const accent = AREA_ACCENT[dashboard.area] ?? "bg-slate-500 text-white";
  const initials = getInitials(dashboard.title);

const card = (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={
        hasValidUrl
          ? { y: -3, transition: { duration: 0.25, ease: "easeOut" } }
          : { y: 0 }
      }
      className={`group relative flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all duration-300 ease-out ${
        hasValidUrl
          ? "cursor-pointer border-slate-200 bg-white hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100 dark:border-slate-700/60 dark:bg-slate-900 dark:hover:border-violet-700 dark:hover:shadow-violet-950/40"
          : "cursor-not-allowed border-dashed border-slate-200 bg-slate-50/60 opacity-60 dark:border-slate-800 dark:bg-slate-900/40"
      }`}
    >
      {hasValidUrl && (
        <ExternalLink className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:text-violet-500 dark:text-slate-600" />
      )}

      <span
        className={`flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-bold shadow-sm transition-transform duration-300 ease-out ${accent} ${
          hasValidUrl ? "group-hover:scale-[1.03]" : ""
        }`}
      >
        {initials}
      </span>

      <div className="min-w-0">
        <p
          className={`text-sm font-medium leading-snug transition-colors ${
            hasValidUrl
              ? "text-slate-700 group-hover:text-violet-700 dark:text-slate-200 dark:group-hover:text-violet-300"
              : "text-slate-400 dark:text-slate-600"
          }`}
        >
          {dashboard.title}
        </p>

        {!hasValidUrl && (
          <span className="mt-1 inline-block text-[10px] font-medium text-slate-400 dark:text-slate-600">
            Próximamente
          </span>
        )}
      </div>
    </motion.div>
  );

  if (!hasValidUrl) return card;

  return (
    
      <a href={dashboard.reportUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
      aria-label={`Abrir ${dashboard.title} en SharePoint`}
    >
      {card}
    </a>
  );
}

// ---------------------------------------------------------------------------
// Controles de paginación
// ---------------------------------------------------------------------------

interface BoardsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function BoardsPagination({
  currentPage,
  totalPages,
  onPageChange,
}: BoardsPaginationProps) {
  if (totalPages <= 1) return null;

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-800">
      <button
        type="button"
        disabled={isFirstPage}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-500 transition-colors disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:border-violet-300 enabled:hover:text-violet-600 dark:border-slate-700 dark:text-slate-400 dark:enabled:hover:border-violet-700 dark:enabled:hover:text-violet-300"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Anterior
      </button>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (page) => {
            const isActive = page === currentPage;

            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                aria-label={`Ir a la página ${page}`}
                aria-current={isActive ? "page" : undefined}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? "w-6 bg-violet-600"
                    : "w-1.5 bg-slate-200 hover:bg-violet-200 dark:bg-slate-700 dark:hover:bg-violet-800"
                }`}
              />
            );
          }
        )}
      </div>

      <button
        type="button"
        disabled={isLastPage}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-500 transition-colors disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:border-violet-300 enabled:hover:text-violet-600 dark:border-slate-700 dark:text-slate-400 dark:enabled:hover:border-violet-700 dark:enabled:hover:text-violet-300"
      >
        Siguiente
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Estado vacío
// ---------------------------------------------------------------------------

function EmptyState({ area }: { area: FilterArea }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="col-span-full flex flex-col items-center justify-center gap-3 py-12 text-center"
    >
      <LayoutGrid className="h-8 w-8 text-slate-300 dark:text-slate-600" />

      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Sin tableros en {area === "Todos" ? "esta sección" : area}
        </p>

        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
          Intenta ajustar la búsqueda o seleccionar otra área.
        </p>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Shell principal
// ---------------------------------------------------------------------------

export function BoardsClientShell({}: BoardsClientShellProps) {
  const [search, setSearch] = useState("");
  const [activeArea, setActiveArea] = useState<FilterArea>("Todos");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return POWERBI_DASHBOARDS.filter((dashboard) => {
      const matchesSearch =
        dashboard.title.toLowerCase().includes(normalizedSearch) ||
        dashboard.description?.toLowerCase().includes(normalizedSearch) ||
        dashboard.area.toLowerCase().includes(normalizedSearch) ||
        dashboard.tags?.some((tag) =>
          tag.toLowerCase().includes(normalizedSearch)
        );

      const matchesArea =
        activeArea === "Todos" || dashboard.area === activeArea;

      return matchesSearch && matchesArea;
    });
  }, [search, activeArea]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / BOARDS_PER_PAGE)
  );

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * BOARDS_PER_PAGE;
    return filtered.slice(start, start + BOARDS_PER_PAGE);
  }, [filtered, currentPage]);

  // Vuelve a la página 1 cada vez que cambia la búsqueda o el filtro de área,
  // para evitar quedar parado en una página que ya no tiene resultados.
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeArea]);

  return (
    <div className="flex flex-col gap-8 px-4 py-6 md:px-6">
      <BoardsToolbar
        areas={POWERBI_AREAS}
        active={activeArea}
        search={search}
        onSearchChange={setSearch}
        onAreaChange={setActiveArea}
      />

      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <EmptyState key="empty" area={activeArea} />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {paginated.map((dashboard) => (
              <BoardCard key={dashboard.id} dashboard={dashboard} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <BoardsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}