/**
 * @module app/settings/SaveBar
 * Barra flotante de guardado para formularios con cambios pendientes
 * en la intranet EDM.
 *
 * @remarks
 * Componente de UI reutilizable que aparece en la parte inferior de la
 * pantalla cuando hay cambios sin guardar o cuando una operación de
 * guardado está en progreso. Soporta cuatro estados visuales distintos
 * correspondientes a {@link SaveStatus}.
 *
 * Se usa actualmente en la página de configuración personal
 * (`/settings`) pero está diseñado para ser reutilizable en cualquier
 * formulario de la intranet que requiera confirmación explícita de
 * guardado.
 *
 * **Estados visuales:**
 * | `saveStatus` | `dirty` | Contenido mostrado                        |
 * |--------------|---------|-------------------------------------------|
 * | `idle`       | `true`  | "Tienes cambios sin guardar" + botones     |
 * | `saving`     | any     | Spinner + "Guardando…"                    |
 * | `saved`      | any     | Checkmark verde + "Cambios guardados"     |
 * | `error`      | any     | Icono error + "Error al guardar" + Reintentar |
 * | `idle`       | `false` | Oculto                                    |
 */

"use client";

import { Loader2, AlertCircle } from "lucide-react";
import type { SaveStatus }      from "../hooks/useSettings";

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Props del componente {@link SaveBar}.
 */
interface Props {
  /**
   * `true` si hay cambios en el formulario que no han sido guardados.
   * Controla si la barra es visible cuando `saveStatus === "idle"`.
   */
  dirty: boolean;

  /**
   * Estado actual de la operación de guardado.
   * Determina el contenido visual mostrado en la barra.
   */
  saveStatus: SaveStatus;

  /**
   * Callback invocado al presionar "Guardar" o "Reintentar".
   * Debe persistir los cambios en `localStorage` y actualizar
   * `saveStatus` acorde al resultado.
   */
  onSave: () => void;

  /**
   * Callback invocado al presionar "Descartar".
   * Debe restaurar los valores guardados descartando los cambios
   * pendientes en el estado local.
   * `undefined` si el formulario no soporta descarte de cambios.
   */
  onDiscard?: () => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

/**
 * Barra flotante centrada en la parte inferior de la pantalla que
 * refleja el estado de guardado de un formulario.
 *
 * @remarks
 * Se monta siempre en el árbol de componentes pero solo renderiza
 * contenido cuando `visible === true`. La visibilidad se calcula
 * internamente — el componente padre no necesita condicionarlo.
 *
 * La barra aparece con animación `fade-in + slide-in-from-bottom`
 * de Tailwind para una transición suave que no distrae al colaborador.
 *
 * En estado `error`, muestra un botón "Reintentar" que reintenta
 * la operación `onSave` sin necesidad de que el colaborador repita
 * ninguna acción.
 *
 * @param props - Ver {@link Props}.
 * @returns El elemento flotante de la barra, o `null` si no hay nada
 *   que mostrar.
 *
 * @example
 * ```tsx
 * <SaveBar
 *   dirty={dirty}
 *   saveStatus={saveStatus}
 *   onSave={save}
 *   onDiscard={discard}
 * />
 * ```
 */
export function SaveBar({ dirty, saveStatus, onSave, onDiscard }: Props) {
  const visible =
    dirty ||
    saveStatus === "saved"  ||
    saveStatus === "error"  ||
    saveStatus === "saving";

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-xl shadow-slate-200/60">

        {/* Estado: guardando */}
        {saveStatus === "saving" && (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
            <p className="text-[13px] font-medium text-slate-600">Guardando…</p>
          </>
        )}

        {/* Estado: guardado con éxito */}
        {saveStatus === "saved" && (
          <>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                className="h-3.5 w-3.5 text-emerald-600"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-[13px] font-medium text-slate-700">
              Cambios guardados
            </p>
          </>
        )}

        {/* Estado: error al guardar */}
        {saveStatus === "error" && (
          <>
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-[13px] font-medium text-red-600">
              Error al guardar
            </p>
            <button
              onClick={onSave}
              className="rounded-xl bg-red-600 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </>
        )}

        {/* Estado: idle con cambios pendientes */}
        {saveStatus === "idle" && dirty && (
          <>
            <p className="text-[13px] text-slate-500">
              Tienes cambios sin guardar
            </p>
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