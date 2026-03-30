import Link from "next/link";
import { Cake } from "lucide-react";
import { fmtFecha } from "@/lib/format";
import type { Birthday } from "@/types/home";

function avatarHue(name: string): string {
  const hues = [270, 290, 250, 310, 220, 280, 260, 300];
  // ✅ Fix: fallback a 270 si el índice es undefined
  return `hsl(${hues[name.charCodeAt(0) % hues.length] ?? 270}, 50%, 52%)`;
}

function Initials({ name }: { name: string }) {
  const parts  = name.trim().split(" ");
  // ✅ Fix: extraer con fallback antes de indexar
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
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
            <Cake className="h-3.5 w-3.5 text-violet-600" />
          </span>
          <h2 className="text-sm font-semibold text-slate-800">Cumpleaños</h2>
        </div>
        {!isEmpty && (
          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-600">
            {birthdays.length}
          </span>
        )}
      </div>

      <ul className="divide-y divide-slate-50">
        {isEmpty ? (
          <li className="flex flex-col items-center gap-1.5 py-8 text-center">
            <Cake className="h-6 w-6 text-slate-200" />
            <p className="text-xs text-slate-400">No hay cumpleaños hoy</p>
          </li>
        ) : (
          birthdays.map((b) => (
            <li key={b.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-violet-50/40">
              <Initials name={b.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{b.name}</p>
                <p className="text-[11px] text-slate-400">
                  {fmtFecha(b.date)}
                  {b.area ? <> <span className="text-slate-300">·</span> {b.area}</> : null}
                </p>
              </div>
              <Link
                href={`/personas/${b.id}`}
                className="shrink-0 rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-500 transition-colors hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50"
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