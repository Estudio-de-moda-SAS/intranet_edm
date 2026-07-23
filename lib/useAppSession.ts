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
 * **Sobre `DEV_DISABLE_ROLES`:**
 * Este hook YA NO tiene manejo propio de esa bandera. Toda la lógica de
 * "forzar accessLevel a admin mientras los permisos de Azure AD están
 * pendientes" vive únicamente en {@link useGraphProfile} — `useAppSession`
 * simplemente usa el `data` que ese hook ya resuelve correctamente, para
 * evitar dos copias de la misma lógica desincronizándose entre sí.
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
 * **Modo producción**:
 * Usa {@link useGraphProfile} para obtener el perfil desde Graph con el
 * token de MSAL. Mientras el perfil se resuelve, `isLoading` es `true` y
 * `user` es `null`. Si MSAL no tiene sesión activa, retorna el estado
 * "no autenticado" con `isAuthed: false`. El manejo de `DEV_DISABLE_ROLES`
 * (forzar `accessLevel` a `"admin"`) ocurre dentro de `useGraphProfile` —
 * este hook no lo duplica.
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

  // Nota: antes existía aquí un bloque especial para DEV_DISABLE_ROLES que
  // sustituía el usuario completo por DEV_SESSION (el mock de desarrollo).
  // Se eliminó porque duplicaba —y desincronizaba— la misma lógica que ya
  // vive en useGraphProfile: ese hook ya consulta Graph siempre (sin
  // desactivarse por DEV_DISABLE_ROLES) y ya fuerza accessLevel a "admin"
  // sin tocar el resto del perfil. useAppSession ahora confía 100% en el
  // `data` que useGraphProfile ya resuelve correctamente, en vez de
  // mantener una segunda copia de la misma bandera que podía quedar
  // desactualizada respecto a la otra (que fue justo lo que causó que el
  // cargo mostrara "Aprendiz TI 2" para todos los usuarios).

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