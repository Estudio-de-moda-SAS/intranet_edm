/**
 * @module devSession
 * Sesión de desarrollo para bypass de Microsoft Entra ID.
 *
 * Permite probar la intranet con distintos niveles de acceso sin necesidad
 * de autenticarse contra Azure AD. Expone dos modos de simulación
 * configurables mediante {@link DEV_MODE}:
 *
 * - **`'direct'`** — asigna el {@link AccessLevel} indicado en
 *   {@link DEV_USER_RAW}.`accessLevel` sin pasar por ninguna lógica de
 *   resolución.
 * - **`'groups'`** — simula grupos de Azure AD mediante {@link DEV_MOCK_GROUPS}
 *   y los resuelve con {@link resolveAccessLevelFromGroups}, exactamente igual
 *   que en producción.
 *
 * @remarks
 * Este módulo no usa `'use client'` y es accesible tanto desde Server
 * Components como desde Client Components.
 *
 * ⚠️ Solo debe usarse en entorno de desarrollo. No incluir en builds de
 * producción.
 */

import { resolveAccessLevel, type AccessLevel, type AppUser } from './roles';
import { resolveAccessLevelFromGroups }                        from './microsoft-graph';

// ── Modo activo ───────────────────────────────────────────────────────────────

/**
 * Modo de simulación activo.
 *
 * - `'direct'` — usa el `accessLevel` definido directamente en
 *   {@link DEV_USER_RAW}. Cambio de una línea para probar cualquier nivel.
 * - `'groups'` — resuelve el nivel a partir de {@link DEV_MOCK_GROUPS},
 *   simulando el flujo real de Azure AD sin tener los grupos creados.
 */
export const DEV_MODE: 'direct' | 'groups' = 'groups';

// ── Grupos simulados ──────────────────────────────────────────────────────────

/**
 * Grupos de Azure AD simulados. Solo aplica cuando {@link DEV_MODE} es
 * `'groups'`.
 *
 * Descomentar el grupo que se quiera simular. Los nombres deben coincidir
 * con los patrones definidos en `GROUP_NAME_PATTERNS` de `microsoft-graph.ts`
 * para que la resolución funcione correctamente.
 *
 * @example
 * ```ts
 * const DEV_MOCK_GROUPS = ['Finanzas-EDM-Intranet'];
 * // → accessLevel resuelto: 'finance'
 * ```
 */
export const DEV_MOCK_GROUPS: string[] = [
  // 'Finanzas-EDM-Intranet',
  // 'Juridica-EDM-Intranet',
  // 'Logistica-EDM-Intranet',
  // 'RRHH-EDM-Intranet',
  // 'TI-EDM-Intranet',
  // 'Retail-EDM-Intranet',
  // 'Servicios-Administrativos-EDM-Intranet',
  // 'Gerencia-EDM-Intranet',
  // 'Producto-EDM-Intranet',
   'Admin-EDM-Intranet',
];

// ── Usuario base ──────────────────────────────────────────────────────────────

/**
 * Datos base del usuario de desarrollo antes de resolver el nivel de acceso.
 *
 * El campo `accessLevel` solo se aplica cuando {@link DEV_MODE} es `'direct'`.
 * En modo `'groups'` es ignorado y el nivel se resuelve desde
 * {@link DEV_MOCK_GROUPS}.
 *
 * @internal
 */
export const DEV_USER_RAW = {
  id:          'dev-user-id',
  name:        'Juan Esteban Avendaño Gómez',
  email:       'aprendizti2@estudiodemoda.com.co',
  image:       null,
  role:        'Aprendiz TI 2',
  department:  'Tecnologia',
  location:    'Medellín, Colombia',
  employeeId:  'EMP-00142',
  joined:      'marzo 2024',
  phone:       '+57 310 555 0192',
  /** Solo aplica cuando {@link DEV_MODE} es `'direct'`. */
  accessLevel: 'employee' as AccessLevel | undefined,
};

// ── Resolución del nivel ──────────────────────────────────────────────────────

