"use client";

// PdfViewerModal.tsx
// Visor PDF emergente con metadatos.
// Usa createPortal propio para tener control total del layout (sin depender
// de los paddings / flex del Modal base, que impedían el llenado vertical).
import { useEffect, useState } from "react";
import { createPortal }        from "react-dom";
import {
  Download, ZoomIn, ZoomOut, RotateCw,
  FileText, User, Tag, Hash,
  ChevronLeft, ChevronRight, Maximize2, Minimize2,
  AlertCircle, Shield, X,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PdfMetadata {
  id:           string;
  title:        string;
  category?:    string;
  author?:      string;
  version?:     string;
  size?:        string;
  updatedAt?:   string;
  restricted?:  boolean;
  previewUrl?:  string;
  downloadUrl?: string;
}

interface PdfViewerModalProps {
  open:     boolean;
  onClose:  () => void;
  metadata: PdfMetadata | null;
}

// ── Placeholder ───────────────────────────────────────────────────────────────

function PdfPlaceholder({ metadata }: { metadata: PdfMetadata }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 gap-5 p-8">
      <div className="flex flex-col items-center gap-3 text-center max-w-xs">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-sm">
          <FileText className="h-8 w-8 text-teal-500" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-700">Vista previa no disponible</p>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            La integración con Graph está pendiente. El documento{" "}
            <span className="font-mono font-bold text-slate-600">{metadata.id}</span>{" "}
            estará disponible próximamente.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5">
          <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-[11px] font-semibold text-amber-700">Pendiente integración Graph</span>
        </div>
      </div>

      <div className="flex gap-3 mt-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="w-16 h-20 rounded-lg border border-slate-200 bg-white shadow-sm flex flex-col items-center justify-center gap-1.5 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/0 to-slate-100/60" />
            {[...Array(5)].map((_, j) => (
              <div key={j} className="h-0.5 rounded-full bg-slate-200" style={{ width: `${40 + (j * 7) % 20}%` }} />
            ))}
            <span className="text-[9px] text-slate-300 font-mono absolute bottom-1">{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Metadata row ──────────────────────────────────────────────────────────────

function MetadataRow({ icon: Icon, label, value }: {
  icon:  React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-50 border border-slate-200">
        <Icon className="h-3.5 w-3.5 text-slate-400" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">{label}</p>
        <p className="text-[12px] text-slate-700 font-medium mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

function UnsupportedPreview({ url }: { url: string }) {
  const ext = getFileExtension(url).toUpperCase() || "desconocido";

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 gap-4 p-8">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-sm">
        <FileText className="h-8 w-8 text-slate-400" />
      </span>
      <div className="text-center max-w-xs">
        <p className="text-sm font-semibold text-slate-700">
          Vista previa no disponible
        </p>
        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
          Los archivos <span className="font-mono font-bold text-slate-600">.{ext}</span>{" "}
          no pueden previsualizarse en el navegador. Descarga el archivo para abrirlo.
        </p>
      </div>
      <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5">
        <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-[11px] font-semibold text-slate-500">
          Formato no soportado para previsualización
        </span>
      </div>
    </div>
  );
}

function OfficePreview({ url, title }: { url: string; title: string }) {
  const embedUrl = toOfficeEmbedUrl(url);
  return (
    <iframe
      src={embedUrl}
      className="w-full h-full border-0"
      title={title}
      // Office Online requiere estos atributos
      frameBorder="0"
      allowFullScreen
    />
  );
}

const SUPPORTED_TYPES    = [".pdf"];
const OFFICE_TYPES       = [".xlsx", ".xls", ".docx", ".doc", ".pptx", ".ppt"];

function getFileExtension(url: string): string {
  const base = url.split("?")[0] ?? "";
  return base.split(".").pop()?.toLowerCase() ?? "";
}

function isSupported(url: string): boolean {
  return SUPPORTED_TYPES.some(ext => url.endsWith(ext));
}

function isOfficeFile(url: string): boolean {
  if (url.includes("view.officeapps.live.com")) return true;
  if (url.includes("action=embedview"))          return true;
  return OFFICE_TYPES.some(ext => url.toLowerCase().endsWith(ext));
}

// Convierte una URL de SharePoint en embed de Office Online
function toOfficeEmbedUrl(url: string): string {
  // Si ya es una URL de embed de Office Online, úsala directamente
  if (url.includes("view.officeapps.live.com")) return url;
  // Si es una URL de SharePoint, conviértela
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
}
// ── Main ──────────────────────────────────────────────────────────────────────

export default function PdfViewerModal({ open, onClose, metadata }: PdfViewerModalProps) {
  const [mounted,     setMounted]     = useState(false);
  const [zoom,        setZoom]        = useState(100);
  const [page,        setPage]        = useState(1);
  const [fullscreen,  setFullscreen]  = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (open) { setZoom(100); setPage(1); }
  }, [open, metadata?.id]);

  // Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open || !mounted || !metadata) return null;

  const dialogContent = (
    // Backdrop
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.currentTarget === e.target) onClose(); }}
    >
      {/* Panel — usa h-full dentro del flex para llenar el espacio disponible */}
      <div
        className={`
          flex flex-col bg-white shadow-2xl border border-slate-200 overflow-hidden
          ${fullscreen
            ? "fixed inset-0 rounded-none"
            : "relative w-full max-w-6xl rounded-2xl"
          }
        `}
        style={fullscreen ? undefined : { height: "min(90vh, 900px)" }}
      >
        {/* Accent bar */}
        <div className="h-1 w-full bg-teal-500 shrink-0" />

        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">

          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 border border-teal-100">
              <FileText className="h-4 w-4 text-teal-600" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate max-w-[240px] sm:max-w-[420px]">
                {metadata.title}
              </p>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                {metadata.id}
                {metadata.version && ` · v${metadata.version}`}
                {metadata.size    && ` · ${metadata.size}`}
              </p>
            </div>
            {metadata.restricted && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold bg-rose-50 text-rose-700 border-rose-200">
                <Shield className="h-3 w-3" />
                Restringido
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Zoom */}
            <div className="hidden sm:flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 px-1 py-0.5">
              <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-1 rounded hover:bg-slate-200 transition text-slate-500">
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="text-[11px] font-mono font-bold text-slate-600 w-9 text-center">{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-1 rounded hover:bg-slate-200 transition text-slate-500">
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Toggle sidebar */}
            <button onClick={() => setSidebarOpen(s => !s)} title="Metadatos" className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-500">
              <Tag className="h-4 w-4" />
            </button>

            {/* Descarga */}
            {metadata.downloadUrl ? (
              <a href={metadata.downloadUrl} download className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-500" title="Descargar">
                <Download className="h-4 w-4" />
              </a>
            ) : (
              <button disabled title="Disponible con integración Graph" className="p-1.5 rounded-lg text-slate-300 cursor-not-allowed">
                <Download className="h-4 w-4" />
              </button>
            )}

            {/* Fullscreen */}
            <button onClick={() => setFullscreen(f => !f)} className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-500">
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            {/* Cerrar */}
            <button onClick={onClose} aria-label="Cerrar" className="p-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-500 transition text-slate-500">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Split body — flex-1 garantiza que llena todo el espacio restante ── */}
        <div className="flex flex-1 min-h-0">

