import Link from "next/link";
import { Cake } from "lucide-react";
import { fmtFecha } from "@/lib/format";
import type { Birthday } from "@/types/home";

function avatarHue(name: string): string {
  const hues = [270, 290, 250, 310, 220, 280, 260, 300];
  return `hsl(${hues[name.charCodeAt(0) % hues.length] ?? 270}, 50%, 52%)`;
}

function Initials({ name }: { name: string }) {
  const parts  = name.trim().split(" ");
  const first  = parts[0] ?? "";
  const second = parts[1] ?? "";
  const letters = second
    ? `${first[0] ?? ""}${second[0] ?? ""}`
    : first.slice(0, 2);
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white select-none"
      style={{ backgroundColor: avatarHue(name) }}
      aria-hidden
    >
      {letters.toUpperCase()}
    </span>
  );
}

export function BirthdaysCard({ birthdays }: { birthdays: Birthday[] }) {
  const isEmpty = birthdays.length === 0;

  return (
    <div className="rounded-xl border shadow-sm
                    border-slate-200 bg-white
                    dark:border-[#30363d] dark:bg-[#161b22]">

      <div className="flex items-center justify-between border-b px-5 py-4
                      border-slate-100 dark:border-[#21262d]">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg
                           bg-violet-50 dark:bg-violet-500/[0.12]">
            <Cake className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
          </span>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-[#e6edf3]">Cumpleaños</h2>
        </div>
        {!isEmpty && (
          <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold
                           bg-violet-50 text-violet-600
                           dark:bg-violet-500/[0.12] dark:text-violet-400">
            {birthdays.length}
          </span>
        )}
      </div>

      <ul className="divide-y divide-slate-50 dark:divide-[#21262d]">
        {isEmpty ? (
          <li className="flex flex-col items-center gap-1.5 py-8 text-center">
            <Cake className="h-6 w-6 text-slate-200 dark:text-[#30363d]" />
            <p className="text-xs text-slate-400 dark:text-[#545d68]">No hay cumpleaños hoy</p>
          </li>
        ) : (
          birthdays.map((b) => (
            <li key={b.id} className="flex items-center gap-3 px-5 py-3 transition-colors
                                      hover:bg-violet-50/40 dark:hover:bg-violet-500/[0.06]">
              <Initials name={b.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-[#e6edf3]">{b.name}</p>
                <p className="text-[11px] text-slate-400 dark:text-[#545d68]">
                  {fmtFecha(b.date)}
                  {b.area ? <> <span className="text-slate-300 dark:text-[#30363d]">·</span> {b.area}</> : null}
                </p>
              </div>
              <Link
                href={`/personas/${b.id}`}
                className="shrink-0 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors
                           border-slate-200 text-slate-500
                           hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50
                           dark:border-[#30363d] dark:text-[#768390]
                           dark:hover:border-violet-500/40 dark:hover:text-violet-400 dark:hover:bg-violet-500/[0.08]"
              >
                Ver
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}