/**
 * Resuelve el {@link AccessLevel} del usuario de desarrollo según el
 * {@link DEV_MODE} activo.
 *
 * Se llama en cada request a través del proxy de sesión y no se cachea
 * como constante, de modo que cambiar {@link DEV_MODE} o
 * {@link DEV_MOCK_GROUPS} y guardar el archivo refleja el cambio
 * inmediatamente gracias al HMR de Next.js.
 *
 * @returns El {@link AccessLevel} resuelto para la sesión de desarrollo.
 */
export function resolveDevAccessLevel(): AccessLevel {
  if (DEV_MODE === 'groups') {
    const mockGroups = DEV_MOCK_GROUPS.map((name, i) => ({
      id:          `mock-group-${i}`,
      displayName: name,
    }));
    return resolveAccessLevelFromGroups(
      mockGroups,
      DEV_USER_RAW.department,
      DEV_USER_RAW.role,
    );
  }
  return DEV_USER_RAW.accessLevel
    ?? resolveAccessLevel(DEV_USER_RAW.department, DEV_USER_RAW.role);
}

const resolvedLevel: AccessLevel = resolveDevAccessLevel();

/**
 * Usuario de desarrollo con el {@link AccessLevel} ya resuelto.
 * Listo para usarse como valor de `session.user` en cualquier componente.
 */
export const DEV_USER: AppUser = {
  ...DEV_USER_RAW,
  accessLevel: resolvedLevel,
};

/**
 * Sesión de desarrollo completa, con formato compatible con el objeto
 * `Session` de NextAuth.
 *
 * Usar en el proxy de sesión (`useSession` / `auth()`) cuando
 * `NODE_ENV === 'development'`.
 */
export const DEV_SESSION = {
  user:        DEV_USER,
  accessToken: 'dev-token',
  expires:     '2099-01-01',
};

// ── Presets de usuarios de prueba ─────────────────────────────────────────────

/**
 * Colección de usuarios de prueba predefinidos, uno por cada
 * {@link AccessLevel} del sistema.
 *
 * Útil para probar rápidamente la UI con distintos perfiles sin modificar
 * {@link DEV_USER_RAW}. Se puede usar en combinación con un selector de
 * usuario en la barra de desarrollo.
 *
 * @example
 * ```ts
 * // Simular una sesión como analista financiera
 * const session = { user: DEV_USERS.finance, ... };
 * ```
 */
export const DEV_USERS: Record<string, AppUser> = {
  employee: {
    ...DEV_USER,
    name:        'Carlos Ríos',
    role:        'Auxiliar Administrativo',
    department:  'Servicios Administrativos',
    accessLevel: 'employee',
  },
  manager: {
    ...DEV_USER,
    name:        'Andrea Morales',
    role:        'Directora General',
    department:  'Gerencia',
    accessLevel: 'manager',
  },
  admin_services: {
    ...DEV_USER,
    name:        'Luisa Fernanda Pérez',
    role:        'Coordinadora de Recepción',
    department:  'Servicios Administrativos',
    accessLevel: 'admin_services',
  },
  hr: {
    ...DEV_USER,
    name:        'Daniela Quintero',
    role:        'Coordinadora de Talento Humano',
    department:  'Recursos Humanos',
    accessLevel: 'hr',
  },
  retail: {
    ...DEV_USER,
    name:        'Mateo Londoño',
    role:        'Gerente Comercial',
    department:  'Retail',
    accessLevel: 'retail',
  },
  logistics: {
    ...DEV_USER,
    name:        'Felipe Castaño',
    role:        'Coordinador de Logística',
    department:  'Logística',
  },
  it: {
    ...DEV_USER,
    name:        'Juan Esteban Avendaño Gómez',
    role:        'Aprendiz TI 2',
    department:  'Tecnología',
    accessLevel: 'it',
  },
  legal: {
    ...DEV_USER,
    name:        'Valentina Ospina',
    role:        'Abogada Corporativa Senior',
    department:  'Jurídica',
    accessLevel: 'legal',
  },
  finance: {
    ...DEV_USER,
    name:        'Camila Torres',
    role:        'Analista Financiera Senior',
    department:  'Finanzas',
    accessLevel: 'finance',
  },
  admin: {
    ...DEV_USER,
    name:        'Sebastián Vargas',
    role:        'Administrador de Plataforma',
    department:  'Tecnología',
    accessLevel: 'admin',
  },
};