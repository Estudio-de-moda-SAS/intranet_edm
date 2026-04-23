"use client";

import { Download } from "lucide-react";

/**
 * @module ProductExportToolbar
 * Barra de acciones para exportación de reportes del módulo de Producto.
 */

/**
 * Propiedades del componente {@link ProductExportToolbar}.
 *
 * @property periodLabel Etiqueta del periodo asociado a la exportación.
 */
type ExportProps = { periodLabel: string };

/**
 * Barra de acciones para exportación de reportes del módulo.
 *
 * @param props Propiedades del componente.
 * @param props.periodLabel Periodo mostrado como contexto de exportación.
 * @returns Controles de exportación en formatos disponibles.
 *
 * @remarks
 * Este componente presenta acciones rápidas para exportar información
 * del módulo en distintos formatos.
 *
 * En la implementación actual, la exportación es simulada mediante logs,
 * por lo que funciona como placeholder de la experiencia final.
 *
 * En una versión productiva, podría conectarse con:
 * - generación de reportes Excel
 * - exportación a PDF
 * - servicios backend de reporting
 * - descargas asincrónicas
 *
 * @example
 * ```tsx
 * <ProductExportToolbar periodLabel="SS-25" />
 * ```
 */
export function ProductExportToolbar({ periodLabel }: ExportProps) {
  const handleExport = (format: "excel" | "pdf") => {
    console.log(`Exportando ${format} — ${periodLabel}`);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleExport("excel")}
        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-[11px] font-medium text-stone-600 hover:border-amber-300 hover:text-amber-700 transition-colors shadow-sm"
      >
        <Download className="h-3 w-3" />
        Excel
      </button>

      <button
        onClick={() => handleExport("pdf")}
        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-[11px] font-medium text-stone-600 hover:border-amber-300 hover:text-amber-700 transition-colors shadow-sm"
      >
        <Download className="h-3 w-3" />
        PDF
      </button>
    </div>
  );
}