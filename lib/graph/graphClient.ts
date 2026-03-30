// lib/graph/graphClient.ts
// ─────────────────────────────────────────────────────────────────────────────
// Cliente base para Microsoft Graph API.
// Genérico: cada service especifica el tipo que espera recibir,
// eliminando el 'any' implícito de res.json().
// ─────────────────────────────────────────────────────────────────────────────

const GRAPH_BASE = "https://graph.microsoft.com/v1.0"

// ── Tipos base de Graph ───────────────────────────────────────────────────────

/** Respuesta paginada estándar de Graph (colecciones) */
export type GraphPage<T> = {
  value: T[]
  "@odata.nextLink"?: string
}

/** Error estándar de Graph API */
type GraphError = {
  error: {
    code:    string
    message: string
  }
}

// ── Cliente principal ─────────────────────────────────────────────────────────

/**
 * Llama a un endpoint de Graph y devuelve la respuesta tipada.
 *
 * Uso:
 *   const user = await callGraph<GraphUser>("/me", token)
 *   const page = await callGraph<GraphPage<GraphUser>>("/users", token)
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
  })

  if (!res.ok) {
    // Intenta extraer el mensaje de error de Graph antes de lanzar
    const body = await res.json().catch(() => null) as GraphError | null
    const message = body?.error?.message ?? res.statusText
    throw new Error(`Graph API ${res.status}: ${message}`)
  }

  return res.json() as Promise<T>
}

/**
 * Llama a un endpoint de Graph que devuelve datos binarios (fotos, archivos).
 * Retorna null si el recurso no existe o el request falla.
 */
export async function callGraphBlob(
  endpoint: string,
  accessToken: string,
): Promise<Blob | null> {
  const res = await fetch(`${GRAPH_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next:    { revalidate: 3600 }, // cachea 1 hora — la foto no cambia frecuente
  })

  if (!res.ok) return null
  return res.blob()
}