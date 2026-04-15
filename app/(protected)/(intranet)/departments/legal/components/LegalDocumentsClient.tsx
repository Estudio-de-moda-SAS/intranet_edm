/**
 * @module LegalDocumentsClient
 * Cliente interactivo para explorar documentos jurídicos.
 *
 * @remarks
 * Este componente gestiona la interacción del usuario con el repositorio
 * documental del área legal, incluyendo:
 *
 * - búsqueda por texto
 * - filtro por categoría
 * - filtro por nivel de acceso (público / restringido)
 * - visualización tabular de documentos
 * - apertura de un visor PDF modal
 *
 * Se encarga de transformar la colección de documentos recibida en una
 * experiencia de exploración filtrable y navegable.
 */

"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  FileSignature,
  ScrollText,
  FileText,
  ShieldCheck,
  ClipboardList,
  Eye,
  Lock,
} from "lucide-react";
import type { LegalDocument, DocumentCategory } from "@/lib/graph/departments/legal.service";
import PdfViewerModal, { type PdfMetadata } from "@/app/components/pdf/PdfViewerModal";

/**
 * Mapa de íconos disponibles para categorías documentales.
 *
 * @remarks
 * Permite resolver dinámicamente el componente visual a partir
 * del nombre de ícono definido en la configuración de categoría.
 */
const ICON_MAP: Record<string, React.ElementType> = {
  FileSignature,
  ScrollText,
  FileText,
  ShieldCheck,
  ClipboardList,
};

/**
 * Configuración de tabs de filtro por visibilidad/restricción.
 *
 * @remarks
 * Cada pestaña representa:
 * - `null`: todos los documentos
 * - `true`: solo restringidos
 * - `false`: solo públicos
 */
const FILTER_TABS: { label: string; value: boolean | null }[] = [
  { label: "Todos", value: null },
  { label: "Restringidos", value: true },
  { label: "Públicos", value: false },
];

/**
 * Convierte un documento legal a metadata compatible con el visor PDF.
 *
 * @param doc Documento legal origen.
 * @param categoryLabel Etiqueta legible de la categoría.
 * @returns Metadata estructurada para el componente {@link PdfViewerModal}.
 *
 * @remarks
 * Esta función construye un objeto base y agrega campos opcionales
 * solo cuando están definidos, evitando props innecesarias o vacías.
 */
function toMetadata(doc: LegalDocument, categoryLabel: string): PdfMetadata {
  const base: PdfMetadata = {
    id: doc.id,
    title: doc.title,
    category: categoryLabel,
    size: doc.size,
    updatedAt: doc.updatedAt,
  };

  if (doc.author !== undefined) base.author = doc.author;
  if (doc.version !== undefined) base.version = doc.version;
  if (doc.restricted !== undefined) base.restricted = doc.restricted;
  if (doc.previewUrl !== undefined) base.previewUrl = doc.previewUrl;
  if (doc.downloadUrl !== undefined) base.downloadUrl = doc.downloadUrl;

  return base;
}

/**
 * Metadatos visuales de una categoría documental.
 *
 * @property label Nombre legible de la categoría.
 * @property color Clases CSS del color principal.
 * @property bg Clases CSS del fondo.
 * @property border Clases CSS del borde.
 * @property icon Nombre del ícono asociado.
 */
interface CategoryMeta {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
}

/**
 * Props del componente {@link LegalDocumentsClient}.
 *
 * @property documents Lista de documentos jurídicos disponibles.
 * @property CATEGORY_MAP Configuración visual por categoría documental.
 */
interface LegalDocumentsClientProps {
  documents: LegalDocument[];
  CATEGORY_MAP: Record<DocumentCategory, CategoryMeta>;
}

