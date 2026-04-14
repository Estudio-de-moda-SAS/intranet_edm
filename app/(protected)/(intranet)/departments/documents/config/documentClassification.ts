/**
 * @module documentClassification
 * Sistema de clasificación y autorización documental del módulo de Gestión
 * Documental.
 *
 * Define:
 * - los niveles de clasificación de seguridad de los documentos,
 * - sus metadatos visuales y descriptivos,
 * - la relación entre departamentos propietarios y niveles de acceso,
 * - y las reglas de autorización para visualización documental.
 *
 * @remarks
 * Este archivo implementa una parte central del modelo de seguridad del
 * repositorio documental.
 *
 * Flujo general:
 * 1. Cada documento posee una {@link DocClassification} y un departamento
 *    propietario (`ownerDepartment`).
 * 2. {@link canViewDocument} determina si un usuario con cierto
 *    {@link AccessLevel} puede visualizar ese documento.
 * 3. {@link filterDocsByAccess} permite filtrar colecciones documentales
 *    completas usando la misma lógica de autorización.
 *
 * Esto asegura consistencia entre:
 * - reglas del servidor,
 * - filtros aplicados en cliente,
 * - y representación visual del nivel de sensibilidad documental.
 */

// app/documents/config/documentClassification.ts
// ─────────────────────────────────────────────────────────────────────────────
// Sistema de clasificación documental corporativa.
// Estándar basado en ISO 27001 / mejores prácticas de gestión documental.
//
// Flujo:
//   1. Cada documento tiene una `classification` y un `ownerDepartment`.
//   2. `canViewDocument()` decide si un AccessLevel puede ver ese documento.
//   3. DocumentTable filtra las filas en cliente con los mismos IDs que
//      el servidor ya autorizó — doble capa de seguridad.
// ─────────────────────────────────────────────────────────────────────────────

import type { AccessLevel } from "@/lib/roles";
import { atLeast }          from "@/lib/roles";

// ── 1. Clasificaciones ────────────────────────────────────────────────────────

/**
 * Niveles de clasificación de seguridad documental.
 *
 * @remarks
 * Cada valor define un alcance distinto de visibilidad:
 *
 * - `public`:
 *   visible para todos los colaboradores.
 *
 * - `internal`:
 *   visible para perfiles con acceso interno ampliado (`manager` o superior).
 *
 * - `confidential`:
 *   visible únicamente para el área propietaria o administradores.
 *
 * - `restricted`:
 *   visible solo para administradores.
 */
export type DocClassification =
  | "public"
  | "internal"
  | "confidential"
  | "restricted";

/**
 * Metadatos descriptivos y visuales asociados a cada {@link DocClassification}.
 *
 * @remarks
 * Esta estructura permite:
 * - mostrar etiquetas legibles,
 * - explicar el alcance de visibilidad,
 * - y renderizar badges consistentes en la interfaz.
 */
export const CLASSIFICATION_META: Record<DocClassification, {
  label:       string;
  description: string;
  badgeColor:  string;
  badgeBg:     string;
  badgeBorder: string;
}> = {
  public: {
    label:       "Público",
    description: "Visible para todos los colaboradores",
    badgeColor:  "text-emerald-700",
    badgeBg:     "bg-emerald-50",
    badgeBorder: "border-emerald-200",
  },
  internal: {
    label:       "Interno",
    description: "Solo managers y superiores",
    badgeColor:  "text-sky-700",
    badgeBg:     "bg-sky-50",
    badgeBorder: "border-sky-200",
  },
  confidential: {
    label:       "Confidencial",
    description: "Restringido al área propietaria",
    badgeColor:  "text-amber-700",
    badgeBg:     "bg-amber-50",
    badgeBorder: "border-amber-200",
  },
  restricted: {
    label:       "Restringido",
    description: "Solo administradores",
    badgeColor:  "text-rose-700",
    badgeBg:     "bg-rose-50",
    badgeBorder: "border-rose-200",
  },
};

// ── 2. Mapa área propietaria → AccessLevel requerido ─────────────────────────

