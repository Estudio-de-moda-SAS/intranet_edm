"use client";

import { useState } from "react";
import { MessageSquarePlus, Send, Star, Lightbulb, Bug, HeartHandshake } from "lucide-react";
import { Modal } from "@/app/components/ui/Modal";

type Rating = 1 | 2 | 3 | 4 | 5;
type FeedbackCategory = "experiencia" | "sugerencia" | "problema";

const CATEGORIES: { key: FeedbackCategory; label: string; icon: typeof Lightbulb; color: string; bg: string }[] = [
  { key: "experiencia", label: "Experiencia general", icon: HeartHandshake, color: "text-violet-600", bg: "bg-violet-50 group-hover:bg-violet-100 border-violet-100 group-hover:border-violet-200" },
  { key: "sugerencia",  label: "Sugerencia",          icon: Lightbulb,      color: "text-amber-600",  bg: "bg-amber-50 group-hover:bg-amber-100 border-amber-100 group-hover:border-amber-200"   },
  { key: "problema",    label: "Reportar problema",   icon: Bug,            color: "text-rose-500",   bg: "bg-rose-50 group-hover:bg-rose-100 border-rose-100 group-hover:border-rose-200"       },
];

/**
 * FeedbackPanel — panel horizontal de ancho completo, ubicado debajo del grid
 * de columnas del home. Integrado al mismo lenguaje visual de la intranet.
 */
export function FeedbackPanel() {
  const [open, setOpen]             = useState(false);
  const [category, setCategory]     = useState<FeedbackCategory | null>(null);
  const [rating, setRating]         = useState<Rating | null>(null);
  const [hover, setHover]           = useState<Rating | null>(null);
  const [message, setMessage]       = useState("");
  const [sent, setSent]             = useState(false);

  function openWith(cat: FeedbackCategory) {
    setCategory(cat);
    setOpen(true);
  }

  function handleSubmit() {
    if (!rating || !message.trim()) return;
    // TODO: POST /api/feedback { category, rating, message }
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

  const activeRating = hover ?? rating;

  return (
    <>
      {/* ── Panel ── */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">

        {/* Accent bar top */}
        <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 via-violet-400 to-violet-300" />

        <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

          {/* Left — copy */}
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50">
              <MessageSquarePlus className="h-4.5 w-4.5 text-violet-600" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Tu opinión importa</h3>
              <p className="text-[12px] text-slate-400 leading-tight">
                Ayúdanos a mejorar la intranet — anónimo y confidencial
              </p>
            </div>
          </div>

          {/* Right — category buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            {CATEGORIES.map(({ key, label, icon: Icon, color, bg }) => (
              <button
                key={key}
                onClick={() => openWith(key)}
                className={`
                  group flex items-center gap-2 rounded-xl border px-3.5 py-2
                  text-[12px] font-semibold transition-all duration-200
                  hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]
                  ${bg}
                `}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${color}`} />
                <span className={color}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modal ── */}
      <Modal
        open={open}
        onClose={() => { setOpen(false); setCategory(null); }}
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
              <Send className="h-3.5 w-3.5" />
              Enviar feedback
            </button>
          ) : undefined
        }
      >
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-50">
              <Send className="h-6 w-6 text-violet-600" />
            </span>
            <p className="text-base font-bold text-slate-800">¡Gracias por tu feedback!</p>
            <p className="text-sm text-slate-500">Tu mensaje fue enviado correctamente.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold text-slate-600">
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
                          : "text-slate-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-slate-600">Mensaje</p>
              <textarea
                rows={4}
                maxLength={500}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Cuéntanos tu experiencia, sugerencias o inquietudes..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 transition-all focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
              <p className="mt-1 text-right text-[10px] text-slate-400">
                {message.length} / 500
              </p>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
