// app/(protected)/(intranet)/edm-news/components/EdmNewsAdminList.tsx
"use client";

import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { EdmNewsStatusBadge } from "./EdmNewsStatusBadge";
import type { EdmNewsAdminItem } from "../types/edmNews";

interface Props {
  items: EdmNewsAdminItem[];
  onEdit: (item: EdmNewsAdminItem) => void;
  onDelete: (item: EdmNewsAdminItem) => void;
  onToggleStatus: (item: EdmNewsAdminItem) => void;
  busyId: string | null;
}

export function EdmNewsAdminList({ items, onEdit, onDelete, onToggleStatus, busyId }: Props) {
  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-400 border border-dashed rounded-2xl border-slate-200 dark:border-[#30363d]">
        Aún no hay avisos. Crea el primero con el botón de arriba.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#161b22]"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-slate-800 dark:text-[#e6edf3] truncate">
                {item.title}
              </p>
              <EdmNewsStatusBadge status={item.status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date(item.created_at).toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}{" "}
              · {item.created_by}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onToggleStatus(item)}
              disabled={busyId === item.id}
              title={item.status === "publicado" ? "Despublicar" : "Publicar"}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-[#21262d] disabled:opacity-40"
            >
              {item.status === "publicado" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              onClick={() => onEdit(item)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-[#21262d]"
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(item)}
              disabled={busyId === item.id}
              className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-40"
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}