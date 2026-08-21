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
    <div className="pdf-viewer-modal__meta-row">
      <span className="pdf-viewer-modal__meta-icon">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="pdf-viewer-modal__meta-body">
        <p className="pdf-viewer-modal__meta-label">{label}</p>
        <p className="pdf-viewer-modal__meta-value">{value}</p>
      </div>
    </div>
  );
}