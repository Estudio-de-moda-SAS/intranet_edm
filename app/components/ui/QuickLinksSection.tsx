"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Zap, ChevronRight, Star, Lock,
  FileText, LayoutDashboard, Users, Calendar,
  BarChart2, BookOpen, Wrench, MessageSquare,
  Globe, Bell, Briefcase, ClipboardList,
  CreditCard, HeadphonesIcon, PieChart, Settings,
  ShieldCheck, FilePlus, Receipt, Wallet,
  TrendingUp, PlusCircle, DollarSign, GraduationCap,
  Award, KeyRound, GitBranch, Package, Activity,
  UserPlus, CalendarDays, PhoneCall, UserCheck,
  FolderOpen, Landmark, Scale, FileSignature,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/features/favorites/FavoritesContext";
import { AddFavoriteModal } from "@/app/components/home/AddFavoriteModal";
import type { AppColor } from "@/app/components/ui/AppsGrid";

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  FileText, LayoutDashboard, Users, Calendar,
  BarChart2, BookOpen, Wrench, MessageSquare,
  Globe, Bell, Briefcase, ClipboardList,
  CreditCard, HeadphonesIcon, PieChart, Settings,
  ShieldCheck, FilePlus, Receipt, Wallet, Zap,
  TrendingUp, PlusCircle, DollarSign, GraduationCap,
  Award, KeyRound, GitBranch, Package, Activity,
  UserPlus, CalendarDays, PhoneCall, UserCheck,
  FolderOpen, Landmark, Scale, FileSignature,
};

function resolveIcon(iconKey: string): React.ElementType {
  return ICON_MAP[iconKey] ?? LayoutDashboard;
}

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export type QuickLinkColor =
  | "purple" | "teal" | "blue" | "amber"
  | "pink"   | "green" | "coral";

export type QuickLinkItem = {
  label:        string;
  href:         string;
  icon:         string;
  description?: string;
  color?:       QuickLinkColor;
  disabled?:    boolean;
  disabledMsg?: string;
  action?:      () => void;
};

type QuickLinksSectionProps = {
  quickLinks:  QuickLinkItem[];
  title?:      string;
  fillHeight?: boolean;
  columns?:    2 | 3 | 4;
};

// ─── Color map ────────────────────────────────────────────────────────────────
// Cada color tiene:
//  · iconBg   — fondo del icono (base + dark)
//  · iconText — color del icono (base + dark)
//  · border   — borde izquierdo de acento (base + dark)
//  · hover    — estado hover completo (base + dark), SIN gradiente forzado

const colorMap: Record<QuickLinkColor, {
  iconBg:    string;
  iconText:  string;
  border:    string;
  hoverCard: string;
  arrow:     string;
}> = {
  purple: {
    iconBg:    "bg-[#EEEDFE] dark:bg-violet-500/[0.15]",
    iconText:  "text-[#534AB7] dark:text-violet-400",
    border:    "border-l-[#7F77DD] dark:border-l-violet-500/60",
    hoverCard: "hover:bg-violet-50 hover:border-l-[#534AB7] dark:hover:bg-violet-500/[0.08] dark:hover:border-l-violet-400",
    arrow:     "text-[#AFA9EC] dark:text-violet-500/60",
  },
  teal: {
    iconBg:    "bg-[#E1F5EE] dark:bg-teal-500/[0.15]",
    iconText:  "text-[#0F6E56] dark:text-teal-400",
    border:    "border-l-[#1D9E75] dark:border-l-teal-500/60",
    hoverCard: "hover:bg-teal-50 hover:border-l-[#0F6E56] dark:hover:bg-teal-500/[0.08] dark:hover:border-l-teal-400",
    arrow:     "text-[#9FE1CB] dark:text-teal-500/60",
  },
  blue: {
    iconBg:    "bg-[#E6F1FB] dark:bg-blue-500/[0.15]",
    iconText:  "text-[#185FA5] dark:text-blue-400",
    border:    "border-l-[#378ADD] dark:border-l-blue-500/60",
    hoverCard: "hover:bg-blue-50 hover:border-l-[#185FA5] dark:hover:bg-blue-500/[0.08] dark:hover:border-l-blue-400",
    arrow:     "text-[#B5D4F4] dark:text-blue-500/60",
  },
  amber: {
    iconBg:    "bg-[#FAEEDA] dark:bg-amber-500/[0.15]",
    iconText:  "text-[#854F0B] dark:text-amber-400",
    border:    "border-l-[#BA7517] dark:border-l-amber-500/60",
    hoverCard: "hover:bg-amber-50 hover:border-l-[#854F0B] dark:hover:bg-amber-500/[0.08] dark:hover:border-l-amber-400",
    arrow:     "text-[#FAC775] dark:text-amber-500/60",
  },
  pink: {
    iconBg:    "bg-[#FBEAF0] dark:bg-pink-500/[0.15]",
    iconText:  "text-[#993556] dark:text-pink-400",
    border:    "border-l-[#D4537E] dark:border-l-pink-500/60",
    hoverCard: "hover:bg-pink-50 hover:border-l-[#993556] dark:hover:bg-pink-500/[0.08] dark:hover:border-l-pink-400",
    arrow:     "text-[#F4C0D1] dark:text-pink-500/60",
  },
  green: {
    iconBg:    "bg-[#EAF3DE] dark:bg-green-500/[0.15]",
    iconText:  "text-[#3B6D11] dark:text-green-400",
    border:    "border-l-[#639922] dark:border-l-green-500/60",
    hoverCard: "hover:bg-green-50 hover:border-l-[#3B6D11] dark:hover:bg-green-500/[0.08] dark:hover:border-l-green-400",
    arrow:     "text-[#C0DD97] dark:text-green-500/60",
  },
  coral: {
    iconBg:    "bg-[#FAECE7] dark:bg-orange-500/[0.15]",
    iconText:  "text-[#993C1D] dark:text-orange-400",
    border:    "border-l-[#D85A30] dark:border-l-orange-500/60",
    hoverCard: "hover:bg-orange-50 hover:border-l-[#993C1D] dark:hover:bg-orange-500/[0.08] dark:hover:border-l-orange-400",
    arrow:     "text-[#F5C4B3] dark:text-orange-500/60",
  },
};

