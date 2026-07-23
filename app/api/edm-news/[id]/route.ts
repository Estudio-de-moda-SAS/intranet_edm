// app/api/edm-news/[id]/route.ts
/**
 * @module app/api/edm-news/[id]/route
 * Route Handler para editar, cambiar estado y eliminar un aviso puntual.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireEdmNewsAdmin, UnauthorizedError, ForbiddenError } from "@/lib/edmNews/authorize";

interface UpdateNewsBody {
  title?: string;
  content_html?: string;
  image_url?: string;
  status?: "borrador" | "publicado" | "programado";
  publish_at?: string | null;
  expires_at?: string | null;
  send_by_email?: boolean;
  content_data?: Record<string, unknown>;
}

/**
 * PATCH /api/edm-news/:id
 *
 * Edita campos de un aviso existente, incluyendo cambios de estado
 * (publicar/despublicar/programar).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  let id: string | undefined;
  try {
    ({ id } = await params);
    const user = await requireEdmNewsAdmin(req);
    const body: UpdateNewsBody = await req.json();

    const { data, error } = await supabaseAdmin
      .from("edm_news")
      .update({ ...body, updated_by: user.email })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Aviso no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ item: data });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error(`[PATCH /api/edm-news/${id}]`, error);
    return NextResponse.json({ error: "Error al actualizar el aviso" }, { status: 500 });
  }
}

/**
 * DELETE /api/edm-news/:id
 *
 * Elimina un aviso de forma permanente.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  let id: string | undefined;
  try {
    ({ id } = await params);
    await requireEdmNewsAdmin(req);

    const { error } = await supabaseAdmin.from("edm_news").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error(`[DELETE /api/edm-news/${id}]`, error);
    return NextResponse.json({ error: "Error al eliminar el aviso" }, { status: 500 });
  }
}