/**
 * Cliente de documentos jurídicos con búsqueda, filtros y visor PDF.
 *
 * @param props Propiedades del componente.
 * @returns Interfaz interactiva para explorar y visualizar documentos legales.
 *
 * @remarks
 * Este componente:
 * - mantiene el estado de búsqueda
 * - mantiene el filtro por visibilidad
 * - mantiene la categoría seleccionada
 * - gestiona la apertura y cierre del visor PDF
 * - filtra documentos por múltiples criterios simultáneamente
 * - calcula categorías y conteos derivados
 *
 * El visor PDF se alimenta con metadata transformada mediante {@link toMetadata}.
 *
 * @example
 * ```tsx
 * <LegalDocumentsClient
 *   documents={documents}
 *   CATEGORY_MAP={CATEGORY_MAP}
 * />
 * ```
 */
export default function LegalDocumentsClient({
  documents,
  CATEGORY_MAP,
}: LegalDocumentsClientProps) {
  /**
   * Texto actual de búsqueda.
   */
  const [search, setSearch] = useState("");

  /**
   * Filtro actual por tipo de visibilidad.
   *
   * @remarks
   * - `null`: todos
   * - `true`: restringidos
   * - `false`: públicos
   */
  const [activeTab, setActiveTab] = useState<boolean | null>(null);

  /**
   * Categoría seleccionada en el selector.
   */
  const [category, setCategory] = useState("Todas");

  /**
   * Indica si el visor PDF está abierto.
   */
  const [viewerOpen, setViewerOpen] = useState(false);

  /**
   * Metadata actualmente cargada en el visor PDF.
   */
  const [viewerMetadata, setViewerMetadata] = useState<PdfMetadata | null>(null);

  /**
   * Abre el visor PDF con la metadata del documento seleccionado.
   *
   * @param doc Documento que se desea visualizar.
   *
   * @remarks
   * Resuelve la etiqueta legible de categoría y luego construye
   * la metadata necesaria para el modal.
   */
  function openViewer(doc: LegalDocument) {
    const catLabel = CATEGORY_MAP[doc.category]?.label ?? doc.category;
    setViewerMetadata(toMetadata(doc, catLabel));
    setViewerOpen(true);
  }

  /**
   * Lista de categorías disponibles para el selector.
   *
   * @remarks
   * Incluye una opción general (`"Todas"`) y el resto se deriva
   * dinámicamente a partir de la colección de documentos.
   */
  const categories = [
    "Todas",
    ...Array.from(
      new Set(documents.map((d) => CATEGORY_MAP[d.category]?.label ?? d.category))
    ).sort(),
  ];

  /**
   * Documentos resultantes tras aplicar búsqueda, categoría y tab activo.
   *
   * @remarks
   * Se filtra por:
   * - categoría seleccionada
   * - estado restringido/público
   * - coincidencia textual en `id` o `title`
   */
  const filtered = documents.filter((doc) => {
    const catLabel = CATEGORY_MAP[doc.category]?.label ?? doc.category;
    const matchCat = category === "Todas" || catLabel === category;
    const matchTab = activeTab === null || (doc.restricted ?? false) === activeTab;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      doc.id.toLowerCase().includes(q) ||
      doc.title.toLowerCase().includes(q);

    return matchCat && matchTab && matchSearch;
  });

  /**
   * Total de documentos restringidos en la colección completa.
   */
  const restrictedCount = documents.filter((d) => d.restricted).length;

  return (
    <>
      {/* Search / filter bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-5 py-4
                      border-b border-slate-100 dark:border-[#21262d]"
      >
        <p className="text-[11px] text-slate-400 dark:text-[#545d68]">
          {filtered.length} documentos
          {restrictedCount > 0 && (
            <>
              {" "}
              ·{" "}
              <span className="font-semibold text-rose-500 dark:text-rose-400">
                {restrictedCount} restringidos
              </span>
            </>
          )}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5
                               text-slate-400 dark:text-[#545d68]"
            />
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

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border px-2.5 py-1.5 text-[12px] outline-none cursor-pointer transition
                       border-slate-200 bg-slate-50 text-slate-600
                       focus:border-teal-300
                       dark:border-[#30363d] dark:bg-[#1c2128] dark:text-[#adbac7]"
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <button
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition
                             border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100
                             dark:border-[#30363d] dark:bg-[#1c2128] dark:text-[#adbac7] dark:hover:bg-[#21262d]"
          >
            <Filter className="h-3.5 w-3.5" />
            Filtros
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center gap-1 px-5 py-2.5 overflow-x-auto
                      border-b bg-slate-50/60
                      border-slate-100 dark:border-[#21262d] dark:bg-[#1c2128]/50"
      >
        {FILTER_TABS.map((t) => (
          <button
            key={t.label}
            onClick={() => setActiveTab(t.value)}
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
              activeTab === t.value
                ? "bg-teal-600 text-white shadow-sm dark:bg-teal-600/80"
                : "text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:text-[#545d68] dark:hover:bg-[#30363d] dark:hover:text-[#adbac7]"
            }`}
          >
            {t.label}
            {t.value === true && restrictedCount > 0 && (
              <span className="ml-1 rounded-full bg-rose-500 text-white px-1.5 text-[9px]">
                {restrictedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr
              className="border-b border-slate-100 bg-slate-50/40
                           dark:border-[#21262d] dark:bg-[#1c2128]/40"
            >
              {["Documento", "Tipo", "Tamaño", "Actualizado", "Autor", ""].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap
                                       text-slate-400 dark:text-[#545d68]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50 dark:divide-[#21262d]">
            {filtered.map((doc) => {
              const catMeta = CATEGORY_MAP[doc.category];
              const CatIcon = ICON_MAP[catMeta?.icon ?? "FileText"] ?? FileText;

              return (
                <tr
                  key={doc.id}
                  className="transition-colors group
                               hover:bg-slate-50/70 dark:hover:bg-[#1c2128]"
                >
                  {/* Documento */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {doc.restricted && <Lock className="h-3 w-3 shrink-0 text-rose-400" />}
                      <div>
                        <p
                          className="font-semibold truncate max-w-[240px]
                                      text-slate-800 dark:text-[#e6edf3]"
                        >
                          {doc.title}
                        </p>
                        <p
                          className="text-[10px] font-mono mt-0.5
                                      text-slate-400 dark:text-[#545d68]"
                        >
                          {doc.id}
                          {doc.version && ` · v${doc.version}`}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Tipo */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold
                      ${catMeta?.bg ?? "bg-slate-100 dark:bg-[#21262d]"}
                      ${catMeta?.color ?? "text-slate-600 dark:text-[#768390]"}
                      ${catMeta?.border ?? "border-slate-200 dark:border-[#30363d]"}`}
                    >
                      <CatIcon className="h-3 w-3 shrink-0" />
                      {catMeta?.label ?? doc.category}
                    </span>
                  </td>

                  {/* Tamaño */}
                  <td
                    className="px-4 py-3 font-bold whitespace-nowrap
                                 text-slate-800 dark:text-[#e6edf3]"
                  >
                    {doc.size}
                  </td>

                  {/* Actualizado */}
                  <td className="px-4 py-3 text-slate-500 dark:text-[#768390]">
                    {doc.updatedAt}
                  </td>

                  {/* Autor */}
                  <td className="px-4 py-3 text-slate-500 dark:text-[#768390]">
                    {doc.author ?? "—"}
                  </td>

                  {/* Ver PDF */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openViewer(doc)}
                      className="flex items-center gap-0.5 text-[11px] font-semibold transition
                                 text-teal-500 dark:text-teal-400
                                 opacity-0 group-hover:opacity-100"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div
            className="py-10 text-center text-sm
                          text-slate-400 dark:text-[#545d68]"
          >
            No hay documentos con ese criterio.
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-5 py-3
                      border-t border-slate-100 bg-slate-50/40
                      dark:border-[#21262d] dark:bg-[#1c2128]/40"
      >
        <p className="text-[11px] text-slate-400 dark:text-[#545d68]">
          {filtered.filter((d) => d.restricted).length} restringidos ·{" "}
          {filtered.filter((d) => !d.restricted).length} públicos
        </p>

        <a
          href="/legal/documents"
          className="text-[12px] font-medium transition-colors
                      text-teal-600 hover:text-teal-700
                      dark:text-teal-400 dark:hover:text-teal-300"
        >
          Ver todos los documentos →
        </a>
      </div>

      <PdfViewerModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        metadata={viewerMetadata}
      />
    </>
  );
}