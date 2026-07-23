// app/(protected)/(intranet)/edm-news/types/edmNews.ts

export type EdmNewsStatus = "borrador" | "publicado" | "programado";

export interface EdmNewsAdminItem {
  id: string;
  title: string;
  type: "html" | "image";
  content_html: string | null;
  content_data: { title?: string; body?: string } | null;
  image_url: string | null;
  status: EdmNewsStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
}

/** Payload para crear o editar un aviso desde el editor simple. */
export interface AvisoFormValues {
  title: string;
  type: "html" | "image";
  body?: string;      // usado cuando type = "html"
  imageUrl?: string;  // usado cuando type = "image"
}