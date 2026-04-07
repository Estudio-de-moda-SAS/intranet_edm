"use client";

import { useState } from "react";
import { MessageSquarePlus, Send, Star } from "lucide-react";
import { Modal } from "@/app/components/ui/Modal";

type Rating = 1 | 2 | 3 | 4 | 5;

interface FeedbackCardProps {
  backgroundImage?: string;
  overlayOpacity?: number;
  fallbackGradient?: string;
}

export function FeedbackCard({
  backgroundImage,
  overlayOpacity = 60,
  fallbackGradient = "linear-gradient(135deg, #374151 0%, #111827 100%)",
}: FeedbackCardProps) {
  const [open, setOpen]       = useState(false);
  const [rating, setRating]   = useState<Rating | null>(null);
  const [hover, setHover]     = useState<Rating | null>(null);
  const [message, setMessage] = useState("");
  const [sent, setSent]       = useState(false);

  function handleSubmit() {
    if (!rating || !message.trim()) return;
    setSent(true);
    setTimeout(() => { setOpen(false); setSent(false); setRating(null); setHover(null); setMessage(""); }, 2200);
  }

  const activeRating = hover ?? rating;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative flex w-full flex-col overflow-hidden
          rounded-xl border shadow-sm text-left transition-all duration-300
          border-slate-200 bg-white
          dark:border-[#30363d] dark:bg-[#161b22]
          hover:border-violet-200 hover:shadow-md
          dark:hover:border-violet-500/30 dark:hover:shadow-[0_4px_20px_rgb(0_0_0/0.4)]
          focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
      >
        {/* Background hover effect */}
        <div
          className="absolute inset-0 opacity-0 bg-cover bg-center transition-opacity duration-500 group-hover:opacity-100"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            background: backgroundImage ? undefined : fallbackGradient,
          }}
        />
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: `rgba(0,0,0,${overlayOpacity / 100})` }}
        />

        {/* Decorativos */}
        <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full transition-transform duration-700 group-hover:scale-150
                        bg-violet-50 group-hover:bg-white/10
                        dark:bg-violet-500/[0.06] dark:group-hover:bg-white/10" />
        <div className="pointer-events-none absolute -bottom-4 -left-2 h-16 w-16 rounded-full transition-transform duration-700 group-hover:scale-150
                        bg-violet-50/60 group-hover:bg-white/10
                        dark:bg-violet-500/[0.04] dark:group-hover:bg-white/10" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between border-b px-5 py-4 transition-colors duration-300
                        border-slate-100 group-hover:border-white/10
                        dark:border-[#21262d]">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-300
                             bg-violet-50 group-hover:bg-white/15
                             dark:bg-violet-500/[0.12]">
              <MessageSquarePlus className="h-3.5 w-3.5 transition-colors duration-300
                                            text-violet-600 group-hover:text-white
                                            dark:text-violet-400" />
            </span>
            <h2 className="text-sm font-semibold transition-colors duration-300
                           text-slate-800 group-hover:text-white
                           dark:text-[#e6edf3]">
              Feedback
            </h2>
          </div>
          <div className="flex gap-0.5">
            {([1, 2, 3, 4, 5] as Rating[]).map((n) => (
              <Star key={n} className="h-3 w-3 fill-amber-300 text-amber-300 transition-colors duration-300 group-hover:fill-amber-400 group-hover:text-amber-400" />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="relative z-10 px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-widest transition-colors duration-300
                        text-slate-400 group-hover:text-white/60
                        dark:text-[#545d68]">
            Tu opinión importa
          </p>
          <p className="mt-1 text-sm font-semibold leading-snug transition-colors duration-300
                        text-slate-700 group-hover:text-white
                        dark:text-[#cdd9e5]">
            Comparte tu experiencia,<br />sugerencias o inquietudes
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all duration-300
                           bg-violet-50 text-violet-600 group-hover:bg-white/20 group-hover:text-white
                           dark:bg-violet-500/[0.12] dark:text-violet-400">
            <Send className="h-3 w-3" />
            Enviar feedback
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </span>
        </div>
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Enviar Feedback"
        subtitle="Anónimo · Confidencial"
        size="sm"
        accentColor="bg-violet-600"
        footer={!sent ? (
          <button
            onClick={handleSubmit}
            disabled={!rating || !message.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" /> Enviar feedback
          </button>
        ) : undefined}
      >
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full
                             bg-violet-50 dark:bg-violet-500/[0.12]">
              <Send className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </span>
            <p className="text-base font-bold text-slate-800 dark:text-[#e6edf3]">¡Gracias por tu feedback!</p>
            <p className="text-sm text-slate-500 dark:text-[#768390]">Tu mensaje fue enviado correctamente.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-[#adbac7]">¿Cómo calificarías tu experiencia?</p>
              <div className="flex gap-1">
                {([1, 2, 3, 4, 5] as Rating[]).map((n) => (
                  <button key={n} onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(null)} className="transition-transform hover:scale-110 active:scale-95">
                    <Star className={`h-7 w-7 transition-colors ${activeRating && n <= activeRating ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-[#30363d]"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-[#adbac7]">Mensaje</p>
              <textarea
                rows={4} maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="Cuéntanos tu experiencia, sugerencias o inquietudes..."
                className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm transition-all
                           border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-400
                           focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100
                           dark:border-[#30363d] dark:bg-[#1c2128] dark:text-[#cdd9e5] dark:placeholder:text-[#545d68]
                           dark:focus:border-violet-500/50 dark:focus:ring-violet-500/15"
              />
              <p className="mt-1 text-right text-[10px] text-slate-400 dark:text-[#545d68]">{message.length} / 500</p>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}