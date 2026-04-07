// lib/microsoft-graph.ts
// ─────────────────────────────────────────────────────────────────────────────
// Consultas a Microsoft Graph API.
// ─────────────────────────────────────────────────────────────────────────────

import { resolveAccessLevel, type AccessLevel } from "./roles";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface GraphProfile {
  jobTitle?:       string | null;
  department?:     string | null;
  employeeId?:     string | null;
  hireDate?:       string | null;
  mobilePhone?:    string | null;
  businessPhones?: string[];
  officeLocation?: string | null;
}

interface GraphGroup {
  id:           string;
  displayName:  string;
  description?: string | null;
}

interface GraphGroupsResponse {
  value: GraphGroup[];
}

// ── 1. Perfil de usuario ──────────────────────────────────────────────────────

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
//   AZURE_GROUP_LOGISTICS=<object-id>       → grupo "Logistica-EDM"
//   AZURE_GROUP_RETAIL=<object-id>          → grupo "Retail-EDM"
//   AZURE_GROUP_HR=<object-id>              → grupo "RRHH-EDM"
//   AZURE_GROUP_IT=<object-id>              → grupo "TI-EDM"
//   AZURE_GROUP_ADMIN_SERVICES=<object-id>  → grupo "Servicios-Administrativos-EDM"
//   AZURE_GROUP_MANAGER=<object-id>         → grupo "Gerencia-EDM"
//   AZURE_GROUP_PRODUCT=<object-id>         → grupo "Producto-EDM-Intranet"

function buildGroupMap(): Map<string, AccessLevel> {
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
    [process.env.AZURE_GROUP_PRODUCT,        "product"],   // ← nuevo
  ];
  for (const [id, level] of entries) {
    if (id) map.set(id.toLowerCase(), level);
  }
  return map;
}

// Fallback por nombre de grupo — funciona sin configurar .env
// ⚠️  ORDEN IMPORTANTE: los patrones más específicos van primero
const GROUP_NAME_PATTERNS: [RegExp, AccessLevel][] = [
  // admin — SOLO superadministradores de la plataforma
  [/Admin-EDM-Intranet/,                           "admin"],

  // Departamentos
  [/Finanzas/i,                                    "finance"],
  [/Jur[ií]dica|Legal/i,                           "legal"],
  [/Retail|Comercial|Tiendas/i,                    "retail"],
  [/RRHH|Recursos.Humanos|Talento/i,               "hr"],
  [/Producto-EDM-Intranet|Producto|Colecciones/i,  "product"],  // ← nuevo

  // ⚠️  "Servicios Administrativos" va ANTES para no confundirse con TI
  [/Servicios.Administrativos|Recepci[oó]n/i,      "admin_services"],
  [/Tecnolog[ií]a|Inform[áa]tica|\bTI\b/i,         "it"],

  [/Gerencia|Direcci[oó]n/i,                       "manager"],
];

/**
 * Determina el AccessLevel más alto a partir de los grupos del usuario.
 *
 * Prioridad:
 *   1. Object ID exacto desde variables de entorno (.env.local)
 *   2. Nombre de grupo (displayName) — fallback hasta configurar .env
 *   3. department/role del perfil de Graph — fallback para usuarios nuevos
 */
export function resolveAccessLevelFromGroups(
  groups:      GraphGroup[],
  department?: string | null,
  role?:        string | null,
): AccessLevel {
  const groupMap = buildGroupMap();

  const HIERARCHY: AccessLevel[] = [
    "admin", "finance", "legal",
    "it", "product", "retail", "hr", "admin_services",  // ← product agregado
    "manager", "employee",
  ];

  const found = new Set<AccessLevel>();

  for (const group of groups) {
    // 1. Object ID exacto
    const byId = groupMap.get(group.id.toLowerCase());
    if (byId) { found.add(byId); continue; }

    // 2. Nombre del grupo
    for (const [pattern, level] of GROUP_NAME_PATTERNS) {
      if (pattern.test(group.displayName)) {
        found.add(level);
        break;
      }
    }
  }

  // Devolver el nivel de mayor jerarquía encontrado
  for (const level of HIERARCHY) {
    if (found.has(level)) return level;
  }

  // 3. Fallback por department/role — para usuarios nuevos sin grupo asignado
  return resolveAccessLevel(department, role);
}

// ── 4. Helpers ────────────────────────────────────────────────────────────────

export function formatHireDate(hireDate: string | null | undefined): string {
  if (!hireDate) return "";
  return new Date(hireDate).toLocaleDateString("es-CO", {
    month: "long",
    year:  "numeric",
  });
}