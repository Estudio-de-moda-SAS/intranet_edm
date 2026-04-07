"use client";

import { Newspaper, ArrowRight } from "lucide-react";
import Link from "next/link";
import { NewsCarousel }       from "./NewsCarousel";
import { KnowUsCard }         from "@/app/components/home/KnowUsCard";
import { PoliciesCardAside }  from "@/app/components/home/PoliciesCard";
import { QuickLinksSection }  from "@/app/components/ui/QuickLinksSection";
import { homeQuickLinks }     from "@/app/components/home/config/homeQuickLinks";

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
}

interface Props {
  announcements: Announcement[];
}

export function NewsSection({ announcements }: Props) {
  if (!announcements?.length) return null;

  return (
    <section className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg
                           bg-violet-50 dark:bg-violet-500/[0.12]">
            <Newspaper className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
          </span>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-[#e6edf3]">
            Noticias y Comunicados
          </h2>
        </div>
        <Link
          href="/noticias"
          className="flex items-center gap-1 text-[11px] font-medium transition-colors
                     text-slate-400 hover:text-violet-600
                     dark:text-[#545d68] dark:hover:text-violet-400"
        >
          Ver todas <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:h-[580px]">

        {/* Columna izquierda: Carousel */}
        <div className="h-[340px] lg:h-full">
          <NewsCarousel announcements={announcements} />
        </div>

        {/* Columna derecha */}
        <div className="grid grid-cols-2 grid-rows-2 gap-2 lg:h-full">
          <KnowUsCard />
          <PoliciesCardAside />
          <div className="col-span-2 lg:h-full">
            <QuickLinksSection quickLinks={homeQuickLinks} />
          </div>
        </div>

      </div>
    </section>
  );
}
