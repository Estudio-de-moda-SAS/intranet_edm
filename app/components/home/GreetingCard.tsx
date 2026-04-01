import { saludo } from "@/lib/format";
import type { User } from "@/types/home";

export function GreetingCard({ user }: { user: User }) {
  return (
    <div className="select-none">
      <h1 className="text-2xl font-semibold leading-snug tracking-tight sm:text-3xl
                      text-violet-950
                      dark:text-white">
        {saludo(user?.name)}{" "}
        <span
          className="inline-block origin-bottom-right"
          style={{ animation: "wave 1.8s ease-in-out 0.4s 1 forwards" }}
          aria-hidden
        >
          👋
        </span>
      </h1>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {user.role && (
          <span className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium
                           bg-emerald-50 border-emerald-200 text-emerald-600
                           dark:bg-emerald-500/15 dark:border-emerald-400/25 dark:text-emerald-300">
            {user.role}
          </span>
        )}
        {user.location && (
          <span className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium
                           bg-white border-slate-200 text-slate-500
                           dark:bg-white/10 dark:border-white/15 dark:text-slate-300">
            📍 {user.location}
          </span>
        )}
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