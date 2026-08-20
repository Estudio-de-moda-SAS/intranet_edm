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
 *
 * No se aplica ningún parámetro de zoom en la URL: el fragmento `#zoom=`
 * de PDF.js/visores nativos no se respeta de forma consistente entre
 * navegadores dentro de un `iframe`, así que se retiró el control de zoom
 * de la toolbar en vez de dejar un botón que aparentaba funcionar sin
 * hacerlo.
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