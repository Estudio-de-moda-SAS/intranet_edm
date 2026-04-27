/**
 * @module sharepoint
 * Tipos base para documentos y carpetas de SharePoint.
 */

/** Item obtenido desde una biblioteca de SharePoint vía Graph */
export interface SharePointDocument {
  /** ID único del item en Graph */
  id: string;
  /** Nombre completo del archivo o carpeta */
  name: string;
  /** Indica si es archivo o carpeta */
  kind: "file" | "folder";
  /** Extensión del archivo (sin punto). Vacío si es carpeta. */
  extension: string;
  /** Tamaño en bytes. 0 si es carpeta. */
  size: number;
  /** Fecha de última modificación (ISO 8601) */
  modifiedAt: string;
  /** Nombre del usuario que modificó el item */
  modifiedBy: string;
  /** URL pública de SharePoint para abrir en browser */
  webUrl: string;
  /** URL de descarga directa. Vacío si es carpeta. */
  downloadUrl: string;
  /**
   * URL de vista previa.
   * - PDF: URL directa para iframe
   * - Office (docx/xlsx/pptx): Office Online embed URL
   * - undefined: muestra placeholder hasta que Graph esté disponible
   * - No aplica para carpetas
   */
  previewUrl: string | undefined;
  /**
   * Cantidad de items dentro de la carpeta.
   * Solo presente cuando kind === "folder".
   */
  childCount?: number;
}