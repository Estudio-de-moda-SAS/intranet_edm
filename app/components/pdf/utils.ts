/**
 * @module PdfViewerModal/utils
 * Utilidades puras para identificación y transformación de URLs de documentos.
 */

/**
 * Extensiones soportadas para vista previa nativa de PDF.
 */
export const SUPPORTED_TYPES = [".pdf"];

/**
 * Extensiones de documentos Office soportadas vía Office Online.
 */
export const OFFICE_TYPES = [".xlsx", ".xls", ".docx", ".doc", ".pptx", ".ppt"];

/**
 * Obtiene la extensión de archivo a partir de una URL.
 *
 * @param url URL del archivo.
 * @returns Extensión normalizada en minúsculas o cadena vacía.
 */
export function getFileExtension(url: string): string {
  const base = url.split("?")[0] ?? "";
  return base.split(".").pop()?.toLowerCase() ?? "";
}

/**
 * Determina si una URL corresponde a un PDF soportado.
 *
 * @param url URL del archivo.
 * @returns `true` si la vista previa PDF es compatible.
 */
export function isSupported(url: string): boolean {
  return SUPPORTED_TYPES.some((ext) => url.endsWith(ext));
}

/**
 * Determina si una URL corresponde a un archivo Office o a un embed de Office.
 *
 * @param url URL del archivo.
 * @returns `true` si puede mostrarse en Office Online.
 */
export function isOfficeFile(url: string): boolean {
  if (url.includes("view.officeapps.live.com")) return true;
  if (url.includes("action=embedview")) return true;
  return OFFICE_TYPES.some((ext) => url.toLowerCase().endsWith(ext));
}

/**
 * Convierte una URL de archivo a una URL embebible para Office Online.
 *
 * @param url URL original del documento.
 * @returns URL adaptada para `view.officeapps.live.com`.
 */
export function toOfficeEmbedUrl(url: string): string {
  if (url.includes("view.officeapps.live.com")) return url;
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
}