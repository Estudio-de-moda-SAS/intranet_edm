/**
 * @module graphClient
 *
 * Cliente HTTP mínimo y genérico para Microsoft Graph.
 *
 * @remarks
 * Centraliza la obtención de tokens (vía MSAL), el armado de URLs, la
 * paginación por `@odata.nextLink`, y el manejo automático de throttling
 * (HTTP 429 con reintento respetando `Retry-After`). Es consumido por
 * todos los servicios documentales para evitar duplicar esta lógica.
 */

import { getAccessToken } from "@/app/api/auth/msal";

export const GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";

const MAX_THROTTLE_RETRIES = 3;
const DEFAULT_RETRY_AFTER_SECONDS = 2;

interface GraphCollectionResponse<T> {
  value: T[];
  "@odata.nextLink"?: string;
}

/**
 * Error de Graph con el código de estado HTTP incluido, para poder
 * distinguir casos como 403 (sin permiso) o 429 (throttling) de otros
 * fallos genéricos de red.
 */
export class GraphApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "GraphApiError";
    this.status = status;
  }
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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveUrl(pathOrUrl: string): string {
  return pathOrUrl.startsWith("https://")
    ? pathOrUrl
    : `${GRAPH_BASE_URL}${pathOrUrl}`;
}

/**
 * Ejecuta un `fetch` contra Graph con reintento automático en caso de
 * throttling (429): espera el tiempo indicado en `Retry-After` (o un
 * valor por defecto si el header no viene) y reintenta hasta
 * `MAX_THROTTLE_RETRIES` veces antes de rendirse.
 */
async function fetchWithThrottleRetry(
  url: string,
  init: RequestInit
): Promise<Response> {
  let attempt = 0;

  while (true) {
    const response = await fetch(url, init);

    if (response.status !== 429 || attempt >= MAX_THROTTLE_RETRIES) {
      return response;
    }

    const retryAfterHeader = response.headers.get("Retry-After");
    const retryAfterSeconds = retryAfterHeader
      ? Number(retryAfterHeader)
      : DEFAULT_RETRY_AFTER_SECONDS;

    console.warn(
      `[Graph] 429 recibido, reintentando en ${retryAfterSeconds}s (intento ${attempt + 1}/${MAX_THROTTLE_RETRIES})`
    );

    await delay(
      (Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : DEFAULT_RETRY_AFTER_SECONDS) *
        1000
    );

    attempt += 1;
  }
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
  const url = resolveUrl(pathOrUrl);

  const response = await fetchWithThrottleRetry(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new GraphApiError(
      response.status,
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
    const response: GraphCollectionResponse<T> = await graphFetch
      <GraphCollectionResponse<T>
    >(nextUrl, extraScopes);

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
  const url = resolveUrl(pathOrUrl);

  const response = await fetchWithThrottleRetry(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body ?? {}),
  });

  if (!response.ok) {
    throw new GraphApiError(
      response.status,
      `[Graph] ${response.status} ${response.statusText} · ${url}`
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Sube el contenido binario de un archivo a Microsoft Graph (PUT).
 *
 * @remarks
 * Usado para operaciones de escritura (crear/actualizar `driveItem`s).
 * Requiere un scope de escritura, ej. `Files.ReadWrite.All`.
 */
export async function graphUpload<T>(
  pathOrUrl: string,
  file: File,
  extraScopes: readonly string[]
): Promise<T> {
  const token = await getGraphToken(extraScopes);
  const url = resolveUrl(pathOrUrl);

  const response = await fetchWithThrottleRetry(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!response.ok) {
    throw new GraphApiError(
      response.status,
      `[Graph] ${response.status} ${response.statusText} · ${url}`
    );
  }

  return response.json() as Promise<T>;
}