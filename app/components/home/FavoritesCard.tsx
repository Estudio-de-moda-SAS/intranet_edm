"use client";

import { useState }        from "react";
import Link                from "next/link";
import {
  Star, Plus, GripVertical, X,
  FileText, LayoutDashboard, Users, Calendar,
  BarChart2, BookOpen, Wrench, MessageSquare,
  Globe, Bell, Briefcase, ClipboardList,
  CreditCard, HeadphonesIcon, PieChart, Settings,
  ShieldCheck, Zap,
} from "lucide-react";
import { cn }              from "@/lib/utils";
import { useFavorites }    from "@/features/favorites/FavoritesContext";
import { AddFavoriteModal } from "@/app/components/home/AddFavoriteModal";
import { useAppSession }   from "@/lib/useAppSession";

const ICON_MAP = {
  FileText, LayoutDashboard, Users, Calendar,
  BarChart2, BookOpen, Wrench, MessageSquare,
  Globe, Bell, Briefcase, ClipboardList,
  CreditCard, HeadphonesIcon, PieChart, Settings,
  ShieldCheck, Zap,
} as const;

type IconKey = keyof typeof ICON_MAP;
function resolveIcon(key: string) { return ICON_MAP[key as IconKey] ?? FileText; }

const MAX_FAVORITES = 16;

export function FavoritesCard() {
  const { favorites, favoriteHrefs, removeFavorite, addFavorite } = useFavorites();
  const { level } = useAppSession();
  const [editing,   setEditing]   = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const emptySlots = editing ? Math.max(0, MAX_FAVORITES - favorites.length) : 0;

  return (
    <>
      <section className="flex flex-col rounded-xl border shadow-sm h-full overflow-hidden
                           border-slate-200 bg-white
                           dark:border-[#30363d] dark:bg-[#161b22]">

        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 shrink-0
                        border-slate-100 dark:border-[#21262d]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-lg
                             bg-amber-50 dark:bg-amber-500/[0.12]">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            </span>
            <div>
              <p className="text-[13px] font-semibold leading-none
                            text-slate-800 dark:text-[#e6edf3]">Favoritos</p>
              <p className="text-[11px] mt-0.5 leading-none
                            text-slate-400 dark:text-[#545d68]">Tus accesos personalizados</p>
            </div>
          </div>

          <button
            onClick={() => setEditing(v => !v)}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-200",
              editing
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#21262d] dark:text-[#adbac7] dark:hover:bg-[#30363d]"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/[0.12] dark:text-amber-400 dark:hover:bg-amber-500/[0.18]",
            )}
          >
            {editing ? "Listo" : "Editar"}
          </button>
        </div>

        {/* Grid */}
        <ul className="grid grid-cols-2 gap-1.5 p-2.5 flex-1 auto-rows-fr">
          {favorites.map(item => {
            const Icon = resolveIcon(item.iconKey);
            return (
              <li key={item.id} className="relative group min-h-0">
                {editing && (
                  <button
                    onClick={() => removeFavorite(item.id)}
                    className="absolute -right-1 -top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm transition-transform hover:scale-110"
                    aria-label={`Quitar ${item.label}`}
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}

                <Link
                  href={editing ? "#" : item.href}
                  {...(editing ? { onClick: (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault() } : {})}
                  className={cn(
                    "flex h-full w-full items-center gap-2.5 rounded-[10px]",
                    "border px-3 py-2",
                    "transition-all duration-200",
                    "border-slate-200 bg-slate-50",
                    "dark:border-[#30363d] dark:bg-[#1c2128]",
                    editing
                      ? "cursor-default opacity-80"
                      : "hover:bg-amber-50 hover:border-amber-200 hover:shadow-sm dark:hover:bg-amber-500/[0.06] dark:hover:border-amber-500/25",
                  )}
                >
                  {editing && <GripVertical className="h-3 w-3 shrink-0 text-slate-300 dark:text-[#545d68]" />}

                  <span className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] transition-transform duration-200",
                    item.color,
                    !editing && "group-hover:scale-110",
                  )}>
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </span>

                  <span className="flex-1 min-w-0">
                    <span className={cn(
                      "block text-[12px] font-medium leading-tight truncate transition-colors duration-200",
                      editing
                        ? "text-slate-500 dark:text-[#545d68]"
                        : "text-slate-700 group-hover:text-amber-800 dark:text-[#adbac7] dark:group-hover:text-amber-300",
                    )}>
                      {item.label}
                    </span>
                    {item.description && (
                      <span className="block text-[10.5px] leading-tight mt-0.5 truncate
                                       text-slate-400 dark:text-[#545d68]">
                        {item.description}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}

          {editing && favorites.length < MAX_FAVORITES && (
            <>
              <li className="min-h-0">
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex h-full w-full min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] border border-dashed px-3 py-2 text-[12px] font-medium transition-all duration-200
                             border-amber-300 bg-amber-50/60 text-amber-500
                             hover:border-amber-400 hover:bg-amber-100 hover:shadow-sm
                             dark:border-amber-500/30 dark:bg-amber-500/[0.06] dark:text-amber-400
                             dark:hover:border-amber-500/50 dark:hover:bg-amber-500/[0.12]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar
                </button>
              </li>
              {Array.from({ length: emptySlots - 1 }).map((_, i) => (
                <li key={`skeleton-${i}`} className="min-h-0">
                  <div className="flex h-full w-full min-h-[44px] items-center gap-2.5 rounded-[10px] border border-dashed px-3 py-2 opacity-60
                                  border-slate-200 bg-slate-50/50
                                  dark:border-[#30363d] dark:bg-[#1c2128]/50">
                    <span className="h-7 w-7 shrink-0 rounded-[7px] animate-pulse
                                     bg-slate-200/80 dark:bg-[#30363d]" />
                    <span className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <span className="h-2.5 w-3/4 rounded-full animate-pulse
                                       bg-slate-200/80 dark:bg-[#30363d]" />
                      <span className="h-2 w-1/2 rounded-full animate-pulse
                                       bg-slate-200/60 dark:bg-[#21262d]" />
                    </span>
                  </div>
                </li>
              ))}
            </>
          )}

          {favorites.length === 0 && !editing && (
            <li className="col-span-2 flex flex-col items-center gap-2 py-8 text-center">
              <Star className="h-6 w-6 text-slate-200 dark:text-[#30363d]" />
              <p className="text-xs text-slate-400 dark:text-[#545d68]">Aún no tienes favoritos</p>
              <button
                onClick={() => { setEditing(true); setModalOpen(true); }}
                className="mt-1 text-[11px] font-medium text-violet-500 hover:underline dark:text-violet-400"
              >
                Agregar favoritos
              </button>
            </li>
          )}
        </ul>
      </section>

      <AddFavoriteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        existingHrefs={favoriteHrefs}
        accessLevel={level}
        onAdd={async (input) => {
          await addFavorite(input);
          setModalOpen(false);
        }}
      />
    </>
  );
}