/**
 * @module FeedbackPanel
 * Componente cliente para recopilar feedback de usuarios dentro de la intranet.
 *
 * @remarks
 * Este archivo renderiza un panel de acceso rápido para enviar comentarios,
 * sugerencias o reportes, junto con un modal de captura que permite:
 * - seleccionar una categoría,
 * - calificar la experiencia,
 * - escribir un mensaje,
 * - mostrar confirmación de envío.
 */

"use client";

import { useState } from "react";
import { MessageSquarePlus, Send, Star, Lightbulb, Bug, HeartHandshake } from "lucide-react";
import { Modal } from "@/app/components/ui/Modal";

/**
 * Escala de calificación permitida.
 */
type Rating = 1 | 2 | 3 | 4 | 5;

/**
 * Categorías disponibles de feedback.
 */
type FeedbackCategory = "experiencia" | "sugerencia" | "problema";

/**
 * Configuración visual y semántica de las categorías disponibles.
 */
const CATEGORIES: {
  key: FeedbackCategory;
  label: string;
  icon: typeof Lightbulb;
  color: string;
  bg: string;
}[] = [
  {
    key: "experiencia",
    label: "Experiencia general",
    icon: HeartHandshake,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 group-hover:bg-violet-100 border-violet-100 group-hover:border-violet-200 dark:bg-violet-500/[0.08] dark:group-hover:bg-violet-500/[0.15] dark:border-violet-500/20 dark:group-hover:border-violet-500/30",
  },
  {
    key: "sugerencia",
    label: "Sugerencia",
    icon: Lightbulb,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 group-hover:bg-amber-100 border-amber-100 group-hover:border-amber-200 dark:bg-amber-500/[0.08] dark:group-hover:bg-amber-500/[0.15] dark:border-amber-500/20 dark:group-hover:border-amber-500/30",
  },
  {
    key: "problema",
    label: "Reportar problema",
    icon: Bug,
    color: "text-rose-500 dark:text-rose-400",
    bg: "bg-rose-50 group-hover:bg-rose-100 border-rose-100 group-hover:border-rose-200 dark:bg-rose-500/[0.08] dark:group-hover:bg-rose-500/[0.15] dark:border-rose-500/20 dark:group-hover:border-rose-500/30",
  },
];

/**
 * Renderiza un panel de feedback con acceso a modal de envío.
 *
 * @returns Panel interactivo con categorías y modal de feedback.
 *
 * @remarks
 * Flujo general:
 * 1. El usuario selecciona una categoría desde el panel.
 * 2. Se abre un {@link Modal} con el formulario correspondiente.
 * 3. El usuario asigna una calificación y escribe un mensaje.
 * 4. Al enviar, se muestra una confirmación temporal.
 * 5. Luego se reinicia el estado interno del formulario.
 */
export function FeedbackPanel() {
  /**
   * Indica si el modal está abierto.
   */
  const [open, setOpen] = useState(false);

  /**
   * Categoría seleccionada actualmente.
   */
  const [category, setCategory] = useState<FeedbackCategory | null>(null);

  /**
   * Calificación elegida por el usuario.
   */
  const [rating, setRating] = useState<Rating | null>(null);

  /**
   * Calificación actualmente sobrevolada en la UI.
   *
   * @remarks
   * Se usa para previsualizar el estado de las estrellas antes de hacer clic.
   */
  const [hover, setHover] = useState<Rating | null>(null);

  /**
   * Mensaje escrito por el usuario.
   */
  const [message, setMessage] = useState("");

  /**
   * Estado de confirmación de envío.
   */
  const [sent, setSent] = useState(false);

  /**
   * Abre el modal con una categoría preseleccionada.
   *
   * @param cat Categoría elegida.
   */
  function openWith(cat: FeedbackCategory) {
    setCategory(cat);
    setOpen(true);
  }

  /**
   * Procesa el envío del feedback.
   *
   * @remarks
   * Actualmente simula el envío:
   * - valida que exista rating y mensaje,
   * - muestra estado de éxito,
   * - reinicia el formulario después de un breve tiempo.
   */
  function handleSubmit() {
    if (!rating || !message.trim()) return;

    setSent(true);

    setTimeout(() => {
      setOpen(false);
      setSent(false);
      setRating(null);
      setHover(null);
      setMessage("");
      setCategory(null);
    }, 2200);
  }

  /**
   * Valor de rating visible actualmente en la UI.
   *
   * @remarks
   * Prioriza el hover visual sobre el rating ya confirmado.
   */
  const activeRating = hover ?? rating;

  return (
    <>
      <section className="rounded-xl border shadow-sm overflow-hidden
                          border-slate-200 bg-white
                          dark:border-[#30363d] dark:bg-[#161b22]">

        {/* Accent bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 via-violet-400 to-violet-300" />

        <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
                             bg-violet-50 dark:bg-violet-500/[0.12]">
              <MessageSquarePlus className="h-4.5 w-4.5 text-violet-600 dark:text-violet-400" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-[#e6edf3]">
                Tu opinión importa
              </h3>
              <p className="text-[12px] leading-tight text-slate-400 dark:text-[#545d68]">
                Ayúdanos a mejorar la intranet — anónimo y confidencial
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            {CATEGORIES.map(({ key, label, icon: Icon, color, bg }) => (
              <button
                key={key}
                onClick={() => openWith(key)}
                className={`group flex items-center gap-2 rounded-xl border px-3.5 py-2
                  text-[12px] font-semibold transition-all duration-200
                  hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] ${bg}`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${color}`} />
                <span className={color}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setCategory(null);
        }}
        title={
          category
            ? CATEGORIES.find((c) => c.key === category)?.label ?? "Enviar Feedback"
            : "Enviar Feedback"
        }
        subtitle="Anónimo · Confidencial"
        size="sm"
        accentColor="bg-violet-600"
        footer={
          !sent ? (
            <button
              onClick={handleSubmit}
              disabled={!rating || !message.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" /> Enviar feedback
            </button>
          ) : undefined
        }
      >
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full
                             bg-violet-50 dark:bg-violet-500/[0.12]">
              <Send className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </span>
            <p className="text-base font-bold text-slate-800 dark:text-[#e6edf3]">
              ¡Gracias por tu feedback!
            </p>
            <p className="text-sm text-slate-500 dark:text-[#768390]">
              Tu mensaje fue enviado correctamente.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-[#adbac7]">
                ¿Cómo calificarías tu experiencia?
              </p>
              <div className="flex gap-1">
                {([1, 2, 3, 4, 5] as Rating[]).map((n) => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(null)}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        activeRating && n <= activeRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200 dark:text-[#30363d]"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-[#adbac7]">
                Mensaje
              </p>
              <textarea
                rows={4}
                maxLength={500}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Cuéntanos tu experiencia, sugerencias o inquietudes..."
                className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm transition-all
                           border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-400
                           focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100
                           dark:border-[#30363d] dark:bg-[#1c2128] dark:text-[#cdd9e5] dark:placeholder:text-[#545d68]
                           dark:focus:border-violet-500/50 dark:focus:ring-violet-500/15"
              />
              <p className="mt-1 text-right text-[10px] text-slate-400 dark:text-[#545d68]">
                {message.length} / 500
              </p>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}