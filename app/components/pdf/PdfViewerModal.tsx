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
 * - controlar página, fullscreen y descarga.
 *
 * El componente se renderiza mediante `createPortal` para superponerse
 * correctamente sobre el resto de la interfaz. Los estilos viven en
 * `pdfViewerModal.css`, con variables que replican el sistema de diseño
 * de `document-workspace.css` (mismo morado de acento, mismos radios y
 * curva de transición) — se redefinen localmente porque el modal se
 * monta directo en `document.body` y no hereda las variables del
 * módulo documental por cascada normal.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Download,
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

import "./pdfViewerModal.css";
import type { PdfViewerModalProps } from "./types";
import { isOfficeFile, isSupported } from "./utils";
import { PdfPlaceholder } from "./components/PdfPlaceholder";
import { PreviewSkeleton } from "./components/PreviewSkeleton";
import { UnsupportedPreview } from "./components/UnsupportedPreview";
import { MetadataRow } from "./components/MetadataRow";
import { ToolbarBtn } from "./components/ToolbarBtn";
import { PdfPreview } from "./components/PdfPreview";
import { OfficePreview } from "./components/OfficePreview";

/**
 * Margen de gracia (ms) antes de declarar que un documento no tiene
 * preview disponible.
 *
 * @remarks
 * La mayoría de documentos resuelven `previewUrl` en pocos cientos de
 * milisegundos tras abrir el modal. Sin este margen, el modal pintaba
 * inmediatamente el mensaje "Pendiente integración Graph" y lo
 * reemplazaba casi al instante cuando la URL sí llegaba — un parpadeo
 * visible y poco profesional. Con el margen, ese caso común nunca
 * llega a mostrar el mensaje: pasa directo al preview real.
 */
const PREVIEW_GRACE_MS = 600;

type PreviewState = "checking" | "ready" | "unavailable";

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
 * 2. Reinicia página al cambiar de documento.
 * 3. Cierra con tecla Escape o click en backdrop.
 * 4. Bloquea el scroll del body mientras está abierto.
 * 5. Espera un margen de gracia corto antes de decidir si el documento
 *    realmente no tiene preview (ver {@link PREVIEW_GRACE_MS}).
 * 6. Decide qué tipo de preview mostrar:
 *    - skeleton mientras se verifica,
 *    - placeholder si genuinamente no hay preview,
 *    - Office embed si es documento Office,
 *    - fallback si el formato no es compatible,
 *    - iframe PDF nativo si sí lo es.
 *
 * También incorpora:
 * - toolbar superior,
 * - sidebar de metadatos, cerrado por defecto — el usuario lo abre con
 *   el botón de la toolbar,
 * - modo fullscreen local,
 * - navegación básica de página en móvil,
 * - transición de entrada/salida suave.
 */
