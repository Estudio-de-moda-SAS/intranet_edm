/**
 * @module globalDocumentSearch.service
 *
 * Búsqueda global de documentos vía Microsoft Search API, para alimentar
 * el buscador general de la intranet (`GlobalHeader`).
 *
 * @remarks
 * Ejecuta dos búsquedas en paralelo, independientes entre sí:
 * - `driveItem` (archivos y carpetas) con el operador `filename:` para
 *   priorizar coincidencia de nombre, con respaldo a consulta simple.
 *   Los resultados de archivo se filtran a tipos reconocidos (Word,
 *   Excel, PowerPoint, PDF, imágenes, etc.) para eliminar ruido de
 *   archivos técnicos/de sistema indexados por SharePoint.
 * - `drive` (bibliotecas de documentos) con consulta simple y su propio
 *   conjunto de campos — `drive` no tiene `folder` ni `parentReference`,
 *   pedirlos causaba que esa búsqueda fallara silenciosamente.
 *
 * Las carpetas/bibliotecas del propio OneDrive del usuario navegan
 * directamente a su contenido; el resto de bibliotecas/carpetas de
 * SharePoint también navegan internamente usando `driveId` genérico.
 * Los archivos fuera de OneDrive abren en pestaña externa.
 *
 * Prioriza coincidencias por nombre, con caché en memoria de 60 segundos.
 * Requiere `Files.Read.All` (ya aprobado).
 */

import { graphPost } from "./graphClient";
import { getMyDriveId } from "./myDriveDiscovery.service";
import { isRecognizedDocumentExtension } from "../utils/getDocumentIcon";

const SEARCH_SCOPES = ["Files.Read.All"] as const;
const SEARCH_CACHE_TTL_MS = 60_000;
const MAX_RESULTS = 10;

const DRIVE_ITEM_FIELDS = [
  "id",
  "name",
  "webUrl",
  "size",
  "lastModifiedDateTime",
  "folder",
  "parentReference",
];

const DRIVE_FIELDS = ["id", "name", "webUrl", "lastModifiedDateTime"];

