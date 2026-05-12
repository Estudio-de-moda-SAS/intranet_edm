/**
 * @module useGraphProfile
 * Hook que obtiene y cachea el perfil de Microsoft Graph del colaborador
 * autenticado con MSAL.
 *
 * @remarks
 * Reemplaza la lógica que antes vivía en el callback `jwt` de `auth.ts`:
 * consulta `/v1.0/me` y `/v1.0/me/memberOf` en paralelo, resuelve el
 * {@link AccessLevel} del colaborador y construye el {@link AppUser} completo.
 *
 * El resultado se cachea **15 minutos** vía TanStack Query para evitar
 * llamadas repetidas a Graph en cada render, equivalente al comportamiento
 * del JWT de NextAuth que calculaba el perfil una sola vez por sesión.
 *
 * **Modo bypass:**
 * Cuando `NEXT_PUBLIC_AUTH_BYPASS === "true"` el hook retorna
 * {@link DEV_SESSION} directamente sin invocar MSAL ni Graph.
 *
 * **Roles desactivados:**
 * Cuando {@link DEV_DISABLE_ROLES} es `true` el hook retorna `admin`
 * directamente sin invocar Graph, evitando que grupos con `displayName: null`
 * (permisos de Azure AD pendientes) caigan al fallback `employee`.
 * Para restaurar el comportamiento real: asignar `DEV_DISABLE_ROLES = false`
 * en `config/config.ts`, o eliminar la constante por completo.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useGraphProfile();
 * if (isLoading) return <Spinner />;
 * console.log(data?.user.accessLevel); // 'finance', 'it', etc.
 * ```
 */

"use client";

import { useMsal }                       from "@azure/msal-react";
import { useQuery }                      from "@tanstack/react-query";
import { getAccessToken }                from "@/app/api/auth/msal";
import {
  getMicrosoftGraphProfile,
  getMicrosoftGraphGroups,
  resolveAccessLevelFromGroups,
  formatHireDate,
}                                        from "@/lib/microsoft-graph";
import type { AppUser, AccessLevel }     from "@/lib/roles";
import { DEV_SESSION }                   from "@/lib/devSession";
import { DEV_DISABLE_ROLES }             from "@/config/config";

// ── Constantes ────────────────────────────────────────────────────────────────

const isBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

/** Tiempo en ms que el perfil se considera fresco sin refetch. */
const STALE_TIME = 1000 * 60 * 15; // 15 minutos

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Datos resueltos del perfil de Microsoft Graph listos para consumir
 * en los componentes de la intranet.
 */
export interface GraphProfileResult {
  /** Usuario completo con todos los campos de {@link AppUser} resueltos. */
  user: AppUser;
  /** Nivel de acceso resuelto desde los grupos de Azure AD. */
  accessLevel: AccessLevel;
  /** Token de acceso de Microsoft Graph para llamadas directas a la API. */
  accessToken: string;
}

// ── Fetcher ───────────────────────────────────────────────────────────────────

/**
 * Función de fetch que obtiene el perfil y grupos de Graph en paralelo
 * y construye el {@link GraphProfileResult}.
 *
 * @remarks
 * Usa `interactionMode: "popup"` deliberadamente para evitar que un fallo
 * silencioso de token dispare un `loginRedirect` completo, lo que causaría
 * un loop login → home → login. El popup solo aparece si `acquireTokenSilent`
 * falla y la sesión de MSAL sigue activa — caso muy poco frecuente.
 *
 * El `"redirect"` se reserva exclusivamente para `LoginPage`, donde el
 * usuario ya espera ser redirigido a Microsoft.
 *
 * @param accountId - `homeAccountId` de la cuenta MSAL activa.
 *   Se usa como parte de la query key para invalidar el caché si el
 *   usuario cambia de cuenta.
 * @returns {@link GraphProfileResult} con el perfil completo resuelto.
 * @throws Si no se puede obtener el access token o el perfil de Graph.
 *
 * @internal
 */
