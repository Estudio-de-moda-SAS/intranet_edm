/**
 * @module microsoft-graph
 * Consultas a Microsoft Graph API y resolución de {@link AccessLevel} a partir
 * de grupos de Azure AD.
 *
 * @remarks
 * La resolución del nivel de acceso sigue este orden de prioridad:
 *
 * 1. **Object ID exacto** — variables de entorno `AZURE_GROUP_*` en `.env.local`
 * 2. **Nombre del grupo** (`displayName`) — patrones en {@link GROUP_NAME_PATTERNS}
 * 3. **Departamento / cargo** — delega en {@link resolveAccessLevel} de `roles.ts`
 * 4. **Fallback seguro** → `'employee'`
 */

import { resolveAccessLevel, type AccessLevel } from "./roles";

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Subconjunto del perfil de usuario devuelto por `/v1.0/me` en Microsoft Graph.
 * Solo incluye los campos relevantes para la intranet EDM.
 */
 export interface GraphProfile {
  jobTitle?:       string | null;
  department?:     string | null;
  employeeId?:     string | null;
  hireDate?:       string | null;
  mobilePhone?:    string | null;
  businessPhones?: string[];
  officeLocation?: string | null;
}

/**
 * Representación mínima de un grupo de Azure AD devuelto por
 * `/v1.0/me/memberOf`.
 */
 export interface GraphGroup {
  id:           string;
  displayName:  string;
  description?: string | null;
}

/**
 * Forma de la respuesta paginada de `/v1.0/me/memberOf`.
 * @internal
 */
export interface GraphGroupsResponse {
  value: GraphGroup[];
}

// ── 1. Perfil de usuario ──────────────────────────────────────────────────────

/**
 * Obtiene el perfil extendido del usuario autenticado desde Microsoft Graph.
 *
 * Consulta `/v1.0/me` seleccionando únicamente los campos necesarios para
 * construir el {@link AppUser} en el callback `jwt` de `auth.ts`.
 *
 * @param accessToken - Token de acceso delegado obtenido durante el login con
 *   Microsoft Entra ID.
 * @returns El perfil del usuario, o `null` si la petición falla o el token
 *   no tiene los permisos necesarios (`User.Read`).
 */
