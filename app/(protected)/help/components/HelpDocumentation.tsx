"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import PdfViewerModal, { PdfMetadata } from "@/app/components/pdf/PdfViewerModal";

function getExt(title: string) {
  if (title.toLowerCase().includes("vpn")) return "VID";
  if (title.toLowerCase().includes("manual")) return "DOC";
  return "PDF";
}

function getExtStyles(ext: string) {
  switch (ext) {
    case "PDF":
      return "bg-rose-50 text-rose-700";
    case "DOC":
      return "bg-blue-50 text-blue-700";
    case "VID":
      return "bg-emerald-50 text-emerald-700";
    default:
      return "bg-slate-50 text-slate-700";
  }
}

const docs: PdfMetadata[] = [
  {
    id: "DOC-001",
    title: "Política de seguridad TI 2025",
    category: "Seguridad",
    author: "IT Department",
    version: "1.0",
    size: "2.4 MB",
    updatedAt: "Mar 2025",
    previewUrl: "/docs/politica-seguridad.pdf",
    downloadUrl: "/docs/politica-seguridad.pdf",
  },
  {
    id: "DOC-002",
    title: "Manual de onboarding IT",
    category: "Onboarding",
    author: "HR + IT",
    version: "3.1",
    size: "1.2 MB",
    updatedAt: "Feb 2025",
    previewUrl: "/docs/onboarding.docx",
    downloadUrl: "/docs/onboarding.docx",
  },
  {
    id: "DOC-003",
    title: "Configuración VPN — Tutorial",
    category: "Redes",
    author: "Infra Team",
    version: "1.0",
    size: "Video",
    updatedAt: "2025",
  },
  {
    id: "DOC-004",
    title: "Guía de buenas prácticas",
    category: "Seguridad",
    author: "IT",
    version: "2.0",
    size: "900 KB",
    updatedAt: "Ene 2025",
    previewUrl: "/docs/buenas-practicas.pdf",
    downloadUrl: "/docs/buenas-practicas.pdf",
  },
];

export default function HelpDocumentation() {
  const [selectedDoc, setSelectedDoc] = useState<PdfMetadata | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">
          Documentación técnica
        </h3>
      </div>

      <ul className="divide-y divide-slate-100">
        {docs.map((doc) => {
          const ext = getExt(doc.title);
          const styles = getExtStyles(ext);

          return (
            <li key={doc.id}>
              <button
                onClick={() => {
                  setSelectedDoc(doc);
                  setOpen(true);
                }}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group text-left"
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${styles}`}
                >
                  {ext}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                    {doc.title}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {doc.updatedAt} · {doc.size}
                  </p>
                </div>

                <Download className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
              </button>
            </li>
          );
        })}
      </ul>

      {/* 🔥 MODAL */}
      <PdfViewerModal
        open={open}
        onClose={() => setOpen(false)}
        metadata={selectedDoc}
      />
    </div>
  );
}