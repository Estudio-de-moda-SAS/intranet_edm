/**
 * @module HomePage
 * Pagina principal de la intranet (Home).
 *
 * @remarks
 * Server Component puro que actua como punto de entrada para la vista
 * principal de la aplicacion.
 *
 * **Modo bypass:**
 * Llama a `getHomeData()` directamente — retorna mock data sin token.
 *
 * **Modo produccion:**
 * Renderiza `HomeClient` que obtiene el token con MSAL y llama a
 * `/api/home` con el header `Authorization: Bearer {token}`.
 * El Route Handler reenvía el token a Graph y retorna los datos.
 *
 * Este patron garantiza que el token de MSAL nunca se necesita en el
 * servidor durante el render inicial — fluye del cliente al Route Handler.
 */

import { getHomeData }       from "@/lib/graph/home.service";
import { HomePageContent }   from "./components/HomePageContent";
import { HomeClient }        from "./components/HomeClient";
import { PageTransition }    from "@/app/components/ui/PageTransition";
import type { HomeData }     from "@/types/home";

const IS_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

/**
 * Componente principal de la pagina Home.
 *
 * @returns Pagina renderizada con datos obtenidos en servidor (bypass)
 *   o delegada al cliente para obtener el token (produccion).
 */
export default async function HomePage() {

  // En bypass: datos mock disponibles directamente en servidor
  if (IS_BYPASS) {
    const data: HomeData = await getHomeData();
    return (
      <PageTransition>
        <HomePageContent data={data} />
      </PageTransition>
    );
  }

  // En produccion: HomeClient obtiene el token con MSAL,
  // llama a /api/home con Authorization header y renderiza
  // HomePageContent cuando los datos llegan.
  return (
    <PageTransition>
      <HomeClient />
    </PageTransition>
  );
}