/**
 * @module PdfViewerModal/types
 * Tipos compartidos del visor de documentos.
 */

/**
 * Metadatos del documento a visualizar en el modal.
 *
 * @remarks
 * Este modelo concentra tanto la información descriptiva del archivo
 * como las URLs necesarias para previsualización y descarga.
 */
export interface PdfMetadata {
  /**
   * Identificador único del documento.
   */
  id: string;

  /**
   * Título visible del documento.
   */
  title: string;

  /**
   * Categoría funcional o documental.
   */
  category?: string;

  /**
   * Autor o responsable del documento.
   */
  author?: string;

  /**
   * Versión visible del archivo.
   */
  version?: string;

  /**
   * Tamaño legible del documento.
   */
  size?: string;

  /**
   * Fecha de actualización visible.
   */
  updatedAt?: string;

  /**
   * Indica si el acceso al documento está restringido.
   */
  restricted?: boolean;

  /**
   * URL de previsualización del documento.
   */
  previewUrl?: string;

  /**
   * URL de descarga directa del documento.
   */
  downloadUrl?: string;
}

/**
 * Props del componente {@link PdfViewerModal}.
 */
export interface PdfViewerModalProps {
  /**
   * Controla si el modal está abierto.
   */
  open: boolean;

  /**
   * Callback para cerrar el modal.
   */
  onClose: () => void;

  /**
   * Documento actualmente seleccionado.
   */
  metadata: PdfMetadata | null;
}