/**
 * @module sharepointDiscovery.service
 *
 * Servicio de descubrimiento de sitios y bibliotecas de SharePoint.
 *
 * @remarks
 * Se conserva para dos propósitos:
 * - Alimentar la herramienta interna de descubrimiento (SharePoint Explorer),
 *   utilizada únicamente en desarrollo para identificar `siteId`s.
 * - Servir como fuente documental `corporate-sites` (Áreas Corporativas),
 *   una vez que el catálogo oficial de sitios (`documentSites.ts`) resuelve
 *   el `siteId` de cada área y el usuario selecciona una biblioteca.
 *
 * La navegación de contenido (raíz y carpetas) y la previsualización delegan
 * en {@link driveNavigation.service} para compartir lógica con las demás
 * fuentes documentales del explorador.
 *
 * Requiere el scope `Sites.Read.All`.
 */

import { getAccessToken } from "@/app/api/auth/msal";
import {
  getDocumentPreviewUrl,
  getDriveFolderChildren,
  getDriveRootChildren,
  uploadFileToDriveFolder
} from "./driveNavigation.service";
import type { DocumentItem } from "../types/document.types";

const GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";

const SHAREPOINT_DISCOVERY_SCOPES = ["Sites.Read.All"] as const;

const DEFAULT_SITE_SEARCH_TERMS = [
  "documentos",
  "recursos",
  "humanos",
  "talento",
  "capital",
  "juridico",
  "legal",
  "tecnologia",
  "sistemas",
  "ti",
  "comercial",
  "ventas",
  "finanzas",
  "contabilidad",
  "logistica",
  "compras",
  "operaciones",
  "administrativo",
  "administracion",
  "marketing",
  "mercadeo",
];

export interface SharePointSiteDiscoveryResult {
  id: string;
  name?: string;
  displayName?: string;
  description?: string;
  webUrl?: string;
  createdDateTime?: string;
  lastModifiedDateTime?: string;
}

export interface SharePointDriveDiscoveryResult {
  id: string;
  name?: string;
  description?: string;
  webUrl?: string;
  driveType?: string;
  createdDateTime?: string;
  lastModifiedDateTime?: string;
}

interface GraphCollectionResponse<T> {
  value: T[];
  "@odata.nextLink"?: string;
}

/**
 * Error de una llamada a Graph que sí llegó a responder (a diferencia de un
 * error de red). Conserva el status HTTP para que el llamador pueda
 * distinguir, por ejemplo, un 403 (sin permiso sobre ese recurso puntual)
 * de otros fallos que sí deban propagarse como error real.
 */
export class GraphRequestError extends Error {
  readonly status: number;

  constructor(status: number, statusText: string) {
    super(`[SharePoint Graph] ${status} ${statusText}`);
    this.name = "GraphRequestError";
    this.status = status;
  }
}

async function getSharePointToken() {
  return getAccessToken({
    silentExtraScopesToConsent: Array.from(SHAREPOINT_DISCOVERY_SCOPES),
  });
}

