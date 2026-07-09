/**
 * @module graphClient
 *
 * Cliente HTTP mínimo y genérico para Microsoft Graph.
 *
 * @remarks
 * Centraliza la obtención de tokens (vía MSAL), el armado de URLs y la
 * paginación por `@odata.nextLink`. Es consumido por todos los servicios
 * documentales para evitar duplicar lógica de fetch en cada uno.
 */

import { getAccessToken } from "@/app/api/auth/msal";

export const GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";

interface GraphCollectionResponse<T> {
  value: T[];
  "@odata.nextLink"?: string;
}

/**
 * Obtiene un access token de Graph con los scopes delegados adicionales
 * requeridos por el servicio que invoca.
 */
export async function getGraphToken(
  extraScopes: readonly string[]
): Promise<string> {
  return getAccessToken({
    silentExtraScopesToConsent: Array.from(extraScopes),
  });
}

/**
 * Ejecuta un GET contra Microsoft Graph y retorna el JSON tipado.
 *
 * @param pathOrUrl - Ruta relativa o URL absoluta (para `@odata.nextLink`).
 * @param extraScopes - Scopes delegados requeridos para esta petición.
 */
export async function graphFetch<T>(
  pathOrUrl: string,
  extraScopes: readonly string[]
): Promise<T> {
  const token = await getGraphToken(extraScopes);

  const url = pathOrUrl.startsWith("https://")
    ? pathOrUrl
    : `${GRAPH_BASE_URL}${pathOrUrl}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(
      `[Graph] ${response.status} ${response.statusText} · ${url}`
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Ejecuta un GET paginado contra Microsoft Graph, siguiendo
 * `@odata.nextLink` hasta `maxPages` veces.
 */
export async function graphFetchCollection<T>(
  path: string,
  extraScopes: readonly string[],
  maxPages = 3
): Promise<T[]> {
  const results: T[] = [];
  let nextUrl: string | undefined = path;
  let currentPage = 0;

  while (nextUrl && currentPage < maxPages) {
   const response: GraphCollectionResponse<T> = await graphFetch<GraphCollectionResponse<T>>(
  nextUrl,
  extraScopes
);

    results.push(...response.value);
    nextUrl = response["@odata.nextLink"];
    currentPage += 1;
  }

  return results;
}
/**
 * Ejecuta un POST contra Microsoft Graph y retorna el JSON tipado.
 */

export async function graphPost<T>(
  pathOrUrl: string,
  body: unknown,
  extraScopes: readonly string[]
): Promise<T> {
  const token = await getGraphToken(extraScopes);

  const url = pathOrUrl.startsWith("https://")
    ? pathOrUrl
    : `${GRAPH_BASE_URL}${pathOrUrl}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body ?? {}),
  });

  if (!response.ok) {
    throw new Error(
      `[Graph] ${response.status} ${response.statusText} · ${url}`
    );
  }

  return response.json() as Promise<T>;
}