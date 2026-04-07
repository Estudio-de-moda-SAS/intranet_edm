// app/components/ui/SaveBar.tsx
// SaveBar mejorado — soporta estados: idle | saving | saved | error
// Reemplaza el SaveBar de IntranetUI.tsx (o agrégalo aquí y re-exporta)
'use client';

import { Loader2, AlertCircle } from 'lucide-react';
import type { SaveStatus } from '../hooks/useSettings';

interface Props {
  dirty:      boolean;
  saveStatus: SaveStatus;
  onSave:     () => void;
  onDiscard?: () => void;
}

export function SaveBar({ dirty, saveStatus, onSave, onDiscard }: Props) {
  const visible = dirty || saveStatus === 'saved' || saveStatus === 'error' || saveStatus === 'saving';
  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-xl shadow-slate-200/60">

        {saveStatus === 'saving' && (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
            <p className="text-[13px] font-medium text-slate-600">Guardando…</p>
          </>
        )}

        {saveStatus === 'saved' && (
          <>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5 text-emerald-600">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-[13px] font-medium text-slate-700">Cambios guardados</p>
          </>
        )}

        {saveStatus === 'error' && (
          <>
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-[13px] font-medium text-red-600">Error al guardar</p>
            <button
              onClick={onSave}
              className="rounded-xl bg-red-600 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </>
        )}

        {saveStatus === 'idle' && dirty && (
          <>
            <p className="text-[13px] text-slate-500">Tienes cambios sin guardar</p>
            {onDiscard && (
              <button
                onClick={onDiscard}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Descartar
              </button>
            )}
            <button
              onClick={onSave}
              className="rounded-xl bg-violet-600 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-violet-700 transition-colors shadow-sm shadow-violet-200"
            >
              Guardar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
