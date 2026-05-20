/**
 * @module AppsGrid
 * Componente cliente para mostrar una grilla paginada de aplicaciones,
 * integrada con el sistema de favoritos.
 */

"use client";

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
import { useFavorites } from "@/features/favorites/FavoritesContext";
import { AddFavoriteModal } from "@/app/components/home/AddFavoriteModal";
import { AppPreviewModal } from "@/app/components/ui/AppPreviewModal";

export type AppColor =
  | "purple"
  | "teal"
  | "blue"
  | "amber"
  | "pink"
  | "green"
  | "coral"
  | "indigo"
  | "rose"
  | "slate";

export type AppsGridVariant = "compact" | "launcher";

export type AppItem = {
  id?: string;
  label: string;
  href: string;
  embedUrl?: string;
  icon?: LucideIcon | string;
  color?: AppColor;
  description?: string;
};

export type AppsGridProps = {
  apps: AppItem[];
  title?: string;
  headerIconBg?: string;
  headerIconColor?: string;
  headerIcon?: LucideIcon;
  cols?: 2 | 3 | 4;
  variant?: AppsGridVariant;
  showFavorites?: boolean;
  favoriteHrefs?: string[];
  onToggleFavorite?: (item: AppItem) => void;
};

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

function resolveIcon(icon: unknown): LucideIcon | null {
  if (typeof icon === "function") return icon as LucideIcon;
  if (typeof icon === "string") return ICON_MAP[icon] ?? null;
  return null;
}

const COLOR_MAP: Record<
  AppColor,
  {
    bg: string;
    icon: string;
    border: string;
    hoverBg: string;
    hoverBorder: string;
    arrow: string;
  }
> = {
  purple: {
    bg: "bg-[#EEEDFE]",
    icon: "text-[#534AB7]",
    border: "border-l-[#7F77DD]",
    hoverBg: "hover:bg-[#EEEDFE]",
    hoverBorder: "hover:border-l-[#534AB7]",
    arrow: "text-[#AFA9EC]",
  },
  teal: {
    bg: "bg-[#E1F5EE]",
    icon: "text-[#0F6E56]",
    border: "border-l-[#1D9E75]",
    hoverBg: "hover:bg-[#E1F5EE]",
    hoverBorder: "hover:border-l-[#0F6E56]",
    arrow: "text-[#9FE1CB]",
  },
  blue: {
    bg: "bg-[#E6F1FB]",
    icon: "text-[#185FA5]",
    border: "border-l-[#378ADD]",
    hoverBg: "hover:bg-[#E6F1FB]",
    hoverBorder: "hover:border-l-[#185FA5]",
    arrow: "text-[#B5D4F4]",
  },
  amber: {
    bg: "bg-[#FAEEDA]",
    icon: "text-[#854F0B]",
    border: "border-l-[#BA7517]",
    hoverBg: "hover:bg-[#FAEEDA]",
    hoverBorder: "hover:border-l-[#854F0B]",
    arrow: "text-[#FAC775]",
  },
  pink: {
    bg: "bg-[#FBEAF0]",
    icon: "text-[#993556]",
    border: "border-l-[#D4537E]",
    hoverBg: "hover:bg-[#FBEAF0]",
    hoverBorder: "hover:border-l-[#993556]",
    arrow: "text-[#F4C0D1]",
  },
  green: {
    bg: "bg-[#EAF3DE]",
    icon: "text-[#3B6D11]",
    border: "border-l-[#639922]",
    hoverBg: "hover:bg-[#EAF3DE]",
    hoverBorder: "hover:border-l-[#3B6D11]",
    arrow: "text-[#C0DD97]",
  },
  coral: {
    bg: "bg-[#FAECE7]",
    icon: "text-[#993C1D]",
    border: "border-l-[#D85A30]",
    hoverBg: "hover:bg-[#FAECE7]",
    hoverBorder: "hover:border-l-[#993C1D]",
    arrow: "text-[#F5C4B3]",
  },
  indigo: {
    bg: "bg-[#EEF0FD]",
    icon: "text-[#3747C4]",
    border: "border-l-[#4F6BED]",
    hoverBg: "hover:bg-[#EEF0FD]",
    hoverBorder: "hover:border-l-[#3747C4]",
    arrow: "text-[#B3BCF7]",
  },
  rose: {
    bg: "bg-[#FDE8EE]",
    icon: "text-[#9B1239]",
    border: "border-l-[#E11D48]",
    hoverBg: "hover:bg-[#FDE8EE]",
    hoverBorder: "hover:border-l-[#9B1239]",
    arrow: "text-[#FCA5C0]",
  },
  slate: {
    bg: "bg-[#F1F3F5]",
    icon: "text-[#475569]",
    border: "border-l-[#94A3B8]",
    hoverBg: "hover:bg-[#F1F3F5]",
    hoverBorder: "hover:border-l-[#475569]",
    arrow: "text-[#CBD5E1]",
  },
};

