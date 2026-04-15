/**
 * @module DocumentTable
 * Tabla interactiva del repositorio documental corporativo.
 *
 * Este componente permite visualizar, filtrar y explorar documentos del módulo
 * de Gestión Documental mediante una interfaz tabular con búsqueda, filtros por
 * estado y categoría, indicadores visuales de clasificación y acceso a preview.
 *
 * @remarks
 * La tabla está diseñada para soportar escenarios de consulta documental con:
 * - filtrado por texto,
 * - filtrado por categoría,
 * - filtrado por estado mediante tabs,
 * - visualización opcional de clasificación documental,
 * - apertura de visor PDF,
 * - y métricas resumidas del subconjunto visible.
 *
 * También incorpora adaptación visual para modo oscuro y representa de forma
 * consistente la información de clasificación mediante {@link CLASSIFICATION_META}.
 */

"use client";

import { useState }          from "react";
import {
  Search, Filter, ChevronRight, Lock,
  Clock, CheckCircle2, AlertCircle, Loader2, FileText, Eye,
} from "lucide-react";
import { CLASSIFICATION_META } from "../config/documentClassification";
import type { DocumentItem }   from "../config/documentData";
import PdfViewerModal, { type PdfMetadata } from "@/app/components/pdf/PdfViewerModal";

/**
 * Configuración visual de estados documentales.
 *
 * @remarks
 * Asocia cada estado a:
 * - una etiqueta legible,
 * - clases visuales para badge,
 * - un ícono representativo.
 *
 * Esto permite desacoplar la representación visual del estado documental
 * respecto al valor técnico persistido en los datos.
 */