const DEFAULT_COLOR = colorMap["purple"]!;

// ─── Clases del item activo ───────────────────────────────────────────────────

function activeItemClasses(c: typeof DEFAULT_COLOR) {
  return cn(
    // Layout
    "flex items-center gap-2.5 rounded-[10px] h-full w-full",
    // Borde
    "border border-l-[3px]",
    // Base light
    "border-slate-200 bg-slate-50",
    // Base dark
    "dark:border-[#30363d] dark:bg-[#1c2128]",
    // Padding
    "px-3 py-2 pr-8",
    // Transición
    "transition-all duration-200 ease-out",
    // Hover lift
    "group-hover:-translate-y-[2px] group-hover:scale-[1.015] group-hover:shadow-sm",
    // Hover color (por color, sin gradiente forzado)
    c.border,
    c.hoverCard,
  );
}

// ─── QuickLinksSection ────────────────────────────────────────────────────────

export function QuickLinksSection({
  quickLinks,
  title      = "Accesos rápidos",
  fillHeight = false,
  columns    = 2,
}: QuickLinksSectionProps) {
  const { favoriteHrefs, addFavorite, removeFavorite, getFavoriteByHref } = useFavorites();
  const [pendingLink, setPendingLink] = useState<QuickLinkItem | null>(null);

  function handleStarClick(link: QuickLinkItem) {
    if (link.disabled) return;
    const existing = getFavoriteByHref(link.href);
    if (existing) removeFavorite(existing.id);
    else setPendingLink(link);
  }

  const activeCount = quickLinks.filter((l) => !l.disabled).length;

  // ─── Contenido interno del item (icono + label + flecha) ──────────────────
  function ItemContent({ link, c }: { link: QuickLinkItem; c: typeof DEFAULT_COLOR }) {
    const Icon = resolveIcon(link.icon);
    return (
      <>
        <span className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px]",
          "transition-transform duration-200 group-hover:scale-110",
          c.iconBg,
        )}>
          <Icon size={13} className={c.iconText} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[12.5px] font-medium leading-tight truncate transition-colors duration-200
                           text-slate-700 group-hover:text-violet-700
                           dark:text-[#cdd9e5] dark:group-hover:text-violet-400">
            {link.label}
          </span>
          {link.description && (
            <span className="block text-[11px] leading-tight truncate mt-0.5
                             text-slate-400 dark:text-[#545d68]">
              {link.description}
            </span>
          )}
        </span>
        <ChevronRight
          size={12}
          className={cn(
            "shrink-0 transition-all duration-200",
            "group-hover:translate-x-0.5 group-hover:opacity-0",
            c.arrow,
          )}
        />
      </>
    );
  }

  return (
    <>
      <section className={cn(
        "rounded-xl border shadow-sm flex flex-col overflow-hidden",
        "border-slate-200 bg-white",
        "dark:border-[#30363d] dark:bg-[#161b22]",
        fillHeight && "h-full",
      )}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0
                        border-b border-slate-100 dark:border-[#21262d]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-lg
                             bg-violet-50 dark:bg-violet-500/[0.12]">
              <Zap className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
            </span>
            <div>
              <p className="text-[13px] font-semibold leading-none
                            text-slate-800 dark:text-[#e6edf3]">
                {title}
              </p>
              <p className="text-[11px] mt-0.5 leading-none
                            text-slate-400 dark:text-[#545d68]">
                Accede directamente a lo que más usas
              </p>
            </div>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full
                           bg-violet-50 text-violet-600
                           dark:bg-violet-500/[0.12] dark:text-violet-400">
            {activeCount} enlaces
          </span>
        </div>

        {/* Grid */}
        <ul className={cn(
          "grid gap-1.5 p-2.5",
          columns === 2 && "grid-cols-2",
          columns === 3 && "grid-cols-3",
          columns === 4 && "grid-cols-4",
        )}>
          {quickLinks.map((link) => {
            const c        = colorMap[link.color ?? "purple"] ?? DEFAULT_COLOR;
            const isFav    = favoriteHrefs.includes(link.href);
            const disabled = link.disabled ?? false;

            // ── Deshabilitado ──────────────────────────────────
            if (disabled) {
              return (
                <li
                  key={link.href}
                  className="relative group min-h-0"
                  title={link.disabledMsg ?? "No tienes acceso a esta herramienta"}
                >
                  <div className={cn(
                    "flex items-center gap-2.5 rounded-[10px] h-full",
                    "border border-l-[3px] border-slate-100 border-l-slate-200 bg-slate-50/50",
                    "dark:border-[#21262d] dark:border-l-[#30363d] dark:bg-[#1c2128]/40",
                    "px-3 py-2 pr-8 cursor-not-allowed opacity-40 select-none",
                  )}>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px]
                                     bg-slate-100 dark:bg-[#21262d]">
                      <Lock size={11} className="text-slate-400 dark:text-[#545d68]" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[12.5px] font-medium leading-tight truncate
                                       text-slate-400 dark:text-[#444c56]">
                        {link.label}
                      </span>
                      {link.description && (
                        <span className="block text-[11px] leading-tight truncate mt-0.5
                                         text-slate-300 dark:text-[#30363d]">
                          {link.description}
                        </span>
                      )}
                    </span>
                    <Lock size={11} className="shrink-0 text-slate-300 dark:text-[#30363d]" />
                  </div>
                </li>
              );
            }

            // ── Estrella compartida ────────────────────────────
            const StarButton = (
              <button
                onClick={() => handleStarClick(link)}
                title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
                className={cn(
                  "absolute top-1.5 right-1.5 z-10",
                  "flex h-5 w-5 items-center justify-center rounded-full",
                  "transition-all duration-200",
                  "group-hover:-translate-y-[2px] group-hover:scale-[1.015]",
                  isFav
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100 text-slate-300 hover:text-amber-400 dark:text-[#444c56] dark:hover:text-amber-400",
                )}
              >
                <Star
                  size={11}
                  className={cn("transition-all", isFav ? "fill-amber-400 text-amber-400" : "fill-none")}
                />
              </button>
            );

            // ── Acción (abre modal u otra función) ─────────────
            if (link.action) {
              return (
                <li key={link.href} className="relative group min-h-0">
                  <button
                    type="button"
                    onClick={link.action}
                    className={activeItemClasses(c)}
                  >
                    <ItemContent link={link} c={c} />
                  </button>
                  {StarButton}
                </li>
              );
            }

            // ── Navegación normal ──────────────────────────────
            return (
              <li key={link.href} className="relative group min-h-0">
                <Link href={link.href} className={activeItemClasses(c)}>
                  <ItemContent link={link} c={c} />
                </Link>
                {StarButton}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Modal favoritos */}
      <AddFavoriteModal
        open={pendingLink !== null}
        onClose={() => setPendingLink(null)}
        existingHrefs={favoriteHrefs}
        preselectedApp={pendingLink ? {
          href:  pendingLink.href,
          label: pendingLink.label,
          icon:  pendingLink.icon,
          ...(pendingLink.description !== undefined && { description: pendingLink.description }),
          ...(pendingLink.color       !== undefined && { color: pendingLink.color as AppColor }),
        } : null}
        onAdd={addFavorite}
      />
    </>
  );
}