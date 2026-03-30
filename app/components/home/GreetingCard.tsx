import { saludo } from "@/lib/format";
import type { User } from "@/types/home";

// Rendered inside the light hero banner — uses dark text on light bg.

export function GreetingCard({ user }: { user: User }) {
  return (
    <div className="select-none">
      <h1 className="text-2xl font-semibold text-violet-950 leading-snug tracking-tight sm:text-3xl">
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
          <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-0.5 text-xs font-medium text-violet-700">
            {user.role}
          </span>
        )}
        {user.location && (
          <span className="rounded-full border border-slate-200 bg-white px-3 py-0.5 text-xs font-medium text-slate-500">
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