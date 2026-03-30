// LegalDocumentsPanel.tsx
// SERVER COMPONENT — diseño unificado con DocumentTable.

import { FolderOpen, ChevronRight } from "lucide-react";
import type { LegalDocument } from "@/lib/graph/legal.service";
import Link from "next/link";

import LegalDocumentsClient from "./LegalDocumentsClient";
import { getLegalDocuments } from "@/lib/documents/providers/legalDocuments.provider";

const CATEGORY_MAP: Record<
  LegalDocument["category"],
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  contract_template: {
    label:  "Plantilla",
    icon:   "FileSignature",
    color:  "text-blue-600",
    bg:     "bg-blue-50",
    border: "border-blue-100",
  },
  policy: {
    label:  "Política",
    icon:   "ScrollText",
    color:  "text-violet-600",
    bg:     "bg-violet-50",
    border: "border-violet-100",
  },
  power_of_attorney: {
    label:  "Poder notarial",
    icon:   "FileText",
    color:  "text-amber-600",
    bg:     "bg-amber-50",
    border: "border-amber-100",
  },
  regulatory: {
    label:  "Normatividad",
    icon:   "ShieldCheck",
    color:  "text-teal-600",
    bg:     "bg-teal-50",
    border: "border-teal-100",
  },
  form: {
    label:  "Formato",
    icon:   "ClipboardList",
    color:  "text-slate-600",
    bg:     "bg-slate-100",
    border: "border-slate-200",
  },
};

export default async function LegalDocumentsPanel() {
  const documents = await getLegalDocuments();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

      {/* ── Header — igual al de DocumentTable ── */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
            <FolderOpen size={16} className="text-slate-600" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Documentos jurídicos</p>
            <p className="text-[11px] text-slate-400">Plantillas, políticas y formatos</p>
          </div>
        </div>

        <Link
          href="/legal/documents"
          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Ver todos <ChevronRight size={14} />
        </Link>
      </div>

      {/* CLIENT COMPONENT — search, tabs, table, viewer */}
      <LegalDocumentsClient
        documents={documents}
        CATEGORY_MAP={CATEGORY_MAP}
      />

    </div>
  );
}