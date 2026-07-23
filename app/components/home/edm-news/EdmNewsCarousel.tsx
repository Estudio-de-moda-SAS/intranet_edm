"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EdmNewsTile } from "./EdmNewsTile";
import { EdmNewsLightbox } from "./EdmNewsLightbox";
import { useEdmNews } from "./useEdmNews";
import type { EdmNewsItem } from "./useEdmNews";

const AUTOPLAY_INTERVAL_MS = 9000; // antes 6000 — menos vertiginoso

export function EdmNewsCarousel() {
  const { data: items, isLoading, error } = useEdmNews();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [expanded, setExpanded] = useState<EdmNewsItem | null>(null);
  const total = items?.length ?? 0;

  useEffect(() => {
    if (total <= 1 || isPaused || expanded) return;
    const id = setInterval(() => setCurrent((p) => (p + 1) % total), AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [total, isPaused, expanded]);

  if (isLoading) {
    return <div className="h-full w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-[#161b22]" />;
  }

  if (error || !items || items.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-[#30363d]">
        No hay avisos publicados por el momento
      </div>
    );
  }

  const next = () => setCurrent((p) => (p + 1) % total);
  const prev = () => setCurrent((p) => (p - 1 + total) % total);

  return (
    <>
      <div
        className="relative h-full w-full group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative h-full rounded-2xl overflow-hidden">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === current ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <EdmNewsTile news={item} onExpand={() => setExpanded(item)} />
            </div>
          ))}
        </div>

        {total > 1 && (
          <>
            <button onClick={prev} aria-label="Anterior" className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-105 bg-white/90 text-violet-700 hover:bg-white backdrop-blur-sm dark:bg-[#161b22]/80 dark:text-violet-400 dark:hover:bg-[#21262d]/90 dark:border dark:border-[#30363d]">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={next} aria-label="Siguiente" className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-105 bg-white/90 text-violet-700 hover:bg-white backdrop-blur-sm dark:bg-[#161b22]/80 dark:text-violet-400 dark:hover:bg-[#21262d]/90 dark:border dark:border-[#30363d]">
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {total > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
            {items.map((_, index) => (
              <button key={index} onClick={() => setCurrent(index)} aria-label={`Ir al aviso ${index + 1}`} className={`h-1.5 rounded-full transition-all duration-300 ${index === current ? "w-8 bg-white shadow" : "w-3 bg-white/50 hover:bg-white/75"}`} />
            ))}
          </div>
        )}
      </div>

      <EdmNewsLightbox news={expanded} onClose={() => setExpanded(null)} />
    </>
  );
}