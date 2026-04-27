/**
 * @module HomeClient
 * Client Component que obtiene el token de MSAL y carga los datos
 * del homepage desde el Route Handler `/api/home`.
 *
 * @remarks
 * Solo se monta en produccion (`NEXT_PUBLIC_AUTH_BYPASS=false`).
 * En bypass, `HomePage` renderiza `HomePageContent` directamente
 * con mock data desde el servidor.
 *
 * **Flujo:**
 * 1. `useQuery` se ejecuta en cliente cuando MSAL terminó de inicializar
 *    (`inProgress === "none"`) y hay una cuenta activa.
 * 2. Obtiene el token con `getAccessToken()`.
 * 3. Llama a `GET /api/home` con `Authorization: Bearer {token}`.
 * 4. El Route Handler pasa el token a `getHomeData()` via header.
 * 5. Renderiza `HomePageContent` con los datos recibidos.
 *
 * @remarks
 * El guard `msalReady` evita que la query corra mientras MSAL está
 * procesando el redirect callback de Microsoft (`inProgress === "handleRedirect"`),
 * lo que causaba un loop login → home → login al volver de Entra ID.
 */

"use client";

import { useQuery }          from "@tanstack/react-query";
import { useMsal }           from "@azure/msal-react";
import { getAccessToken }    from "@/app/api/auth/msal";
import { HomePageContent }   from "./HomePageContent";
import type { HomeData }     from "@/types/home";

// -- Fetcher ------------------------------------------------------------------

/**
 * Obtiene los datos del homepage desde el Route Handler `/api/home`,
 * enviando el token de MSAL en el header `Authorization`.
 *
 * @returns Datos del homepage tipados como {@link HomeData}.
 * @throws Si el token no se puede obtener o el Route Handler falla.
 *
 * @internal
 */
async function fetchHomeData(): Promise<HomeData> {
  const token = await getAccessToken({ interactionMode: "redirect" });

  const res = await fetch("/api/home", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`[HomeClient] /api/home responded ${res.status}`);
  }

  return res.json() as Promise<HomeData>;
}

// -- Skeleton -----------------------------------------------------------------

/**
 * Skeleton de carga mientras se obtienen los datos del homepage.
 * @internal
 */
function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/70 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        <p className="text-sm text-slate-400">Cargando...</p>
      </div>
    </div>
  );
}

// -- Componente ---------------------------------------------------------------

/**
 * Orquestador cliente del homepage en modo produccion.
 *
 * @remarks
 * Espera a que MSAL termine de inicializar (`inProgress === "none"`) antes
 * de habilitar la query. Esto cubre el caso en que el usuario llega a esta
 * pagina justo después del redirect de Microsoft, cuando `handleRedirectPromise`
 * aún no ha terminado y `accounts[]` todavía está vacío.
 *
 * @returns `HomePageContent` con los datos cargados, o un skeleton
 *   mientras MSAL o la query resuelven.
 */
export function HomeClient() {
  const { accounts, inProgress } = useMsal();

  // MSAL listo = no hay ningún flujo en progreso (login, redirect, logout…)
  const msalReady  = inProgress === "none";
  const isLoggedIn = accounts.length > 0;

  const { data, isLoading, isError } = useQuery<HomeData>({
    queryKey:  ["home-data"],
    // Solo ejecutar cuando MSAL terminó de inicializar Y hay cuenta activa
    enabled:   msalReady && isLoggedIn,
    staleTime: 1000 * 60 * 5,
    queryFn:   fetchHomeData,
    retry:     false,
  });

  if (!msalReady || isLoading) return <HomeSkeleton />;

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-slate-50/70 flex items-center justify-center">
        <p className="text-sm text-slate-400">
          Error al cargar los datos. Recarga la pagina.
        </p>
      </div>
    );
  }

  return <HomePageContent data={data} />;
}