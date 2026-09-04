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
    <div className="pdf-viewer-modal__placeholder">
      <span className="pdf-viewer-modal__placeholder-icon pdf-viewer-modal__placeholder-icon--neutral">
        <FileText className="h-7 w-7" strokeWidth={1.75} />
      </span>

      <div className="pdf-viewer-modal__placeholder-copy" style={{ gap: 0 }}>
        <p className="pdf-viewer-modal__placeholder-title">Vista previa no disponible</p>
        <p className="pdf-viewer-modal__placeholder-desc" style={{ marginTop: "0.375rem" }}>
          Los archivos <strong>.{ext}</strong> no pueden previsualizarse en el navegador.
          Descarga el archivo para abrirlo.
        </p>
      </div>

      <span className="pdf-viewer-modal__placeholder-chip pdf-viewer-modal__placeholder-chip--neutral">
        <AlertCircle className="h-3.5 w-3.5" />
        Formato no soportado para previsualización
      </span>
    </div>
  );
}