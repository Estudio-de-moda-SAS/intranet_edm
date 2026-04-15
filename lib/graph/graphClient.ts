/**
 * @module graph/graphClient
 * Cliente base para Microsoft Graph API usado por todos los services
 * de la intranet EDM.
 *
 * @remarks
 * Provee dos funciones de bajo nivel que abstraen el fetch a Graph:
 * - {@link callGraph} para respuestas JSON tipadas.
 * - {@link callGraphBlob} para recursos binarios (fotos, archivos).
 *
 * Todos los services de departamento (`getHomeData`, `getSharedData`, etc.)
 * construyen sus consultas sobre estos dos helpers, manteniendo la lógica
 * de autenticación y manejo de errores en un único lugar.
 */

export const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

// ── Tipos base ────────────────────────────────────────────────────────────────

/**
 * Forma de la respuesta paginada estándar de Microsoft Graph para
 * endpoints que devuelven colecciones (ej. `/users`, `/me/events`).
 *
 * @remarks
 * `@odata.nextLink` está presente cuando hay más páginas disponibles.
 * Los services actuales no implementan paginación automática — si se
 * necesita, debe iterarse manualmente usando este campo.
 *
 * @typeParam T - Tipo de cada elemento en la colección.
 */
export type GraphPage<T> = {
  /** Array de elementos de la página actual. */
  value: T[];

  /**
   * URL de la siguiente página de resultados.
   * `undefined` si no hay más páginas.
   */
  "@odata.nextLink"?: string;
};

/**
 * Forma del cuerpo de error estándar devuelto por Microsoft Graph
 * cuando una petición falla.
 *
 * @internal
 */
export type GraphError = {
  error: {
    /** Código de error de Graph (ej. `"Authorization_RequestDenied"`). */
    code: string;
    /** Descripción legible del error. */
    message: string;
  };
};

// ── Cliente JSON ──────────────────────────────────────────────────────────────

/**
 * Realiza una petición GET autenticada a Microsoft Graph y devuelve la
 * respuesta deserializada con el tipo indicado.
 *
 * @remarks
 * La URL final se construye como `https://graph.microsoft.com/v1.0{endpoint}`,
 * por lo que `endpoint` debe comenzar con `/` (ej. `"/me"`, `"/users"`).
 *
 * En caso de respuesta no exitosa, intenta deserializar el cuerpo como
 * {@link GraphError} para incluir el mensaje de Graph en la excepción.
 * Si el cuerpo no es JSON válido, usa `res.statusText` como fallback.
 *
 * Todas las peticiones se realizan con `cache: "no-store"` para garantizar
 * datos frescos en cada renderizado de Server Components.
 *
 * @typeParam T - Tipo esperado de la respuesta JSON de Graph.
 *   Puede ser un objeto simple o {@link GraphPage}`<T>` para colecciones.
 * @param endpoint    - Ruta relativa del endpoint de Graph, comenzando con `/`.
 * @param accessToken - Token de acceso delegado con los scopes necesarios
 *   para el endpoint solicitado.
 * @returns Promesa que resuelve con la respuesta deserializada como `T`.
 * @throws `Error` con el código HTTP y mensaje de Graph si la respuesta
 *   no es exitosa (ej. `"Graph API 403: Insufficient privileges"`).
 *
 * @example
 * ```ts
 * // Recurso único
 * const user = await callGraph<GraphUser>("/me", token);
 *
 * // Colección paginada
 * const page = await callGraph<GraphPage<GraphEvent>>(
 *   "/me/events?$top=5",
 *   token,
 * );
 * ```
 */
export async function callGraph<T>(
  endpoint: string,
  accessToken: string,
): Promise<T> {
  const res = await fetch(`${GRAPH_BASE}${endpoint}`, {
    headers: {
      Authorization:  `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body    = await res.json().catch(() => null) as GraphError | null;
    const message = body?.error?.message ?? res.statusText;
    throw new Error(`Graph API ${res.status}: ${message}`);
  }

  return res.json() as Promise<T>;
}

// ── Cliente binario ───────────────────────────────────────────────────────────

/**
 * Realiza una petición GET autenticada a Microsoft Graph y devuelve la
 * respuesta como `Blob` para recursos binarios (fotos de perfil, archivos).
 *
 * @remarks
 * A diferencia de {@link callGraph}, esta función no lanza excepciones ante
 * respuestas no exitosas — retorna `null` directamente. Esto simplifica el
 * manejo en los consumidores, donde un recurso binario ausente es un caso
 * esperado (ej. usuario sin foto de perfil).
 *
 * La respuesta se cachea durante 1 hora (`next: { revalidate: 3600 }`)
 * porque los recursos binarios como fotos de perfil cambian con muy poca
 * frecuencia, reduciendo la carga sobre Graph.
 *
 * @param endpoint    - Ruta relativa del endpoint de Graph, comenzando con `/`.
 *   Típicamente termina en `/$value` para recursos binarios
 *   (ej. `"/users/{id}/photo/$value"`).
 * @param accessToken - Token de acceso delegado con los scopes necesarios.
 * @returns `Blob` con el contenido binario, o `null` si el recurso no existe
 *   o la petición falla por cualquier motivo.
 *
 * @example
 * ```ts
 * const blob = await callGraphBlob(
 *   `/users/${email}/photo/$value`,
 *   token,
 * );
 * if (!blob) return null; // sin foto → fallback a iniciales
 *
 * const buffer = Buffer.from(await blob.arrayBuffer());
 * return `data:image/jpeg;base64,${buffer.toString("base64")}`;
 * ```
 */
export async function callGraphBlob(
  endpoint: string,
  accessToken: string,
): Promise<Blob | null> {
  const res = await fetch(`${GRAPH_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next:    { revalidate: 3600 },
  });

  if (!res.ok) return null;
  return res.blob();
}