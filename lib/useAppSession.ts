/**
 * @module useAppSession
 * Hook unificado de sesión para la intranet EDM.
 *
 * @remarks
 * Abstrae la fuente de autenticación activa — bypass de desarrollo o
 * MSAL con Microsoft Entra ID — exponiendo siempre la misma interfaz
 * {@link AppSession} a los componentes cliente.
 *
 * El modo de operación se determina en tiempo de build a partir de la
 * variable de entorno `NEXT_PUBLIC_AUTH_BYPASS`:
 * - `"true"` → retorna {@link DEV_SESSION} directamente, sin invocar MSAL.
 * - cualquier otro valor → delega en {@link useGraphProfile} que obtiene
 *   el perfil desde Microsoft Graph usando MSAL.
 *
 * El contrato de retorno {@link AppSession} es **idéntico** al anterior
 * — ningún componente consumidor necesita cambios.
 *
 * @example
 * ```tsx
 * const { user, level, can, isLoading } = useAppSession();
 *
 * if (isLoading) return <Spinner />;
 * if (can('finance:view_dashboard')) return <FinanceDashboard />;
 * ```
 */

"use client";

import { useMsal }                               from "@azure/msal-react";
import { useGraphProfile }                       from "./useGraphProfile";
import { DEV_SESSION }                           from "./devSession";
import { can as canFn }                          from "./roles";
import { DEV_DISABLE_ROLES }                     from "@/config/config";
import type { AccessLevel, AppUser, Permission } from "./roles";

const isBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Contrato de retorno del hook {@link useAppSession}.
 *
 * Unifica el acceso a la sesión independientemente de si la autenticación
 * proviene del bypass de desarrollo o de MSAL con Entra ID. Todos los
 * campos están siempre presentes — nunca es necesario comprobar la fuente
 * de autenticación en los componentes consumidores.
 */
export interface AppSession {
  /**
   * Usuario resuelto con todos los campos de {@link AppUser}.
   *
   * - En modo bypass: siempre definido (nunca `null`).
   * - En producción: `null` mientras `isLoading = true` o si no hay
   *   sesión activa en MSAL.
   */
  user: AppUser | null;

  /**
   * Nivel de acceso resuelto para el usuario actual.
   *
   * Retorna `'employee'` cuando no hay sesión activa.
   */
  level: AccessLevel;

  /**
   * Función de verificación de permisos preconfigurada con el nivel
   * de acceso del usuario actual.
   *
   * @remarks
   * Atajo de {@link canFn} de `roles.ts` con el `level` ya aplicado.
   * Retorna `false` en todos los casos cuando no hay sesión activa.
   *
   * @param permission - Permiso a verificar (ej. `'finance:view_dashboard'`).
   * @returns `true` si el nivel actual posee el permiso.
   *
   * @example
   * ```ts
   * if (can('hr:manage_employees')) { ... }
   * ```
   */
  can: (permission: Permission) => boolean;

  /**
   * `true` mientras MSAL y Graph resuelven el estado de la sesión.
   * Siempre `false` en modo bypass.
   */
  isLoading: boolean;

  /**
   * `true` si hay una sesión activa y {@link user} no es `null`.
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
 * **Modo bypass** (`NEXT_PUBLIC_AUTH_BYPASS === "true"`):
 * Retorna {@link DEV_SESSION} directamente sin invocar MSAL ni Graph.
 *
 * **Roles desactivados** (`DEV_DISABLE_ROLES === true`):
 * En cuanto MSAL confirma que hay sesión activa, devuelve `admin` sin
 * esperar a que Graph resuelva — la query está desactivada en este modo.
 * Para restaurar: `DEV_DISABLE_ROLES = false` en `config/config.ts`.
 *
 * **Modo producción**:
 * Usa {@link useGraphProfile} para obtener el perfil desde Graph con el
 * token de MSAL. Mientras el perfil se resuelve, `isLoading` es `true` y
 * `user` es `null`. Si MSAL no tiene sesión activa, retorna el estado
 * "no autenticado" con `isAuthed: false`.
 *
 * ⚠️ `isBypass` es una constante de build — su valor nunca cambia en
 * tiempo de ejecución, por lo que el orden de invocación de hooks es
 * siempre el mismo dentro de una build dada y no viola las reglas de hooks.
 *
 * @returns Objeto {@link AppSession} con el usuario resuelto, nivel de
 *   acceso, función `can` y estados de carga y autenticación.
 */
export function useAppSession(): AppSession {

  // ── Modo bypass ────────────────────────────────────────────────────────
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

  // ── Modo producción ────────────────────────────────────────────────────

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { accounts } = useMsal();
  const hasMsalSession = accounts.length > 0;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data, isLoading } = useGraphProfile();

  // Sin sesión MSAL → no autenticado
  if (!hasMsalSession) {
    return {
      user:      null,
      level:     "employee",
      can:       () => false,
      isLoading: false,
      isAuthed:  false,
    };
  }

  // Roles desactivados → hay sesión MSAL, no hace falta esperar a Graph.
  // useGraphProfile tiene la query desactivada en este modo, data nunca llega.
  // Para restaurar: DEV_DISABLE_ROLES = false en config/config.ts
  if (DEV_DISABLE_ROLES) {
    const account = accounts[0];
    const base    = DEV_SESSION.user as AppUser;
    const user: AppUser = {
      ...base,
      accessLevel: "admin",
      ...(account && {
        id:    account.localAccountId,
        name:  account.name     ?? base.name,
        email: account.username ?? base.email,
      }),
    };
    return {
      user,
      level:     "admin",
      can:       () => true,
      isLoading: false,
      isAuthed:  true,
    };
  }

  // Graph aún está resolviendo
  if (isLoading || !data) {
    return {
      user:      null,
      level:     "employee",
      can:       () => false,
      isLoading: true,
      isAuthed:  false,
    };
  }

  const { user, accessLevel: level } = data;

  return {
    user,
    level,
    can:      (permission) => canFn(level, permission),
    isLoading: false,
    isAuthed:  true,
  };
}