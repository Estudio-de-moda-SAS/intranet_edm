/**
 * @module documentCatalog.service
 *
 * Servicios del catálogo documental corporativo.
 *
 * @remarks
 * Este módulo constituye la única puerta de acceso al catálogo de áreas
 * documentales de la Intranet.
 *
 * El catálogo se descubre dinámicamente vía Microsoft Graph: se listan los
 * subsitios directos de {@link DOCUMENTS_ROOT_SITE_ID} (`getSharePointSubsites`)
 * y se enriquecen con la cosmética curada en `documentSites.ts`. El
 * resultado se cachea en memoria para no repetir la llamada a Graph en cada
 * render; {@link invalidateDocumentDepartmentsCache} fuerza un refetch.
 */

import {
  DEFAULT_DEPARTMENT_ORDER_BASE,
  DEPARTMENT_OVERRIDES,
  DOCUMENTS_ROOT_SITE_ID,
  EXCLUDED_SUBSITE_KEYS,
  normalizeDepartmentKey,
} from "../config/documentSites";
import { getSharePointSubsites } from "./sharepointDiscovery.service";
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
  const subsites = await getSharePointSubsites(DOCUMENTS_ROOT_SITE_ID);

  const excluded = new Set(EXCLUDED_SUBSITE_KEYS);

  const departments = subsites
    .map((subsite) => {
      const name = subsite.displayName ?? subsite.name ?? "Área sin nombre";
      const key = normalizeDepartmentKey(name);
      return { subsite, name, key };
    })
    .filter(({ key }) => !excluded.has(key))
    .map(({ subsite, name, key }, index): DocumentDepartment => {
      const override = DEPARTMENT_OVERRIDES[key];

      return {
        id: key,
        name,
        siteId: subsite.id,
        siteUrl: subsite.webUrl ?? "",
        ...(override?.description ? { description: override.description } : {}),
        ...(override?.icon ? { icon: override.icon } : {}),
        ...(override?.accentColor ? { accentColor: override.accentColor } : {}),
        order: override?.order ?? DEFAULT_DEPARTMENT_ORDER_BASE + index,
        enabled: true,
      };
    });

  return departments.sort(
    (left, right) => left.order - right.order || left.name.localeCompare(right.name, "es")
  );
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