{/* Reemplaza el bloque "Área de contenido" */}
<div className="flex-1 overflow-auto bg-slate-100 flex flex-col">
  {!metadata.previewUrl ? (
    <PdfPlaceholder metadata={metadata} />
  ) : isOfficeFile(metadata.previewUrl) ? (
    <OfficePreview url={metadata.previewUrl} title={metadata.title} />
  ) : !isSupported(metadata.previewUrl) ? (
    <UnsupportedPreview url={metadata.previewUrl} />
  ) : (
    <iframe
      src={`${metadata.previewUrl}#zoom=${zoom}&page=${page}`}
      className="w-full h-full border-0"
      title={metadata.title}
    />
  )}
</div>

          {/* Sidebar de metadatos */}
          {sidebarOpen && (
            <aside className="w-64 shrink-0 border-l border-slate-100 bg-white flex flex-col min-h-0">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 shrink-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Metadatos</p>
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
                <div className="px-4 py-3 border-t border-slate-100 shrink-0">
                  <div className="flex items-center gap-1.5 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2">
                    <Shield className="h-3.5 w-3.5 text-rose-400" />
                    <span className="text-[11px] font-semibold text-rose-600">Acceso restringido</span>
                  </div>
                </div>
              )}
            </aside>
          )}
        </div>

        {/* ── Mobile page nav ── */}
        {metadata.previewUrl && (
          <div className="sm:hidden flex items-center justify-center gap-3 px-4 py-2.5 border-t border-slate-100 bg-slate-50/60 shrink-0">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[12px] font-mono text-slate-600">Pág. {page}</span>
            <button onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
}