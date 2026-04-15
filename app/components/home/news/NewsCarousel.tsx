/**
 * @module NewsCarousel
 * Componente cliente para mostrar anuncios o noticias en formato carrusel.
 *
 * @remarks
 * Este archivo implementa un carrusel visual con rotación automática,
 * navegación manual y selectores por indicador.
 */

"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NewsTileSquare } from "./NewsTileSquare";

/**
 * Representa una noticia o anuncio dentro del carrusel.
 */
interface Announcement {
  /**
   * Identificador único de la noticia.
   */
  id: string;

  /**
   * Título principal del contenido.
   */
  title: string;

  /**
   * Resumen opcional de la noticia.
   */
  summary?: string;

  /**
   * Fecha visible asociada al contenido.
   */
  date?: string;

  /**
   * URL opcional de la imagen destacada.
   */
  imageUrl?: string;
}

/**
 * Props del componente {@link NewsCarousel}.
 */
interface Props {
  /**
   * Lista de anuncios o noticias a mostrar.
   */
  announcements: Announcement[];
}

/**
 * Componente cliente que renderiza un carrusel de noticias.
 *
 * @param props Propiedades del componente.
 * @param props.announcements Lista de noticias a visualizar.
 * @returns Carrusel interactivo con autoplay y navegación manual.
 *
 * @remarks
 * Flujo general:
 * 1. Mantiene el índice actual del slide visible.
 * 2. Activa rotación automática si existe más de una noticia.
 * 3. Permite navegar manualmente hacia adelante o atrás.
 * 4. Renderiza indicadores para saltar a una noticia específica.
 */
export function NewsCarousel({ announcements }: Props) {
  /**
   * Índice de la noticia actualmente visible.
   */
  const [current, setCurrent] = useState(0);

  /**
   * Cantidad total de noticias en el carrusel.
   */
  const total = announcements.length;

  /**
   * Activa la rotación automática del carrusel.
   */
  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(() => setCurrent((p) => (p + 1) % total), 6000);
    return () => clearInterval(id);
  }, [total]);

  /**
   * Avanza al siguiente slide.
   */
  const next = () => setCurrent((p) => (p + 1) % total);

  /**
   * Retrocede al slide anterior.
   */
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

      {/* Navegación */}
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

      {/* Indicadores */}
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