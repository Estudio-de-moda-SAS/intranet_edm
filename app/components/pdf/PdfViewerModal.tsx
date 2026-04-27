"use client";

/**
 * @module PdfViewerModal
 * Modal visor para documentos PDF y archivos de oficina con panel de metadatos.
 *
 * @remarks
 * Este archivo implementa un visor enriquecido que permite:
 *
 * - previsualizar PDFs en navegador,
 * - incrustar archivos Office mediante Office Online,
 * - mostrar estados alternativos cuando no existe preview,
 * - visualizar metadatos del documento,
 * - controlar zoom, página, fullscreen y descarga.
 *
 * El componente se renderiza mediante `createPortal` para superponerse
 * correctamente sobre el resto de la interfaz.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  User,
  Tag,
  Hash,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Shield,
  X,
} from "lucide-react";

import type { PdfViewerModalProps } from "./types";
import { isOfficeFile, isSupported } from "./utils";
import { PdfPlaceholder } from "./components/PdfPlaceholder";
import { UnsupportedPreview } from "./components/UnsupportedPreview";
import { MetadataRow } from "./components/MetadataRow";
import { ToolbarBtn } from "./components/ToolbarBtn";
import { PdfPreview } from "./components/PdfPreview";
import { OfficePreview } from "./components/OfficePreview";

/**
 * Modal principal para visualizar PDFs y documentos compatibles.
 *
 * @param props Propiedades del componente.
 * @param props.open Indica si el modal está visible.
 * @param props.onClose Callback para cerrar el modal.
 * @param props.metadata Documento seleccionado.
 * @returns Modal renderizado en portal con visor y sidebar de metadatos.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Valida si el modal está abierto y si existe metadata.
 * 2. Reinicia zoom y página al cambiar de documento.
 * 3. Cierra con tecla Escape o click en backdrop.
 * 4. Bloquea el scroll del body mientras está abierto.
 * 5. Decide qué tipo de preview mostrar:
 *    - placeholder si no hay preview,
 *    - Office embed si es documento Office,
 *    - fallback si el formato no es compatible,
 *    - iframe PDF nativo si sí lo es.
 *
 * También incorpora:
 * - toolbar superior,
 * - sidebar colapsable de metadatos,
 * - modo fullscreen local,
 * - navegación básica de página en móvil.
 */
