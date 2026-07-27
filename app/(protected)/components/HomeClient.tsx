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
 *
 * @remarks
 * `fetchHomeData` pide el token con `interactionMode: "redirect"` a
 * propósito: esta query se dispara sola al montar el componente, sin
 * ningún gesto de clic del usuario. Si la sesión venció y `getAccessToken`
 * intentara `acquireTokenPopup` (el modo por defecto), el navegador
 * bloquearía el `window.open` por no venir de una interacción directa,
 * y el usuario quedaría atascado viendo un error sin salida real —
 * incluso recargando, porque el mismo flujo se repite.
 */

"use client";

import { useQuery }          from "@tanstack/react-query";
import { useMsal }           from "@azure/msal-react";
import { getAccessToken, ensureLogin } from "@/app/api/auth/msal";
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
      <div className="min-h-screen bg-slate-50/70 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-slate-500">
            No pudimos cargar tu información. Esto puede pasar si tu sesión
            expiró.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300"
            >
              Reintentar
            </button>

            <button
              type="button"
              onClick={() => ensureLogin("redirect")}
              className="rounded-full bg-violet-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-violet-700"
            >
              Iniciar sesión de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <HomePageContent data={data} />;
}