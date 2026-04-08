/**
 * @module api/client
 * Cliente HTTP base para consumir la API interna de la intranet EDM.
 *
 * @remarks
 * Provee una función genérica de petición GET que todos los módulos de
 * API de la intranet deben usar como capa de transporte, evitando
 * duplicar la lógica de construcción de URL, headers y manejo de errores.
 *
 * La URL base se configura mediante la variable de entorno
 * `NEXT_PUBLIC_API_URL`, lo que permite apuntar a distintos entornos
 * (desarrollo, staging, producción) sin modificar el código.
 *
 * @example
 * ```ts
 * // Uso directo (preferir los módulos de API específicos)
 * const data = await apiGet<MiTipo>("/mi-endpoint");
 * ```
 */

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ── Cliente ───────────────────────────────────────────────────────────────────

/**
 * Realiza una petición GET autenticada a la API interna de la intranet
 * y retorna la respuesta deserializada con el tipo indicado.
 *
 * @remarks
 * La URL final se construye como `{NEXT_PUBLIC_API_URL}{endpoint}`, por
 * lo que `endpoint` debe comenzar con `/`
 * (ej. `"/finance/kpis"`, `"/hr/employees"`).
 *
 * Las respuestas se cachean durante 60 segundos mediante
 * `next: { revalidate: 60 }`, optimizando el rendimiento en Server
 * Components sin sacrificar la frescura de los datos.
 *
 * ⚠️ El header `Authorization` está preparado pero comentado hasta que
 * se implemente el flujo de autenticación con token en la API interna.
 * Cuando esté disponible, debe descomentarse y pasarse el token como
 * parámetro o leerlo desde la sesión activa.
 *
 * @typeParam T - Tipo esperado de la respuesta JSON de la API.
 * @param endpoint - Ruta relativa del endpoint, comenzando con `/`.
 * @returns Promesa que resuelve con la respuesta deserializada como `T`.
 * @throws `Error` con el código HTTP y el endpoint si la respuesta no
 *   es exitosa (ej. `"API error 404: /finance/kpis"`).
 *
 * @example
 * ```ts
 * const kpis = await apiGet<FinanceKPIs>("/finance/kpis");
 * ```
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${token}` ← pendiente de implementar
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`API error ${res.status}: ${endpoint}`);
  return res.json();
}