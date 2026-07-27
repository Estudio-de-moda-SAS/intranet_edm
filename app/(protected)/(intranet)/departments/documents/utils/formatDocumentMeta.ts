/**
 * @module formatDocumentMeta
 *
 * Utilidades de formato para metadatos de documentos (tamaño, fecha).
 */

/**
 * Formatea un tamaño en bytes a una unidad legible (KB, MB, GB).
 */
export function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === 0) return "—";

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  const value = bytes / Math.pow(1024, exponent);

  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

/**
 * Formatea una fecha ISO de Graph a formato corto `dd/mm/aaaa`.
 */
export function formatShortDate(isoDate?: string): string {
  if (!isoDate) return "—";

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Deriva una extensión legible a partir del nombre del archivo,
 * para mostrar como badge/ícono tipado en la lista.
 */
export function getFileExtension(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? (parts.at(-1) ?? "").toUpperCase() : "";
}