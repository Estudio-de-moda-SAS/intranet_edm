/**
 * @module documentCatalog.service
 *
 * Servicios del catálogo documental corporativo.
 *
 * @remarks
 * Este módulo constituye la única puerta de acceso al catálogo de áreas
 * documentales de la Intranet.
 *
 * El catálogo se construye a partir de la lista explícita de sitios de
 * gerencia ({@link DOCUMENT_SITES}): cada URL se resuelve vía Microsoft
 * Graph en paralelo y se enriquece con su cosmética. Los sitios que fallen
 * (sin permiso, URL inexistente) se descartan en silencio, de modo que cada
 * usuario solo ve las gerencias a las que tiene acceso. El resultado se
 * cachea en memoria; {@link invalidateDocumentDepartmentsCache} fuerza un
 * refetch.
 */

import {
  DOCUMENT_SITES,
  normalizeDepartmentKey,
} from "../config/documentSites";
import { resolveSharePointSiteByUrl } from "./sharepointDiscovery.service";
import type { DocumentDepartment } from "../types/documentDepartment.types";

let cachedDepartments: readonly DocumentDepartment[] | null = null;
let pendingFetch: Promise<readonly DocumentDepartment[]> | null = null;

/** Fuerza que la próxima llamada al catálogo vuelva a consultar Graph. */
export function invalidateDocumentDepartmentsCache(): void {
  cachedDepartments = null;
  pendingFetch = null;
}

async function fetchDepartmentsFromGraph(): Promise<
  readonly DocumentDepartment[]
> {
  const results = await Promise.allSettled(
    DOCUMENT_SITES.map(async (config) => ({
      config,
      site: await resolveSharePointSiteByUrl(config.url),
    }))
  );

  return results.flatMap((result, index): DocumentDepartment[] => {
    // 403/404: el usuario no tiene acceso a esa gerencia (o la URL ya no
    // existe). Se omite sin romper el resto del catálogo.
    if (result.status === "rejected") return [];

    const { config, site } = result.value;
    const name =
      config.name ?? site.displayName ?? site.name ?? "Área sin nombre";

    return [
      {
        id: config.id ?? normalizeDepartmentKey(name),
        name,
        siteId: site.id,
        siteUrl: site.webUrl ?? config.url,
        ...(config.description ? { description: config.description } : {}),
        ...(config.icon ? { icon: config.icon } : {}),
        ...(config.accentColor ? { accentColor: config.accentColor } : {}),
        order: index + 1,
        enabled: true,
      },
    ];
  });
}

/**
 * Obtiene el catálogo completo de áreas documentales, usando la caché en
 * memoria cuando está disponible.
 */
async function loadCatalog(): Promise<readonly DocumentDepartment[]> {
  if (cachedDepartments) return cachedDepartments;

  if (!pendingFetch) {
    pendingFetch = fetchDepartmentsFromGraph()
      .then((departments) => {
        cachedDepartments = departments;
        return departments;
      })
      .finally(() => {
        pendingFetch = null;
      });
  }

  return pendingFetch;
}

/**
 * Obtiene todas las áreas documentales habilitadas.
 *
 * @returns Colección ordenada de áreas disponibles.
 *
 * @remarks
 * Este método representa la fuente oficial de información utilizada por
 * el Sidebar del módulo documental.
 */
export async function getDocumentDepartments(): Promise<
  readonly DocumentDepartment[]
> {
  return loadCatalog();
}

/**
 * Obtiene una única área documental mediante su identificador.
 *
 * @param id Identificador interno del departamento.
 *
 * @returns Área encontrada o `null` si no existe.
 */
export async function getDocumentDepartmentById(
  id: string
): Promise<DocumentDepartment | null> {
  const departments = await loadCatalog();
  return departments.find((department) => department.id === id) ?? null;
}

/**
 * Busca áreas documentales utilizando coincidencias parciales.
 *
 * @param searchTerm Texto ingresado por el usuario.
 *
 * @returns Áreas cuyo nombre contiene el texto buscado.
 *
 * @remarks
 * La búsqueda es insensible a mayúsculas y minúsculas.
 */
export async function searchDocumentDepartments(
  searchTerm: string
): Promise<readonly DocumentDepartment[]> {
  const normalizedTerm = searchTerm.trim().toLowerCase();

  const departments = await loadCatalog();

  if (!normalizedTerm) {
    return departments;
  }

  return departments.filter((department) =>
    department.name.toLowerCase().includes(normalizedTerm)
  );
}