export default function PdfViewerModal({ open, onClose, metadata }: PdfViewerModalProps) {
  /**
   * Controla si el componente ya está montado en cliente.
   */
  const [mounted, setMounted] = useState(false);

  /**
   * Nivel de zoom aplicado al visor PDF.
   */
  const [zoom, setZoom] = useState(100);

  /**
   * Página actual usada en la navegación básica del visor.
   */
  const [page, setPage] = useState(1);

  /**
   * Indica si el modal está en modo fullscreen.
   */
  const [fullscreen, setFullscreen] = useState(false);

  /**
   * Controla la visibilidad del panel lateral de metadatos.
   */
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /**
   * Marca el componente como montado.
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Reinicia zoom y página al abrir o cambiar de documento.
   */
  useEffect(() => {
    if (open) {
      setZoom(100);
      setPage(1);
    }
  }, [open, metadata?.id]);

  /**
   * Maneja cierre por tecla Escape.
   */
  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  /**
   * Bloquea scroll del body mientras el modal está abierto.
   */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !mounted || !metadata) return null;

  const dialogContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4
                 bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.currentTarget === e.target) onClose();
      }}
    >
      <div
        className={`
          flex flex-col overflow-hidden
          border shadow-2xl
          bg-white border-slate-200 shadow-slate-300/30
          dark:bg-[#161b22] dark:border-[#30363d] dark:shadow-black/50
          ${fullscreen ? "fixed inset-0 rounded-none" : "relative w-full max-w-6xl rounded-2xl"}
        `}
        style={fullscreen ? undefined : { height: "min(90vh, 900px)" }}
      >
        {/* Accent bar */}
        <div className="h-1 w-full bg-teal-500 shrink-0" />

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-slate-100 dark:border-[#21262d]">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                         border
                         bg-teal-50 border-teal-100
                         dark:bg-teal-500/[0.10] dark:border-teal-500/20"
            >
              <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </span>

            <div className="min-w-0">
              <p className="text-sm font-semibold truncate max-w-[240px] sm:max-w-[420px] text-slate-800 dark:text-[#e6edf3]">
                {metadata.title}
              </p>
              <p className="text-[10px] font-mono mt-0.5 text-slate-400 dark:text-[#545d68]">
                {metadata.id}
                {metadata.version && ` · v${metadata.version}`}
                {metadata.size && ` · ${metadata.size}`}
              </p>
            </div>

            {metadata.restricted && (
              <span
                className="hidden sm:inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold
                           bg-rose-50 text-rose-700 border-rose-200
                           dark:bg-rose-500/[0.10] dark:text-rose-400 dark:border-rose-500/25"
              >
                <Shield className="h-3 w-3" />
                Restringido
              </span>
            )}
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            {/* Zoom */}
            <div
              className="hidden sm:flex items-center gap-0.5 rounded-lg px-1 py-0.5
                         border bg-slate-50 border-slate-200
                         dark:bg-[#1c2128] dark:border-[#30363d]"
            >
              <ToolbarBtn onClick={() => setZoom((z) => Math.max(50, z - 10))} title="Reducir zoom">
                <ZoomOut className="h-3.5 w-3.5" />
              </ToolbarBtn>

              <span className="text-[11px] font-mono font-bold w-9 text-center text-slate-600 dark:text-[#adbac7]">
                {zoom}%
              </span>

              <ToolbarBtn onClick={() => setZoom((z) => Math.min(200, z + 10))} title="Aumentar zoom">
                <ZoomIn className="h-3.5 w-3.5" />
              </ToolbarBtn>
            </div>

            <ToolbarBtn onClick={() => setSidebarOpen((s) => !s)} title="Metadatos">
              <Tag className="h-4 w-4" />
            </ToolbarBtn>

            {metadata.downloadUrl ? (
              <a
                href={metadata.downloadUrl}
                download
                title="Descargar"
                className="p-1.5 rounded-lg transition
                           text-slate-500 hover:bg-slate-100
                           dark:text-[#768390] dark:hover:bg-[#21262d] dark:hover:text-[#adbac7]"
              >
                <Download className="h-4 w-4" />
              </a>
            ) : (
              <ToolbarBtn disabled title="Disponible con integración Graph">
                <Download className="h-4 w-4" />
              </ToolbarBtn>
            )}

            <ToolbarBtn onClick={() => setFullscreen((f) => !f)} title="Pantalla completa">
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </ToolbarBtn>

            <ToolbarBtn onClick={onClose} danger title="Cerrar">
              <X className="h-4 w-4" />
            </ToolbarBtn>
          </div>
        </div>

        {/* Split body */}
        <div className="flex flex-1 min-h-0">
          {/* Main content */}
          <div className="flex-1 overflow-auto flex flex-col bg-slate-100 dark:bg-[#0d1117]">
            {!metadata.previewUrl ? (
              <PdfPlaceholder metadata={metadata} />
            ) : isOfficeFile(metadata.previewUrl) ? (
              <OfficePreview url={metadata.previewUrl} title={metadata.title} />
            ) : !isSupported(metadata.previewUrl) ? (
              <UnsupportedPreview url={metadata.previewUrl} />
            ) : (
              <PdfPreview
                url={`${metadata.previewUrl}#zoom=${zoom}&page=${page}`}
                title={metadata.title}
              />
            )}
          </div>

          {/* Sidebar */}
          {sidebarOpen && (
            <aside className="w-64 shrink-0 flex flex-col min-h-0 border-l border-slate-100 bg-white dark:border-[#21262d] dark:bg-[#161b22]">
              <div className="px-4 py-3 shrink-0 border-b bg-slate-50/60 dark:border-[#21262d] dark:bg-[#1c2128]/60">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#545d68]">
                  Metadatos
                </p>
              </div>

              <div className="px-4 py-1 flex-1 overflow-y-auto">
                <MetadataRow icon={Hash} label="ID" value={metadata.id} />
                <MetadataRow icon={FileText} label="Título" value={metadata.title} />
                <MetadataRow icon={Tag} label="Categoría" value={metadata.category} />
                <MetadataRow icon={User} label="Autor" value={metadata.author} />
                <MetadataRow icon={RotateCw} label="Versión" value={metadata.version} />
                <MetadataRow icon={Download} label="Tamaño" value={metadata.size} />
                <MetadataRow icon={Tag} label="Actualizado" value={metadata.updatedAt} />
              </div>

              {metadata.restricted && (
                <div className="px-4 py-3 shrink-0 border-t border-slate-100 dark:border-[#21262d]">
                  <div
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2
                               border bg-rose-50 border-rose-200
                               dark:bg-rose-500/[0.08] dark:border-rose-500/20"
                  >
                    <Shield className="h-3.5 w-3.5 text-rose-400 dark:text-rose-400" />
                    <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      Acceso restringido
                    </span>
                  </div>
                </div>
              )}
            </aside>
          )}
        </div>

        {/* Mobile page nav */}
        {metadata.previewUrl && (
          <div
            className="sm:hidden flex items-center justify-center gap-3 px-4 py-2.5 shrink-0
                       border-t bg-slate-50/60
                       border-slate-100 dark:border-[#21262d] dark:bg-[#1c2128]/60"
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border transition disabled:opacity-30
                         border-slate-200 bg-white text-slate-500
                         dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#768390]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-[12px] font-mono text-slate-600 dark:text-[#adbac7]">
              Pág. {page}
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border transition
                         border-slate-200 bg-white text-slate-500
                         dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#768390]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
}