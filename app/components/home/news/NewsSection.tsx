"use client";

import { Newspaper, ArrowRight } from "lucide-react";
import Link from "next/link";
import { NewsCarousel }      from "./NewsCarousel";
import { KnowUsCard }        from "@/app/components/home/KnowUsCard";
import { PoliciesCardAside }      from "@/app/components/home/PoliciesCard";
import { QuickLinksSection } from "@/app/components/ui/QuickLinksSection";
import { homeQuickLinks }    from "@/app/components/home/config/homeQuickLinks";

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
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
            <Newspaper className="h-3.5 w-3.5 text-violet-600" />
          </span>
          <h2 className="text-sm font-semibold text-slate-800">Noticias y Comunicados</h2>
        </div>
        <Link
          href="/noticias"
          className="flex items-center gap-1 text-[11px] font-medium text-slate-400 transition-colors hover:text-violet-600"
        >
          Ver todas <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-[580px]">

        {/* Columna izquierda: Carousel */}
        <div className="h-full">
          <NewsCarousel announcements={announcements} />
        </div>

        {/*
          Columna derecha — grid 2×2:
            Fila 1: KnowUsCard (mitad) | PoliciesCard (mitad)
            Fila 2: QuickLinksSection  — col-span-2
                    ← antes era PoliciesCard aquí, ahora Accesos Rápidos
                       (movidos desde el aside del home)
        */}
        <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">

          {/* Fila 1 — izquierda */}
          <KnowUsCard />

          {/* Fila 1 — derecha: Políticas compacta */}
          <PoliciesCardAside />

          {/* Fila 2: Accesos Rápidos — ancho completo */}
          <div className="col-span-2 h-full">
            <QuickLinksSection quickLinks={homeQuickLinks} />
          </div>

        </div>

      </div>
    </section>
  );
}