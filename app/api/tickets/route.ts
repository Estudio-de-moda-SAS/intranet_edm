// app/api/tickets/route.ts
// GET /api/tickets?userId=xxx&status=pending&departmentId=ti
//
// Por ahora devuelve los MOCK_REQUESTS filtrados.
// Cuando tengas DB, reemplaza getMockTickets() por tu query real (Prisma, etc.)

import { NextRequest, NextResponse } from "next/server";
import { MOCK_REQUESTS, type RequestStatus } from "@/app/(protected)/(intranet)/requests/data/tickets";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const status       = searchParams.get("status") as RequestStatus | null;
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
    if (status)       data = data.filter((r) => r.status       === status);
    if (departmentId) data = data.filter((r) => r.departmentId === departmentId);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/tickets]", error);
    return NextResponse.json({ error: "Error al obtener solicitudes" }, { status: 500 });
  }
}
