"use client";

import { useState } from "react";
import type { Recognition, RecognitionCategory } from "@/lib/recognitions";

const CATEGORY_CONFIG: Record<
  RecognitionCategory,
  { label: string; icon: string; color: string; darkColor: string; bg: string; darkBg: string }
> = {
  destacado:      { label: "Destacado",           icon: "⭐", color: "text-amber-700",  darkColor: "dark:text-amber-400",   bg: "bg-amber-100",   darkBg: "dark:bg-amber-500/[0.12]"   },
  innovacion:     { label: "Innovación",          icon: "💡", color: "text-violet-700", darkColor: "dark:text-violet-400",  bg: "bg-violet-100",  darkBg: "dark:bg-violet-500/[0.12]"  },
  trabajo_equipo: { label: "Trabajo en equipo",   icon: "🤝", color: "text-sky-700",    darkColor: "dark:text-sky-400",     bg: "bg-sky-100",     darkBg: "dark:bg-sky-500/[0.12]"     },
  liderazgo:      { label: "Liderazgo",           icon: "🏆", color: "text-emerald-700",darkColor: "dark:text-emerald-400", bg: "bg-emerald-100", darkBg: "dark:bg-emerald-500/[0.12]" },
  cliente:        { label: "Orientación cliente", icon: "💼", color: "text-pink-700",   darkColor: "dark:text-pink-400",    bg: "bg-pink-100",    darkBg: "dark:bg-pink-500/[0.12]"    },
};

type Props = { recognitions: Recognition[] };

export function RecognitionsCard({ recognitions }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="rounded-2xl border overflow-hidden shadow-sm
                        border-slate-200 bg-white
                        dark:border-[#30363d] dark:bg-[#161b22]"
             style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-[18px] py-4 border-b
                      border-slate-100 dark:border-[#21262d]">
        <div className="flex items-center gap-[9px]">
          <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-[16px]"
                style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}>
            🏅
          </span>
          <div>
            <h2 className="text-[14px] font-bold leading-[1.2]
                           text-slate-900 dark:text-[#e6edf3]">
              Mis Reconocimientos
            </h2>
            <p className="text-[11px] mt-[1px]
                          text-slate-400 dark:text-[#545d68]">
              {recognitions.length} recibido{recognitions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <span className="flex h-7 min-w-[28px] items-center justify-center rounded-full text-[12px] font-extrabold
                          border-[1.5px] border-amber-300 dark:border-amber-500/40"
              style={{ background: "linear-gradient(135deg, #fef3c7, #fde68a)" }}>
          <span className="text-amber-800 dark:text-amber-300">{recognitions.length}</span>
        </span>
      </div>

      {/* List */}
      <div className="flex flex-col gap-1.5 px-3 pt-2.5 pb-1">
        {recognitions.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-[28px] block mb-2 opacity-50">🏅</span>
            <span className="text-[12.5px] text-slate-400 dark:text-[#545d68]">
              Aún no tienes reconocimientos
            </span>
          </div>
        ) : (
          recognitions.map((rec) => {
            const cat    = CATEGORY_CONFIG[rec.category] ?? CATEGORY_CONFIG.destacado;
            const isOpen = expanded === rec.id;

            return (
              <div
                key={rec.id}
                onClick={() => setExpanded(isOpen ? null : rec.id)}
                className={`rounded-[10px] border cursor-pointer overflow-hidden transition-all duration-200
                  ${isOpen
                    ? `border-slate-200 dark:border-[#30363d] ${cat.bg} ${cat.darkBg}`
                    : "border-slate-100 bg-slate-50 dark:border-[#21262d] dark:bg-[#1c2128] hover:bg-slate-100 dark:hover:bg-[#21262d]"
                  }`}
              >
                {/* Row */}
                <div className="grid items-center gap-2.5 px-3 py-2.5"
                     style={{ gridTemplateColumns: "32px 1fr auto" }}>

                  {/* Avatar */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold overflow-hidden
                                  border-[1.5px] border-blue-500/20 bg-blue-500/10 text-blue-600
                                  dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-400">
                    {rec.fromPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={rec.fromPhoto} alt={rec.from} className="w-full h-full object-cover" />
                    ) : (
                      rec.fromAvatar
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-bold truncate
                                  text-slate-800 dark:text-[#e6edf3]">
                      {rec.title}
                    </p>
                    <p className="text-[11px] mt-[1px]
                                  text-slate-400 dark:text-[#545d68]">
                      De <strong className="font-semibold text-slate-600 dark:text-[#adbac7]">{rec.from}</strong>
                    </p>
                  </div>

                  {/* Category + chevron */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`flex items-center gap-[3px] rounded-full px-[7px] py-[2px] text-[10px] font-bold
                                      ${cat.bg} ${cat.darkBg} ${cat.color} ${cat.darkColor}`}>
                      {cat.icon} {cat.label}
                    </span>
                    <svg
                      width="12" height="12" viewBox="0 0 24 24" fill="none"
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      className={`transition-transform duration-200 stroke-slate-400 dark:stroke-[#545d68]
                                  ${isOpen ? "rotate-180" : ""}`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>

                {/* Expanded message */}
                {isOpen && (
                  <div className="px-3 pb-3 border-t border-slate-200/60 dark:border-[#30363d]">
                    <p className="mt-2.5 mb-1.5 text-[12px] leading-relaxed italic
                                  text-slate-600 dark:text-[#adbac7]">
                      &ldquo;{rec.message}&rdquo;
                    </p>
                    <span className="text-[10.5px] font-medium text-slate-400 dark:text-[#545d68]">
                      {new Date(rec.date).toLocaleDateString("es-CO", {
                        day: "2-digit", month: "long", year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-3 pt-2.5 pb-3">
        <button className="w-full rounded-lg border border-dashed py-2 text-[12px] font-semibold transition-colors
                           border-slate-200 text-slate-500
                           hover:border-amber-400 hover:text-amber-700
                           dark:border-[#30363d] dark:text-[#545d68]
                           dark:hover:border-amber-500/40 dark:hover:text-amber-400">
          Ver todos los reconocimientos →
        </button>
      </div>
    </section>
  );
}