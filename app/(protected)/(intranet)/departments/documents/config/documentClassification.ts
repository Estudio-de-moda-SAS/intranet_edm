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
import { atLeast
 }     from "@/lib/roles";

// ── 1. Clasificaciones ────────────────────────────────────────────────────────

export type DocClassification =
  | 'public'        // Visible para todos — políticas generales, manuales de uso
  | 'internal'      // Solo empleados manager+ — procedimientos internos
  | 'confidential'  // Solo el área propietaria + admin — datos sensibles del área
  | 'restricted';   // Solo admin — documentos estratégicos / legales críticos

export const CLASSIFICATION_META: Record<DocClassification, {
  label:       string;
  description: string;
  badgeColor:  string;
  badgeBg:     string;
  badgeBorder: string;
}> = {
  public: {
    label:       'Público',
    description: 'Visible para todos los colaboradores',
    badgeColor:  'text-emerald-700',
    badgeBg:     'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
  },
  internal: {
    label:       'Interno',
    description: 'Solo managers y superiores',
    badgeColor:  'text-sky-700',
    badgeBg:     'bg-sky-50',
    badgeBorder: 'border-sky-200',
  },
  confidential: {
    label:       'Confidencial',
    description: 'Restringido al área propietaria',
    badgeColor:  'text-amber-700',
    badgeBg:     'bg-amber-50',
    badgeBorder: 'border-amber-200',
  },
  restricted: {
    label:       'Restringido',
    description: 'Solo administradores',
    badgeColor:  'text-rose-700',
    badgeBg:     'bg-rose-50',
    badgeBorder: 'border-rose-200',
  },
};

// ── 2. Mapa área propietaria → AccessLevel requerido ─────────────────────────
//
// Para documentos "confidential", el usuario debe tener el nivel del área.

const OWNER_LEVEL_MAP: Record<string, AccessLevel> = {
  'Finanzas':                  'finance',
  'Legal':                     'legal',
  'Jurídica':                  'legal',
  'Logística':                 'logistics',
  'Retail':                    'retail',
  'Comercial':                 'retail',
  'RRHH':                      'hr',
  'Recursos Humanos':          'hr',
  'Tecnología':                'it',
  'TI':                        'it',
  'Seguridad IT':              'it',
  'Infraestructura':           'it',
  'Servicios Administrativos': 'admin_services',
  'Gerencia':                  'manager',
  'Procurement':               'manager',
  'Sales Ops':                 'retail',
};

// ── 3. Función principal de autorización ─────────────────────────────────────

/**
 * Determina si un AccessLevel puede ver un documento dado su clasificación
 * y departamento propietario.
 *
 * @example
 * canViewDocument('employee', 'public',       'RRHH')      // true
 * canViewDocument('employee', 'internal',     'RRHH')      // false
 * canViewDocument('manager',  'internal',     'RRHH')      // true
 * canViewDocument('manager',  'confidential', 'Finanzas')  // false
 * canViewDocument('finance',  'confidential', 'Finanzas')  // true
 * canViewDocument('hr',       'confidential', 'Finanzas')  // false
 * canViewDocument('admin',    'restricted',   'Legal')     // true
 */
export function canViewDocument(
  userLevel:       AccessLevel,
  classification:  DocClassification,
  ownerDepartment: string,
): boolean {
  switch (classification) {
    case 'public':
      return true;

    case 'internal':
      return atLeast(userLevel, 'manager');

    case 'confidential': {
      if (userLevel === 'admin') return true;
      const requiredLevel = OWNER_LEVEL_MAP[ownerDepartment];
      if (!requiredLevel) return atLeast(userLevel, 'manager'); // fallback seguro
      return userLevel === requiredLevel;
    }

    case 'restricted':
      return userLevel === 'admin';
  }
}

// ── 4. Helper para filtrar arrays de documentos ───────────────────────────────

export function filterDocsByAccess<T extends {
  classification:  DocClassification;
  ownerDepartment: string;
}>(docs: T[], userLevel: AccessLevel): T[] {
  return docs.filter((doc) =>
    canViewDocument(userLevel, doc.classification, doc.ownerDepartment),
  );
}
