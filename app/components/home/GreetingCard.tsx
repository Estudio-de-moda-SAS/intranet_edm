import { saludo } from "@/lib/format";
import type { User } from "@/types/home";

export function GreetingCard({ user }: { user: User }) {
  return (
    <div className="relative select-none overflow-hidden rounded-2xl border px-7 py-6
                    /* ── Light: gradiente blanco → lavender con borde sutil ── */
                    bg-gradient-to-br from-white via-violet-50/60 to-indigo-50/80
                    border-violet-100/80
                    shadow-sm shadow-violet-100/50
                    /* ── Dark: superficie oscura con acento violet muy sutil ── */
                    dark:bg-none dark:bg-[#161b22]
                    dark:border-[#30363d]
                    dark:shadow-none">

      {/* ── Patrón de puntos — light ── */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.35] dark:hidden"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="gc-dots-light" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#7c3aed" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gc-dots-light)" />
      </svg>

      {/* ── Patrón de puntos — dark (más sutil) ── */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06] hidden dark:block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="gc-dots-dark" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#a78bfa" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gc-dots-dark)" />
      </svg>

      {/* ── Orbes de acento — light ── */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full
                      bg-violet-200/30 blur-3xl dark:hidden" />
      <div className="pointer-events-none absolute -bottom-10 left-1/3 h-32 w-32 rounded-full
                      bg-indigo-200/25 blur-2xl dark:hidden" />

      {/* ── Orbes de acento — dark ── */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full
                      bg-violet-500/[0.06] blur-3xl hidden dark:block" />
      <div className="pointer-events-none absolute -bottom-10 left-1/4 h-32 w-32 rounded-full
                      bg-indigo-500/[0.05] blur-2xl hidden dark:block" />

      {/* ── Contenido ── */}
      <div className="relative">

        {/* Eyebrow */}
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em]
                      text-violet-400/70 dark:text-violet-500/60">
          Portal Corporativo
        </p>

        {/* Saludo */}
        <h1 className="text-2xl font-semibold leading-snug tracking-tight sm:text-3xl
                       text-violet-950 dark:text-[#e6edf3]">
          {saludo(user?.name)}{" "}
          <span
            className="inline-block origin-bottom-right"
            style={{ animation: "wave 1.8s ease-in-out 0.4s 1 forwards" }}
            aria-hidden
          >
            👋
          </span>
        </h1>

        {/* Badges */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {user.role && (
            <span className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium
                             bg-emerald-50 border-emerald-200 text-emerald-700
                             dark:bg-emerald-500/[0.10] dark:border-emerald-500/20 dark:text-emerald-400">
              {user.role}
            </span>
          )}
          {user.location && (
            <span className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium
                             bg-white/80 border-slate-200 text-slate-500
                             dark:bg-white/[0.04] dark:border-white/10 dark:text-[#768390]">
              📍 {user.location}
            </span>
          )}
        </div>
      </div>

      <style>{`
        @keyframes wave {
          0%   { transform: rotate(0deg);  }
          15%  { transform: rotate(14deg); }
          30%  { transform: rotate(-8deg); }
          45%  { transform: rotate(14deg); }
          60%  { transform: rotate(-4deg); }
          75%  { transform: rotate(10deg); }
          100% { transform: rotate(0deg);  }
        }
      `}</style>
    </div>
  );
}