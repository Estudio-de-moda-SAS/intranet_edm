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
  // ↓ Si existe, ejecuta la acción en lugar de navegar al href
  action?:      () => void;
};

type QuickLinksSectionProps = {
  quickLinks:  QuickLinkItem[];
  title?:      string;
  fillHeight?: boolean;
  columns?:    2 | 3 | 4;
};

// ─── Color map ────────────────────────────────────────────────────────────────

const colorMap: Record<QuickLinkColor, {
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
};

const DEFAULT_COLOR = colorMap["purple"]!;

// ─── Clases compartidas para el item activo ───────────────────────────────────

function activeItemClasses(c: typeof DEFAULT_COLOR) {
  return cn(
    "flex items-center gap-2.5 rounded-[10px] h-full w-full",
    "border border-slate-200 border-l-[3px] bg-slate-50",
    "px-3 py-2 pr-8",
    "transition-all duration-300 ease-out",
    "group-hover:-translate-y-[3px] group-hover:scale-[1.02] group-hover:shadow-md",
    "group-hover:bg-gradient-to-r group-hover:from-violet-100 group-hover:to-purple-200",
    c.border, c.hoverBg, c.hoverBorder,
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

  return (
    <>
      <section className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden",
        fillHeight && "h-full",
      )}>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-violet-50">
              <Zap className="h-3.5 w-3.5 text-violet-600" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-slate-800 leading-none">{title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-none">
                Accede directamente a lo que más usas
              </p>
            </div>
          </div>
          <span className="text-[11px] font-medium bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full">
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
            const Icon     = resolveIcon(link.icon);
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
                    "border border-slate-100 border-l-[3px] border-l-slate-200 bg-slate-50/50",
                    "px-3 py-2 pr-8 cursor-not-allowed opacity-50 select-none",
                  )}>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-slate-100">
                      <Icon size={13} className="text-slate-400" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[12.5px] font-medium text-slate-400 leading-tight truncate">
                        {link.label}
                      </span>
                      {link.description && (
                        <span className="block text-[11px] text-slate-300 leading-tight truncate mt-0.5">
                          {link.description}
                        </span>
                      )}
                    </span>
                    <Lock size={11} className="shrink-0 text-slate-300" />
                  </div>
                </li>
              );
            }

            // ── Acción (abre modal) ────────────────────────────
            if (link.action) {
              return (
                <li key={link.href} className="relative group min-h-0">
                  <button
                    type="button"
                    onClick={link.action}
                    className={activeItemClasses(c)}
                  >
                    <span className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px]",
                      "transition-transform duration-300 group-hover:scale-110",
                      c.bg,
                    )}>
                      <Icon size={13} className={c.icon} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[12.5px] font-medium text-slate-700 leading-tight truncate transition-colors duration-300 group-hover:text-violet-700">
                        {link.label}
                      </span>
                      {link.description && (
                        <span className="block text-[11px] text-slate-400 leading-tight truncate mt-0.5">
                          {link.description}
                        </span>
                      )}
                    </span>
                    <ChevronRight
                      size={12}
                      className={cn("shrink-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-0", c.arrow)}
                    />
                  </button>

                  {/* Estrella — usa href como key aunque no navegue */}
                  <button
                    onClick={() => handleStarClick(link)}
                    title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
                    className={cn(
                      "absolute top-1.5 right-1.5 z-10",
                      "flex h-5 w-5 items-center justify-center rounded-full",
                      "transition-all duration-300",
                      "group-hover:-translate-y-[3px] group-hover:scale-[1.02]",
                      isFav
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100 text-slate-300 hover:text-amber-400",
                    )}
                  >
                    <Star
                      size={11}
                      className={cn("transition-all", isFav ? "fill-amber-400 text-amber-400" : "fill-none")}
                    />
                  </button>
                </li>
              );
            }

            // ── Navegación normal ──────────────────────────────
            return (
              <li key={link.href} className="relative group min-h-0">
                <Link
                  href={link.href}
                  className={activeItemClasses(c)}
                >
                  <span className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px]",
                    "transition-transform duration-300 group-hover:scale-110",
                    c.bg,
                  )}>
                    <Icon size={13} className={c.icon} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[12.5px] font-medium text-slate-700 leading-tight truncate transition-colors duration-300 group-hover:text-violet-700">
                      {link.label}
                    </span>
                    {link.description && (
                      <span className="block text-[11px] text-slate-400 leading-tight truncate mt-0.5">
                        {link.description}
                      </span>
                    )}
                  </span>
                  <ChevronRight
                    size={12}
                    className={cn("shrink-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-0", c.arrow)}
                  />
                </Link>

                {/* Estrella */}
                <button
                  onClick={() => handleStarClick(link)}
                  title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
                  className={cn(
                    "absolute top-1.5 right-1.5 z-10",
                    "flex h-5 w-5 items-center justify-center rounded-full",
                    "transition-all duration-300",
                    "group-hover:-translate-y-[3px] group-hover:scale-[1.02]",
                    isFav
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100 text-slate-300 hover:text-amber-400",
                  )}
                >
                  <Star
                    size={11}
                    className={cn("transition-all", isFav ? "fill-amber-400 text-amber-400" : "fill-none")}
                  />
                </button>
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