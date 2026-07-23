// app/(protected)/(intranet)/edm-news/components/EdmNewsStatusBadge.tsx
import type { EdmNewsStatus } from "../types/edmNews";

const STYLES: Record<EdmNewsStatus, string> = {
  borrador: "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300",
  publicado: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  programado: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
};

const LABELS: Record<EdmNewsStatus, string> = {
  borrador: "Borrador",
  publicado: "Publicado",
  programado: "Programado",
};

export function EdmNewsStatusBadge({ status }: { status: EdmNewsStatus }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}