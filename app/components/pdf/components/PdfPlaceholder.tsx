import { AlertCircle, FileText } from "lucide-react";
import type { PdfMetadata } from "../types";

/**
 * @module PdfViewerModal/components/PdfPlaceholder
 * Estado visual mostrado cuando aún no existe una URL de preview.
 */

interface PdfPlaceholderProps {
  /**
   * Metadatos del documento actual.
   */
  metadata: PdfMetadata;
}

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
export function PdfPlaceholder({ metadata }: PdfPlaceholderProps) {
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
            {[...Array(5)].map((__, j) => (
              <div
                key={j}
                className="h-0.5 rounded-full bg-slate-200 dark:bg-[#30363d]"
                style={{ width: `${40 + (j * 7) % 20}%` }}
              />
            ))}
            <span className="text-[9px] font-mono absolute bottom-1
                             text-slate-300 dark:text-[#444c56]">
              {i + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}