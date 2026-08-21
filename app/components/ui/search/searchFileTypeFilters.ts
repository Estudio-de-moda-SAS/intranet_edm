/**
 * @module searchFileTypeFilters
 *
 * Filtros de tipo de archivo para el modal de búsqueda global.
 *
 * @remarks
 * Filtra únicamente resultados de la categoría "Documentos" — los
 * accesos a módulos (Aplicaciones, Tableros, etc.) no tienen tipo de
 * archivo, así que se ocultan cuando hay un filtro específico activo.
 */

import { getFileExtension } from '@/app/(protected)/(intranet)/departments/documents/utils/formatDocumentMeta';

export interface FileTypeFilterOption {
  id: string;
  label: string;
  extensions: string[];
}

export const FILE_TYPE_FILTERS: FileTypeFilterOption[] = [
  { id: 'all', label: 'Todos', extensions: [] },
  { id: 'word', label: 'Word', extensions: ['DOC', 'DOCX'] },
  { id: 'excel', label: 'Excel', extensions: ['XLS', 'XLSX', 'CSV'] },
  { id: 'powerpoint', label: 'PowerPoint', extensions: ['PPT', 'PPTX'] },
  { id: 'pdf', label: 'PDF', extensions: ['PDF'] },
  { id: 'image', label: 'Imágenes', extensions: ['PNG', 'JPG', 'JPEG', 'GIF', 'SVG'] },
];

interface FilterableResult {
  label: string;
  category?: string;
}

/**
 * Filtra una lista de resultados de búsqueda según el filtro de tipo
 * de archivo seleccionado. `'all'` no filtra nada.
 */
export function applyFileTypeFilter<T extends FilterableResult>(
  results: T[],
  filterId: string
): T[] {
  if (filterId === 'all') return results;

  const filter = FILE_TYPE_FILTERS.find((f) => f.id === filterId);
  if (!filter) return results;

  return results.filter((item) => {
    if (item.category !== 'Documentos') return false;
    const extension = getFileExtension(item.label);
    return filter.extensions.includes(extension);
  });
}