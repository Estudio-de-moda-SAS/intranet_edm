// app/api/edm-news/admin/route.ts
/**
 * @module app/api/edm-news/admin/route
 * Route Handler que lista TODOS los avisos (cualquier estado), para el
 * panel de gestión. A diferencia de GET /api/edm-news (feed público),
 * este requiere autorización.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireEdmNewsAdmin, UnauthorizedError, ForbiddenError } from "@/lib/edmNews/authorize";

/**
 * GET /api/edm-news/admin
 *
 * Retorna todos los avisos (borrador, publicado, programado), ordenados
 * por fecha de creación descendente. Requiere estar en `edm_news_admins`.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await requireEdmNewsAdmin(req);

    const { data, error } = await supabaseAdmin
      .from("edm_news")
      .select("id, title, type, content_html, content_data, image_url, status, created_at, updated_at, created_by")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ items: data ?? [] });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[GET /api/edm-news/admin]", error);
    return NextResponse.json({ error: "Error al obtener los avisos" }, { status: 500 });
  }
}