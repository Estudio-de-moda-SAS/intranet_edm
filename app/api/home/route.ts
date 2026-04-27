/**
 * @module app/api/home/route
 * Route Handler que sirve los datos del homepage al cliente.
 *
 * @remarks
 * Este Route Handler es el puente entre el cliente MSAL y los services
 * de servidor que consultan Microsoft Graph.
 *
 * **Flujo:**
 * 1. El Client Component obtiene el token con `getAccessToken()` de MSAL.
 * 2. Lo envía en el header `Authorization: Bearer {token}`.
 * 3. Este Route Handler lo recibe y lo reenvía a `getHomeData()`.
 * 4. `getHomeData()` lo pasa a `getSharedData()` y a `callGraph()`.
 * 5. Los datos se retornan como JSON al cliente.
 *
 * Mientras `GRAPH_READY=false`, `getHomeData()` retorna mock data
 * sin necesidad del token — el header se ignora.
 */

import { NextResponse }    from "next/server";
import { getHomeData }     from "@/lib/graph/home.service";

/**
 * GET /api/home
 *
 * Retorna los datos del homepage del colaborador autenticado.
 *
 * @remarks
 * El header `Authorization: Bearer {token}` es requerido en producción
 * cuando `GRAPH_READY=true`. Con `GRAPH_READY=false` retorna mock data
 * sin validar el header.
 *
 * @returns JSON con {@link HomeData} o error 500 si Graph falla.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const data = await getHomeData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/home]", error);
    return NextResponse.json(
      { error: "Error al obtener datos del home" },
      { status: 500 },
    );
  }
}