"use client";

// DocumentTable.tsx
// Recibe los documentos ya filtrados por el servidor (según accessLevel).
// El cliente solo hace filtrado local de búsqueda/categoría/estado —
// nunca recibe documentos que el usuario no debería ver.

import { useState }          from "react";
import {
  Search, Filter, ChevronRight, Lock,
  Clock, CheckCircle2, AlertCircle, Loader2, FileText, Eye,
} from "lucide-react";
import { CLASSIFICATION_META } from "../config/documentClassification";
import type { DocumentItem }   from "../config/documentData";
import PdfViewerModal, { type PdfMetadata } from "@/app/components/pdf/PdfViewerModal";

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CFG = {
  draft:     { label: "Borrador",    color: "bg-slate-100 text-slate-500 border-slate-200",     icon: Loader2       },
  review:    { label: "En revisión", color: "bg-sky-50 text-sky-700 border-sky-100",             icon: Clock         },
  approved:  { label: "Aprobado",    color: "bg-violet-50 text-violet-700 border-violet-100",    icon: CheckCircle2  },
  published: { label: "Publicado",   color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: CheckCircle2  },
  archived:  { label: "Archivado",   color: "bg-amber-50 text-amber-700 border-amber-100",       icon: FileText      },
  expired:   { label: "Expirado",    color: "bg-rose-50 text-rose-700 border-rose-200",          icon: AlertCircle   },
};

const FILTER_TABS = [
  { label: "Todos",       value: null                 },
  { label: "Borradores",  value: "draft"              },
  { label: "En revisión", value: "review"             },
  { label: "Aprobados",   value: "approved,published" },
  { label: "Expirados",   value: "expired"            },
] as const;

function fmtSize(n: number) { return `${n.toFixed(1)} MB`; }

// ── Helper: DocumentItem → PdfMetadata ───────────────────────────────────────

function toMetadata(doc: DocumentItem): PdfMetadata {
  return {
    id:         doc.id,
    title:      doc.title,
    category:   doc.category,
    author:     doc.owner,
    size:       fmtSize(doc.size),
    updatedAt:  doc.updated,
    restricted: doc.classification === "restricted" || doc.classification === "confidential",
    // Omit optional fields entirely when undefined (required by exactOptionalPropertyTypes)
    ...(doc.previewUrl  !== undefined && { previewUrl:  doc.previewUrl  }),
    ...(doc.downloadUrl !== undefined && { downloadUrl: doc.downloadUrl }),
  };
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface DocumentTableProps {
  /** Documentos ya filtrados por accessLevel desde el servidor */
  documents: DocumentItem[];
  /** Si true, muestra la columna de clasificación */
  showClassification?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DocumentTable({
  documents,
  showClassification = false,
}: DocumentTableProps) {

  const [search,         setSearch]         = useState("");
  const [tab,            setTab]            = useState<string | null>(null);
  const [category,       setCategory]       = useState("Todas");
  const [viewerOpen,     setViewerOpen]     = useState(false);
  const [viewerMetadata, setViewerMetadata] = useState<PdfMetadata | null>(null);

  function openViewer(doc: DocumentItem) {
    setViewerMetadata(toMetadata(doc));
    setViewerOpen(true);
  }

  // Categorías únicas derivadas de los documentos visibles
  const categories = ["Todas", ...Array.from(new Set(documents.map((d) => d.category))).sort()];

  const filtered = documents.filter((doc) => {
    const matchCat = category === "Todas" || doc.category === category;
    const matchTab = !tab || tab.split(",").includes(doc.status);
    const q        = search.toLowerCase();
    const matchQ   = !q || doc.id.toLowerCase().includes(q) || doc.title.toLowerCase().includes(q);
    return matchCat && matchTab && matchQ;
  });

  const totalSize    = filtered.reduce((s, d) => s + d.size, 0);
  const expiredCount = documents.filter((d) => d.status === "expired").length;

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div>
            <p className="text-sm font-semibold text-slate-800">Documentos corporativos</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {filtered.length} documentos ·{" "}
              <span className="font-bold text-slate-700">{fmtSize(totalSize)}</span> almacenados
            </p>
          </div>

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

        {/* ── Status Tabs ── */}
        <div className="flex items-center gap-1 px-5 py-2.5 bg-slate-50/60 border-b border-slate-100 overflow-x-auto">
          {FILTER_TABS.map((t) => (
            <button
              key={t.label}
              onClick={() => setTab(t.value)}
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
                tab === t.value
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"
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

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40">
                {[
                  "Documento",
                  "Categoría",
                  ...(showClassification ? ["Clasificación"] : []),
                  "Estado",
                  "Tamaño",
                  "Creado",
                  "Actualizado",
                  "Responsable",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {filtered.map((doc) => {
                const cfg  = STATUS_CFG[doc.status];
                const Icon = cfg.icon;
                const cls  = CLASSIFICATION_META[doc.classification];

                return (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors group">

                    {/* Título */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {doc.classification === "restricted" && (
                          <Lock className="h-3 w-3 text-rose-400 shrink-0" />
                        )}
                        {doc.classification === "confidential" && (
                          <Lock className="h-3 w-3 text-amber-400 shrink-0" />
                        )}
                        <div>
                          <p className="font-semibold text-slate-800 truncate max-w-[220px]">{doc.title}</p>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {doc.id} · {doc.pages} páginas
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {doc.category}
                      </span>
                    </td>

                    {/* Clasificación — solo si showClassification=true */}
                    {showClassification && (
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cls.badgeBg} ${cls.badgeColor} ${cls.badgeBorder}`}>
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
                    <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">
                      {fmtSize(doc.size)}
                    </td>

                    {/* Creado */}
                    <td className="px-4 py-3 text-slate-500">{doc.created}</td>

                    {/* Actualizado */}
                    <td className={`px-4 py-3 font-semibold whitespace-nowrap ${doc.status === "expired" ? "text-rose-600" : "text-slate-600"}`}>
                      {doc.status === "expired" ? "⚠ " : ""}{doc.updated}
                    </td>

                    {/* Responsable */}
                    <td className="px-4 py-3 text-slate-500">{doc.owner}</td>

                    {/* Acciones — Ver PDF reemplaza el link directo en hover */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => openViewer(doc)}
                          className="flex items-center gap-0.5 text-teal-500 text-[11px] font-semibold"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver
                        </button>
                        <a
                          href={`/documentos/${doc.id}`}
                          className="flex items-center gap-0.5 text-slate-400 text-[11px] font-semibold hover:text-slate-600 transition"
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
            <div className="py-10 text-center text-sm text-slate-400">
              No hay documentos con ese criterio.
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/40">
          <p className="text-[11px] text-slate-400">
            {filtered.filter((d) => d.status === "expired").length} expirados ·{" "}
            {filtered.filter((d) => d.status === "draft").length} en borrador
          </p>
          <a href="/documentos" className="text-[12px] font-medium text-teal-600 hover:text-teal-700 transition-colors">
            Ver todos los documentos →
          </a>
        </div>

      </div>

      {/* ── PDF Viewer Modal — fuera del div para evitar overflow:hidden ── */}
      <PdfViewerModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        metadata={viewerMetadata}
      />
    </>
  );
}