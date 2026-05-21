"use client";

/**
 * @module BoardsClientShell
 * @remarks
 * Full client shell for the `/boards` route.
 *
 * Layout:
 * - Tab strip — filters dashboards by operational area
 * - Two-column panel — sidebar list (left) + {@link PowerBIViewer} (right)
 *
 * On mobile the grid collapses to a single column: list above, viewer below.
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, ChevronRight } from "lucide-react";
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
};

// ---------------------------------------------------------------------------
// Tab navigation
// ---------------------------------------------------------------------------

type FilterArea = PowerBIArea | "Todos";

interface TabNavProps {
  areas: PowerBIArea[];
  active: FilterArea;
  counts: Record<string, number>;
  onChange: (area: FilterArea) => void;
}

function TabNav({ areas, active, counts, onChange }: TabNavProps) {
  const tabs: FilterArea[] = ["Todos", ...areas];

  return (
    <nav
      className="flex gap-1 flex-wrap"
      role="tablist"
      aria-label="Filtrar tableros por área"
    >
      {tabs.map((tab) => {
        const isActive = active === tab;
        const count =
          tab === "Todos"
            ? POWERBI_DASHBOARDS.length
            : (counts[tab] ?? 0);

        return (
          <button
            key={tab}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab)}
            className={`relative px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              isActive
                ? "text-white"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="boards-tab-bg"
                className="absolute inset-0 bg-violet-600 rounded-lg"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab}
              <span
                className={`inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold rounded-full ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}
              >
                {count}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
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
          Agrega reportes en{" "}
          <code className="font-mono text-violet-500">
            config/powerbi.catalog.ts
          </code>
        </p>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main shell
// ---------------------------------------------------------------------------

export function BoardsClientShell({}: BoardsClientShellProps) {
  const [activeArea, setActiveArea] = useState<FilterArea>("Todos");
  const [selectedId, setSelectedId] = useState<string>(
    POWERBI_DASHBOARDS[0]?.id ?? ""
  );

  const filtered = useMemo(
    () =>
      activeArea === "Todos"
        ? POWERBI_DASHBOARDS
        : POWERBI_DASHBOARDS.filter((d) => d.area === activeArea),
    [activeArea]
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    POWERBI_AREAS.forEach((area) => {
      map[area] = POWERBI_DASHBOARDS.filter((d) => d.area === area).length;
    });
    return map;
  }, []);

  const selected =
    filtered.find((d) => d.id === selectedId) ?? filtered[0] ?? null;

  const handleAreaChange = (area: FilterArea) => {
    setActiveArea(area);
    const first =
      area === "Todos"
        ? POWERBI_DASHBOARDS[0]
        : POWERBI_DASHBOARDS.find((d) => d.area === area);
    if (first) setSelectedId(first.id);
  };

  return (
    <div className="flex flex-col gap-6 px-4 md:px-6 py-6">
      {/* Tab filter */}
      <TabNav
        areas={POWERBI_AREAS}
        active={activeArea}
        counts={counts}
        onChange={handleAreaChange}
      />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">

        {/* Left: dashboard list */}
        <aside className="flex flex-col gap-2 pt-1">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <EmptyState key="empty" area={activeArea} />
            ) : (
              filtered.map((dashboard) => (
                <DashboardCard
                  key={dashboard.id}
                  dashboard={dashboard}
                  isSelected={selected?.id === dashboard.id}
                  onClick={() => setSelectedId(dashboard.id)}
                />
              ))
            )}
          </AnimatePresence>
        </aside>

        {/* Right: viewer */}
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
                <PowerBIViewer dashboard={selected} />
              </motion.div>
            ) : (
              <motion.div
                key="no-selection"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-64 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-sm"
              >
                Selecciona un tablero para visualizarlo
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}