"use client";

/**
 * AppsGrid — conectado al FavoritesContext.
 *
 * - Pulsar ⭐ en una card que NO es favorita → abre AddFavoriteModal con la app preseleccionada.
 * - Pulsar ⭐ en una card que YA es favorita → la elimina directamente (sin modal).
 * - El modal se gestiona internamente; el padre no necesita saber nada.
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, LayoutGrid, Star,
  Users, CalendarDays, FileText, HeartHandshake, Award, BarChart3,
  GraduationCap, Briefcase, ClipboardList, UserPlus, Clock, ShieldCheck,
  LayoutDashboard, BarChart2, BookOpen, Wrench, MessageSquare, Globe,
  Bell, CreditCard, HeadphonesIcon, PieChart, Settings, Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/features/favorites/FavoritesContext";
import { AddFavoriteModal } from "@/app/components/home/AddFavoriteModal";

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export type AppColor =
  | "purple" | "teal" | "blue" | "amber"
  | "pink"   | "green" | "coral" | "indigo"
  | "rose"   | "slate";

export type AppItem = {
  id?: string;
  label: string;
  href: string;
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
  favoriteHrefs?: string[];
  onToggleFavorite?: (item: AppItem) => void;
};

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  users: Users, calendarDays: CalendarDays, fileText: FileText,
  heartHandshake: HeartHandshake, award: Award, barChart3: BarChart3,
  graduationCap: GraduationCap, briefcase: Briefcase, clipboardList: ClipboardList,
  userPlus: UserPlus, clock: Clock, shieldCheck: ShieldCheck,
  layoutDashboard: LayoutDashboard, barChart2: BarChart2, bookOpen: BookOpen,
  wrench: Wrench, messageSquare: MessageSquare, globe: Globe, bell: Bell,
  creditCard: CreditCard, headphonesIcon: HeadphonesIcon, pieChart: PieChart,
  settings: Settings, zap: Zap,
};

function resolveIcon(icon: unknown): LucideIcon | null {
  if (typeof icon === "function") return icon as LucideIcon;
  if (typeof icon === "string") return ICON_MAP[icon] ?? null;
  return null;
}

// ─── Color map ────────────────────────────────────────────────────────────────

const COLOR_MAP: Record<AppColor, {
  bg: string; icon: string; border: string;
  hoverBg: string; hoverBorder: string; arrow: string;
}> = {
  purple: { bg:"bg-[#EEEDFE]", icon:"text-[#534AB7]", border:"border-l-[#7F77DD]", hoverBg:"hover:bg-[#EEEDFE]", hoverBorder:"hover:border-l-[#534AB7]", arrow:"text-[#AFA9EC]" },
  teal:   { bg:"bg-[#E1F5EE]", icon:"text-[#0F6E56]", border:"border-l-[#1D9E75]", hoverBg:"hover:bg-[#E1F5EE]", hoverBorder:"hover:border-l-[#0F6E56]", arrow:"text-[#9FE1CB]" },
  blue:   { bg:"bg-[#E6F1FB]", icon:"text-[#185FA5]", border:"border-l-[#378ADD]", hoverBg:"hover:bg-[#E6F1FB]", hoverBorder:"hover:border-l-[#185FA5]", arrow:"text-[#B5D4F4]" },
  amber:  { bg:"bg-[#FAEEDA]", icon:"text-[#854F0B]", border:"border-l-[#BA7517]", hoverBg:"hover:bg-[#FAEEDA]", hoverBorder:"hover:border-l-[#854F0B]", arrow:"text-[#FAC775]" },
  pink:   { bg:"bg-[#FBEAF0]", icon:"text-[#993556]", border:"border-l-[#D4537E]", hoverBg:"hover:bg-[#FBEAF0]", hoverBorder:"hover:border-l-[#993556]", arrow:"text-[#F4C0D1]" },
  green:  { bg:"bg-[#EAF3DE]", icon:"text-[#3B6D11]", border:"border-l-[#639922]", hoverBg:"hover:bg-[#EAF3DE]", hoverBorder:"hover:border-l-[#3B6D11]", arrow:"text-[#C0DD97]" },
  coral:  { bg:"bg-[#FAECE7]", icon:"text-[#993C1D]", border:"border-l-[#D85A30]", hoverBg:"hover:bg-[#FAECE7]", hoverBorder:"hover:border-l-[#993C1D]", arrow:"text-[#F5C4B3]" },
  indigo: { bg:"bg-[#EEF0FD]", icon:"text-[#3747C4]", border:"border-l-[#4F6BED]", hoverBg:"hover:bg-[#EEF0FD]", hoverBorder:"hover:border-l-[#3747C4]", arrow:"text-[#B3BCF7]" },
  rose:   { bg:"bg-[#FDE8EE]", icon:"text-[#9B1239]", border:"border-l-[#E11D48]", hoverBg:"hover:bg-[#FDE8EE]", hoverBorder:"hover:border-l-[#9B1239]", arrow:"text-[#FCA5C0]" },
  slate:  { bg:"bg-[#F1F3F5]", icon:"text-[#475569]", border:"border-l-[#94A3B8]", hoverBg:"hover:bg-[#F1F3F5]", hoverBorder:"hover:border-l-[#475569]", arrow:"text-[#CBD5E1]" },
};

// ─── Paginación ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 12; // 3 cols × 4 filas
const MAX_PAGES = 5;

function PaginationDot({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label="Ir a página"
      className={cn("h-1.5 rounded-full transition-all duration-200",
        active ? "w-5 bg-rose-500" : "w-1.5 bg-slate-300 hover:bg-slate-400"
      )}
    />
  );
}

// ─── AppCard ──────────────────────────────────────────────────────────────────

function AppCard({
  item,
  isFavorite,
  onStarClick,
}: {
  item: AppItem;
  isFavorite: boolean;
  onStarClick: (item: AppItem) => void;
}) {
  const c = COLOR_MAP[item.color ?? "purple"] ?? COLOR_MAP.purple;
  const Icon = resolveIcon(item.icon);

  return (
    <li className="min-h-0">
      <Link
        href={item.href}
        className={cn(
          "group relative flex items-center gap-2.5 rounded-[10px] h-full",
          "border border-slate-200 border-l-[3px] bg-slate-50",
          "px-3 py-2.5 pr-8",
          "transition-all duration-300 ease-out",
          "hover:-translate-y-[2px] hover:scale-[1.01] hover:shadow-md",
          c.border, c.hoverBg, c.hoverBorder,
        )}
      >
        <span className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px]",
          "transition-transform duration-300 group-hover:scale-110",
          c.bg,
        )}>
          {Icon && <Icon size={14} className={c.icon} />}
        </span>

        <span className="flex-1 min-w-0">
          <span className="block text-[12.5px] font-semibold text-slate-700 leading-tight truncate transition-colors duration-300 group-hover:text-violet-700">
            {item.label}
          </span>
          {item.description && (
            <span className="block text-[11px] text-slate-400 leading-tight truncate mt-0.5">
              {item.description}
            </span>
          )}
        </span>

        <ChevronRight size={12} className={cn("absolute right-2.5 shrink-0 transition-all duration-200 group-hover:translate-x-0.5", c.arrow)} />

        {/* Estrella */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); onStarClick(item); }}
          title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          className={cn(
            "absolute top-1.5 right-1.5 z-10",
            "flex h-5 w-5 items-center justify-center rounded-full",
            "transition-all duration-200",
            isFavorite
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100 text-slate-300 hover:text-amber-400",
          )}
        >
          <Star
            size={11}
            className={cn(
              "transition-all",
              isFavorite ? "fill-amber-400 text-amber-400" : "fill-none",
            )}
          />
        </button>
      </Link>
    </li>
  );
}

