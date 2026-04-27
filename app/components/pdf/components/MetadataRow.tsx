import React from "react";

/**
 * @module PdfViewerModal/components/MetadataRow
 * Fila visual para mostrar metadatos en el sidebar.
 */

interface MetadataRowProps {
  /**
   * Componente de ícono a renderizar.
   */
  icon: React.ElementType;

  /**
   * Etiqueta del metadato.
   */
  label: string;

  /**
   * Valor visible del metadato.
   */
  value: React.ReactNode;
}

/**
 * Fila de metadato usada en el sidebar lateral.
 *
 * @param props Propiedades del componente.
 * @returns Fila visual con ícono, etiqueta y valor.
 */
export function MetadataRow({ icon: Icon, label, value }: MetadataRowProps) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-0
                    border-slate-100 dark:border-[#21262d]">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md
                       border bg-slate-50 border-slate-200
                       dark:bg-[#21262d] dark:border-[#30363d]">
        <Icon className="h-3.5 w-3.5 text-slate-400 dark:text-[#545d68]" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide font-semibold
                      text-slate-400 dark:text-[#545d68]">
          {label}
        </p>
        <p className="text-[12px] font-medium mt-0.5 break-words
                      text-slate-700 dark:text-[#cdd9e5]">
          {value}
        </p>
      </div>
    </div>
  );
}