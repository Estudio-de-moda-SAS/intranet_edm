/**
 * @module globalAreaSearch.service
 *
 * Búsqueda de áreas corporativas (y subsitios ya catalogados) por
 * nombre, para el buscador general de la intranet.
 *
 * @remarks
 * A diferencia de la búsqueda de documentos, esta no llama a Graph — el
 * catálogo (`documentSites.ts`) ya está en memoria, así que la búsqueda
 * es instantánea. Solo cubre áreas que ya fueron agregadas al catálogo;
 * subsitios aún no catalogados no aparecerán aquí (ver limitación
 * conocida de descubrimiento de subsitios).
 */

import { DOCUMENT_SITES } from "../config/documentSites";

export interface GlobalAreaSearchResult {
  label: string;
  description: string;
  href: string;
  category: string;
  kind: "area";
}

const MAX_RESULTS = 5;

/**
 * Busca áreas del catálogo por nombre o descripción.
 */
export function searchAreasGlobal(query: string): GlobalAreaSearchResult[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return DOCUMENT_SITES.filter((department) => department.enabled)
    .filter(
      (department) =>
        department.name.toLowerCase().includes(normalized) ||
        (department.description ?? "").toLowerCase().includes(normalized)
    )
    .slice(0, MAX_RESULTS)
    .map((department) => ({
      label: department.name,
      description: department.description ?? "Área corporativa",
      href: `/departments/documents?source=corporate-sites&area=${encodeURIComponent(department.id)}`,
      category: "Carpetas Corporativas",
      kind: "area" as const,
    }));
}