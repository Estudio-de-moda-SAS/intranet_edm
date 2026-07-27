"use client";

import { useQuery } from "@tanstack/react-query";

export interface EdmNewsItem {
  id: string;
  title: string;
  type: "html" | "image";
  content_html: string | null;
  image_url: string | null;
  created_at: string;
}

async function fetchEdmNews(): Promise<EdmNewsItem[]> {
  const res = await fetch("/api/edm-news");
  if (!res.ok) throw new Error("No se pudo cargar EDM News");
  const json = await res.json();
  return json.items;
}

export function useEdmNews() {
  return useQuery({
    queryKey: ["edm-news", "feed"],
    queryFn: fetchEdmNews,
  });
}