export default function PdfViewerModal({ open, onClose, metadata }: PdfViewerModalProps) {
  /**
   * Controla si el componente ya está montado en cliente.
   */
  const [mounted, setMounted] = useState(false);

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
   *
   * @remarks
   * Cerrado por defecto: el usuario decide cuándo verlo con el botón
   * de la toolbar, en vez de que ocupe espacio de entrada siempre.
   */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /**
   * Estado de resolución del preview: "checking" mientras corre el
   * margen de gracia, "ready" cuando ya hay `previewUrl`, "unavailable"
   * cuando el margen expiró sin que llegara una URL.
   */
  const [previewState, setPreviewState] = useState<PreviewState>("checking");

  /**
   * Controla la animación de entrada (fade + scale) del diálogo.
   */
  const [visible, setVisible] = useState(false);

  /**
   * Marca el componente como montado.
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Reinicia página al abrir o cambiar de documento.
   */
  useEffect(() => {
    if (open) {
      setPage(1);
    }
  }, [open, metadata?.id]);

  /**
   * Resuelve el estado del preview con margen de gracia: si `previewUrl`
   * ya está presente, pasa a "ready" de inmediato; si no, espera
   * {@link PREVIEW_GRACE_MS} antes de declarar "unavailable", dando
   * tiempo a que la integración con Graph resuelva la URL sin que el
   * usuario vea el mensaje de "no disponible" parpadear en pantalla.
   */
  useEffect(() => {
    if (!open) return;

    if (metadata?.previewUrl) {
      setPreviewState("ready");
      return;
    }

    setPreviewState("checking");
    const timeout = setTimeout(() => {
      setPreviewState("unavailable");
    }, PREVIEW_GRACE_MS);

    return () => clearTimeout(timeout);
  }, [open, metadata?.id, metadata?.previewUrl]);

  /**
   * Controla la animación de entrada del diálogo (un frame después del
   * montaje, para que la transición CSS sí se dispare).
   */
  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

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

  const previewUrl = metadata.previewUrl;

  const dialogContent = (
    <div
      className={`pdf-viewer-modal ${visible ? "pdf-viewer-modal--visible" : ""}`}
      onClick={(e) => {
        if (e.currentTarget === e.target) onClose();
      }}
    >
      <div
        className={[
          "pdf-viewer-modal__dialog",
          visible && "pdf-viewer-modal__dialog--visible",
          fullscreen && "pdf-viewer-modal__dialog--fullscreen",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Accent bar */}
        <div className="pdf-viewer-modal__accent-bar" />

        {/* Toolbar */}
        <div className="pdf-viewer-modal__toolbar">
          <div className="pdf-viewer-modal__toolbar-left">
            <span className="pdf-viewer-modal__icon-badge">
              <FileText className="h-4 w-4" strokeWidth={2} />
            </span>

            <div className="pdf-viewer-modal__title-group">
              <p className="pdf-viewer-modal__title">{metadata.title}</p>
              <p className="pdf-viewer-modal__subtitle">
                {metadata.id}
                {metadata.version && ` · v${metadata.version}`}
                {metadata.size && ` · ${metadata.size}`}
              </p>
            </div>

            {metadata.restricted && (
              <span className="pdf-viewer-modal__badge pdf-viewer-modal__badge--restricted">
                <Shield className="h-3 w-3" />
                Restringido
              </span>
            )}
          </div>

          <div className="pdf-viewer-modal__toolbar-right">
            <ToolbarBtn onClick={() => setSidebarOpen((s) => !s)} title="Metadatos">
              <Tag className="h-4 w-4" />
            </ToolbarBtn>

            {metadata.downloadUrl ? (
              <a
                href={metadata.downloadUrl}
                download
                title="Descargar"
                className="pdf-viewer-modal__toolbar-btn"
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

            <div className="pdf-viewer-modal__divider" />

            <ToolbarBtn onClick={onClose} danger title="Cerrar">
              <X className="h-4 w-4" />
            </ToolbarBtn>
          </div>
        </div>

        {/* Split body */}
        <div className="pdf-viewer-modal__body">
          {/* Main content */}
          <div className="pdf-viewer-modal__main">
            {previewState === "checking" ? (
              <PreviewSkeleton />
            ) : previewState === "unavailable" || !previewUrl ? (
              <PdfPlaceholder metadata={metadata} />
            ) : isOfficeFile(previewUrl) ? (
              <OfficePreview url={previewUrl} title={metadata.title} />
            ) : !isSupported(previewUrl) ? (
              <UnsupportedPreview url={previewUrl} />
            ) : (
              <PdfPreview url={`${previewUrl}#page=${page}`} title={metadata.title} />
            )}
          </div>

          {/* Sidebar */}
          {sidebarOpen && (
            <aside className="pdf-viewer-modal__sidebar">
              <div className="pdf-viewer-modal__sidebar-header">
                <p className="pdf-viewer-modal__sidebar-label">
                  <Tag className="h-3 w-3" />
                  Metadatos
                </p>
              </div>

              <div className="pdf-viewer-modal__sidebar-content">
                <MetadataRow icon={Hash} label="ID" value={metadata.id} />
                <MetadataRow icon={FileText} label="Título" value={metadata.title} />
                <MetadataRow icon={Tag} label="Categoría" value={metadata.category} />
                <MetadataRow icon={User} label="Autor" value={metadata.author} />
                <MetadataRow icon={RotateCw} label="Versión" value={metadata.version} />
                <MetadataRow icon={Download} label="Tamaño" value={metadata.size} />
                <MetadataRow icon={Tag} label="Actualizado" value={metadata.updatedAt} />
              </div>

              {metadata.restricted && (
                <div className="pdf-viewer-modal__sidebar-restricted">
                  <div className="pdf-viewer-modal__sidebar-restricted-chip">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Acceso restringido</span>
                  </div>
                </div>
              )}
            </aside>
          )}
        </div>

        {/* Mobile page nav */}
        {previewState === "ready" && previewUrl && (
          <div className="pdf-viewer-modal__mobile-nav">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="pdf-viewer-modal__mobile-nav-btn"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="pdf-viewer-modal__mobile-nav-page">Pág. {page}</span>

            <button
              onClick={() => setPage((p) => p + 1)}
              className="pdf-viewer-modal__mobile-nav-btn"
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