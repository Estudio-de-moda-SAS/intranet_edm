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