const PAGE_SIZE = 12;
const MAX_PAGES = 5;

interface PaginationDotProps {
  active: boolean;
  onClick: () => void;
}

function PaginationDot({ active, onClick }: PaginationDotProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Ir a página"
      className={cn(
        "h-1.5 rounded-full transition-all duration-200",
        active ? "w-5 bg-rose-500" : "w-1.5 bg-slate-300 hover:bg-slate-400",
      )}
    />
  );
}

interface AppCardProps {
  item: AppItem;
  isFavorite: boolean;
  onStarClick: (item: AppItem) => void;
  onPreviewClick: (item: AppItem) => void;
  variant?: AppsGridVariant;
  showFavorites?: boolean;
}

function AppCard({
  item,
  isFavorite,
  onStarClick,
  onPreviewClick,
  variant = "compact",
  showFavorites = true,
}: AppCardProps) {
  const c = COLOR_MAP[item.color ?? "purple"] ?? COLOR_MAP.purple;
  const Icon = resolveIcon(item.icon);
  const isLauncher = variant === "launcher";

  return (
    <li className="min-h-0">
      <div
        className={cn(
          "group relative flex h-full flex-col overflow-hidden",
          "border border-slate-200 border-l-[3px] bg-slate-50",
          "transition-all duration-300 ease-out",
          "before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300",
          "hover:-translate-y-[3px] hover:border-slate-300",
          isLauncher
           ? "min-h-[82px] gap-2 rounded-2xl px-4 py-2.5 hover:shadow-[0_14px_32px_rgba(15,23,42,0.10)] before:bg-gradient-to-br before:from-white/70 before:to-violet-50/60 hover:before:opacity-100"
            : "gap-2.5 rounded-[10px] px-3 py-2.5 hover:scale-[1.01] hover:shadow-md",
          c.border,
          c.hoverBg,
          c.hoverBorder,
        )}
      >
        <div className="relative z-10 flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "flex shrink-0 items-center justify-center",
              "transition-transform duration-300 group-hover:scale-110",
              isLauncher ? "h-11 w-11 rounded-xl" : "h-8 w-8 rounded-[7px]",
              c.bg,
            )}
          >
            {Icon && (
              <Icon
                size={isLauncher ? 18 : 14}
                className={c.icon}
              />
            )}
          </span>

          <span className="min-w-0 flex-1">
            <span
              className={cn(
                "block truncate font-semibold leading-tight text-slate-700 transition-colors duration-300 group-hover:text-violet-700",
                isLauncher ? "text-[14px]" : "text-[12.5px]",
              )}
            >
              {item.label}
            </span>

            {item.description && (
              <span
                className={cn(
                  "mt-0.5 block truncate leading-tight text-slate-400",
                  isLauncher ? "text-[12px]" : "text-[11px]",
                )}
              >
                {item.description}
              </span>
            )}
          </span>

          {showFavorites && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onStarClick(item);
              }}
              title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full",
                "transition-all duration-200",
                isLauncher
                  ? "h-7 w-7 bg-white/85 text-slate-300 shadow-sm backdrop-blur-sm hover:text-amber-400"
                  : "h-5 w-5",
                isFavorite
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100",
              )}
            >
              <Star
                size={isLauncher ? 12 : 11}
                className={cn(
                  "transition-all",
                  isFavorite ? "fill-amber-400 text-amber-400" : "fill-none",
                )}
              />
            </button>
          )}
        </div>

        <div className="relative z-10 mt-auto flex flex-wrap items-center gap-2">
          {item.embedUrl && (
            <button
              type="button"
              onClick={() => onPreviewClick(item)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 font-medium text-violet-700 transition-all duration-200 hover:border-violet-300 hover:bg-violet-100",
                isLauncher ? "px-3 py-1.5 text-[12px]" : "px-2.5 py-1 text-[11px]",
              )}
            >
              <MonitorUp className={cn(isLauncher ? "h-3.5 w-3.5" : "h-3 w-3")} />
              Usar aquí
            </button>
          )}

          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white font-medium text-slate-600 transition-all duration-200 hover:border-violet-200 hover:text-violet-700",
              isLauncher ? "px-3 py-1.5 text-[12px]" : "px-2.5 py-1 text-[11px]",
            )}
          >
            Abrir aplicación
            <ExternalLink className={cn(isLauncher ? "h-3.5 w-3.5" : "h-3 w-3")} />
          </a>
        </div>
      </div>
    </li>
  );
}

