// app/(protected)/(intranet)/api/edm-news/route.ts
/**
 * @module app/api/edm-news/route
 * Route Handler que sirve el feed de EDM News publicados para el
 * carrusel del Home.
 *
 * @remarks
 * Lectura pública (cualquier colaborador autenticado en la Intranet
 * puede verlo) — no requiere validar rol de administrador, a diferencia
 * de los endpoints de gestión (crear/editar/publicar) que se agregarán
 * después.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireEdmNewsAdmin, UnauthorizedError, ForbiddenError } from "@/lib/edmNews/authorize";

const FEED_LIMIT = 6;

/**
 * GET /api/edm-news
 *
 * Retorna los últimos avisos publicados, ordenados por fecha descendente.
 *
 * @returns JSON con la lista de avisos, o error 500 si falla la consulta.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const nowIso = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("edm_news")
      .select("id, title, type, content_html, image_url, created_at")
      .eq("status", "publicado")
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
      .order("created_at", { ascending: false })
      .limit(FEED_LIMIT);

    if (error) throw error;

    return NextResponse.json({ items: data ?? [] });
  } catch (error) {
    console.error("[GET /api/edm-news]", error);
    return NextResponse.json(
      { error: "Error al obtener los avisos de EDM News" },
      { status: 500 },
    );
  }
}

interface CreateNewsBody {
  title: string;
  type: "html" | "image";
  content_html?: string;
  image_url?: string;
  status?: "borrador" | "publicado" | "programado";
  publish_at?: string;
  template_id?: string;
  content_data?: Record<string, unknown>;
}

/**
 * POST /api/edm-news
 *
 * Crea un nuevo aviso. Requiere que el usuario esté autorizado en
 * `edm_news_admins`.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireEdmNewsAdmin(req);
    const body: CreateNewsBody = await req.json();

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
    }
    if (body.type === "html" && !body.content_html) {
      return NextResponse.json(
        { error: "content_html es obligatorio cuando type = 'html'" },
        { status: 400 },
      );
    }
    if (body.type === "image" && !body.image_url) {
      return NextResponse.json(
        { error: "image_url es obligatorio cuando type = 'image'" },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("edm_news")
      .insert({
        title: body.title.trim(),
        type: body.type,
        content_html: body.content_html ?? null,
        image_url: body.image_url ?? null,
        status: body.status ?? "borrador",
        publish_at: body.publish_at ?? null,
        template_id: body.template_id ?? null,
        content_data: body.content_data ?? null,
        created_by: user.email,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[POST /api/edm-news]", error);
    return NextResponse.json({ error: "Error al crear el aviso" }, { status: 500 });
  }
}