async function fetchGraphProfile(
  accountId: string
): Promise<GraphProfileResult> {
  void accountId; // usado solo como cache key, no se necesita en el cuerpo

  const accessToken = await getAccessToken({ interactionMode: "popup" });

  const [graphProfile, graphGroups] = await Promise.all([
    getMicrosoftGraphProfile(accessToken),
    getMicrosoftGraphGroups(accessToken),
  ]);

  const accessLevel = resolveAccessLevelFromGroups(
    graphGroups,
    graphProfile?.department  ?? null,
    graphProfile?.jobTitle    ?? null,
  );

  const hireDate = formatHireDate(graphProfile?.hireDate);
  const user: AppUser = {
    id:         "",
    name:       "",
    email:      "",
    image:      null,
    role:       graphProfile?.jobTitle    ?? "",
    department: graphProfile?.department  ?? "",
    accessLevel,
    ...(graphProfile?.officeLocation                                     && { location:   graphProfile.officeLocation }),
    ...(graphProfile?.employeeId                                         && { employeeId: graphProfile.employeeId    }),
    ...(hireDate                                                         && { joined:     hireDate                   }),
    ...((graphProfile?.mobilePhone ?? graphProfile?.businessPhones?.[0]) && {
      phone: graphProfile.mobilePhone ?? graphProfile.businessPhones![0]!,
    }),
  };

  return { user, accessLevel, accessToken };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Hook que provee el perfil de Microsoft Graph del colaborador autenticado.
 *
 * @remarks
 * Internamente decide la fuente de datos según el modo activo:
 *
 * **Modo bypass** (`NEXT_PUBLIC_AUTH_BYPASS === "true"`):
 * Retorna {@link DEV_SESSION} directamente, sin MSAL ni Graph.
 *
 * **Roles desactivados** (`DEV_DISABLE_ROLES === true`):
 * Retorna `admin` directamente sin llamar a Graph. Evita que grupos de
 * Azure AD con `displayName: null` (permisos pendientes de Admin Consent)
 * caigan al fallback `employee`.
 * Para restaurar: `DEV_DISABLE_ROLES = false` en `config/config.ts`.
 *
 * **Modo producción**:
 * Obtiene el access token con {@link getAccessToken} y consulta Graph.
 * Solo se ejecuta si MSAL tiene al menos una cuenta autenticada.
 *
 * ⚠️ Todos los hooks se invocan incondicionalmente para respetar las
 * Rules of Hooks. El flag {@link DEV_DISABLE_ROLES} solo afecta el valor
 * de retorno, nunca el orden de invocación de hooks.
 *
 * @returns Resultado de TanStack Query con {@link GraphProfileResult}
 *   como `data`, más los estados estándar `isLoading`, `isError`, `error`.
 */
export function useGraphProfile() {
  // ── Modo bypass — retorno temprano seguro porque isBypass es constante de build ──
  if (isBypass) {
    const devUser = DEV_SESSION.user as AppUser;
    return {
      data: {
        user:        devUser,
        accessLevel: devUser.accessLevel,
        accessToken: "bypass-token",
      } satisfies GraphProfileResult,
      isLoading: false,
      isError:   false,
      error:     null,
    };
  }

  // ── Hooks — siempre se invocan, nunca dentro de un condicional ───────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { accounts, inProgress } = useMsal();
  const account    = accounts[0];
  const msalReady  = inProgress === "none";
  const isLoggedIn = !!account;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const query = useQuery({
    queryKey:  ["graph-profile", account?.homeAccountId ?? ""],
    // Desactivar la query cuando los roles están desactivados — no hace falta
    // llamar a Graph si vamos a ignorar el resultado de todas formas.
    enabled:   !DEV_DISABLE_ROLES && msalReady && isLoggedIn,
    staleTime: STALE_TIME,
    queryFn:   () => fetchGraphProfile(account!.homeAccountId),
    select:    (data) => ({
      ...data,
      user: {
        ...data.user,
        id:    account?.localAccountId ?? data.user.id,
        name:  account?.name           ?? data.user.name,
        email: account?.username       ?? data.user.email,
      },
    }),
  });

  // ── Roles desactivados → devolver admin sin usar el resultado de Graph ───
  // Los grupos de Azure AD devuelven displayName: null porque los permisos
  // de Admin Consent están pendientes. Esto evita caer al fallback employee.
  // Para restaurar el flujo real: DEV_DISABLE_ROLES = false en config/config.ts
  if (DEV_DISABLE_ROLES) {
    const account0 = accounts[0];
    const devUser  = DEV_SESSION.user as AppUser;
    return {
      data: {
        user: {
          ...devUser,
          accessLevel: "admin" as AccessLevel,
          ...(account0 && {
            id:    account0.localAccountId,
            name:  account0.name     ?? devUser.name,
            email: account0.username ?? devUser.email,
          }),
        },
        accessLevel: "admin" as AccessLevel,
        accessToken: "dev-roles-disabled-token",
      } satisfies GraphProfileResult,
      isLoading: false,
      isError:   false,
      error:     null,
    };
  }

  return query;
}