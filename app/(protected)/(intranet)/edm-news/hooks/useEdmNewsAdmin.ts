// app/(protected)/(intranet)/edm-news/hooks/useEdmNewsAdmin.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getIdToken } from "@/app/api/auth/msal";
import { renderAvisoImportanteHtml } from "@/lib/edmNews/renderAvisoTemplate";
import type { EdmNewsAdminItem, AvisoFormValues, EdmNewsStatus } from "../types/edmNews";

const QUERY_KEY = ["edm-news", "admin"];

async function authedFetch(path: string, options: RequestInit = {}) {
  const token = await getIdToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json?.error ?? "Error de red") as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return json;
}

/** Lista todos los avisos (cualquier estado) para el panel de gestión. */
export function useEdmNewsAdminList() {
  return useQuery<EdmNewsAdminItem[], Error & { status?: number }>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const json = await authedFetch("/api/edm-news/admin");
      return json.items;
    },
    retry: false, // no reintentar en 401/403 — es un estado esperado, no un error transitorio
  });
}

/** Crea o edita un aviso, ya sea de tipo texto (plantilla) o imagen subida. */
export function useSaveAviso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string;
      values: AvisoFormValues;
    }) => {
      const payload =
        values.type === "image"
          ? {
              title: values.title,
              type: "image" as const,
              image_url: values.imageUrl,
              content_data: null,
            }
          : {
              title: values.title,
              type: "html" as const,
              content_html: renderAvisoImportanteHtml({ title: values.title, body: values.body ?? "" }),
              content_data: { title: values.title, body: values.body },
            };

      if (id) {
        return authedFetch(`/api/edm-news/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
      return authedFetch("/api/edm-news", {
        method: "POST",
        body: JSON.stringify({ ...payload, status: "borrador" }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

/** Cambia el estado de un aviso (publicar / despublicar). */
export function useSetAvisoStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: EdmNewsStatus }) =>
      authedFetch(`/api/edm-news/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["edm-news", "feed"] }); // refresca el carrusel del Home
    },
  });
}

/** Elimina un aviso de forma permanente. */
export function useDeleteAviso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      authedFetch(`/api/edm-news/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["edm-news", "feed"] });
    },
  });
}