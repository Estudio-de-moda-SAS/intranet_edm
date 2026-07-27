/**
 * @module globalDocumentSearch.service
 *
 * Búsqueda global de documentos vía Microsoft Search API, para alimentar
 * el buscador general de la intranet (`GlobalHeader`).
 *
 * @remarks
 * A diferencia de las demás fuentes del módulo (que navegan estructuras ya
 * conocidas), esta búsqueda cubre todo lo que Graph puede indexar y el
 * usuario tiene permiso de ver — incluyendo sitios que no forman parte del
 * catálogo curado de Áreas Corporativas.
 *
 * Por simplicidad y seguridad, solo los resultados que pertenecen al
 * OneDrive del propio usuario ofrecen navegación enriquecida (abrir la
 * carpeta y resaltar el archivo) dentro del módulo. Cualquier otro
 * resultado (compartidos, sitios de SharePoint) abre directamente el
 * documento en una pestaña nueva de SharePoint/Office.
 *
 * Requiere `Files.Read.All` (ya aprobado).
 */

import { graphPost } from "./graphClient";
import { getMyDriveId } from "./myDriveDiscovery.service";

const SEARCH_SCOPES = ["Files.Read.All"] as const;

interface GraphSearchHitResource {
  id: string;
  name?: string;
  webUrl?: string;
  parentReference?: {
    driveId?: string;
    id?: string;
    name?: string;
  };
}

interface GraphSearchHit {
  resource: GraphSearchHitResource;
}

interface GraphSearchHitsContainer {
  hits?: GraphSearchHit[];
}

interface GraphSearchResponseValue {
  hitsContainers?: GraphSearchHitsContainer[];
}

interface GraphSearchResponse {
  value: GraphSearchResponseValue[];
}

/** Resultado de búsqueda global, listo para el buscador de la intranet. */
export interface GlobalDocumentSearchResult {
  label: string;
  description: string;
  href: string;
  category: string;
}

function buildMyDriveHref(params: {
  folderId: string | null;
  highlightId: string;
}): string {
  const search = new URLSearchParams();
  search.set("source", "my-drive");
  if (params.folderId) search.set("folder", params.folderId);
  search.set("highlight", params.highlightId);
  return `/departments/documents?${search.toString()}`;
}

/**
 * Busca documentos por nombre a través de todo lo que el usuario tiene
 * acceso, usando Microsoft Search API.
 *
 * @param query - Texto de búsqueda ingresado por el usuario.
 */
export async function searchDocumentsGlobal(
  query: string
): Promise<GlobalDocumentSearchResult[]> {
  const normalized = query.trim();
  if (!normalized) return [];

  const [response, myDriveId] = await Promise.all([
    graphPost<GraphSearchResponse>(
      "/search/query",
      {
        requests: [
          {
            entityTypes: ["driveItem"],
            query: { queryString: normalized },
            from: 0,
            size: 8,
            fields: ["id", "name", "webUrl", "parentReference"],
          },
        ],
      },
      SEARCH_SCOPES
    ),
    getMyDriveId().catch(() => null),
  ]);

  const hits =
    response.value?.[0]?.hitsContainers?.[0]?.hits?.map(
      (hit) => hit.resource
    ) ?? [];

  return hits
    .filter((resource) => Boolean(resource.name))
    .map((resource) => {
      const isMyDrive =
        myDriveId !== null &&
        resource.parentReference?.driveId === myDriveId;

      const folderLabel = resource.parentReference?.name;

      const href = isMyDrive
        ? buildMyDriveHref({
            folderId: resource.parentReference?.id ?? null,
            highlightId: resource.id,
          })
        : resource.webUrl ?? "#";

      return {
        label: resource.name ?? "Documento",
        description: folderLabel
          ? `En ${folderLabel}`
          : "Documento de SharePoint",
        href,
        category: "Documentos",
      };
    });
}