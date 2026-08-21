import { AlertCircle, FileText } from "lucide-react";
import type { PdfMetadata } from "../types";

/**
 * @module PdfViewerModal/components/PdfPlaceholder
 * Estado visual mostrado cuando, tras el margen de gracia inicial
 * (ver {@link PreviewSkeleton}), aún no existe una URL de preview.
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
 * una URL de previsualización. `PdfViewerModal` solo llega a este
 * componente después de esperar un margen de gracia corto — ver
 * {@link PreviewSkeleton} — para no mostrar este mensaje como un
 * parpadeo cuando el `previewUrl` en realidad sí llega, solo que un
 * poco después del primer render.
 */
export function PdfPlaceholder({ metadata }: PdfPlaceholderProps) {
  return (
    <div className="pdf-viewer-modal__placeholder">
      <div className="pdf-viewer-modal__placeholder-copy">
        <span className="pdf-viewer-modal__placeholder-icon">
          <FileText className="h-7 w-7" strokeWidth={1.75} />
        </span>

        <div>
          <p className="pdf-viewer-modal__placeholder-title">Vista previa no disponible</p>
          <p className="pdf-viewer-modal__placeholder-desc">
            La integración con Graph está pendiente. El documento{" "}
            <strong>{metadata.id}</strong> estará disponible próximamente.
          </p>
        </div>

        <span className="pdf-viewer-modal__placeholder-chip pdf-viewer-modal__placeholder-chip--warning">
          <AlertCircle className="h-3.5 w-3.5" />
          Pendiente integración Graph
        </span>
      </div>

      <div className="pdf-viewer-modal__placeholder-pages">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="pdf-viewer-modal__placeholder-page">
            {[...Array(5)].map((__, j) => (
              <div
                key={j}
                className="pdf-viewer-modal__placeholder-page-line"
                style={{ width: `${40 + (j * 7) % 20}%` }}
              />
            ))}
            <span className="pdf-viewer-modal__placeholder-page-number">{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}