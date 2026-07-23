/**
 * @module mapDocumentItemToPdfMetadata
 *
 * Adaptador entre el modelo documental unificado ({@link DocumentItem}) y
 * los metadatos que consume {@link PdfViewerModal} ({@link PdfMetadata}).
 */

import type { DocumentItem } from "../types/document.types";
import type { PdfMetadata } from "@/app/components/pdf/types";  
import { formatFileSize, formatShortDate } from "./formatDocumentMeta";

/**
 * Convierte un {@link DocumentItem} a {@link PdfMetadata}, para poder
 * abrirlo directamente en el visor de documentos.
 *
 * @param item - Documento seleccionado en el explorador.
 * @param previewUrl - URL de previsualización resuelta vía Graph
 * (puede llegar `undefined` mientras la petición está en curso).
 */
export function mapDocumentItemToPdfMetadata(
  item: DocumentItem,
  previewUrl?: string
): PdfMetadata {
  return {
    id: item.id,
    title: item.name,
    ...(item.mimeType !== undefined && { category: item.mimeType }),
    ...(item.sharedBy !== undefined && { author: item.sharedBy }),
    size: formatFileSize(item.size),
    updatedAt: formatShortDate(item.lastModifiedDateTime),
    ...(previewUrl !== undefined && { previewUrl }),
    ...(item.downloadUrl !== undefined && { downloadUrl: item.downloadUrl }),
  };
}