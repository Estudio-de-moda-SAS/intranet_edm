"use client";

// AdminDocumentsCenterClient.tsx
// Lista de documentos administrativos con visor PDF emergente.

import { useState } from "react";
import {
  FileText, FileSpreadsheet, FileCode2, BookOpen, Eye,
} from "lucide-react";
import type { AdminDocument, AdminDocumentCategory } from "@/lib/graph/departments/administrative.service";
import PdfViewerModal, { type PdfMetadata } from "@/app/components/pdf/PdfViewerModal";

// ── Category map ──────────────────────────────────────────────────────────────

const CATEGORY_MAP: Record<
  AdminDocumentCategory,
  { label: string; Icon: React.ElementType; color: string; bg: string; border: string }
> = {
  policy:    { label: "Política",      Icon: BookOpen,        color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
  form:      { label: "Formulario",    Icon: FileSpreadsheet, color: "text-emerald-600",bg: "bg-emerald-50",border: "border-emerald-100" },
  procedure: { label: "Procedimiento", Icon: FileCode2,       color: "text-sky-600",    bg: "bg-sky-50",    border: "border-sky-100"    },
  template:  { label: "Plantilla",     Icon: FileText,        color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-100"  },
};

// ── Helper ────────────────────────────────────────────────────────────────────

function toMetadata(doc: AdminDocument): PdfMetadata {
  return {
    id:          doc.id,
    title:       doc.title,
    category:    CATEGORY_MAP[doc.category]?.label ?? doc.category,
    size:        doc.size,
    updatedAt:   doc.updatedAt,
    // previewUrl se activa cuando Graph esté disponible:
    // previewUrl:  doc.previewUrl,
    downloadUrl: doc.downloadUrl,
  };
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  documents: AdminDocument[];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminDocumentsCenterClient({ documents }: Props) {
  const [viewerOpen,     setViewerOpen]     = useState(false);
  const [viewerMetadata, setViewerMetadata] = useState<PdfMetadata | null>(null);

  function openViewer(doc: AdminDocument) {
    setViewerMetadata(toMetadata(doc));
    setViewerOpen(true);
  }

  return (
    <>
      {/* Document list */}
      <ul className="divide-y divide-slate-50">
        {documents.map((doc) => {
          const cat  = CATEGORY_MAP[doc.category];
          const Icon = cat.Icon;
          return (
            <li key={doc.id}>
              <div className="group flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${cat.bg} ${cat.border}`}>
                  <Icon size={15} className={cat.color} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{doc.title}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {doc.size} · Actualizado {doc.updatedAt}
                  </p>
                </div>

                {/* Acciones — visibles en hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => openViewer(doc)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-teal-500 hover:bg-teal-50 transition-colors"
                  >
                    <Eye size={13} />
                    Ver
                  </button>
                  <a
                    href={doc.downloadUrl}
                    download
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  >
                    ↓
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <PdfViewerModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        metadata={viewerMetadata}
      />
    </>
  );
}