export async function getMicrosoftGraphProfile(
  accessToken: string
): Promise<GraphProfile | null> {
  try {
    const res = await fetch(
      "https://graph.microsoft.com/v1.0/me?$select=jobTitle,department,employeeId,hireDate,mobilePhone,businessPhones,officeLocation",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache:   "no-store",
      }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ── 2. Grupos del usuario ─────────────────────────────────────────────────────

/**
 * Obtiene la lista de grupos de Azure AD a los que pertenece el usuario
 * autenticado.
 *
 * Consulta `/v1.0/me/memberOf` con un máximo de 100 grupos. Si el usuario
 * pertenece a más de 100 grupos, los grupos adicionales no se evalúan —
 * en la práctica esto no ocurre en EDM.
 *
 * @param accessToken - Token de acceso delegado con permiso `GroupMember.Read.All`
 *   o `Directory.Read.All`.
 * @returns Array de grupos del usuario, o `[]` si la petición falla.
 */
export async function getMicrosoftGraphGroups(
  accessToken: string
): Promise<GraphGroup[]> {
  try {
    const res = await fetch(
      "https://graph.microsoft.com/v1.0/me/memberOf?$select=id,displayName,description&$top=100",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache:   "no-store",
      }
    );
    if (!res.ok) return [];
    const data: GraphGroupsResponse = await res.json();
    return data.value ?? [];
  } catch {
    return [];
  }
}

// ── 3. Mapa de grupos Azure AD → AccessLevel ──────────────────────────────────
//
// CONFIGURACIÓN en .env.local:
//   AZURE_GROUP_ADMIN=<object-id>           → grupo "Admin-EDM-Intranet"
//   AZURE_GROUP_FINANCE=<object-id>         → grupo "Finanzas-EDM"
//   AZURE_GROUP_LEGAL=<object-id>           → grupo "Juridica-EDM"
//   AZURE_GROUP_RETAIL=<object-id>          → grupo "Retail-EDM"
//   AZURE_GROUP_HR=<object-id>              → grupo "RRHH-EDM"
//   AZURE_GROUP_IT=<object-id>              → grupo "TI-EDM"
//   AZURE_GROUP_ADMIN_SERVICES=<object-id>  → grupo "Servicios-Administrativos-EDM"
//   AZURE_GROUP_MANAGER=<object-id>         → grupo "Gerencia-EDM"
//   AZURE_GROUP_PRODUCT=<object-id>         → grupo "Producto-EDM-Intranet"

/**
 * Construye el mapa de Object IDs de Azure AD → {@link AccessLevel} a partir
 * de las variables de entorno `AZURE_GROUP_*`.
 *
 * @remarks
 * Se llama en cada invocación de {@link resolveAccessLevelFromGroups}, no se
 * cachea como constante de módulo, para respetar cambios en `.env` sin
 * necesidad de reiniciar el servidor en desarrollo.
 *
 * Las entradas cuya variable de entorno no esté definida se omiten
 * silenciosamente, permitiendo un arranque parcial sin errores.
 *
 * @returns `Map` de Object ID en minúsculas → {@link AccessLevel}.
 *
 * @internal
 */
export function buildGroupMap(): Map<string, AccessLevel> {
  const map = new Map<string, AccessLevel>();
  const entries: [string | undefined, AccessLevel][] = [
    [process.env.AZURE_GROUP_ADMIN,          "admin"],
    [process.env.AZURE_GROUP_FINANCE,        "finance"],
    [process.env.AZURE_GROUP_LEGAL,          "legal"],
    [process.env.AZURE_GROUP_RETAIL,         "retail"],
    [process.env.AZURE_GROUP_HR,             "hr"],
    [process.env.AZURE_GROUP_IT,             "it"],
    [process.env.AZURE_GROUP_ADMIN_SERVICES, "admin_services"],
    [process.env.AZURE_GROUP_MANAGER,        "manager"],
    [process.env.AZURE_GROUP_PRODUCT,        "product"],
  ];
  for (const [id, level] of entries) {
    if (id) map.set(id.toLowerCase(), level);
  }
  return map;
}

/**
 * Patrones de nombre de grupo para resolución por `displayName`.
 *
 * Se usan como fallback cuando los Object IDs no están configurados en
 * `.env.local`. Cada entrada es un par `[patrón, nivel]`.
 *
 * @remarks
 * ⚠️ El orden es importante: los patrones más específicos deben ir primero
 * para evitar falsos positivos. En particular, `"Servicios Administrativos"`
 * debe preceder al patrón de TI para que grupos con ese nombre no sean
 * clasificados erróneamente.
 *
 * Si se agregan nuevos niveles a {@link AccessLevel} en `roles.ts`, deben
 * añadirse aquí también.
 */
export const GROUP_NAME_PATTERNS: [RegExp, AccessLevel][] = [
  [/Admin-EDM-Intranet/,                           "admin"],
  [/Finanzas/i,                                    "finance"],
  [/Jur[ií]dica|Legal/i,                           "legal"],
  [/Retail|Comercial|Tiendas/i,                    "retail"],
  [/RRHH|Recursos.Humanos|Talento/i,               "hr"],
  [/Producto-EDM-Intranet|Producto|Colecciones/i,  "product"],
  [/Servicios.Administrativos|Recepci[oó]n/i,      "admin_services"],
  [/Tecnolog[ií]a|Inform[áa]tica|\bTI\b/i,         "it"],
  [/Gerencia|Direcci[oó]n/i,                       "manager"],
];

/**
 * Orden de prioridad para resolver el nivel de mayor jerarquía cuando el
 * usuario pertenece a múltiples grupos de Azure AD.
 *
 * @remarks
 * ⚠️ Este array es independiente de `LEVEL_HIERARCHY` en `roles.ts`.
 * Su propósito es distinto: determina cuál nivel "gana" ante membresías
 * múltiples, no define una escala ascendente de permisos.
 *
 * Si se agregan nuevos niveles a `roles.ts`, deben añadirse aquí también
 * para que sean evaluados correctamente.
 *
 * @internal
 */
export const RESOLUTION_HIERARCHY: AccessLevel[] = [
  "admin", "finance", "legal",
  "it", "product", "retail", "hr", "admin_services",
  "manager", "employee",
];

/**
 * Determina el {@link AccessLevel} más alto a partir de los grupos de Azure AD
 * del usuario autenticado.
 *
 * Sigue un orden de prioridad estricto:
 * 1. **Object ID exacto** — variable `AZURE_GROUP_*` configurada en `.env.local`.
 *    Método recomendado en producción: inmune a renombrados de grupos en Azure.
 * 2. **Nombre del grupo** (`displayName`) — patrones en {@link GROUP_NAME_PATTERNS}.
 *    Útil en desarrollo o cuando los Object IDs aún no están configurados.
 * 3. **Fallback por departamento / cargo** — delega en {@link resolveAccessLevel}
 *    de `roles.ts`. Cubre usuarios recién creados sin grupo asignado todavía.
 *
 * @param groups     - Lista de grupos obtenida desde `/v1.0/me/memberOf`.
 * @param department - Nombre del departamento del perfil de Entra ID.
 *   Se pasa al fallback {@link resolveAccessLevel}.
 * @param role       - Cargo del usuario (`jobTitle`).
 *   Se pasa al fallback {@link resolveAccessLevel}.
 * @returns El {@link AccessLevel} de mayor jerarquía encontrado, o `'employee'`
 *   si ningún grupo coincide y el fallback tampoco resuelve.
 *
 * @see {@link resolveAccessLevel} — fallback de último recurso en `roles.ts`
 *
 * @example
 * ```ts
 * resolveAccessLevelFromGroups(
 *   [{ id: 'abc-123', displayName: 'Finanzas-EDM' }],
 *   'Finanzas',
 * )
 * // → 'finance'
 *
 * resolveAccessLevelFromGroups([], 'Tecnología', 'Aprendiz TI')
 * // → 'it'  (fallback por departamento)
 * ```
 */
export function resolveAccessLevelFromGroups(
  groups:      GraphGroup[],
  department?: string | null,
  role?:       string | null,
): AccessLevel {
  const groupMap = buildGroupMap();
  const found = new Set<AccessLevel>();

  for (const group of groups) {
    const byId = groupMap.get(group.id.toLowerCase());
    if (byId) { found.add(byId); continue; }

    for (const [pattern, level] of GROUP_NAME_PATTERNS) {
      if (pattern.test(group.displayName)) {
        found.add(level);
        break;
      }
    }
  }

  for (const level of RESOLUTION_HIERARCHY) {
    if (found.has(level)) return level;
  }

  return resolveAccessLevel(department, role);
}

// ── 4. Helpers ────────────────────────────────────────────────────────────────

/**
 * Formatea una fecha ISO 8601 de contratación al formato legible usado en
 * el perfil del colaborador (ej. `"marzo 2024"`).
 *
 * @param hireDate - Fecha en formato ISO 8601, o `null`/`undefined` si no
 *   está disponible en el perfil de Entra ID.
 * @returns Cadena con mes y año en español colombiano, o `""` si la fecha
 *   no está disponible.
 *
 * @example
 * ```ts
 * formatHireDate('2024-03-01')  // "marzo de 2024"
 * formatHireDate(null)          // ""
 * ```
 */
export function formatHireDate(hireDate: string | null | undefined): string {
  if (!hireDate) return "";
  return new Date(hireDate).toLocaleDateString("es-CO", {
    month: "long",
    year:  "numeric",
  });
}