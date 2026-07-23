// app/api/edm-news/upload/route.ts
/**
 * @module app/api/edm-news/upload/route
 * Route Handler para subir imágenes de avisos a Supabase Storage.
 *
 * @remarks
 * Todas las imágenes se suben con Cache-Control de 1 año — son archivos
 * inmutables (nunca se sobrescriben, cada subida genera un nombre único),
 * por lo que es seguro que el navegador las cachee de forma permanente
 * tras la primera carga. Esto es crítico para no agotar el bandwidth
 * mensual del plan gratuito de Supabase con descargas repetidas del
 * mismo archivo.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireEdmNewsAdmin, UnauthorizedError, ForbiddenError } from "@/lib/edmNews/authorize";

const MAX_FILE_SIZE_BYTES = 6 * 1024 * 1024; // antes 3MB — con margen sobre el nuevo maxSizeMB:3 del cliente
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await requireEdmNewsAdmin(req);

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato no permitido. Usa JPG, PNG o WEBP." },
        { status: 400 },
      );
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `El archivo supera el límite de ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB` },
        { status: 400 },
      );
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `avisos/${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from("edm-news")
      .upload(path, buffer, {
        contentType: file.type,
        cacheControl: "31536000", // 1 año — el archivo es inmutable, nunca se sobrescribe
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabaseAdmin.storage.from("edm-news").getPublicUrl(path);

    return NextResponse.json({ url: publicUrlData.publicUrl, path });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[POST /api/edm-news/upload]", error);
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 });
  }
}