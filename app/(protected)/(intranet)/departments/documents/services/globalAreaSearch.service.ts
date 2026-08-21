/**
 * @module globalAreaSearch.service
 *
 * Búsqueda de áreas corporativas (y subsitios ya catalogados) por
 * nombre, para el buscador general de la intranet.
 *
 * @remarks
 * El catálogo (`documentCatalog.service.ts`) se resuelve dinámicamente
 * contra Microsoft Graph y se cachea en memoria — la primera búsqueda de
 * la sesión dispara esa carga, las siguientes reutilizan la caché y son
 * prácticamente instantáneas. Por eso esta función es async: ya no hay
 * forma de garantizar que el catálogo esté disponible de forma síncrona
 * como cuando era un array estático en `documentSites.ts`.
 *
 * Solo cubre áreas que el catálogo dinámico logra descubrir; subsitios
 * aún no catalogados no aparecerán aquí (ver limitación conocida de
 * descubrimiento de subsitios en `documentCatalog.service.ts`).
 */

import { getDocumentDepartments } from "./documentCatalog.service";

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
 *
 * @remarks
 * Ahora es async: el catálogo se resuelve contra Graph (con caché en
 * memoria) en vez de leerse de un array estático en el módulo.
 */
export async function searchAreasGlobal(
  query: string
): Promise<GlobalAreaSearchResult[]> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const departments = await getDocumentDepartments();

  return departments
    .filter((department) => department.enabled)
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