// ─── AppsGrid ─────────────────────────────────────────────────────────────────

export function AppsGrid({
  apps,
  title = "Aplicaciones",
  headerIconBg    = "bg-rose-50",
  headerIconColor = "text-rose-500",
  headerIcon: HeaderIcon = LayoutGrid,
  cols = 3,
}: AppsGridProps) {
  const { favoriteHrefs, addFavorite, removeFavorite, getFavoriteByHref } = useFavorites();
  const [page, setPage]             = useState(0);
  const [pendingApp, setPendingApp] = useState<AppItem | null>(null);

  const totalPages = Math.min(Math.ceil(apps.length / PAGE_SIZE), MAX_PAGES);

  const paginated = useMemo(() => {
    const capped = apps.slice(0, MAX_PAGES * PAGE_SIZE);
    return capped.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  }, [apps, page]);

  const hasPagination = totalPages > 1;
  const goTo = (p: number) => setPage(Math.max(0, Math.min(p, totalPages - 1)));

  function handleStarClick(item: AppItem) {
    const existing = getFavoriteByHref(item.href);
    if (existing) {
      removeFavorite(existing.id);   // quitar sin modal
    } else {
      setPendingApp(item);           // abrir modal para personalizar
    }
  }

  return (
    <>
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className={cn("flex h-[30px] w-[30px] items-center justify-center rounded-lg", headerIconBg)}>
              <HeaderIcon className={cn("h-3.5 w-3.5", headerIconColor)} />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-slate-800 leading-none">{title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-none">
                {apps.length} aplicaciones disponibles
              </p>
            </div>
          </div>
          {hasPagination && (
            <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border", headerIconBg, headerIconColor)}>
              Pág. {page + 1} / {totalPages}
            </span>
          )}
        </div>

        {/* Grid */}
        <ul
          className="grid gap-1.5 p-2.5 flex-1"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {paginated.map(app => (
            <AppCard
              key={app.href}
              item={app}
              isFavorite={favoriteHrefs.includes(app.href)}
              onStarClick={handleStarClick}
            />
          ))}
        </ul>

        {/* Footer paginación */}
        {hasPagination && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
            <button onClick={() => goTo(page - 1)} disabled={page === 0}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
              <ChevronLeft className="h-3.5 w-3.5" /> Anterior
            </button>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationDot key={i} active={i === page} onClick={() => goTo(i)} />
              ))}
            </div>
            <button onClick={() => goTo(page + 1)} disabled={page === totalPages - 1}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
              Siguiente <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* Modal — gestionado internamente */}
      <AddFavoriteModal
        open={pendingApp !== null}
        onClose={() => setPendingApp(null)}
        preselectedApp={pendingApp}
        existingHrefs={favoriteHrefs}
        onAdd={addFavorite}
      />
    </>
  );
}