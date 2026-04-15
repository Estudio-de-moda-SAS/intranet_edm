/**
 * @module TicketsRoute
 * Endpoint API para listar tickets con filtros opcionales.
 *
 * @remarks
 * Este archivo implementa la ruta:
 *
 * `GET /api/tickets`
 *
 * Permite obtener una colección de tickets aplicando filtros mediante
 * query params.
 *
 * Filtros soportados:
 *
 * - `status` → estado del ticket
 * - `departmentId` → identificador del departamento
 *
 * Actualmente utiliza datos mock ({@link MOCK_REQUESTS}),
 * pero está preparado para migrar fácilmente a una base de datos real.
 */

// app/api/tickets/route.ts 
// GET /api/tickets?userId=xxx&status=pending&departmentId=ti
//
// Por ahora devuelve los MOCK_REQUESTS filtrados.
// Cuando tengas DB, reemplaza getMockTickets() por tu query real (Prisma, etc.)

import { NextRequest, NextResponse } from "next/server";
import { MOCK_REQUESTS, type RequestStatus } from "@/app/(protected)/(intranet)/requests/data/tickets";

/**
 * Handler `GET` para obtener una lista de tickets.
 *
 * @param req Request HTTP entrante con query params.
 * @returns Lista de tickets filtrados en formato JSON.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Lee los parámetros de búsqueda (`searchParams`).
 * 2. Extrae filtros opcionales:
 *    - `status`
 *    - `departmentId`
 * 3. Aplica filtros sobre los datos mock.
 * 4. Devuelve la lista resultante.
 *
 * En producción:
 *
 * - Este bloque debe reemplazarse por una consulta a base de datos
 *   (por ejemplo con Prisma).
 * - Los filtros pueden aplicarse directamente en el `where`.
 *
 * @example
 * ```http
 * GET /api/tickets?status=pending&departmentId=ti
 * ```
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    /**
     * Estado del ticket a filtrar.
     */
    const status       = searchParams.get("status") as RequestStatus | null;

    /**
     * ID del departamento para filtrar tickets.
     */
    const departmentId = searchParams.get("departmentId");

    // ── Aquí irá tu query real ─────────────────────────────────────────────
    // Ejemplo con Prisma:
    //
    // const tickets = await prisma.ticket.findMany({
    //   where: {
    //     ...(userId       && { requesterId: userId }),
    //     ...(status       && { status }),
    //     ...(departmentId && { departmentId }),
    //   },
    //   orderBy: { createdAt: "desc" },
    // });
    // return NextResponse.json(tickets);
    // ──────────────────────────────────────────────────────────────────────

    // Mock temporal
    let data = [...MOCK_REQUESTS];

    /**
     * Filtrado por estado.
     */
    if (status)       data = data.filter((r) => r.status       === status);

    /**
     * Filtrado por departamento.
     */
    if (departmentId) data = data.filter((r) => r.departmentId === departmentId);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/tickets]", error);

    return NextResponse.json(
      { error: "Error al obtener solicitudes" },
      { status: 500 }
    );
  }
}