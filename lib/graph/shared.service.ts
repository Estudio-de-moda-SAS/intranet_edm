/**
 * @module graph/shared.service
 * Datos compartidos entre todos los services de departamento de la
 * intranet EDM: usuario autenticado y token de acceso a Microsoft Graph.
 *
 * @remarks
 * Centraliza dos responsabilidades que todos los services de departamento
 * necesitan antes de consultar Graph:
 *
 * 1. **{@link getToken}** — obtiene el token de acceso delegado desde la
 *    sesión de NextAuth, o retorna un token mock en modo bypass.
 * 2. **{@link getSharedData}** — obtiene el perfil básico del usuario
 *    autenticado desde `/me` en Graph, o retorna {@link MOCK_USER} en
 *    modo bypass.
 *
 * Ambas funciones son consumidas por `getHomeData` y los services de
 * cada departamento como paso previo a sus propias consultas a Graph.
 *
 * @example
 * ```ts
 * // En cualquier service de departamento:
 * const shared = await getSharedData();
 * const token  = await getToken();
 *
 * const data = await callGraph<MiTipo>("/me/...", token);
 * return { user: shared.user, ...data };
 * ```
 */

import type { Session } from "next-auth";
import { callGraph }    from "@/lib/graph/graphClient";

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Subconjunto del perfil de usuario devuelto por `/v1.0/me` en Graph,
 * limitado a los campos necesarios para construir el objeto `user` compartido
 * entre services.
 *
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

// ── Mock ──────────────────────────────────────────────────────────────────────

/**
 * Perfil de usuario mock usado en modo bypass para desarrollo local.
 *
 * @remarks
 * Simula la estructura que devuelve {@link getSharedData} en producción,
 * permitiendo que los services de departamento funcionen sin depender de
 * Microsoft Graph ni de una sesión activa de Entra ID.
 *
 * @internal
 */
const MOCK_USER = {
  name:     "Juan Esteban Avendaño Gomez",
  role:     "Aprendiz TI 2",
  location: "Medellín",
  email:    "juanesteban@empresa.com",
  id:       "mock-user-id",
};

// ── Token ─────────────────────────────────────────────────────────────────────

/**
 * Obtiene el token de acceso delegado para Microsoft Graph desde la sesión
 * activa de NextAuth.
 *
 * @remarks
 * En modo bypass (`NEXT_PUBLIC_AUTH_BYPASS === "true"`), retorna el literal
 * `"mock-token"` sin realizar ninguna llamada a NextAuth, permitiendo el
 * desarrollo local sin autenticación con Entra ID.
 *
 * En producción, `auth()` se importa dinámicamente para evitar que se
 * ejecute en el cliente — `auth()` es exclusivo de Server Components y
 * Route Handlers. El campo `accessToken` está tipado sin `as any` gracias
 * a la declaración de módulo en `types/next-auth.d.ts`.
 *
 * @returns Token de acceso delegado listo para usar como header
 *   `Authorization: Bearer {token}` en llamadas a Graph.
 * @throws `Error` si no hay sesión activa o el token no está disponible
 *   en los claims de la sesión.
 *
 * @example
 * ```ts
 * const token = await getToken();
 * const profile = await callGraph<GraphProfileBasic>("/me", token);
 * ```
 */
export async function getToken(): Promise<string> {
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
    return "mock-token";
  }

  const { auth } = await import("@/auth");
  const session  = await auth() as Session | null;

  const token = session?.accessToken;
  if (!token) throw new Error("No access token — usuario no autenticado");

  return token;
}

// ── Datos compartidos ─────────────────────────────────────────────────────────

/**
 * Obtiene el perfil básico del usuario autenticado desde Microsoft Graph,
 * normalizado a la estructura compartida entre todos los services de
 * departamento.
 *
 * @remarks
 * Consulta `/me` en Graph seleccionando únicamente los campos necesarios
 * para construir el objeto `user` que acompaña todas las respuestas de
 * los services: `displayName`, `jobTitle`, `department`, `mail`, `id` y
 * `officeLocation`.
 *
 * En modo bypass retorna {@link MOCK_USER} directamente, sin llamar a
 * {@link getToken} ni a Graph.
 *
 * Los valores `null` o `undefined` en el perfil de Graph se normalizan a
 * strings vacíos o al literal `"Usuario"` para `name`, garantizando que
 * el objeto retornado nunca tenga campos indefinidos.
 *
 * @returns Objeto con la propiedad `user` que contiene el perfil
 *   normalizado del colaborador autenticado.
 *
 * @example
 * ```ts
 * const { user } = await getSharedData();
 * // user.name     → "Juan Esteban Avendaño Gomez"
 * // user.role     → "Aprendiz TI 2"
 * // user.location → "Medellín"
 * ```
 */
export async function getSharedData() {
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
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

// ── Tipos exportados ──────────────────────────────────────────────────────────

/**
 * Tipo inferido del valor resuelto por {@link getSharedData}.
 *
 * @remarks
 * Útil para tipar el parámetro `shared` en services que reciben el resultado
 * de `getSharedData` como argumento, evitando duplicar la definición del
 * tipo de retorno.
 *
 * @example
 * ```ts
 * async function buildDepartmentData(shared: SharedData) {
 *   return { user: shared.user, ... };
 * }
 * ```
 */
export type SharedData = Awaited<ReturnType<typeof getSharedData>>;