import { AlertCircle, FileText } from "lucide-react";
import { getFileExtension } from "../utils";

/**
 * @module PdfViewerModal/components/UnsupportedPreview
 * Estado mostrado cuando el archivo no puede previsualizarse.
 */

interface UnsupportedPreviewProps {
  /**
   * URL del archivo a evaluar.
   */
  url: string;
}

/**
 * Vista mostrada cuando el formato no puede previsualizarse en navegador.
 *
 * @param props Propiedades del componente.
 * @param props.url URL del archivo.
 * @returns Estado de formato no soportado.
 */
export function UnsupportedPreview({ url }: UnsupportedPreviewProps) {
  const ext = getFileExtension(url).toUpperCase() || "DESCONOCIDO";

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8
                    bg-slate-50 dark:bg-[#0d1117]">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl
                       border shadow-sm
                       bg-white border-slate-200
                       dark:bg-[#161b22] dark:border-[#30363d]">
        <FileText className="h-8 w-8 text-slate-400 dark:text-[#545d68]" />
      </span>
      <div className="text-center max-w-xs">
        <p className="text-sm font-semibold text-slate-700 dark:text-[#cdd9e5]">
          Vista previa no disponible
        </p>
        <p className="text-[11px] mt-1 leading-relaxed text-slate-400 dark:text-[#768390]">
          Los archivos{" "}
          <span className="font-mono font-bold text-slate-600 dark:text-[#adbac7]">
            .{ext}
          </span>{" "}
          no pueden previsualizarse en el navegador. Descarga el archivo para abrirlo.
        </p>
      </div>
      <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5
                      border bg-white border-slate-200
                      dark:bg-[#1c2128] dark:border-[#30363d]">
        <AlertCircle className="h-3.5 w-3.5 text-slate-400 dark:text-[#545d68]" />
        <span className="text-[11px] font-semibold text-slate-500 dark:text-[#768390]">
          Formato no soportado para previsualización
        </span>
      </div>
    </div>
  );
}