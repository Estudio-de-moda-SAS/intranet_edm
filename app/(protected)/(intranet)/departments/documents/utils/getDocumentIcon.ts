/**
 * @module getDocumentIcon
 *
 * Resuelve el ícono y color representativo de un documento según su
 * extensión de archivo, para dar reconocimiento visual inmediato del
 * tipo de contenido en las listas del explorador.
 */

import {
  File as FileIconDefault,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Presentation,
  type LucideIcon,
} from "lucide-react";
import { getFileExtension } from "./formatDocumentMeta";

export interface DocumentIconInfo {
  icon: LucideIcon;
  colorClass: string;
}

const ICON_MAP: Record<string, DocumentIconInfo> = {
  PDF: { icon: FileText, colorClass: "text-red-500" },
  DOC: { icon: FileText, colorClass: "text-blue-600" },
  DOCX: { icon: FileText, colorClass: "text-blue-600" },
  XLS: { icon: FileSpreadsheet, colorClass: "text-emerald-600" },
  XLSX: { icon: FileSpreadsheet, colorClass: "text-emerald-600" },
  CSV: { icon: FileSpreadsheet, colorClass: "text-emerald-600" },
  PPT: { icon: Presentation, colorClass: "text-orange-600" },
  PPTX: { icon: Presentation, colorClass: "text-orange-600" },
  PNG: { icon: FileImage, colorClass: "text-purple-500" },
  JPG: { icon: FileImage, colorClass: "text-purple-500" },
  JPEG: { icon: FileImage, colorClass: "text-purple-500" },
  GIF: { icon: FileImage, colorClass: "text-purple-500" },
  SVG: { icon: FileImage, colorClass: "text-purple-500" },
  ZIP: { icon: FileArchive, colorClass: "text-amber-600" },
  RAR: { icon: FileArchive, colorClass: "text-amber-600" },
  MP4: { icon: FileVideo, colorClass: "text-pink-500" },
  MOV: { icon: FileVideo, colorClass: "text-pink-500" },
};

const DEFAULT_ICON: DocumentIconInfo = {
  icon: FileIconDefault,
  colorClass: "text-slate-500",
};

/**
 * Resuelve el ícono y clase de color de Tailwind representativos según
 * la extensión del nombre de archivo. Si la extensión no está mapeada,
 * retorna un ícono genérico neutro.
 */
export function getDocumentIcon(name: string): DocumentIconInfo {
  const extension = getFileExtension(name);
  return ICON_MAP[extension] ?? DEFAULT_ICON;
}
/**
 * Indica si una extensión de archivo corresponde a un tipo de documento
 * reconocido por la intranet (los mismos tipos mapeados con ícono).
 *
 * @remarks
 * Usado para filtrar ruido del índice de búsqueda de SharePoint (archivos
 * técnicos/de sistema como `.sql`, `.pdc`, etc. que no son documentos de
 * trabajo reales).
 */
export function isRecognizedDocumentExtension(name: string): boolean {
  const extension = getFileExtension(name);
  return extension in ICON_MAP;
}