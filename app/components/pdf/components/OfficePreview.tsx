import { AlertCircle } from "lucide-react";
import { usePrefersDark } from "../hooks/usePrefersDark";
import { toOfficeEmbedUrl } from "../utils";

/**
 * @module PdfViewerModal/components/OfficePreview
 * Previsualizador de archivos Office embebidos.
 */

interface OfficePreviewProps {
  /**
   * URL del documento.
   */
  url: string;

  /**
   * Título del documento.
   */
  title: string;
}

/**
 * Previsualizador para archivos Office mediante Office Online.
 *
 * @param props Propiedades del componente.
 * @param props.url URL del documento.
 * @param props.title Título del documento.
 * @returns `iframe` embebido de Office Online.
 *
 * @remarks
 * Office Online no respeta modo oscuro, por lo que en dark mode
 * se muestra un aviso contextual al usuario.
 */
export function OfficePreview({ url, title }: OfficePreviewProps) {
  const isDark = usePrefersDark();

  return (
    <div className="flex flex-col w-full h-full">
      {isDark && (
        <div className="pdf-viewer-modal__office-warning">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <p>
            Office Online no admite modo oscuro — el documento se muestra en tema claro
            independientemente de tu preferencia.
          </p>
        </div>
      )}
      <iframe
        src={toOfficeEmbedUrl(url)}
        className="w-full flex-1 border-0"
        title={title}
        frameBorder="0"
        allowFullScreen
      />
    </div>
  );
}