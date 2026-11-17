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
 * usuario solo ve las gerencias a las que tiene acceso. Si el usuario no
 * tiene acceso a una gerencia pero sí a alguno de sus subsitios, éstos se
 * encuentran con la búsqueda de Graph y se muestran en su lugar, con la
 * cosmética de la gerencia. El resultado se
 * cachea en memoria; {@link invalidateDocumentDepartmentsCache} fuerza un
 * refetch.
 */

import {
  DOCUMENT_SITES,
  normalizeDepartmentKey,
  type DocumentSiteConfig,
} from "../config/documentSites";
import { GraphApiError } from "./graphClient";
import {
  parseSharePointSiteUrl,
  resolveSharePointSiteByUrl,
  searchAccessibleSharePointSites,
  type SharePointSiteDiscoveryResult,
} from "./sharepointDiscovery.service";
import type { DocumentDepartment } from "../types/documentDepartment.types";

let cachedDepartments: readonly DocumentDepartment[] | null = null;
let pendingFetch: Promise<readonly DocumentDepartment[]> | null = null;

/** Fuerza que la próxima llamada al catálogo vuelva a consultar Graph. */
export function invalidateDocumentDepartmentsCache(): void {
  cachedDepartments = null;
  pendingFetch = null;
}

interface CatalogEntry {
  config: DocumentSiteConfig;
  site: SharePointSiteDiscoveryResult;
  /** `true` si se encontró por búsqueda bajo una gerencia sin acceso. */
  isFallback: boolean;
}

/** 403/404: el usuario no puede ver ese sitio (o la URL no existe). */
function isNoAccessError(reason: unknown): boolean {
  return (
    reason instanceof GraphApiError &&
    (reason.status === 403 || reason.status === 404)
  );
}

/** Clave comparable de una URL de sitio: `host/ruta`, en minúsculas y decodificada. */
function siteUrlKey(siteUrl: string): string | null {
  try {
    const { hostname, serverRelativePath } = parseSharePointSiteUrl(siteUrl);
    return decodeURIComponent(`${hostname}${serverRelativePath}`).toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Subsitios accesibles que cuelgan de `parentUrl`, quedándose solo con los
 * de nivel más alto (los más profundos se alcanzan navegando desde ellos).
 */
function findTopmostAccessibleSubsites(
  parentUrl: string,
  accessibleSites: readonly SharePointSiteDiscoveryResult[]
): SharePointSiteDiscoveryResult[] {
  const parentKey = siteUrlKey(parentUrl);
  if (!parentKey) return [];

  const candidates = accessibleSites.flatMap((site) => {
    const key = site.webUrl ? siteUrlKey(site.webUrl) : null;
    return key?.startsWith(`${parentKey}/`) ? [{ site, key }] : [];
  });

  return candidates
    .filter(
      (candidate) =>
        !candidates.some((other) =>
          candidate.key.startsWith(`${other.key}/`)
        )
    )
    .map((candidate) => candidate.site);
}

async function fetchDepartmentsFromGraph(): Promise<
  readonly DocumentDepartment[]
> {
  const results = await Promise.allSettled(
    DOCUMENT_SITES.map((config) => resolveSharePointSiteByUrl(config.url))
  );

  // Respaldo: si el usuario no tiene acceso a alguna gerencia, puede que sí
  // lo tenga a uno de sus subsitios. Solo se consulta la búsqueda cuando
  // hace falta, y una sola vez para todas las gerencias.
  const needsFallback = results.some(
    (result) => result.status === "rejected" && isNoAccessError(result.reason)
  );
  const accessibleSites = needsFallback
    ? await searchAccessibleSharePointSites().catch((error: unknown) => {
        console.error("[Document Catalog] searchAccessibleSites", error);
        return [];
      })
    : [];

  const explicitSiteIds = new Set(
    results.flatMap((result) =>
      result.status === "fulfilled" ? [result.value.id] : []
    )
  );

  const entries = results.flatMap((result, index): CatalogEntry[] => {
    const config = DOCUMENT_SITES[index];
    if (!config) return [];

    if (result.status === "fulfilled") {
      return [{ config, site: result.value, isFallback: false }];
    }

    // Cualquier otro error (red, 5xx) se omite sin romper el catálogo.
    if (!isNoAccessError(result.reason)) return [];

    return findTopmostAccessibleSubsites(config.url, accessibleSites)
      // Un subsitio listado explícitamente en DOCUMENT_SITES ya aparece por sí mismo.
      .filter((site) => !explicitSiteIds.has(site.id))
      .map((site) => ({ config, site, isFallback: true }));
  });

  const seenSiteIds = new Set<string>();
  const usedIds = new Set<string>();

  return entries.flatMap(({ config, site, isFallback }): DocumentDepartment[] => {
    if (seenSiteIds.has(site.id)) return [];
    seenSiteIds.add(site.id);

    // En un subsitio de respaldo, `name`, `id` y `description` de la
    // config describen a la gerencia principal; solo se hereda la cosmética.
    const name =
      (isFallback ? undefined : config.name) ??
      site.displayName ??
      site.name ??
      "Área sin nombre";

    const baseId =
      (isFallback ? undefined : config.id) ?? normalizeDepartmentKey(name);
    let id = baseId;
    for (let suffix = 2; usedIds.has(id); suffix += 1) {
      id = `${baseId}-${suffix}`;
    }
    usedIds.add(id);

    const description = isFallback ? undefined : config.description;

    return [
      {
        id,
        name,
        siteId: site.id,
        siteUrl: site.webUrl ?? config.url,
        ...(description ? { description } : {}),
        ...(config.icon ? { icon: config.icon } : {}),
        ...(config.accentColor ? { accentColor: config.accentColor } : {}),
        order: usedIds.size,
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