interface GraphSearchHitResource {
  id: string;
  name?: string;
  webUrl?: string;
  size?: number;
  lastModifiedDateTime?: string;
  folder?: { childCount?: number };
  parentReference?: {
    driveId?: string;
    id?: string;
    name?: string;
    path?: string;
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
  kind: "file" | "folder" | "library";
  pathSegments?: string[];
  size?: number;
  lastModifiedDateTime?: string;
}

interface SearchCacheEntry {
  timestamp: number;
  results: GlobalDocumentSearchResult[];
}

const searchCache = new Map<string, SearchCacheEntry>();

function buildMyDriveFileHref(params: {
  folderId: string | null;
  highlightId: string;
}): string {
  const search = new URLSearchParams();
  search.set("source", "my-drive");
  if (params.folderId) search.set("folder", params.folderId);
  search.set("highlight", params.highlightId);
  return `/departments/documents?${search.toString()}`;
}

function buildMyDriveFolderHref(folderId: string | null): string {
  const search = new URLSearchParams();
  search.set("source", "my-drive");
  if (folderId) search.set("folder", folderId);
  return `/departments/documents?${search.toString()}`;
}

function buildGenericFolderHref(driveId: string, folderId: string): string {
  const search = new URLSearchParams();
  search.set("source", "corporate-sites");
  search.set("driveId", driveId);
  search.set("folder", folderId);
  return `/departments/documents?${search.toString()}`;
}

function buildGenericLibraryHref(driveId: string): string {
  const search = new URLSearchParams();
  search.set("source", "corporate-sites");
  search.set("driveId", driveId);
  return `/departments/documents?${search.toString()}`;
}

function extractPathSegments(path?: string): string[] {
  if (!path) return [];

  const marker = "root:";
  const markerIndex = path.indexOf(marker);
  const relevant = markerIndex >= 0 ? path.slice(markerIndex + marker.length) : path;

  return relevant
    .split("/")
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .filter(Boolean);
}

async function runSearchQuery(
  queryString: string,
  entityTypes: readonly string[],
  fields: readonly string[]
): Promise<GraphSearchHitResource[]> {
  const response = await graphPost<GraphSearchResponse>(
    "/search/query",
    {
      requests: [
        {
          entityTypes,
          query: { queryString },
          from: 0,
          size: 20,
          fields,
        },
      ],
    },
    SEARCH_SCOPES
  );

  return (
    response.value?.[0]?.hitsContainers?.[0]?.hits?.map(
      (hit) => hit.resource
    ) ?? []
  );
}

/**
 * Busca archivos y carpetas (`driveItem`), priorizando nombre de archivo.
 *
 * @remarks
 * Los resultados de tipo archivo (no carpeta) se filtran a extensiones
 * reconocidas, para eliminar ruido de archivos técnicos indexados por
 * SharePoint (`.sql`, `.pdc`, etc.) que no son documentos de trabajo.
 */
async function searchFilesAndFolders(
  normalized: string
): Promise<GraphSearchHitResource[]> {
  let hits = await runSearchQuery(
    `filename:${normalized}`,
    ["driveItem"],
    DRIVE_ITEM_FIELDS
  );

  if (hits.length === 0) {
    hits = await runSearchQuery(normalized, ["driveItem"], DRIVE_ITEM_FIELDS);
  }

  return hits.filter((resource) => {
    if (resource.folder) return true;
    return resource.name ? isRecognizedDocumentExtension(resource.name) : false;
  });
}

/**
 * Busca bibliotecas de documentos (`drive`).
 *
 * @remarks
 * `drive` no soporta el operador `filename:` ni los campos `folder`/
 * `parentReference` (son exclusivos de `driveItem`) — requiere su propio
 * conjunto de campos y una consulta simple con un término contenido en
 * el nombre de la biblioteca.
 *
 * A diferencia del resto de este servicio, esta búsqueda específica se
 * ejecuta contra el endpoint `beta` de Graph — la búsqueda de `drive` no
 * responde de forma confiable en v1.0 (limitación documentada de la
 * plataforma, no de nuestro código). El resto del módulo sigue usando
 * v1.0 sin cambios.
 */
async function searchLibraries(
  normalized: string
): Promise<GraphSearchHitResource[]> {
  try {
    const response = await graphPost<GraphSearchResponse>(
      "https://graph.microsoft.com/beta/search/query",
      {
        requests: [
          {
            entityTypes: ["drive"],
            query: { queryString: normalized },
            from: 0,
            size: 20,
            fields: DRIVE_FIELDS,
          },
        ],
      },
      SEARCH_SCOPES
    );

    return (
      response.value?.[0]?.hitsContainers?.[0]?.hits?.map(
        (hit) => hit.resource
      ) ?? []
    );
  } catch (libraryError) {
    console.error("[globalDocumentSearch] library search", libraryError);
    return [];
  }
}
function rankByNameMatch(
  resources: GraphSearchHitResource[],
  normalizedQuery: string
): GraphSearchHitResource[] {
  const query = normalizedQuery.toLowerCase();

  const score = (resource: GraphSearchHitResource) => {
    const name = (resource.name ?? "").toLowerCase();
    if (name === query) return 0;
    if (name.startsWith(query)) return 1;
    if (name.includes(query)) return 2;
    return 3;
  };

  return [...resources].sort((a, b) => score(a) - score(b));
}

function mapFileOrFolder(
  resource: GraphSearchHitResource,
  myDriveId: string | null
): GlobalDocumentSearchResult {
  const isMyDrive =
    myDriveId !== null && resource.parentReference?.driveId === myDriveId;

  const isFolder = Boolean(resource.folder);
  const pathSegments = extractPathSegments(resource.parentReference?.path);
  const folderLabel = resource.parentReference?.name;
  const driveId = resource.parentReference?.driveId;

  const href = isFolder
    ? isMyDrive
      ? buildMyDriveFolderHref(resource.id)
      : driveId
        ? buildGenericFolderHref(driveId, resource.id)
        : resource.webUrl ?? "#"
    : isMyDrive
      ? buildMyDriveFileHref({
          folderId: resource.parentReference?.id ?? null,
          highlightId: resource.id,
        })
      : resource.webUrl ?? "#";

  const description = isFolder
    ? `${resource.folder?.childCount ?? 0} elementos`
    : pathSegments.join(" / ") || folderLabel || "";

  return {
    label: resource.name ?? "Documento",
    description,
    href,
    category: "Documentos",
    kind: isFolder ? "folder" : "file",
    ...(pathSegments.length > 0
      ? { pathSegments }
      : folderLabel
        ? { pathSegments: [folderLabel] }
        : {}),
    ...(!isFolder && resource.size !== undefined && { size: resource.size }),
    ...(resource.lastModifiedDateTime !== undefined && {
      lastModifiedDateTime: resource.lastModifiedDateTime,
    }),
  };
}

function mapLibrary(
  resource: GraphSearchHitResource,
  myDriveId: string | null
): GlobalDocumentSearchResult {
  const isMyDrive = myDriveId !== null && resource.id === myDriveId;

  const href = isMyDrive
    ? buildMyDriveFolderHref(null)
    : buildGenericLibraryHref(resource.id);

  return {
    label: resource.name ?? "Biblioteca",
    description: "Biblioteca de documentos",
    href,
    category: "Documentos",
    kind: "library",
  };
}

/**
 * Busca archivos, carpetas y bibliotecas por nombre a través de todo lo
 * que el usuario tiene acceso, usando Microsoft Search API.
 */
export async function searchDocumentsGlobal(
  query: string
): Promise<GlobalDocumentSearchResult[]> {
  const normalized = query.trim();
  if (!normalized) return [];

  const cacheKey = normalized.toLowerCase();
  const cached = searchCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_TTL_MS) {
    return cached.results;
  }

  const [myDriveId, fileHits, libraryHits] = await Promise.all([
    getMyDriveId().catch(() => null),
    searchFilesAndFolders(normalized),
    searchLibraries(normalized),
  ]);

  const rankedFiles = rankByNameMatch(fileHits, normalized);
  const rankedLibraries = rankByNameMatch(libraryHits, normalized);

  const results = [
    ...rankedLibraries.map((resource) => mapLibrary(resource, myDriveId)),
    ...rankedFiles.map((resource) => mapFileOrFolder(resource, myDriveId)),
  ].slice(0, MAX_RESULTS);

  searchCache.set(cacheKey, { timestamp: Date.now(), results });

  return results;
}