// app/components/home/edm-news/EdmNewsLightbox.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import DOMPurify from "dompurify";
import type { EdmNewsItem } from "./useEdmNews";

interface Props {
  news: EdmNewsItem | null;
  onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.6;

/**
 * Visor de pantalla completa para un aviso de EDM News.
 *
 * @remarks
 * Se renderiza vía Portal en `document.body`, y el overlay usa estilos
 * INLINE (no clases de Tailwind) para su posicionamiento — esto es
 * deliberado: garantiza que cubra el 100% del viewport sin depender de
 * que las clases se apliquen/purguen correctamente, eliminando toda
 * una categoría de bugs de superposición.
 *
 * Al abrir, el contenido se muestra ajustado a pantalla (sin zoom
 * automático) — el zoom es una herramienta opcional que el usuario
 * activa, no el estado inicial.
 */
export function EdmNewsLightbox({ news, onClose }: Props) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }, [news]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (news) {
      window.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [news, onClose]);

  if (!mounted || !news) return null;

  function zoomAt(clientX: number, clientY: number, delta: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cursorX = clientX - rect.left - rect.width / 2;
    const cursorY = clientY - rect.top - rect.height / 2;

    setScale((prevScale) => {
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prevScale + delta));
      if (newScale === MIN_SCALE) {
        setPos({ x: 0, y: 0 });
        return newScale;
      }
      const ratio = newScale / prevScale;
      setPos((prevPos) => ({
        x: cursorX - (cursorX - prevPos.x) * ratio,
        y: cursorY - (cursorY - prevPos.y) * ratio,
      }));
      return newScale;
    });
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 0.3 : -0.3);
  }

  function handleDoubleClick(e: React.MouseEvent) {
    if (scale > 1) {
      setScale(1);
      setPos({ x: 0, y: 0 });
    } else {
      zoomAt(e.clientX, e.clientY, ZOOM_STEP * 2);
    }
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (scale <= 1) return;
    dragging.current = true;
    lastPos.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  }
  function handleMouseMove(e: React.MouseEvent) {
    if (!dragging.current) return;
    setPos({ x: e.clientX - lastPos.current.x, y: e.clientY - lastPos.current.y });
  }
  function handleMouseUp() {
    dragging.current = false;
  }

  const safeHtml = news.content_html ? DOMPurify.sanitize(news.content_html) : "";

  const modal = (
    // ⚠️ Estilos INLINE a propósito — ver el comentario del módulo arriba.
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100dvh",
        zIndex: 2147483647, // valor máximo posible de z-index, para ganarle a cualquier otro elemento
        background: "rgba(0, 0, 0, 0.95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => e.target === e.currentTarget && scale === 1 && onClose()}
    >
      <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 8, zIndex: 10 }}>
        <button
          onClick={() => zoomAt(window.innerWidth / 2, window.innerHeight / 2, ZOOM_STEP)}
          aria-label="Acercar"
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        <button
          onClick={() => zoomAt(window.innerWidth / 2, window.innerHeight / 2, -ZOOM_STEP)}
          aria-label="Alejar"
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
        <button
          onClick={() => { setScale(1); setPos({ x: 0, y: 0 }); }}
          aria-label="Restablecer zoom"
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: scale > 1 ? (dragging.current ? "grabbing" : "grab") : "default",
        }}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {news.type === "image" && news.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={news.image_url}
            alt={news.title}
            draggable={false}
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
              transition: dragging.current ? "none" : "transform 0.12s ease-out",
              maxHeight: "92vh",
              maxWidth: "92vw",
              objectFit: "contain",
              userSelect: "none",
            }}
          />
        ) : (
          <div
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
              transition: dragging.current ? "none" : "transform 0.12s ease-out",
              maxHeight: "90vh",
              width: "min(90vw, 820px)",
              background: "white",
              borderRadius: "16px",
              overflowY: "auto",
            }}
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        )}
      </div>

      <p style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
        Rueda del mouse o doble clic para hacer zoom · Arrastra para mover · Esc para cerrar
      </p>
    </div>
  );

  return createPortal(modal, document.body);
}