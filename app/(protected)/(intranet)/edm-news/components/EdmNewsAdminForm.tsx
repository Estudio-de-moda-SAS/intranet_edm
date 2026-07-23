// app/(protected)/(intranet)/edm-news/components/EdmNewsAdminForm.tsx
"use client";

import { useState } from "react";
import { Type, ImageIcon } from "lucide-react";
import { EdmNewsImageUpload } from "./EdmNewsImageUpload";
import type { EdmNewsAdminItem, AvisoFormValues } from "../types/edmNews";

interface Props {
  initial?: EdmNewsAdminItem | null;
  onSubmit: (values: AvisoFormValues) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function EdmNewsAdminForm({ initial, onSubmit, onCancel, isSaving }: Props) {
  const [type, setType] = useState<"html" | "image">(initial?.type ?? "html");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.content_data?.body ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.image_url ?? null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    if (type === "image") {
      if (!imageUrl) return;
      onSubmit({ title: title.trim(), type: "image", imageUrl });
    } else {
      if (!body.trim()) return;
      onSubmit({ title: title.trim(), type: "html", body: body.trim() });
    }
  }

  const isValid = title.trim() && (type === "image" ? !!imageUrl : !!body.trim());

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5 rounded-2xl border border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#161b22]">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-[#e6edf3]">
        {initial ? "Editar aviso" : "Nuevo aviso"}
      </h3>

      {/* Toggle de tipo */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType("html")}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors
            ${type === "html"
              ? "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400"
              : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-[#30363d] dark:hover:bg-[#21262d]"}`}
        >
          <Type className="h-4 w-4" />
          Escribir texto
        </button>
        <button
          type="button"
          onClick={() => setType("image")}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors
            ${type === "image"
              ? "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400"
              : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-[#30363d] dark:hover:bg-[#21262d]"}`}
        >
          <ImageIcon className="h-4 w-4" />
          Subir imagen
        </button>
      </div>

      {/* Título — siempre visible, se usa como referencia interna en ambos casos */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-500">
          Título {type === "image" && <span className="text-slate-400">(uso interno, no se muestra sobre la imagen)</span>}
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          placeholder="Ej: AVISO IMPORTANTE"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#30363d] bg-transparent text-sm outline-none focus:ring-2 focus:ring-violet-500"
          required
        />
      </div>

      {/* Contenido según el tipo */}
      {type === "html" ? (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500">
            Cuerpo del aviso <span className="text-slate-400">(deja una línea en blanco entre párrafos)</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={600}
            rows={6}
            placeholder="Escribe el contenido del aviso..."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#30363d] bg-transparent text-sm outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            required
          />
          <p className="text-xs text-slate-400 text-right">{body.length}/600</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500">Imagen del aviso</label>
          <EdmNewsImageUpload value={imageUrl} onChange={setImageUrl} />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-[#21262d]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving || !isValid}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {isSaving ? "Guardando..." : initial ? "Guardar cambios" : "Crear borrador"}
        </button>
      </div>
    </form>
  );
}