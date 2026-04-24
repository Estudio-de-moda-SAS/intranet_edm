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

  // "popup" en vez de "redirect": si el silent falla, muestra un popup
  // en lugar de redirigir a Microsoft y romper el flujo de navegación.
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

  const hireDate  = formatHireDate(graphProfile?.hireDate);
  const user: AppUser = {
    id:         "",   // se sobreescribe en el hook
    name:       "",   // se sobreescribe en el hook
    email:      "",   // se sobreescribe en el hook
    image:      null,
    role:       graphProfile?.jobTitle    ?? "",
    department: graphProfile?.department  ?? "",
    accessLevel,
    ...(graphProfile?.officeLocation                                    && { location:   graphProfile.officeLocation }),
    ...(graphProfile?.employeeId                                        && { employeeId: graphProfile.employeeId    }),
    ...(hireDate                                                        && { joined:     hireDate                   }),
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
 * `isLoading` es siempre `false`.
 *
 * **Modo producción**:
 * Obtiene el access token con {@link getAccessToken} y consulta Graph.
 * Solo se ejecuta si MSAL tiene al menos una cuenta autenticada.
 *
 * La query key incluye el `homeAccountId` de la cuenta activa para
 * invalidar el caché automáticamente si el usuario cambia de cuenta.
 *
 * @returns Resultado de TanStack Query con {@link GraphProfileResult}
 *   como `data`, más los estados estándar `isLoading`, `isError`, `error`.
 *
 * @example
 * ```tsx
 * const { data, isLoading, isError } = useGraphProfile();
 *
 * if (isLoading) return <Spinner />;
 * if (isError)   return <ErrorBanner />;
 *
 * const { user, accessLevel } = data!;
 * ```
 */
export function useGraphProfile() {
  // ── Modo bypass ──────────────────────────────────────────────────────────
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

  // ── Modo producción ──────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { accounts, inProgress } = useMsal();
  const account    = accounts[0];
  const msalReady  = inProgress === "none";
  const isLoggedIn = !!account;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const query = useQuery({
    queryKey:  ["graph-profile", account?.homeAccountId ?? ""],
    // Solo ejecutar cuando MSAL terminó de procesar cualquier flujo
    // (incluido el handleRedirectPromise del callback de Microsoft)
    enabled:   msalReady && isLoggedIn,
    staleTime: STALE_TIME,
    queryFn:   () => fetchGraphProfile(account!.homeAccountId),
    select:    (data) => ({
      ...data,
      user: {
        ...data.user,
        id:    account?.localAccountId  ?? data.user.id,
        name:  account?.name            ?? data.user.name,
        email: account?.username        ?? data.user.email,
      },
    }),
  });

  return query;
}