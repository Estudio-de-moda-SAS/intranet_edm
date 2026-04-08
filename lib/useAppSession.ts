/**
 * @module useAppSession
 * Hook unificado de sesión para la intranet EDM.
 *
 * @remarks
 * Abstrae la fuente de autenticación activa — bypass de desarrollo o
 * NextAuth con Microsoft Entra ID — exponiendo siempre la misma interfaz
 * {@link AppSession} a los componentes cliente.
 *
 * El modo de operación se determina en tiempo de build a partir de la
 * variable de entorno `NEXT_PUBLIC_AUTH_BYPASS`:
 * - `"true"` → retorna {@link DEV_SESSION} directamente, sin invocar NextAuth.
 * - cualquier otro valor → delega en `useSession()` de NextAuth con Entra ID.
 *
 * @example
 * ```tsx
 * const { user, level, can, isLoading } = useAppSession();
 *
 * if (isLoading) return <Spinner />;
 * if (can('finance:view_dashboard')) return <FinanceDashboard />;
 * ```
 */

'use client';

import { useSession }                            from 'next-auth/react';
import { DEV_SESSION }                           from './devSession';
import { can as canFn, resolveAccessLevel }      from './roles';
import type { AccessLevel, AppUser, Permission } from './roles';

const isBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true';

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Contrato de retorno del hook {@link useAppSession}.
 *
 * Unifica el acceso a la sesión independientemente de si la autenticación
 * proviene del bypass de desarrollo o de NextAuth con Entra ID. Todos los
 * campos están siempre presentes — nunca es necesario comprobar la fuente
 * de autenticación en los componentes consumidores.
 */
export interface AppSession {
  /**
   * Usuario resuelto con todos los campos de {@link AppUser}.
   *
   * - En modo bypass: siempre definido (nunca `null`) porque {@link DEV_SESSION}
   *   está disponible de forma síncrona.
   * - En producción: `null` mientras `isLoading = true` o si no hay sesión activa.
   */
  user: AppUser | null;

  /**
   * Nivel de acceso resuelto para el usuario actual.
   *
   * Proviene de `user.accessLevel` en modo bypass, o de los claims de la
   * sesión de NextAuth con fallback a {@link resolveAccessLevel} en producción.
   * Retorna `'employee'` cuando no hay sesión activa.
   */
  level: AccessLevel;

  /**
   * Función de verificación de permisos preconfigurada con el nivel
   * de acceso del usuario actual.
   *
   * @remarks
   * Es un atajo de {@link canFn} de `roles.ts` con el `level` ya aplicado,
   * evitando pasarlo manualmente en cada llamada desde los componentes.
   * Retorna `false` en todos los casos cuando no hay sesión activa.
   *
   * @param permission - Permiso a verificar (ej. `'finance:view_dashboard'`).
   * @returns `true` si el nivel actual posee el permiso; `false` en caso
   *   contrario o si no hay sesión activa.
   *
   * @example
   * ```ts
   * if (can('hr:manage_employees')) { ... }
   * ```
   */
  can: (permission: Permission) => boolean;

  /**
   * `true` mientras NextAuth resuelve el estado de la sesión.
   *
   * Siempre `false` en modo bypass — la sesión de desarrollo está
   * disponible de forma síncrona sin peticiones de red.
   */
  isLoading: boolean;

  /**
   * `true` si hay una sesión activa y {@link user} no es `null`.
   *
   * Siempre `true` en modo bypass.
   */
  isAuthed: boolean;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Hook unificado que provee la sesión del usuario autenticado y utilidades
 * de control de acceso basado en roles.
 *
 * @remarks
 * Internamente evalúa `NEXT_PUBLIC_AUTH_BYPASS` para decidir la fuente
 * de autenticación:
 *
 * **Modo bypass** (`NEXT_PUBLIC_AUTH_BYPASS === "true"`):
 * Retorna {@link DEV_SESSION} directamente sin invocar `useSession()`.
 * Permite simular cualquier nivel de acceso en desarrollo modificando
 * `devSession.ts`, sin depender de Microsoft Entra ID.
 *
 * **Modo producción**:
 * Invoca `useSession()` de NextAuth y mapea `session.user` al tipo
 * {@link AppUser}. Si `accessLevel` no viene en los claims de la sesión,
 * lo resuelve mediante {@link resolveAccessLevel} usando `department` y
 * `role` del perfil de Entra ID.
 *
 * ⚠️ El hook evalúa condicionalmente `useSession()` según el valor de
 * `NEXT_PUBLIC_AUTH_BYPASS`. Esto es seguro porque dicha variable es una
 * constante reemplazada en tiempo de build por Next.js — su valor nunca
 * cambia en tiempo de ejecución, por lo que el orden de invocación de hooks
 * es siempre el mismo dentro de una build dada.
 *
 * @returns Objeto {@link AppSession} con el usuario resuelto, nivel de
 *   acceso, función `can` y estados de carga y autenticación.
 *
 * @example
 * ```tsx
 * // Componente con control de acceso
 * export default function FinancePanel() {
 *   const { user, can, isLoading } = useAppSession();
 *
 *   if (isLoading) return <Spinner />;
 *   if (!can('finance:view_dashboard')) return <Unauthorized />;
 *
 *   return <Dashboard user={user!} />;
 * }
 * ```
 */
export function useAppSession(): AppSession {

  if (isBypass) {
    const user  = DEV_SESSION.user as AppUser;
    const level = user.accessLevel;
    return {
      user,
      level,
      can:       (permission) => canFn(level, permission),
      isLoading: false,
      isAuthed:  true,
    };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  if (!session?.user) {
    return {
      user:      null,
      level:     'employee',
      can:       () => false,
      isLoading,
      isAuthed:  false,
    };
  }

  const rawUser = session.user as AppUser & {
    department?: string;
    accessLevel?: AccessLevel;
  };

  const level: AccessLevel =
    rawUser.accessLevel ??
    resolveAccessLevel(rawUser.department, rawUser.role);

  const user: AppUser = {
    id:          rawUser.id         ?? '',
    name:        rawUser.name       ?? '',
    email:       rawUser.email      ?? '',
    image:       rawUser.image      ?? null,
    role:        rawUser.role       ?? '',
    department:  rawUser.department ?? '',
    accessLevel: level,
    location:    (rawUser as any).location,
    employeeId:  (rawUser as any).employeeId,
    joined:      (rawUser as any).joined,
    phone:       (rawUser as any).phone,
  };

  return {
    user,
    level,
    can:      (permission) => canFn(level, permission),
    isLoading,
    isAuthed: true,
  };
}