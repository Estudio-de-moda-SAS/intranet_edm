"use client";

// LegalDocumentsClient.tsx
// Panel de documentos jurídicos — diseño unificado con DocumentTable.
// Incluye visor PDF emergente con metadatos (Graph pendiente).

import { useState } from "react";
import {
  Search, Filter,
  FileSignature, ScrollText, FileText,
  ShieldCheck, ClipboardList,
  Eye, Lock,
} from "lucide-react";
import type { LegalDocument, LegalDocumentCategory } from "@/lib/graph/legal.service";
import PdfViewerModal, { type PdfMetadata } from "@/app/components/pdf/PdfViewerModal";

// ── Icon map ──────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  FileSignature, ScrollText, FileText, ShieldCheck, ClipboardList,
};

// ── Filter tabs ───────────────────────────────────────────────────────────────

const FILTER_TABS: { label: string; value: boolean | null }[] = [
  { label: "Todos",        value: null  },
  { label: "Restringidos", value: true  },
  { label: "Públicos",     value: false },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function toMetadata(doc: LegalDocument, categoryLabel: string): PdfMetadata {
  const base: PdfMetadata = {
    id:        doc.id,
    title:     doc.title,
    category:  categoryLabel,
    size:      doc.size,
    updatedAt: doc.updatedAt,
  };

  if (doc.author      !== undefined) base.author      = doc.author;
  if (doc.version     !== undefined) base.version     = doc.version;
  if (doc.restricted  !== undefined) base.restricted  = doc.restricted;
  if (doc.previewUrl  !== undefined) base.previewUrl  = doc.previewUrl;
  if (doc.downloadUrl !== undefined) base.downloadUrl = doc.downloadUrl;

  return base;
}
// ── Props ─────────────────────────────────────────────────────────────────────

interface CategoryMeta {
  label:  string;
  color:  string;
  bg:     string;
  border: string;
  icon:   string;
}

interface LegalDocumentsClientProps {
  documents:    LegalDocument[];
  CATEGORY_MAP: Record<LegalDocumentCategory, CategoryMeta>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LegalDocumentsClient({
  documents,
  CATEGORY_MAP,
}: LegalDocumentsClientProps) {

  const [search,         setSearch]         = useState("");
  const [activeTab,      setActiveTab]      = useState<boolean | null>(null);
  const [category,       setCategory]       = useState("Todas");
  const [viewerOpen,     setViewerOpen]     = useState(false);
  const [viewerMetadata, setViewerMetadata] = useState<PdfMetadata | null>(null);

  function openViewer(doc: LegalDocument) {
    const catLabel = CATEGORY_MAP[doc.category]?.label ?? doc.category;
    setViewerMetadata(toMetadata(doc, catLabel));
    setViewerOpen(true);
  }

  // Categorías únicas derivadas de los documentos visibles
  const categories = [
    "Todas",
    ...Array.from(
      new Set(documents.map((d) => CATEGORY_MAP[d.category]?.label ?? d.category))
    ).sort(),
  ];

  const filtered = documents.filter((doc) => {
    const catLabel    = CATEGORY_MAP[doc.category]?.label ?? doc.category;
    const matchCat    = category === "Todas" || catLabel === category;
    const matchTab    = activeTab === null || (doc.restricted ?? false) === activeTab;
    const q           = search.toLowerCase();
    const matchSearch = !q || doc.id.toLowerCase().includes(q) || doc.title.toLowerCase().includes(q);
    return matchCat && matchTab && matchSearch;
  });

  const restrictedCount = documents.filter((d) => d.restricted).length;

  return (
    <>
      {/* ── Search / filter bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <p className="text-[11px] text-slate-400">
          {filtered.length} documentos
          {restrictedCount > 0 && (
            <> · <span className="text-rose-500 font-semibold">{restrictedCount} restringidos</span></>
          )}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar documento..."
              className="pl-8 pr-3 py-1.5 text-[12px] rounded-lg border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 outline-none focus:border-teal-300 focus:bg-white transition w-48"
            />
          </div>

          {/* Categoría */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12px] text-slate-600 outline-none focus:border-teal-300 cursor-pointer"
          >
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>

          <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-100 transition">
            <Filter className="h-3.5 w-3.5" />
            Filtros
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 px-5 py-2.5 bg-slate-50/60 border-b border-slate-100 overflow-x-auto">
        {FILTER_TABS.map((t) => (
          <button
            key={t.label}
            onClick={() => setActiveTab(t.value)}
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
              activeTab === t.value
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"
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

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/40">
              {["Documento", "Tipo", "Tamaño", "Actualizado", "Autor", ""].map((h) => (
                <th key={h} className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {filtered.map((doc) => {
              const catMeta = CATEGORY_MAP[doc.category];
              const CatIcon = ICON_MAP[catMeta?.icon ?? "FileText"] ?? FileText;

              return (
                <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors group">

                  {/* Documento */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {doc.restricted && (
                        <Lock className="h-3 w-3 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold text-slate-800 truncate max-w-[240px]">{doc.title}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {doc.id}
                          {doc.version && ` · v${doc.version}`}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Tipo */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold
                      ${catMeta?.bg     ?? "bg-slate-100"}
                      ${catMeta?.color  ?? "text-slate-600"}
                      ${catMeta?.border ?? "border-slate-200"}`}
                    >
                      <CatIcon className="h-3 w-3 shrink-0" />
                      {catMeta?.label ?? doc.category}
                    </span>
                  </td>

                  {/* Tamaño */}
                  <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">
                    {doc.size}
                  </td>

                  {/* Actualizado */}
                  <td className="px-4 py-3 text-slate-500">{doc.updatedAt}</td>

                  {/* Autor */}
                  <td className="px-4 py-3 text-slate-500">{doc.author ?? "—"}</td>

                  {/* Ver PDF */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openViewer(doc)}
                      className="flex items-center gap-0.5 text-teal-500 opacity-0 group-hover:opacity-100 transition text-[11px] font-semibold"
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
          <div className="py-10 text-center text-sm text-slate-400">
            No hay documentos con ese criterio.
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/40">
        <p className="text-[11px] text-slate-400">
          {filtered.filter((d) => d.restricted).length} restringidos ·{" "}
          {filtered.filter((d) => !d.restricted).length} públicos
        </p>
        <a href="/legal/documents" className="text-[12px] font-medium text-teal-600 hover:text-teal-700 transition-colors">
          Ver todos los documentos →
        </a>
      </div>

      {/* ── PDF Viewer ── */}
      <PdfViewerModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        metadata={viewerMetadata}
      />
    </>
  );
}