"use client";

import { Maximize2 } from "lucide-react";
import DOMPurify from "dompurify";
import type { EdmNewsItem } from "./useEdmNews";

interface Props {
  news: EdmNewsItem;
  onExpand?: () => void;
}

/**
 * Renderiza un aviso de EDM News como pieza visual completa.
 *
 * @remarks
 * Usa `object-contain` (nunca `object-cover`) para que la imagen se vea
 * COMPLETA, sin recortes ni estiramientos — crítico para piezas
 * verticales largas tipo poster de campaña. El fondo desenfocado detrás
 * evita que quede "flotando" en espacio vacío.
 */
export function EdmNewsTile({ news, onExpand }: Props) {
  if (news.type === "image" && news.image_url) {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-slate-900">
        {/* Fondo desenfocado — rellena el espacio sin recortar la imagen principal */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-50"
          style={{ backgroundImage: `url(${news.image_url})` }}
          aria-hidden
        />
        {/* Imagen completa, sin recorte ni estiramiento */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={news.image_url}
          alt={news.title}
          className="relative h-full w-full object-contain"
        />
        {onExpand && (
          <button
            onClick={onExpand}
            aria-label="Ver en pantalla completa"
            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm transition-colors"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  const safeHtml = news.content_html ? DOMPurify.sanitize(news.content_html) : "";

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-white dark:bg-[#161b22]">
      <div className="h-full w-full overflow-y-auto" dangerouslySetInnerHTML={{ __html: safeHtml }} />
      {onExpand && (
        <button
          onClick={onExpand}
          aria-label="Ver en pantalla completa"
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm transition-colors"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}