"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { DEFAULT_ANNOUNCEMENTS, TYPE_CONFIG } from "./config";
import { getDismissed, saveDismissed } from "./helpers";
import type { BannerProps } from "./types";

/**
 * @module ProductAnnouncementBanner
 * Banner rotativo de comunicados del módulo de Producto.
 */

/**
 * Banner de comunicados del módulo de Producto.
 *
 * @param props Propiedades del componente.
 * @param props.announcements Listado de anuncios a mostrar.
 * @param props.autoRotateMs Intervalo de rotación automática.
 * @param props.className Clases adicionales del contenedor.
 * @returns Un banner interactivo con anuncios navegables y descartables.
 *
 * @remarks
 * Este componente implementa un sistema de comunicados rotativos
 * con persistencia de dismiss por sesión.
 *
 * Funcionalidades principales:
 * - renderiza uno o varios anuncios
 * - permite navegación manual entre anuncios
 * - rota automáticamente cuando hay más de un elemento
 * - permite descartar anuncios individualmente
 * - persiste descartes en `sessionStorage`
 *
 * El componente solo renderiza una vez que se confirma el montaje
 * en cliente, evitando inconsistencias con APIs del navegador.
 *
 * Si todos los anuncios fueron descartados, no renderiza contenido.
 *
 * @example
 * ```tsx
 * <ProductAnnouncementBanner />
 * ```
 */
export function ProductAnnouncementBanner({
  announcements = DEFAULT_ANNOUNCEMENTS,
  autoRotateMs = 6000,
  className = "",
}: BannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDismissed(getDismissed());
    setMounted(true);
  }, []);

  const active = announcements.filter((a) => !dismissed.has(a.id));

  useEffect(() => {
    if (active.length > 0 && current >= active.length) {
      setCurrent(active.length - 1);
    }
  }, [active.length, current]);

  useEffect(() => {
    if (!autoRotateMs || active.length <= 1) return;

    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % active.length);
    }, autoRotateMs);

    return () => clearInterval(id);
  }, [autoRotateMs, active.length]);

  const dismiss = useCallback((id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev).add(id);
      saveDismissed(next);
      return next;
    });
  }, []);

  if (!mounted || active.length === 0) return null;

  const item = active[Math.min(current, active.length - 1)];
  if (!item) return null;

  const cfg = TYPE_CONFIG[item.type];
  const { Icon } = cfg;

  return (
    <div className={className} role="region" aria-label="Comunicados de Producto">
      <div
        className={`relative flex items-start gap-3 rounded-xl border px-4 py-3 pb-5 transition-all duration-300 ${cfg.bg} ${cfg.border}`}
      >
        <span
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${cfg.iconBg}`}
          aria-hidden
        >
          <Icon className={`h-3.5 w-3.5 ${cfg.iconColor}`} />
        </span>

        <div className="flex-1 min-w-0 pt-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className={`text-[12px] font-semibold ${cfg.textTitle}`}>{item.title}</span>
            {item.date && (
              <span className={`text-[10px] font-medium opacity-60 ${cfg.textMsg}`}>
                {item.date}
              </span>
            )}
          </div>

          <p className={`mt-0.5 text-[11.5px] leading-snug ${cfg.textMsg}`}>{item.message}</p>

          {item.actionLabel && item.actionHref && (
            <a
              href={item.actionHref}
              className={`mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold underline underline-offset-2 ${cfg.textTitle} hover:opacity-80 transition-opacity`}
            >
              {item.actionLabel} →
            </a>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 ml-2">
          {active.length > 1 && (
            <>
              <button
                onClick={() => setCurrent((c) => (c - 1 + active.length) % active.length)}
                aria-label="Anterior"
                className={`flex h-5 w-5 items-center justify-center rounded hover:bg-black/5 transition-colors ${cfg.textMsg}`}
              >
                <ChevronLeft className="h-3 w-3" />
              </button>

              <button
                onClick={() => setCurrent((c) => (c + 1) % active.length)}
                aria-label="Siguiente"
                className={`flex h-5 w-5 items-center justify-center rounded hover:bg-black/5 transition-colors ${cfg.textMsg}`}
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            </>
          )}

          <button
            onClick={() => dismiss(item.id)}
            aria-label="Cerrar comunicado"
            className={`flex h-5 w-5 items-center justify-center rounded hover:bg-black/5 transition-colors ${cfg.textMsg}`}
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        {active.length > 1 && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1" aria-hidden>
            {active.map((a, i) => (
              <button
                key={a.id}
                onClick={() => setCurrent(i)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === current ? `w-4 ${cfg.dot}` : "w-1 bg-black/15"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}