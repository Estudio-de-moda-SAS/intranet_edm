"use client";

/**
 * @module BoardsClientShell
 * @remarks
 * Full client shell for the `/boards` route.
 *
 * Layout:
 * - Hero banner — introduces the boards module
 * - Search and filter toolbar — filters dashboards by name, description, tags and operational area
 * - Two-column panel — sidebar list (left) + viewer / preview panel (right)
 *
 * On mobile the grid collapses to a single column: list above, viewer below.
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  BarChart3,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { DepartmentHeroBanner } from "@/app/components/ui/animated/DepartmentHeroBanner";
import { PowerBIViewer } from "./PowerBIViewer";
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
   * Access level resolved server-side — passed down from the Server Component.
   * Reserved for future role-based visibility of dashboards (e.g. admin-only boards).
   */
  accessLevel: string;
}

// ---------------------------------------------------------------------------
// Area color map — reuses department identity pattern from the intranet
// ---------------------------------------------------------------------------

const AREA_COLORS: Record<string, string> = {
  Comercial:
    "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
  "E-Commerce":
    "bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300",
  Finanzas:
    "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
  RRHH: "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300",
  Logística:
    "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300",
  Compras:
    "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300",
  TI: "bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300",
  Tiendas:
    "bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300",
  Jurídico:
    "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  Producto:
    "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300",
  "Servicios Administrativos":
    "bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300",
  Corporativo:
    "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300",
};

// ---------------------------------------------------------------------------
// Feature flags
// ---------------------------------------------------------------------------

/**
 * Temporarily disables embedded dashboard rendering.
 *
 * Keep {@link PowerBIViewer} available for the future, but while the organization
 * defines the final embed strategy, the boards section works as a clean catalog
 * that redirects users to the official Microsoft 365 / SharePoint view.
 */
const ENABLE_DASHBOARD_EMBED = false;

