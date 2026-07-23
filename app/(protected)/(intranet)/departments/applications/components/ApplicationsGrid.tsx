"use client";

/**
 * @module ApplicationsGrid
 * @remarks
 * Grilla de cards para el módulo de Aplicaciones, con el mismo lenguaje
 * visual usado en el módulo de Tableros (íconos sólidos a color, buscador
 * suavizado, paginación con dots morados).
 *
 * Reglas de interacción (definidas explícitamente para este componente):
 * - El cuerpo de la card (ícono + nombre) NO es clickeable por sí solo.
 * - "Usar aquí" abre la vista previa embebida (`embedUrl`) — solo aparece
 *   si la app la tiene definida.
 * - "Abrir aplicación" siempre está disponible y abre `href` en pestaña nueva.
 * - La estrella de "frecuentes" solo aparece al hacer hover, salvo que la
 *   app ya esté marcada como frecuente (en ese caso permanece visible).
 */

import { useMemo, useState } from "react";
import {
  Award,
  BarChart2,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  GraduationCap,
  HeadphonesIcon,
  HeartHandshake,
  LayoutDashboard,
  LayoutGrid,
  MessageSquare,
  MonitorUp,
  PieChart,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Star,
  UserPlus,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { AppItem, AppColor } from "@/app/components/ui/AppsGrid";

// ---------------------------------------------------------------------------
// Mapeo de íconos — mismo diccionario que ya usa AppsGrid.tsx, para que
// cada app siga mostrando el ícono que ya tiene configurado.
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, LucideIcon> = {
  shoppingCart: ShoppingCart,
  users: Users,
  calendarDays: CalendarDays,
  fileText: FileText,
  heartHandshake: HeartHandshake,
  award: Award,
  barChart3: BarChart3,
  graduationCap: GraduationCap,
  briefcase: Briefcase,
  clipboardList: ClipboardList,
  userPlus: UserPlus,
  clock: Clock,
  shieldCheck: ShieldCheck,
  layoutDashboard: LayoutDashboard,
  barChart2: BarChart2,
  bookOpen: BookOpen,
  wrench: Wrench,
  messageSquare: MessageSquare,
  globe: Globe,
  bell: Bell,
  creditCard: CreditCard,
  headphonesIcon: HeadphonesIcon,
  pieChart: PieChart,
  settings: Settings,
  zap: Zap,
};

function resolveIcon(icon: unknown): LucideIcon {
  if (typeof icon === "function") return icon as LucideIcon;
  if (typeof icon === "string") return ICON_MAP[icon] ?? LayoutGrid;
  return LayoutGrid;
}

// ---------------------------------------------------------------------------
// Mapa de color sólido por app — versión "sólida" del COLOR_MAP pastel que
// ya existe en AppsGrid.tsx, para que el ícono cuadrado luzca como el de
// Tableros pero conservando la identidad de color que cada app ya tiene.
// ---------------------------------------------------------------------------

const APP_ACCENT: Record<AppColor, string> = {
  purple: "bg-violet-600 text-white",
  teal: "bg-teal-600 text-white",
  blue: "bg-blue-600 text-white",
  amber: "bg-amber-500 text-slate-900",
  pink: "bg-pink-600 text-white",
  green: "bg-emerald-600 text-white",
  coral: "bg-orange-500 text-white",
  indigo: "bg-indigo-600 text-white",
  rose: "bg-rose-600 text-white",
  slate: "bg-slate-600 text-white",
};

// ---------------------------------------------------------------------------
// Paginación
// ---------------------------------------------------------------------------

/** Cantidad máxima de aplicaciones que se muestran por página en la grilla. */
const APPS_PER_PAGE = 12;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ApplicationsGridProps<TFilter extends string = string> {
  apps: AppItem[];
  filters: TFilter[];
  activeFilter: TFilter;
  onFilterChange: (filter: TFilter) => void;
  search: string;
  onSearchChange: (value: string) => void;
  isFrequentApp: (appId?: string) => boolean;
  onToggleFrequentApp: (appId?: string) => void;
  onPreviewClick: (item: AppItem) => void;
}

// ---------------------------------------------------------------------------
// Barra de búsqueda y filtros
// ---------------------------------------------------------------------------

interface ApplicationsToolbarProps<TFilter extends string = string> {
  filters: TFilter[];
  active: TFilter;
  search: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (filter: TFilter) => void;
}

function ApplicationsToolbar<TFilter extends string>({
  filters,
  active,
  search,
  onSearchChange,
  onFilterChange,
}: ApplicationsToolbarProps<TFilter>) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/30">
            <LayoutGrid className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </span>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Mis Aplicaciones
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Las herramientas que necesitas para trabajar, comunicarte y gestionar información
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
            placeholder="Buscar aplicación..."
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
              onClick={() => onFilterChange(item)}
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
// Card de aplicación
// ---------------------------------------------------------------------------

interface ApplicationCardProps {
  app: AppItem;
  isFrequent: boolean;
  onToggleFrequent: () => void;
  onPreviewClick: () => void;
}

function ApplicationCard({
  app,
  isFrequent,
  onToggleFrequent,
  onPreviewClick,
}: ApplicationCardProps) {
  const Icon = resolveIcon(app.icon);
  const accent = APP_ACCENT[app.color ?? "purple"] ?? APP_ACCENT.purple;

  return (
    <div
      className={cn(
        "group relative flex flex-col items-center gap-3 rounded-2xl border p-5 text-center",
        "border-slate-200 bg-white transition-all duration-300 ease-out",
        "hover:-translate-y-[3px] hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100",
        "dark:border-slate-700/60 dark:bg-slate-900 dark:hover:border-violet-700 dark:hover:shadow-violet-950/40",
      )}
    >
      {/* Estrella de frecuentes — visible solo en hover, o siempre si ya es frecuente */}
      <button
        type="button"
        onClick={onToggleFrequent}
        title={isFrequent ? "Quitar de mis frecuentes" : "Añadir a mis frecuentes"}
        className={cn(
          "absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full",
          "border bg-white shadow-sm backdrop-blur-sm transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-md",
          isFrequent
            ? "border-amber-200 text-amber-500 opacity-100"
            : "border-slate-200 text-slate-300 opacity-0 group-hover:opacity-100 hover:border-amber-200 hover:text-amber-500 dark:border-slate-700",
        )}
      >
        <Star
          className={cn(
            "h-3.5 w-3.5",
            isFrequent ? "fill-amber-400 text-amber-400" : "fill-none",
          )}
        />
      </button>

      <span
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-bold shadow-sm",
          "transition-transform duration-300 ease-out group-hover:scale-[1.03]",
          accent,
        )}
      >
        <Icon className="h-6 w-6" />
      </span>

      <p className="text-sm font-medium leading-snug text-slate-700 transition-colors dark:text-slate-200">
        {app.label}
      </p>

      {/* Acciones — siempre visibles, la card en sí no dispara ninguna acción */}
      <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
        {app.embedUrl && (
          <button
            type="button"
            onClick={onPreviewClick}
            className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-700 transition-all duration-200 hover:border-violet-300 hover:bg-violet-100 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300"
          >
            <MonitorUp className="h-3 w-3" />
            Usar aquí
          </button>
        )}

        <a
          href={app.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-all duration-200 hover:border-violet-200 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-violet-800 dark:hover:text-violet-300"
        >
          Abrir
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Controles de paginación
// ---------------------------------------------------------------------------

interface ApplicationsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function ApplicationsPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ApplicationsPaginationProps) {
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
          },
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

function EmptyState({ filter }: { filter: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-3 py-12 text-center">
      <LayoutGrid className="h-8 w-8 text-slate-300 dark:text-slate-600" />

      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Sin aplicaciones en {filter === "Todas" ? "esta sección" : filter}
        </p>

        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
          Intenta ajustar la búsqueda o seleccionar otro filtro.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grilla principal
// ---------------------------------------------------------------------------

export function ApplicationsGrid<TFilter extends string>({
  apps,
  filters,
  activeFilter,
  onFilterChange,
  search,
  onSearchChange,
  isFrequentApp,
  onToggleFrequentApp,
  onPreviewClick,
}: ApplicationsGridProps<TFilter>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(apps.length / APPS_PER_PAGE));

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * APPS_PER_PAGE;
    return apps.slice(start, start + APPS_PER_PAGE);
  }, [apps, currentPage]);

  const handleFilterChange = (filter: TFilter) => {
    setCurrentPage(1);
    onFilterChange(filter);
  };

  const handleSearchChange = (value: string) => {
    setCurrentPage(1);
    onSearchChange(value);
  };

  return (
    <div className="flex flex-col gap-8">
      <ApplicationsToolbar
        filters={filters}
        active={activeFilter}
        search={search}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
      />

      {apps.length === 0 ? (
        <EmptyState filter={activeFilter} />
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {paginated.map((app) => (
            <ApplicationCard
              key={app.id ?? app.href}
              app={app}
              isFrequent={isFrequentApp(app.id)}
              onToggleFrequent={() => onToggleFrequentApp(app.id)}
              onPreviewClick={() => onPreviewClick(app)}
            />
          ))}
        </div>
      )}

      <ApplicationsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}