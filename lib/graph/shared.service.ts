/**
 * @module graph/shared.service
 * Datos compartidos entre todos los services de departamento de la
 * intranet EDM: usuario autenticado y token de acceso a Microsoft Graph.
 *
 * @remarks
 * Centraliza dos responsabilidades que todos los services de departamento
 * necesitan antes de consultar Graph:
 *
 * 1. **{@link getToken}** — obtiene el token de acceso delegado desde el
 *    header `Authorization` de la request entrante, o retorna un token
 *    mock en modo bypass.
 * 2. **{@link getSharedData}** — obtiene el perfil basico del usuario
 *    autenticado desde `/me` en Graph, o retorna {@link MOCK_USER} en
 *    modo bypass o mientras Graph no esta habilitado.
 *
 * **Modelo de seguridad con MSAL:**
 * El servidor nunca almacena ni genera tokens de Graph. El cliente obtiene
 * el token con MSAL y lo envia en el header `Authorization: Bearer` de
 * cada llamada al Route Handler correspondiente. El servidor actua
 * exclusivamente como proxy autenticado hacia Graph.
 *
 * **Activar Graph real:**
 * Cuando los Route Handlers de cada departamento esten implementados
 * y el cliente envie el token via header, cambiar la condicion de
 * `getSharedData` de `|| true` a la logica de Route Handler correspondiente.
 *
 * @example
 * ```ts
 * // En un Route Handler que recibe el token del cliente:
 * export async function GET() {
 *   const token = await getToken();
 *   const data  = await callGraph<MiTipo>("/me/...", token);
 *   return Response.json(data);
 * }
 * ```
 */

import { callGraph } from "@/lib/graph/graphClient";

// -- Flags --------------------------------------------------------------------

/** `true` cuando el bypass de autenticacion esta activo. */
const IS_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

// -- Tipos --------------------------------------------------------------------

/**
 * Subconjunto del perfil de usuario devuelto por `/v1.0/me` en Graph.
 * @internal
 */
type GraphProfileBasic = {
  displayName?:    string | null;
  jobTitle?:       string | null;
  department?:     string | null;
  mail?:           string | null;
  id?:             string | null;
  officeLocation?: string | null;
};

// -- Mock ---------------------------------------------------------------------

/**
 * Perfil de usuario mock usado en modo bypass y mientras Graph no esta activo.
 * @internal
 */
const MOCK_USER = {
  name:     "Juan Esteban Avendano Gomez",
  role:     "Aprendiz TI 2",
  location: "Medellin",
  email:    "juanesteban@empresa.com",
  id:       "mock-user-id",
};

// -- Token --------------------------------------------------------------------

/**
 * Obtiene el token de acceso delegado para Microsoft Graph desde el
 * header `Authorization` de la request entrante.
 *
 * @remarks
 * En modo bypass retorna `"mock-token"` sin leer headers.
 *
 * En produccion, lee el header `Authorization: Bearer {token}` que el
 * cliente envia con cada llamada al Route Handler. El token lo obtiene
 * el cliente con MSAL — el servidor nunca lo genera ni lo almacena.
 *
 * @returns Token de acceso delegado.
 * @throws Si el header no esta presente o tiene formato invalido.
 */
export async function getToken(): Promise<string> {
  if (IS_BYPASS) return "mock-token";

  const { headers }   = await import("next/headers");
  const headerStore   = await headers();
  const authorization = headerStore.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("No access token — header Authorization ausente o invalido");
  }

  return authorization.slice("Bearer ".length);
}

// -- Datos compartidos --------------------------------------------------------

/**
 * Obtiene el perfil basico del usuario autenticado desde Microsoft Graph,
 * normalizado a la estructura compartida entre todos los services de
 * departamento.
 *
 * @remarks
 * **Modo bypass** (`NEXT_PUBLIC_AUTH_BYPASS=true`):
 * Retorna {@link MOCK_USER} directamente sin llamar a Graph.
 *
 * **Produccion sin Route Handlers** (estado actual):
 * Retorna {@link MOCK_USER} directamente. El `|| true` de la condicion
 * garantiza que nunca se llame a `getToken()` desde un Server Component
 * donde no hay header `Authorization`. Cuando los Route Handlers esten
 * implementados, reemplazar `|| true` por la logica correspondiente.
 *
 * **Produccion con Route Handlers activos:**
 * Consulta `/me` en Graph y retorna el perfil real del colaborador.
 *
 * @returns Objeto con la propiedad `user` con el perfil del colaborador.
 */
export async function getSharedData() {
  // || true mantiene mock en produccion hasta que los Route Handlers
  // de cada departamento esten implementados y pasen el token via header.
  // Para activar Graph real: eliminar "|| true" y asegurarse de que
  // esta funcion solo se llama desde Route Handlers, no Server Components.
  if (IS_BYPASS || true) {
    return { user: MOCK_USER };
  }

  const token   = await getToken();
  const profile = await callGraph<GraphProfileBasic>(
    "/me?$select=displayName,jobTitle,department,mail,id,officeLocation",
    token,
  );

  return {
    user: {
      name:     profile.displayName    ?? "Usuario",
      role:     profile.jobTitle       ?? "",
      location: profile.officeLocation ?? "",
      email:    profile.mail           ?? "",
      id:       profile.id             ?? "",
    },
  };
}

// -- Tipos exportados ---------------------------------------------------------

/**
 * Tipo inferido del valor resuelto por {@link getSharedData}.
 *
 * @example
 * ```ts
 * async function buildDepartmentData(shared: SharedData) {
 *   return { user: shared.user, ... };
 * }
 * ```
 */
export type SharedData = Awaited<ReturnType<typeof getSharedData>>;