export function AppsGrid({
  apps,
  title = "Aplicaciones",
  headerIconBg = "bg-rose-50",
  headerIconColor = "text-rose-500",
  headerIcon: HeaderIcon = LayoutGrid,
  cols = 3,
  variant = "compact",
  showFavorites = true,
}: AppsGridProps) {
  const { favoriteHrefs, addFavorite, removeFavorite, getFavoriteByHref } =
    useFavorites();

  const [page, setPage] = useState(0);
  const [pendingApp, setPendingApp] = useState<AppItem | null>(null);
  const [previewApp, setPreviewApp] = useState<AppItem | null>(null);

  const totalPages = Math.min(Math.ceil(apps.length / PAGE_SIZE), MAX_PAGES);

  const paginated = useMemo(() => {
    const capped = apps.slice(0, MAX_PAGES * PAGE_SIZE);
    return capped.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  }, [apps, page]);

  const hasPagination = totalPages > 1;

  const goTo = (p: number) =>
    setPage(Math.max(0, Math.min(p, totalPages - 1)));

  function handleStarClick(item: AppItem) {
    const existing = getFavoriteByHref(item.href);

    if (existing) {
      removeFavorite(existing.id);
    } else {
      setPendingApp(item);
    }
  }

  return (
    <>
      <section
        className={cn(
          "flex flex-col overflow-hidden border border-slate-200 bg-white shadow-sm",
          variant === "launcher" ? "rounded-2xl" : "rounded-xl",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center justify-between border-b border-slate-100",
            variant === "launcher" ? "px-5 py-4" : "px-4 py-3",
          )}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex items-center justify-center rounded-lg",
                variant === "launcher" ? "h-9 w-9" : "h-[30px] w-[30px]",
                headerIconBg,
              )}
            >
              <HeaderIcon
                className={cn(
                  variant === "launcher" ? "h-4 w-4" : "h-3.5 w-3.5",
                  headerIconColor,
                )}
              />
            </span>

            <div>
              <p
                className={cn(
                  "font-semibold text-slate-800 leading-none",
                  variant === "launcher" ? "text-[14px]" : "text-[13px]",
                )}
              >
                {title}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-slate-400 leading-none",
                  variant === "launcher" ? "text-[12px]" : "text-[11px]",
                )}
              >
                {apps.length} aplicaciones disponibles
              </p>
            </div>
          </div>

          {hasPagination && (
            <span
              className={cn(
                "rounded-full border font-medium",
                variant === "launcher"
                  ? "px-2.5 py-1 text-[12px]"
                  : "px-2 py-0.5 text-[11px]",
                headerIconBg,
                headerIconColor,
              )}
            >
              Pág. {page + 1} / {totalPages}
            </span>
          )}
        </div>

        <ul
          className={cn(
            "grid flex-1",
            variant === "launcher" ? "gap-2.5 p-3" : "gap-1.5 p-2.5",
          )}
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {paginated.map((app) => (
            <AppCard
              key={app.href}
              item={app}
              isFavorite={favoriteHrefs.includes(app.href)}
              onStarClick={handleStarClick}
              onPreviewClick={setPreviewApp}
              variant={variant}
              showFavorites={showFavorites}
            />
          ))}
        </ul>

        {hasPagination && (
          <div
            className={cn(
              "flex items-center justify-between border-t border-slate-100",
              variant === "launcher" ? "px-5 py-3" : "px-4 py-2.5",
            )}
          >
            <button
              onClick={() => goTo(page - 1)}
              disabled={page === 0}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Anterior
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationDot
                  key={i}
                  active={i === page}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>

            <button
              onClick={() => goTo(page + 1)}
              disabled={page === totalPages - 1}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </section>

      <AddFavoriteModal
        open={pendingApp !== null}
        onClose={() => setPendingApp(null)}
        preselectedApp={pendingApp}
        existingHrefs={favoriteHrefs}
        onAdd={addFavorite}
      />

      <AppPreviewModal
        open={previewApp !== null}
        onClose={() => setPreviewApp(null)}
        title={previewApp?.label ?? ""}
        url={previewApp?.embedUrl ?? previewApp?.href ?? ""}
      />
    </>
  );
}