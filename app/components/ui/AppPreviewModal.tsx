"use client";

import { ExternalLink, X } from "lucide-react";

type AppPreviewModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  url: string;
};

export function AppPreviewModal({
  open,
  onClose,
  title,
  url,
}: AppPreviewModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white">
      <header className="flex h-14 items-center justify-between border-b border-slate-200 px-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-400">Aplicación integrada</p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-violet-700"
          >
            Abrir en nueva pestaña
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

         <button
  type="button"
  onClick={onClose}
  className="
    flex h-10 w-10 items-center justify-center rounded-full
    border border-slate-200 bg-white text-slate-500 shadow-sm
    transition-all duration-200
    hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50
    hover:text-slate-900 hover:shadow-md
    focus:outline-none focus:ring-2 focus:ring-violet-300 focus:ring-offset-2
  "
  aria-label="Cerrar aplicación integrada"
  title="Cerrar aplicación integrada"
>
  <X className="h-5 w-5" />
</button>
        </div>
      </header>

      <main className="h-[calc(100vh-56px)] overflow-hidden bg-slate-100">
        <iframe
          src={url}
          title={title}
          className="h-full w-full border-0"
          allow="clipboard-read; clipboard-write; fullscreen"
        />
      </main>
    </div>
  );
}