const STATUS_CFG = {
  draft:     { label: "Borrador",    color: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-500/[0.10] dark:text-[#768390] dark:border-slate-500/20",           icon: Loader2      },
  review:    { label: "En revisión", color: "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-500/[0.10] dark:text-sky-400 dark:border-sky-500/20",                        icon: Clock        },
  approved:  { label: "Aprobado",    color: "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-500/[0.10] dark:text-violet-400 dark:border-violet-500/20",       icon: CheckCircle2 },
  published: { label: "Publicado",   color: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/[0.10] dark:text-emerald-400 dark:border-emerald-500/20", icon: CheckCircle2 },
  archived:  { label: "Archivado",   color: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/[0.10] dark:text-amber-400 dark:border-amber-500/20",             icon: FileText     },
  expired:   { label: "Expirado",    color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/[0.10] dark:text-rose-400 dark:border-rose-500/20",                   icon: AlertCircle  },
};

/**
 * Tabs de filtrado rápido por estado documental.
 *
 * @remarks
 * Algunos tabs representan uno o más estados agrupados lógicamente, por
 * ejemplo `approved,published`.
 */
const FILTER_TABS = [
  { label: "Todos",       value: null                 },
  { label: "Borradores",  value: "draft"              },
  { label: "En revisión", value: "review"             },
  { label: "Aprobados",   value: "approved,published" },
  { label: "Expirados",   value: "expired"            },
] as const;

/**
 * Formatea el tamaño del documento en MB.
 *
 * @param n Tamaño numérico en megabytes.
 * @returns Cadena formateada con una cifra decimal.
 */
function fmtSize(n: number) {
  return `${n.toFixed(1)} MB`;
}

/**
 * Convierte un {@link DocumentItem} al formato de metadatos requerido por
 * {@link PdfViewerModal}.
 *
 * @param doc Documento a transformar.
 * @returns Metadatos compatibles con el visor PDF.
 *
 * @remarks
 * Además de la información básica, marca el documento como restringido cuando
 * su clasificación es `restricted` o `confidential`.
 */
function toMetadata(doc: DocumentItem): PdfMetadata {
  return {
    id:         doc.id,
    title:      doc.title,
    category:   doc.category,
    author:     doc.owner,
    size:       fmtSize(doc.size),
    updatedAt:  doc.updated,
    restricted: doc.classification === "restricted" || doc.classification === "confidential",
    ...(doc.previewUrl  !== undefined && { previewUrl:  doc.previewUrl }),
    ...(doc.downloadUrl !== undefined && { downloadUrl: doc.downloadUrl }),
  };
}

/**
 * Sobrescritura de estilos dark mode para badges de clasificación.
 *
 * @remarks
 * Dado que {@link CLASSIFICATION_META} contiene estilos pensados
 * principalmente para modo claro, este mapa complementa la representación
 * visual en modo oscuro.
 */
const CLASSIFICATION_DARK: Record<string, string> = {
  public:       "dark:bg-slate-500/[0.10]   dark:text-slate-400   dark:border-slate-500/20",
  internal:     "dark:bg-blue-500/[0.10]    dark:text-blue-400    dark:border-blue-500/20",
  confidential: "dark:bg-amber-500/[0.10]   dark:text-amber-400   dark:border-amber-500/20",
  restricted:   "dark:bg-rose-500/[0.10]    dark:text-rose-400    dark:border-rose-500/20",
};

/**
 * Propiedades de {@link DocumentTable}.
 *
 * @property documents Colección de documentos a mostrar.
 * @property showClassification Indica si debe mostrarse la columna de clasificación.
 */
interface DocumentTableProps {
  documents: DocumentItem[];
  showClassification?: boolean;
}

/**
 * Renderiza una tabla documental interactiva con búsqueda, filtros y preview.
 *
 * @param props Propiedades del componente.
 * @param props.documents Colección de documentos visibles/autorizados.
 * @param props.showClassification Indica si se incluye la columna de clasificación.
 * @returns Tabla interactiva del repositorio documental con visor PDF.
 *
 * @remarks
 * Este componente administra:
 * - búsqueda por texto sobre ID y título,
 * - filtro por categoría,
 * - filtro rápido por estado,
 * - cálculo de métricas del subconjunto visible,
 * - apertura del visor PDF,
 * - y representación visual de clasificación, estado y sensibilidad.
 */
export default function DocumentTable({ documents, showClassification = false }: DocumentTableProps) {
  /**
   * Texto actual del buscador.
   */
  const [search,         setSearch]         = useState("");

  /**
   * Tab de estado actualmente seleccionado.
   */
  const [tab,            setTab]            = useState<string | null>(null);

  /**
   * Categoría actualmente seleccionada.
   */
  const [category,       setCategory]       = useState("Todas");

  /**
   * Estado de visibilidad del visor PDF.
   */
  const [viewerOpen,     setViewerOpen]     = useState(false);

  /**
   * Metadatos del documento actualmente abierto en el visor.
   */
  const [viewerMetadata, setViewerMetadata] = useState<PdfMetadata | null>(null);

  /**
   * Abre el visor PDF para un documento específico.
   *
   * @param doc Documento a previsualizar.
   */
  function openViewer(doc: DocumentItem) {
    setViewerMetadata(toMetadata(doc));
    setViewerOpen(true);
  }

  /**
   * Categorías disponibles calculadas dinámicamente a partir del conjunto de documentos.
   */
  const categories = ["Todas", ...Array.from(new Set(documents.map((d) => d.category))).sort()];

  /**
   * Colección de documentos visible después de aplicar búsqueda y filtros.
   *
   * @remarks
   * Se evalúan simultáneamente:
   * - categoría,
   * - estado/tab,
   * - coincidencia textual sobre ID y título.
   */
  const filtered = documents.filter((doc) => {
    const matchCat = category === "Todas" || doc.category === category;
    const matchTab = !tab || tab.split(",").includes(doc.status);
    const q        = search.toLowerCase();
    const matchQ   = !q || doc.id.toLowerCase().includes(q) || doc.title.toLowerCase().includes(q);
    return matchCat && matchTab && matchQ;
  });

  /**
   * Tamaño total acumulado del conjunto filtrado.
   */
  const totalSize = filtered.reduce((s, d) => s + d.size, 0);

  /**
   * Cantidad total de documentos expirados en la colección completa.
   */
  const expiredCount = documents.filter((d) => d.status === "expired").length;

  return (
    <>
      <div className="rounded-2xl border overflow-hidden shadow-sm
                      bg-white border-slate-200
                      dark:bg-[#161b22] dark:border-[#30363d]">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4
                        border-b border-slate-100 dark:border-[#21262d]">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-[#e6edf3]">
              Documentos corporativos
            </p>
            <p className="text-[11px] mt-0.5 text-slate-400 dark:text-[#545d68]">
              {filtered.length} documentos ·{" "}
              <span className="font-bold text-slate-700 dark:text-[#adbac7]">{fmtSize(totalSize)}</span> almacenados
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5
                                 text-slate-400 dark:text-[#545d68]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar documento..."
                className="pl-8 pr-3 py-1.5 text-[12px] rounded-lg border outline-none transition w-48
                           border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400
                           focus:border-teal-300 focus:bg-white
                           dark:border-[#30363d] dark:bg-[#1c2128] dark:text-[#cdd9e5] dark:placeholder-[#545d68]
                           dark:focus:border-teal-500/50 dark:focus:bg-[#161b22]"
              />
            </div>

            {/* Categoría */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border px-2.5 py-1.5 text-[12px] outline-none cursor-pointer transition
                         border-slate-200 bg-slate-50 text-slate-600
                         focus:border-teal-300
                         dark:border-[#30363d] dark:bg-[#1c2128] dark:text-[#adbac7]
                         dark:focus:border-teal-500/50"
            >
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>

            <button className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition
                               border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100
                               dark:border-[#30363d] dark:bg-[#1c2128] dark:text-[#adbac7] dark:hover:bg-[#21262d]">
              <Filter className="h-3.5 w-3.5" />
              Filtros
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 px-5 py-2.5 overflow-x-auto
                        border-b bg-slate-50/60
                        border-slate-100 dark:border-[#21262d] dark:bg-[#1c2128]/50">
          {FILTER_TABS.map((t) => (
            <button
              key={t.label}
              onClick={() => setTab(t.value)}
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
                tab === t.value
                  ? "bg-teal-600 text-white shadow-sm dark:bg-teal-600/80"
                  : "text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:text-[#545d68] dark:hover:bg-[#30363d] dark:hover:text-[#adbac7]"
              }`}
            >
              {t.label}
              {t.value === "expired" && expiredCount > 0 && (
                <span className="ml-1 rounded-full bg-rose-500 text-white px-1.5 text-[9px]">
                  {expiredCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40
                             dark:border-[#21262d] dark:bg-[#1c2128]/40">
                {[
                  "Documento", "Categoría",
                  ...(showClassification ? ["Clasificación"] : []),
                  "Estado", "Tamaño", "Creado", "Actualizado", "Responsable", "",
                ].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap
                                         text-slate-400 dark:text-[#545d68]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50 dark:divide-[#21262d]">
              {filtered.map((doc) => {
                const cfg  = STATUS_CFG[doc.status];
                const Icon = cfg.icon;
                const cls  = CLASSIFICATION_META[doc.classification];

                return (
                  <tr key={doc.id}
                      className="transition-colors group
                                 hover:bg-slate-50/70 dark:hover:bg-[#1c2128]">

                    {/* Título */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {doc.classification === "restricted" && (
                          <Lock className="h-3 w-3 shrink-0 text-rose-400" />
                        )}
                        {doc.classification === "confidential" && (
                          <Lock className="h-3 w-3 shrink-0 text-amber-400" />
                        )}
                        <div>
                          <p className="font-semibold truncate max-w-[220px]
                                        text-slate-800 dark:text-[#e6edf3]">
                            {doc.title}
                          </p>
                          <p className="text-[10px] font-mono mt-0.5
                                        text-slate-400 dark:text-[#545d68]">
                            {doc.id} · {doc.pages} páginas
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold
                                       bg-slate-100 text-slate-600
                                       dark:bg-[#21262d] dark:text-[#768390]">
                        {doc.category}
                      </span>
                    </td>

                    {/* Clasificación */}
                    {showClassification && (
                      <td className="px-4 py-3">
                        <span className={`
                          inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold
                          ${cls.badgeBg} ${cls.badgeColor} ${cls.badgeBorder}
                          ${CLASSIFICATION_DARK[doc.classification] ?? "dark:bg-slate-500/[0.10] dark:text-slate-400 dark:border-slate-500/20"}
                        `}>
                          {cls.label}
                        </span>
                      </td>
                    )}

                    {/* Estado */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold ${cfg.color}`}>
                        <Icon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </td>

                    {/* Tamaño */}
                    <td className="px-4 py-3 font-bold whitespace-nowrap
                                   text-slate-800 dark:text-[#e6edf3]">
                      {fmtSize(doc.size)}
                    </td>

                    {/* Creado */}
                    <td className="px-4 py-3 text-slate-500 dark:text-[#768390]">
                      {doc.created}
                    </td>

                    {/* Actualizado */}
                    <td className={`px-4 py-3 font-semibold whitespace-nowrap ${
                      doc.status === "expired"
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-slate-600 dark:text-[#adbac7]"
                    }`}>
                      {doc.status === "expired" ? "⚠ " : ""}{doc.updated}
                    </td>

                    {/* Responsable */}
                    <td className="px-4 py-3 text-slate-500 dark:text-[#768390]">
                      {doc.owner}
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => openViewer(doc)}
                          className="flex items-center gap-0.5 text-[11px] font-semibold
                                     text-teal-500 dark:text-teal-400"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver
                        </button>
                        <a
                          href={`/documentos/${doc.id}`}
                          className="flex items-center gap-0.5 text-[11px] font-semibold transition
                                     text-slate-400 hover:text-slate-600
                                     dark:text-[#545d68] dark:hover:text-[#adbac7]"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-10 text-center text-sm
                            text-slate-400 dark:text-[#545d68]">
              No hay documentos con ese criterio.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3
                        border-t bg-slate-50/40
                        border-slate-100 dark:border-[#21262d] dark:bg-[#1c2128]/40">
          <p className="text-[11px] text-slate-400 dark:text-[#545d68]">
            {filtered.filter((d) => d.status === "expired").length} expirados ·{" "}
            {filtered.filter((d) => d.status === "draft").length} en borrador
          </p>
          <a href="/documentos"
             className="text-[12px] font-medium transition-colors
                        text-teal-600 hover:text-teal-700
                        dark:text-teal-400 dark:hover:text-teal-300">
            Ver todos los documentos →
          </a>
        </div>
      </div>

      <PdfViewerModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        metadata={viewerMetadata}
      />
    </>
  );
}