/**
 * @module TicketDetailRoute
 * Endpoint API para obtener el detalle completo de un ticket por ID.
 *
 * @remarks
 * Este archivo implementa la ruta:
 *
 * `GET /api/tickets/:id`
 *
 * Su responsabilidad es recuperar el detalle completo de un ticket,
 * incluyendo toda la información necesaria para la vista de detalle.
 *
 * Actualmente utiliza una fuente de datos mock mediante {@link getTicketById},
 * pero está preparado para evolucionar a una consulta real con base de datos
 * o ORM, como Prisma.
 */

// app/api/tickets/[id]/route.ts
// GET /api/tickets/:id  → devuelve el detalle completo de un ticket

import { NextRequest, NextResponse } from "next/server";
import { getTicketById } from "@/app/(protected)/(intranet)/requests/data/tickets";

    // ── Aquí irá tu query real ─────────────────────────────────────────────
    // Ejemplo con Prisma:
    //
    // const ticket = await prisma.ticket.findUnique({
    //   where: { id },
    //   include: {
    //     comments:    { include: { author: true }, orderBy: { createdAt: "asc" } },
    //     attachments: true,
    //     timeline:    { orderBy: { createdAt: "asc" } },
    //     requester:   true,
    //     assignee:    true,
    //     department:  true,
    //   },
    // });
    //
    // if (!ticket) {
    //   return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });
    // }
    // return NextResponse.json(ticket);
    // ──────────────────────────────────────────────────────────────────────

    // Mock temporal

/**
 * Handler `GET` para recuperar el detalle de un ticket.
 *
 * @param _req Request HTTP entrante.
 * @param context Contexto de la ruta con parámetros dinámicos.
 * @returns Respuesta JSON con el ticket encontrado o un error.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Extrae el parámetro `id` desde la ruta dinámica.
 * 2. Busca el ticket utilizando {@link getTicketById}.
 * 3. Si no existe, responde con `404`.
 * 4. Si existe, responde con el detalle completo en formato JSON.
 * 5. Si ocurre un error inesperado, responde con `500`.
 *
 * Esta implementación es temporal y usa datos mock.
 * En producción debería reemplazarse por una consulta real a base de datos.
 *
 * @example
 * ```http
 * GET /api/tickets/ti-1
 * ```
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ticket = getTicketById(id);

    if (!ticket) {
      return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("[GET /api/tickets/:id]", error);
    return NextResponse.json({ error: "Error al obtener el ticket" }, { status: 500 });
  }
}