async function graphFetch<T>(pathOrUrl: string): Promise<T> {
  const token = await getSharePointToken();

  const url = pathOrUrl.startsWith("https://")
    ? pathOrUrl
    : `${GRAPH_BASE_URL}${pathOrUrl}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new GraphRequestError(response.status, response.statusText);
  }

  return response.json() as Promise<T>;
}

async function graphFetchCollection<T>(
  path: string,
  maxPages = 3
): Promise<T[]> {
  const results: T[] = [];
  let nextUrl: string | undefined = path;
  let currentPage = 0;

  while (nextUrl && currentPage < maxPages) {
    const response: GraphCollectionResponse<T> =
      await graphFetch<GraphCollectionResponse<T>>(nextUrl);

    results.push(...response.value);
    nextUrl = response["@odata.nextLink"];
    currentPage += 1;
  }

  return results;
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const map = new Map<string, T>();

  items.forEach((item) => {
    map.set(item.id, item);
  });

  return Array.from(map.values());
}

function sortByName<T extends { name?: string; displayName?: string }>(
  items: T[]
) {
  return [...items].sort((a, b) =>
    (a.displayName ?? a.name ?? "").localeCompare(
      b.displayName ?? b.name ?? "",
      "es"
    )
  );
}

export async function searchSharePointSites(
  query: string
): Promise<SharePointSiteDiscoveryResult[]> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const sites = await graphFetchCollection<SharePointSiteDiscoveryResult>(
    `/sites?search=${encodeURIComponent(normalizedQuery)}`,
    2
  );

  return sortByName(sites);
}

export async function discoverSharePointSites(
  searchTerms = DEFAULT_SITE_SEARCH_TERMS
): Promise<SharePointSiteDiscoveryResult[]> {
  const results = await Promise.allSettled(
    searchTerms.map((term) => searchSharePointSites(term))
  );

  const sites = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  );

  return sortByName(uniqueById(sites));
}

/**
 * Resuelve un sitio de SharePoint de forma directa y determinística a
 * partir de su URL real (no depende del índice de búsqueda de `/sites`).
 *
 * @remarks
 * Equivale a `GET /sites/{hostname}:/{server-relative-path}`. Útil cuando
 * el sitio no aparece en `searchSharePointSites`/`discoverSharePointSites`
 * por limitaciones del índice de búsqueda de Graph.
 *
 * Descarta automáticamente el último segmento de la ruta si corresponde
 * a una página o archivo (ej. `default.aspx`, `Forms/AllItems.aspx`),
 * quedándose solo con la ruta real del sitio o subsitio.
 *
 * @param siteUrl - URL completa del sitio, puede incluir una página al
 * final, ej. `https://estudiodemoda.sharepoint.com/sites/FS/Cadena%20Abastecimiento/default.aspx`.
 */
export async function resolveSharePointSiteByUrl(
  siteUrl: string
): Promise<SharePointSiteDiscoveryResult> {
  const url = new URL(siteUrl.trim());
  const hostname = url.hostname;

  const segments = url.pathname
    .replace(/\/+$/, "")
    .split("/")
    .filter(Boolean);

  // Si el último segmento contiene un punto (ej. "default.aspx",
  // "AllItems.aspx"), es una página/archivo, no parte de la ruta del sitio.
  const lastSegment = segments.at(-1);
  if (lastSegment?.includes(".")) {
    segments.pop();
  }

  // También descarta el segmento "Forms" cuando aparece antes de la página
  // (ej. ".../Biblioteca/Forms/AllItems.aspx" -> ".../Biblioteca").
  if (segments.at(-1) === "Forms") {
    segments.pop();
  }

  const serverRelativePath = "/" + segments.join("/");

  return graphFetch<SharePointSiteDiscoveryResult>(
    `/sites/${hostname}:${serverRelativePath}`
  );
}

export async function getSharePointSiteDrives(
  siteId: string
): Promise<SharePointDriveDiscoveryResult[]> {
  const drives = await graphFetchCollection<SharePointDriveDiscoveryResult>(
    `/sites/${encodeURIComponent(siteId)}/drives`,
    2
  );

  return sortByName(drives);
}

/**
 * Contenido raíz de una biblioteca (drive) de SharePoint.
 *
 * @remarks
 * Delegado en {@link driveNavigation.service} para compartir mapeo y
 * paginación con las demás fuentes documentales.
 */
export async function getSharePointDriveRootChildren(
  driveId: string
): Promise<DocumentItem[]> {
  return getDriveRootChildren(
    driveId,
    "corporate-sites",
    SHAREPOINT_DISCOVERY_SCOPES
  );
}

/**
 * Contenido de una carpeta dentro de una biblioteca de SharePoint.
 *
 * @remarks
 * Delegado en {@link driveNavigation.service} para compartir mapeo y
 * paginación con las demás fuentes documentales.
 */
export async function getSharePointFolderChildren(
  driveId: string,
  itemId: string
): Promise<DocumentItem[]> {
  return getDriveFolderChildren(
    driveId,
    itemId,
    "corporate-sites",
    SHAREPOINT_DISCOVERY_SCOPES
  );
}

/** URL de previsualización embebible para un archivo de SharePoint. */
export async function getSharePointPreviewUrl(
  driveId: string,
  itemId: string
): Promise<string | undefined> {
  return getDocumentPreviewUrl(driveId, itemId, SHAREPOINT_DISCOVERY_SCOPES);
}

const SHAREPOINT_WRITE_SCOPES = ["Files.ReadWrite.All"] as const;

/** Sube un archivo a una carpeta de una biblioteca de SharePoint (prueba). */
export async function uploadSharePointFile(
  driveId: string,
  parentItemId: string | null,
  file: File
): Promise<DocumentItem> {
  return uploadFileToDriveFolder(
    driveId,
    parentItemId,
    file,
    "corporate-sites",
    SHAREPOINT_WRITE_SCOPES
  );
}
/**
 * Subsitios directos (un solo nivel) de un sitio de SharePoint.
 *
 * @remarks
 * Equivale a `GET /sites/{siteId}/sites`. Este endpoint tiene soporte
 * algo limitado en Graph — en la práctica funciona bien para jerarquías
 * estándar, pero puede omitir subsitios en casos excepcionales. Si un
 * subsitio conocido no aparece aquí, usa `resolveSharePointSiteByUrl`
 * como respaldo manual.
 */
export async function getSharePointSubsites(
  siteId: string
): Promise<SharePointSiteDiscoveryResult[]> {
  const subsites = await graphFetchCollection<SharePointSiteDiscoveryResult>(
    `/sites/${encodeURIComponent(siteId)}/sites?$select=id,displayName,name,webUrl,createdDateTime,lastModifiedDateTime`,
    2
  );

  return sortByName(subsites);
}