// ---------------------------------------------------------------------------
// Boards search and filters
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
  const filters: FilterArea[] = ["Todos", ...areas];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Centro de tableros
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Busca por nombre, descripción o filtra por área para encontrar el tablero que necesitas.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar tablero..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-violet-700 dark:focus:bg-slate-900 sm:w-72"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              value={active}
              onChange={(event) =>
                onAreaChange(event.target.value as FilterArea)
              }
              className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-violet-700 dark:focus:bg-slate-900 sm:w-52"
            >
              {filters.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((item) => {
          const isActive = active === item;

          return (
            <button
              key={item}
              type="button"
              onClick={() => onAreaChange(item)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                isActive
                  ? "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300"
                  : "border-slate-200 bg-white text-slate-500 hover:border-violet-200 hover:text-violet-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-violet-800 dark:hover:text-violet-300"
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
// Sidebar dashboard card
// ---------------------------------------------------------------------------

interface DashboardCardProps {
  dashboard: PowerBIDashboard;
  isSelected: boolean;
  onClick: () => void;
}

function DashboardCard({ dashboard, isSelected, onClick }: DashboardCardProps) {
  const colorClass =
    AREA_COLORS[dashboard.area] ??
    "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";

  return (
    <motion.button
      layout
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -6 }}
      transition={{ duration: 0.18 }}
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 group outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
        isSelected
          ? "border-violet-500/60 bg-violet-50 dark:bg-violet-950/25 shadow-sm"
          : "border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 hover:border-violet-300 dark:hover:border-violet-800 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium truncate transition-colors ${
              isSelected
                ? "text-violet-700 dark:text-violet-300"
                : "text-slate-800 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400"
            }`}
          >
            {dashboard.title}
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
            {dashboard.description}
          </p>
        </div>

        <ChevronRight
          className={`w-3.5 h-3.5 mt-0.5 shrink-0 transition-all duration-200 ${
            isSelected
              ? "text-violet-500 translate-x-0.5"
              : "text-slate-300 dark:text-slate-600 group-hover:text-violet-400 group-hover:translate-x-0.5"
          }`}
        />
      </div>

      <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
        <span
          className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${colorClass}`}
        >
          {dashboard.area}
        </span>

        {dashboard.openMode === "external" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
            <ExternalLink className="w-3 h-3" />
            SharePoint
          </span>
        )}

        {dashboard.tags?.map((tag) => (
          <span
            key={tag}
            className="inline-block px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Dashboard preview panel
// ---------------------------------------------------------------------------

function DashboardPreview({ dashboard }: { dashboard: PowerBIDashboard }) {
  const hasValidUrl =
    dashboard.reportUrl &&
    dashboard.reportUrl.trim() !== "" &&
    dashboard.reportUrl.trim() !== "t";

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700/60">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/60">
                <BarChart3 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                <ExternalLink className="w-3 h-3" />
                SharePoint
              </span>
            </div>

            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              {dashboard.title}
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed max-w-2xl">
              {dashboard.description ||
                "Este tablero se encuentra disponible desde el entorno corporativo de Microsoft 365."}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50 dark:bg-slate-950">
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
          <div className="flex flex-col gap-4 max-w-2xl">
            <div className="flex items-start gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60 shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Acceso protegido
                </p>

                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Puedes abrir el tablero en su ubicación oficial de SharePoint,
                  conservando los permisos definidos por Microsoft 365.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-2">
              <span
                className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                  AREA_COLORS[dashboard.area] ??
                  "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}
              >
                {dashboard.area}
              </span>

              {dashboard.tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="pt-2">
              {hasValidUrl ? (
                <a
                  href={dashboard.reportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir tablero
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                >
                  URL pendiente
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ area }: { area: FilterArea }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 gap-3 text-center"
    >
      <LayoutGrid className="w-8 h-8 text-slate-300 dark:text-slate-600" />

      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Sin tableros en {area === "Todos" ? "esta sección" : area}
        </p>

        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          Intenta ajustar la búsqueda o seleccionar otra área.
        </p>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main shell
// ---------------------------------------------------------------------------

export function BoardsClientShell({}: BoardsClientShellProps) {
  const [search, setSearch] = useState("");
  const [activeArea, setActiveArea] = useState<FilterArea>("Todos");
  const [selectedId, setSelectedId] = useState<string>(
    POWERBI_DASHBOARDS[0]?.id ?? ""
  );

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

  const selected =
    filtered.find((d) => d.id === selectedId) ?? filtered[0] ?? null;

  const handleAreaChange = (area: FilterArea) => {
    setActiveArea(area);

    const first =
      area === "Todos"
        ? POWERBI_DASHBOARDS.find((dashboard) => {
            const normalizedSearch = search.trim().toLowerCase();

            return (
              dashboard.title.toLowerCase().includes(normalizedSearch) ||
              dashboard.description?.toLowerCase().includes(normalizedSearch) ||
              dashboard.area.toLowerCase().includes(normalizedSearch) ||
              dashboard.tags?.some((tag) =>
                tag.toLowerCase().includes(normalizedSearch)
              )
            );
          })
        : POWERBI_DASHBOARDS.find((dashboard) => dashboard.area === area);

    if (first) setSelectedId(first.id);
  };

  return (
    <>
      {/* Hero banner */}
      <DepartmentHeroBanner
        title="Tableros"
        subtitle="Consulta tableros corporativos protegidos por Microsoft 365 y SharePoint. El acceso se valida según los permisos asignados a cada usuario."
        gradientFrom="from-violet-950"
        gradientVia="via-slate-900"
        gradientTo="to-purple-800"
        dotPatternId="boards-hero-pattern"
        pills={[
          { type: "status", text: "Acceso protegido" },
          { type: "info", text: "Power BI" },
          { type: "info", text: "SharePoint" },
        ]}
      />

      <div className="flex flex-col gap-6 px-4 py-6 md:px-6">
        {/* Search and filter toolbar */}
        <BoardsToolbar
          areas={POWERBI_AREAS}
          active={activeArea}
          search={search}
          onSearchChange={setSearch}
          onAreaChange={handleAreaChange}
        />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_1fr]">
          {/* Left: dashboard list */}
          <aside className="flex max-h-[calc(100vh-180px)] flex-col gap-2 overflow-y-auto pr-1 pt-1">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <EmptyState key="empty" area={activeArea} />
              ) : (
                filtered.map((dashboard) => (
                  <DashboardCard
                    key={dashboard.id}
                    dashboard={dashboard}
                    isSelected={selected?.id === dashboard.id}
                    onClick={() => {
                      setSelectedId(dashboard.id);
                    }}
                  />
                ))
              )}
            </AnimatePresence>
          </aside>

          {/* Right: viewer / preview */}
          <main className="min-w-0 pt-1">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  {ENABLE_DASHBOARD_EMBED &&
                  selected.openMode !== "external" ? (
                    <PowerBIViewer dashboard={selected} />
                  ) : (
                    <DashboardPreview dashboard={selected} />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="no-selection"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500"
                >
                  Selecciona un tablero para visualizarlo
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </>
  );
}