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

"use client";

import { useEffect, useState } from "react";
import { createPortal }        from "react-dom";
import {
  Download, ZoomIn, ZoomOut, RotateCw,
  FileText, User, Tag, Hash,
  ChevronLeft, ChevronRight, Maximize2, Minimize2,
  AlertCircle, Shield, X,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Metadatos del documento a visualizar en el modal.
 *
 * @remarks
 * Este modelo concentra tanto la información descriptiva del archivo
 * como las URLs necesarias para previsualización y descarga.
 */
export interface PdfMetadata {
  /**
   * Identificador único del documento.
   */
  id: string;

  /**
   * Título visible del documento.
   */
  title: string;

  /**
   * Categoría funcional o documental.
   */
  category?: string;

  /**
   * Autor o responsable del documento.
   */
  author?: string;

  /**
   * Versión visible del archivo.
   */
  version?: string;

  /**
   * Tamaño legible del documento.
   */
  size?: string;

  /**
   * Fecha de actualización visible.
   */
  updatedAt?: string;

  /**
   * Indica si el acceso al documento está restringido.
   */
  restricted?: boolean;

  /**
   * URL de previsualización del documento.
   */
  previewUrl?: string;

  /**
   * URL de descarga directa del documento.
   */
  downloadUrl?: string;
}

/**
 * Props del componente {@link PdfViewerModal}.
 */
interface PdfViewerModalProps {
  /**
   * Controla si el modal está abierto.
   */
  open: boolean;

  /**
   * Callback para cerrar el modal.
   */
  onClose: () => void;

  /**
   * Documento actualmente seleccionado.
   */
  metadata: PdfMetadata | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Extensiones soportadas para vista previa nativa de PDF.
 */
const SUPPORTED_TYPES = [".pdf"];

/**
 * Extensiones de documentos Office soportadas vía Office Online.
 */
const OFFICE_TYPES = [".xlsx", ".xls", ".docx", ".doc", ".pptx", ".ppt"];

/**
 * Obtiene la extensión de archivo a partir de una URL.
 *
 * @param url URL del archivo.
 * @returns Extensión normalizada en minúsculas o cadena vacía.
 */
function getFileExtension(url: string): string {
  const base = url.split("?")[0] ?? "";
  return base.split(".").pop()?.toLowerCase() ?? "";
}

/**
 * Determina si una URL corresponde a un PDF soportado.
 *
 * @param url URL del archivo.
 * @returns `true` si la vista previa PDF es compatible.
 */
function isSupported(url: string): boolean {
  return SUPPORTED_TYPES.some(ext => url.endsWith(ext));
}

/**
 * Determina si una URL corresponde a un archivo Office o a un embed de Office.
 *
 * @param url URL del archivo.
 * @returns `true` si puede mostrarse en Office Online.
 */
function isOfficeFile(url: string): boolean {
  if (url.includes("view.officeapps.live.com")) return true;
  if (url.includes("action=embedview"))          return true;
  return OFFICE_TYPES.some(ext => url.toLowerCase().endsWith(ext));
}

/**
 * Convierte una URL de archivo a una URL embebible para Office Online.
 *
 * @param url URL original del documento.
 * @returns URL adaptada para `view.officeapps.live.com`.
 */
function toOfficeEmbedUrl(url: string): string {
  if (url.includes("view.officeapps.live.com")) return url;
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

/**
 * Placeholder mostrado cuando aún no existe una URL de preview.
 *
 * @param props Propiedades del componente.
 * @param props.metadata Metadatos del documento.
 * @returns Vista vacía con mensaje de integración pendiente.
 *
 * @remarks
 * Está orientado a escenarios donde el documento existe,
 * pero la integración con Graph u otro servicio todavía no entrega
 * una URL de previsualización.
 */
function PdfPlaceholder({ metadata }: { metadata: PdfMetadata }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8
                    bg-slate-50 dark:bg-[#0d1117]">
      <div className="flex flex-col items-center gap-3 text-center max-w-xs">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl
                         border shadow-sm
                         bg-white border-slate-200
                         dark:bg-[#161b22] dark:border-[#30363d]">
          <FileText className="h-8 w-8 text-teal-500 dark:text-teal-400" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-[#cdd9e5]">
            Vista previa no disponible
          </p>
          <p className="text-[11px] mt-1 leading-relaxed text-slate-400 dark:text-[#768390]">
            La integración con Graph está pendiente. El documento{" "}
            <span className="font-mono font-bold text-slate-600 dark:text-[#adbac7]">
              {metadata.id}
            </span>{" "}
            estará disponible próximamente.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5
                        border border-amber-200 bg-amber-50
                        dark:border-amber-500/25 dark:bg-amber-500/[0.08]">
          <AlertCircle className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
            Pendiente integración Graph
          </span>
        </div>
      </div>

      <div className="flex gap-3 mt-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="w-16 h-20 rounded-lg flex flex-col items-center justify-center gap-1.5 relative overflow-hidden
                       border shadow-sm bg-white border-slate-200
                       dark:bg-[#161b22] dark:border-[#30363d]"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/0 to-slate-100/60 dark:from-transparent dark:to-[#0d1117]/40" />
            {[...Array(5)].map((_, j) => (
              <div key={j} className="h-0.5 rounded-full bg-slate-200 dark:bg-[#30363d]"
                   style={{ width: `${40 + (j * 7) % 20}%` }} />
            ))}
            <span className="text-[9px] font-mono absolute bottom-1
                             text-slate-300 dark:text-[#444c56]">{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Fila de metadato usada en el sidebar lateral.
 *
 * @param props Propiedades del componente.
 * @returns Fila visual con ícono, etiqueta y valor.
 */
function MetadataRow({ icon: Icon, label, value }: {
  icon:  React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-0
                    border-slate-100 dark:border-[#21262d]">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md
                       border bg-slate-50 border-slate-200
                       dark:bg-[#21262d] dark:border-[#30363d]">
        <Icon className="h-3.5 w-3.5 text-slate-400 dark:text-[#545d68]" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide font-semibold
                      text-slate-400 dark:text-[#545d68]">{label}</p>
        <p className="text-[12px] font-medium mt-0.5 break-words
                      text-slate-700 dark:text-[#cdd9e5]">{value}</p>
      </div>
    </div>
  );
}

/**
 * Vista mostrada cuando el formato no puede previsualizarse en navegador.
 *
 * @param props Propiedades del componente.
 * @param props.url URL del archivo.
 * @returns Estado de formato no soportado.
 */
function UnsupportedPreview({ url }: { url: string }) {
  const ext = getFileExtension(url).toUpperCase() || "desconocido";

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8
                    bg-slate-50 dark:bg-[#0d1117]">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl
                       border shadow-sm
                       bg-white border-slate-200
                       dark:bg-[#161b22] dark:border-[#30363d]">
        <FileText className="h-8 w-8 text-slate-400 dark:text-[#545d68]" />
      </span>
      <div className="text-center max-w-xs">
        <p className="text-sm font-semibold text-slate-700 dark:text-[#cdd9e5]">
          Vista previa no disponible
        </p>
        <p className="text-[11px] mt-1 leading-relaxed text-slate-400 dark:text-[#768390]">
          Los archivos{" "}
          <span className="font-mono font-bold text-slate-600 dark:text-[#adbac7]">.{ext}</span>{" "}
          no pueden previsualizarse en el navegador. Descarga el archivo para abrirlo.
        </p>
      </div>
      <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5
                      border bg-white border-slate-200
                      dark:bg-[#1c2128] dark:border-[#30363d]">
        <AlertCircle className="h-3.5 w-3.5 text-slate-400 dark:text-[#545d68]" />
        <span className="text-[11px] font-semibold text-slate-500 dark:text-[#768390]">
          Formato no soportado para previsualización
        </span>
      </div>
    </div>
  );
}

/**
 * Hook para detectar preferencia de modo oscuro.
 *
 * @returns `true` si el sistema o el documento HTML están en dark mode.
 *
 * @remarks
 * Evalúa tanto:
 * - `prefers-color-scheme: dark`
 * - como la presencia de la clase `dark` en `<html>`.
 */
function usePrefersDark(): boolean {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const htmlDark = () => document.documentElement.classList.contains("dark");
    const update = () => setDark(mq.matches || htmlDark());

    update();

    mq.addEventListener("change", update);
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      mq.removeEventListener("change", update);
      observer.disconnect();
    };
  }, []);

  return dark;
}

/**
 * Previsualizador nativo de PDF.
 *
 * @param props Propiedades del componente.
 * @param props.url URL del PDF.
 * @param props.title Título del documento.
 * @returns `iframe` con visor de PDF.
 *
 * @remarks
 * En modo oscuro aplica `colorScheme: "dark"` cuando el navegador lo soporta.
 * En PDFs cross-origin este comportamiento puede no surtir efecto.
 */
function PdfPreview({ url, title }: { url: string; title: string }) {
  const isDark = usePrefersDark();

  return (
    <div className={`flex-1 overflow-hidden w-full h-full ${isDark ? "p-3 bg-[#0d1117]" : ""}`}>
      <iframe
        src={url}
        className="w-full h-full border-0 rounded-sm"
        title={title}
        style={isDark ? { colorScheme: "dark" } : undefined}
      />
    </div>
  );
}

/**
 * Previsualizador para archivos Office mediante Office Online.
 *
 * @param props Propiedades del componente.
 * @param props.url URL del documento.
 * @param props.title Título del documento.
 * @returns `iframe` embebido de Office Online.
 *
 * @remarks
 * Office Online no respeta modo oscuro, por lo que en dark mode
 * se muestra un aviso contextual al usuario.
 */
function OfficePreview({ url, title }: { url: string; title: string }) {
  const isDark = usePrefersDark();

  return (
    <div className="flex flex-col w-full h-full">
      {isDark && (
        <div className="flex items-center gap-2 px-4 py-2 shrink-0
                        bg-amber-500/[0.10] border-b border-amber-500/20">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
          <p className="text-[11px] text-amber-300/90">
            Office Online no admite modo oscuro — el documento se muestra en tema claro independientemente de tu preferencia.
          </p>
        </div>
      )}
      <iframe
        src={toOfficeEmbedUrl(url)}
        className="w-full flex-1 border-0"
        title={title}
        frameBorder="0"
        allowFullScreen
      />
    </div>
  );
}

/**
 * Botón pequeño reutilizable para la toolbar del visor.
 *
 * @param props Propiedades del componente.
 * @returns Botón de acción con variantes visuales.
 */
function ToolbarBtn({
  onClick, title, disabled = false, danger = false, children,
}: {
  onClick?: () => void;
  title?: string;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg transition ${
        disabled
          ? "text-slate-300 dark:text-[#30363d] cursor-not-allowed"
          : danger
            ? "text-slate-500 dark:text-[#768390] hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/[0.10] dark:hover:text-rose-400"
            : "text-slate-500 dark:text-[#768390] hover:bg-slate-100 dark:hover:bg-[#21262d] dark:hover:text-[#adbac7]"
      }`}
    >
      {children}
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

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
 * 2. Reinicia zoom y página al cambiar el documento.
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
  useEffect(() => { setMounted(true); }, []);

  /**
   * Reinicia zoom y página al abrir o cambiar de documento.
   */
  useEffect(() => {
    if (open) { setZoom(100); setPage(1); }
  }, [open, metadata?.id]);

  /**
   * Maneja cierre por tecla Escape.
   */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  /**
   * Bloquea scroll del body mientras el modal está abierto.
   */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open || !mounted || !metadata) return null;

  const dialogContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4
                 bg-black/40"
      onClick={(e) => { if (e.currentTarget === e.target) onClose(); }}
    >
      <div
        className={`
          flex flex-col overflow-hidden
          border shadow-2xl
          bg-white border-slate-200 shadow-slate-300/30
          dark:bg-[#161b22] dark:border-[#30363d] dark:shadow-black/50
          ${fullscreen
            ? "fixed inset-0 rounded-none"
            : "relative w-full max-w-6xl rounded-2xl"
          }
        `}
        style={fullscreen ? undefined : { height: "min(90vh, 900px)" }}
      >
        {/* Accent bar */}
        <div className="h-1 w-full bg-teal-500 shrink-0" />

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0
                        border-b border-slate-100 dark:border-[#21262d]">

          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                             border
                             bg-teal-50 border-teal-100
                             dark:bg-teal-500/[0.10] dark:border-teal-500/20">
              <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate max-w-[240px] sm:max-w-[420px]
                            text-slate-800 dark:text-[#e6edf3]">
                {metadata.title}
              </p>
              <p className="text-[10px] font-mono mt-0.5 text-slate-400 dark:text-[#545d68]">
                {metadata.id}
                {metadata.version && ` · v${metadata.version}`}
                {metadata.size    && ` · ${metadata.size}`}
              </p>
            </div>
            {metadata.restricted && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold
                               bg-rose-50 text-rose-700 border-rose-200
                               dark:bg-rose-500/[0.10] dark:text-rose-400 dark:border-rose-500/25">
                <Shield className="h-3 w-3" />
                Restringido
              </span>
            )}
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            {/* Zoom */}
            <div className="hidden sm:flex items-center gap-0.5 rounded-lg px-1 py-0.5
                            border bg-slate-50 border-slate-200
                            dark:bg-[#1c2128] dark:border-[#30363d]">
              <ToolbarBtn onClick={() => setZoom(z => Math.max(50, z - 10))}>
                <ZoomOut className="h-3.5 w-3.5" />
              </ToolbarBtn>
              <span className="text-[11px] font-mono font-bold w-9 text-center
                               text-slate-600 dark:text-[#adbac7]">
                {zoom}%
              </span>
              <ToolbarBtn onClick={() => setZoom(z => Math.min(200, z + 10))}>
                <ZoomIn className="h-3.5 w-3.5" />
              </ToolbarBtn>
            </div>

            <ToolbarBtn onClick={() => setSidebarOpen(s => !s)} title="Metadatos">
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

            <ToolbarBtn onClick={() => setFullscreen(f => !f)}>
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </ToolbarBtn>

            <ToolbarBtn onClick={onClose} danger>
              <X className="h-4 w-4" />
            </ToolbarBtn>
          </div>
        </div>

        {/* Split body */}
        <div className="flex flex-1 min-h-0">

          {/* Main content */}
          <div className="flex-1 overflow-auto flex flex-col
                          bg-slate-100 dark:bg-[#0d1117]">
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
            <aside className="w-64 shrink-0 flex flex-col min-h-0
                              border-l border-slate-100 bg-white
                              dark:border-[#21262d] dark:bg-[#161b22]">
              <div className="px-4 py-3 shrink-0
                              border-b bg-slate-50/60
                              dark:border-[#21262d] dark:bg-[#1c2128]/60">
                <p className="text-[11px] font-bold uppercase tracking-wider
                              text-slate-400 dark:text-[#545d68]">
                  Metadatos
                </p>
              </div>
              <div className="px-4 py-1 flex-1 overflow-y-auto">
                <MetadataRow icon={Hash}     label="ID"          value={metadata.id} />
                <MetadataRow icon={FileText} label="Título"      value={metadata.title} />
                <MetadataRow icon={Tag}      label="Categoría"   value={metadata.category} />
                <MetadataRow icon={User}     label="Autor"       value={metadata.author} />
                <MetadataRow icon={RotateCw} label="Versión"     value={metadata.version} />
                <MetadataRow icon={Download} label="Tamaño"      value={metadata.size} />
                <MetadataRow icon={Tag}      label="Actualizado" value={metadata.updatedAt} />
              </div>
              {metadata.restricted && (
                <div className="px-4 py-3 shrink-0 border-t border-slate-100 dark:border-[#21262d]">
                  <div className="flex items-center gap-1.5 rounded-lg px-3 py-2
                                  border bg-rose-50 border-rose-200
                                  dark:bg-rose-500/[0.08] dark:border-rose-500/20">
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
          <div className="sm:hidden flex items-center justify-center gap-3 px-4 py-2.5 shrink-0
                          border-t bg-slate-50/60
                          border-slate-100 dark:border-[#21262d] dark:bg-[#1c2128]/60">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
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
              onClick={() => setPage(p => p + 1)}
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