import { Loader2 } from "lucide-react";

/**
 * @module PdfViewerModal/components/PreviewSkeleton
 * Estado de carga mostrado mientras se determina si existe una URL de preview.
 */

/**
 * Skeleton mostrado durante el margen de gracia inicial, antes de decidir
 * si el documento tiene preview disponible o no.
 *
 * @returns Vista de carga con simulación de página de documento.
 *
 * @remarks
 * Existe para evitar el parpadeo del mensaje "Pendiente integración Graph":
 * la mayoría de documentos resuelven su `previewUrl` en pocos cientos de
 * milisegundos, así que mostrar este skeleton primero (en vez del mensaje
 * final directamente) evita que el usuario vea un mensaje de error que
 * desaparece casi de inmediato.
 */
export function PreviewSkeleton() {
  return (
    <div className="pdf-viewer-modal__placeholder">
      <div className="pdf-viewer-modal__skeleton-wrap">
        <div className="pdf-viewer-modal__skeleton-card">
          <div className="pdf-viewer-modal__skeleton-line" style={{ width: "75%" }} />
          <div className="pdf-viewer-modal__skeleton-line" style={{ width: "100%" }} />
          <div className="pdf-viewer-modal__skeleton-line" style={{ width: "85%" }} />
          <div className="pdf-viewer-modal__skeleton-line" style={{ width: "60%" }} />
          <div className="pdf-viewer-modal__skeleton-block" />
          <div className="pdf-viewer-modal__skeleton-line" style={{ width: "50%" }} />
        </div>

        <span className="pdf-viewer-modal__skeleton-spinner">
          <Loader2 className="h-4 w-4" />
        </span>
      </div>

      <p className="pdf-viewer-modal__skeleton-caption">Cargando vista previa…</p>
    </div>
  );
}