/**
 * Mapa entre departamento propietario y {@link AccessLevel} requerido
 * para acceder a documentos clasificados como `confidential`.
 *
 * @remarks
 * Para documentos confidenciales, la autorización depende de que el usuario
 * pertenezca funcionalmente al área propietaria del documento, o tenga nivel
 * administrativo superior.
 *
 * Este mapa actúa como tabla de resolución entre nombre del departamento
 * y nivel de acceso esperado.
 */
const OWNER_LEVEL_MAP: Record<string, AccessLevel> = {
  "Finanzas":                  "finance",
  "Legal":                     "legal",
  "Jurídica":                  "legal",
  "Retail":                    "retail",
  "Comercial":                 "retail",
  "RRHH":                      "hr",
  "Recursos Humanos":          "hr",
  "Tecnología":                "it",
  "TI":                        "it",
  "Seguridad IT":              "it",
  "Infraestructura":           "it",
  "Servicios Administrativos": "admin_services",
  "Gerencia":                  "manager",
  "Procurement":               "manager",
  "Sales Ops":                 "retail",
};

// ── 3. Función principal de autorización ─────────────────────────────────────

/**
 * Determina si un usuario puede visualizar un documento según:
 * - su {@link AccessLevel},
 * - la {@link DocClassification} del documento,
 * - y el departamento propietario.
 *
 * @param userLevel Nivel de acceso del usuario actual.
 * @param classification Clasificación de seguridad del documento.
 * @param ownerDepartment Departamento propietario del documento.
 * @returns `true` si el usuario puede ver el documento, `false` en caso contrario.
 *
 * @remarks
 * Reglas aplicadas:
 *
 * - **public**
 *   visible para todos los usuarios.
 *
 * - **internal**
 *   visible para perfiles `manager` o superiores, usando {@link atLeast}.
 *
 * - **confidential**
 *   visible para:
 *   - administradores,
 *   - o el área propietaria correspondiente según {@link OWNER_LEVEL_MAP}.
 *
 * - **restricted**
 *   visible exclusivamente para administradores.
 *
 * Si el departamento propietario no existe en {@link OWNER_LEVEL_MAP}, el
 * sistema aplica un fallback conservador permitiendo acceso solo a perfiles
 * `manager` o superiores.
 *
 * @example
 * canViewDocument("employee", "public", "RRHH")      // true
 * canViewDocument("employee", "internal", "RRHH")    // false
 * canViewDocument("manager", "internal", "RRHH")     // true
 * canViewDocument("manager", "confidential", "Finanzas") // false
 * canViewDocument("finance", "confidential", "Finanzas") // true
 * canViewDocument("hr", "confidential", "Finanzas")      // false
 * canViewDocument("admin", "restricted", "Legal")        // true
 */
export function canViewDocument(
  userLevel:       AccessLevel,
  classification:  DocClassification,
  ownerDepartment: string,
): boolean {
  switch (classification) {
    case "public":
      return true;

    case "internal":
      return atLeast(userLevel, "manager");

    case "confidential": {
      if (userLevel === "admin") return true;

      const requiredLevel = OWNER_LEVEL_MAP[ownerDepartment];

      if (!requiredLevel) {
        return atLeast(userLevel, "manager");
      }

      return userLevel === requiredLevel;
    }

    case "restricted":
      return userLevel === "admin";
  }
}

// ── 4. Helper para filtrar arrays de documentos ───────────────────────────────

/**
 * Filtra una colección de documentos según el nivel de acceso del usuario.
 *
 * @typeParam T Tipo de documento compatible con clasificación y departamento propietario.
 * @param docs Colección de documentos a evaluar.
 * @param userLevel Nivel de acceso del usuario actual.
 * @returns Nueva colección que contiene únicamente los documentos autorizados.
 *
 * @remarks
 * Este helper reutiliza la lógica definida en {@link canViewDocument} para
 * aplicar autorización documental sobre arreglos completos.
 *
 * Es útil para:
 * - tablas de documentos,
 * - dashboards,
 * - listados filtrados,
 * - vistas parciales por módulo o categoría.
 */
export function filterDocsByAccess<T extends {
  classification:  DocClassification;
  ownerDepartment: string;
}>(docs: T[], userLevel: AccessLevel): T[] {
  return docs.filter((doc) =>
    canViewDocument(userLevel, doc.classification, doc.ownerDepartment),
  );
}