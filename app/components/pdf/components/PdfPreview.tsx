import { usePrefersDark } from "../hooks/usePrefersDark";

/**
 * @module PdfViewerModal/components/PdfPreview
 * Previsualizador nativo para documentos PDF.
 */

interface PdfPreviewProps {
  /**
   * URL del PDF.
   */
  url: string;

  /**
   * Título del documento.
   */
  title: string;
}

/**
 * Previsualizador nativo de PDF.
 *
 * @param props Propiedades del componente.
 * @param props.url URL del PDF.
 * @param props.title Título del documento.
 * @returns `iframe` con visor de PDF.
 *
 * @remarks
 * En modo oscuro aplica `colorScheme: "dark"` cuando el navegador lo soporta.
 * En PDFs cross-origin este comportamiento puede no surtir efecto.
 */
export function PdfPreview({ url, title }: PdfPreviewProps) {
  const isDark = usePrefersDark();

  return (
    <div className={`flex-1 overflow-hidden w-full h-full ${isDark ? "p-3 bg-[#0d1117]" : ""}`}>
      <iframe
        src={url}
        className="w-full h-full border-0 rounded-sm"
        title={title}
        style={isDark ? { colorScheme: "dark" } : undefined}
      />
    </div>
  );
}