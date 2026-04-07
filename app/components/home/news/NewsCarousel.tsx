"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NewsTileSquare } from "./NewsTileSquare";

interface Announcement {
  id: string;
  title: string;
  summary?: string;
  date?: string;
  imageUrl?: string;
}

interface Props {
  announcements: Announcement[];
}

export function NewsCarousel({ announcements }: Props) {
  const [current, setCurrent] = useState(0);
  const total = announcements.length;

  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(() => setCurrent((p) => (p + 1) % total), 6000);
    return () => clearInterval(id);
  }, [total]);

  const next = () => setCurrent((p) => (p + 1) % total);
  const prev = () => setCurrent((p) => (p - 1 + total) % total);

  return (
    <div className="relative w-full h-full group">

      {/* Slides */}
      <div className="relative h-full rounded-2xl overflow-hidden">
        {announcements.map((item, index) => (
          <div
            key={item.id}
            className={`
              absolute inset-0 transition-opacity duration-700 ease-in-out
              ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"}
            `}
          >
            <NewsTileSquare news={item} variant="large" />
          </div>
        ))}
      </div>

      {/* Nav buttons — en dark usan bg oscuro semitransparente en lugar de blanco */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Anterior"
            className="
              absolute left-3 top-1/2 -translate-y-1/2 z-30
              flex h-9 w-9 items-center justify-center rounded-full
              shadow-md transition-all duration-200
              opacity-0 group-hover:opacity-100
              hover:scale-105

              bg-white/90 text-violet-700 hover:bg-white backdrop-blur-sm
              dark:bg-[#161b22]/80 dark:text-violet-400 dark:hover:bg-[#21262d]/90 dark:border dark:border-[#30363d]
            "
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={next}
            aria-label="Siguiente"
            className="
              absolute right-3 top-1/2 -translate-y-1/2 z-30
              flex h-9 w-9 items-center justify-center rounded-full
              shadow-md transition-all duration-200
              opacity-0 group-hover:opacity-100
              hover:scale-105

              bg-white/90 text-violet-700 hover:bg-white backdrop-blur-sm
              dark:bg-[#161b22]/80 dark:text-violet-400 dark:hover:bg-[#21262d]/90 dark:border dark:border-[#30363d]
            "
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Dot indicators — iguales en ambos modos (blanco sobre foto) */}
      {total > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
          {announcements.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              aria-label={`Ir a noticia ${index + 1}`}
              className={`
                h-1.5 rounded-full transition-all duration-300
                ${index === current
                  ? "w-8 bg-white shadow"
                  : "w-3 bg-white/50 hover:bg-white/75"}
              `}
            />
          ))}
        </div>
      )}
    </div>
  );
}
