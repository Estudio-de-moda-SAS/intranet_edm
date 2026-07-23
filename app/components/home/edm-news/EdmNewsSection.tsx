"use client";

import { Megaphone } from "lucide-react";
import { EdmNewsCarousel } from "./EdmNewsCarousel";

/**
 * Sección del Home que muestra el carrusel de EDM News.
 *
 * @remarks
 * Sigue el mismo patrón visual de header que `NewsSection` (ícono +
 * título), para mantener consistencia dentro del grid del Home.
 */
export function EdmNewsSection() {
  return (
    <section className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-500/[0.12]">
            <Megaphone className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
          </span>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-[#e6edf3]">
            EDM News
          </h2>
        </div>
      </div>

     <div className="h-[420px] lg:h-[620px]">
  <EdmNewsCarousel />
</div>
    </section>
  );
}