"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import PdfViewerModal from "@/app/components/pdf/PdfViewerModal";

const guides = [
  {
    emoji: "🔐",
    title: "Restablecer contraseña corporativa",
    time: "3 min",
    metadata: {
      id: "DOC-001",
      title: "Restablecer contraseña corporativa",
      category: "Seguridad",
      previewUrl: "/mock-pdfs/GUIAsolucionesIAMicrosoft.pdf",
    },
  },
  {
    emoji: "🖨️",
    title: "Conectar impresoras de red",
    time: "5 min",
    metadata: {
      id: "DOC-002",
      title: "Conectar impresoras de red",
      category: "Infraestructura",
      previewUrl: "/mock-pdfs/GUIAsolucionesIAMicrosoft.pdf",
    },
  },
  {
    emoji: "🌐",
    title: "Configurar VPN desde casa",
    time: "7 min",
    metadata: {
      id: "DOC-003",
      title: "Configurar VPN desde casa",
      category: "Redes",
      previewUrl: "/mock-pdfs/GUIAsolucionesIAMicrosoft.pdf",
    },
  },
  {
    emoji: "📱",
    title: "Acceso Móvil al Correo",
    time: "4 min",
    metadata: {
      id: "DOC-004",
      title: "Acceso móvil al correo",
      category: "Correo",
      previewUrl: "/mock-pdfs/GUIAsolucionesIAMicrosoft.pdf",
    },
  },
  {
    emoji: "💾",
    title: "Backup y restaurar archivos",
    time: "6 min",
    metadata: {
      id: "DOC-005",
      title: "Backup y restauración",
      category: "Datos",
      previewUrl: "/mock-pdfs/GUIAsolucionesIAMicrosoft.pdf",
    },
  },
  {
    emoji: "🔑",
    title: "Solicitar accesos y permisos",
    time: "2 min",
    metadata: {
      id: "DOC-006",
      title: "Solicitar accesos",
      category: "Accesos",
      previewUrl: "/mock-pdfs/GUIAsolucionesIAMicrosoft.pdf",
    },
  },
] as const;

export default function HelpQuickGuides() {
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  const handleOpen = (guide: typeof guides[number]) => {
    setSelectedDoc(guide.metadata);
  };

  const handleClose = () => {
    setSelectedDoc(null);
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Guías de autoservicio
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Resuelve los problemas más comunes por ti mismo
            </p>
          </div>
          <button className="text-[11px] font-medium text-blue-600 hover:underline">
            Ver todas
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <button
              key={guide.title}
              onClick={() => handleOpen(guide)}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
            >
              <span className="text-xl">{guide.emoji}</span>

              <div className="flex-1">
                <p className="text-[12px] font-semibold text-slate-800 leading-snug group-hover:text-blue-700 transition-colors">
                  {guide.title}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  {guide.time} lectura
                </span>

                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ✅ MODAL CORRECTO */}
      <PdfViewerModal
        open={!!selectedDoc}
        onClose={handleClose}
        metadata={selectedDoc}
      />
    </>
  );
}