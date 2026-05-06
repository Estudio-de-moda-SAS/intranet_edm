import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { TicketSystem } from "../config/ticketSystems.config";

type Props = {
  system: TicketSystem;
};

const ACCENT_STYLES: Record<string, string> = {
  violet: "border-l-violet-500 bg-violet-50 text-violet-600",
  emerald: "border-l-emerald-500 bg-emerald-50 text-emerald-600",
  amber: "border-l-amber-500 bg-amber-50 text-amber-600",
  sky: "border-l-sky-500 bg-sky-50 text-sky-600",
};

const HOVER_STYLES: Record<string, string> = {
  violet: "hover:border-violet-300 hover:bg-violet-50/40",
  emerald: "hover:border-emerald-300 hover:bg-emerald-50/40",
  amber: "hover:border-amber-300 hover:bg-amber-50/40",
  sky: "hover:border-sky-300 hover:bg-sky-50/40",
};

const TEXT_HOVER_STYLES: Record<string, string> = {
  violet: "group-hover:text-violet-800",
  emerald: "group-hover:text-emerald-800",
  amber: "group-hover:text-amber-800",
  sky: "group-hover:text-sky-800",
};

const ICON_HOVER_STYLES: Record<string, string> = {
  violet: "group-hover:text-violet-700 group-hover:ring-violet-200",
  emerald: "group-hover:text-emerald-700 group-hover:ring-emerald-200",
  amber: "group-hover:text-amber-700 group-hover:ring-amber-200",
  sky: "group-hover:text-sky-700 group-hover:ring-sky-200",
};

export function TicketSystemCard({ system }: Props) {
  const Icon = system.icon;

  const accentClass = ACCENT_STYLES[system.accent] ?? ACCENT_STYLES.violet;
  const hoverClass = HOVER_STYLES[system.accent] ?? HOVER_STYLES.violet;
  const textHoverClass =
    TEXT_HOVER_STYLES[system.accent] ?? TEXT_HOVER_STYLES.violet;
  const iconHoverClass =
    ICON_HOVER_STYLES[system.accent] ?? ICON_HOVER_STYLES.violet;

  return (
    <Link
      href={system.url}
      target={system.external ? "_blank" : undefined}
      rel={system.external ? "noopener noreferrer" : undefined}
      title={system.external ? "Abre en una nueva pestaña" : undefined}
      className={`
        group relative flex h-full cursor-pointer items-center gap-4 rounded-2xl
        border border-slate-200 border-l-4 bg-white p-5 shadow-sm
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-lg
        active:scale-[0.99]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2
        ${hoverClass}
      `}
    >
      <div
        className={`
          flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl
          transition-all duration-300 ease-out
          group-hover:scale-105 group-hover:ring-2
          ${accentClass}
          ${iconHoverClass}
        `}
      >
        <Icon className="h-5 w-5 transition-colors duration-300" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3
            className={`
              text-sm font-semibold text-slate-800 transition-colors duration-300
              ${textHoverClass}
            `}
          >
            {system.name}
          </h3>

          {system.external && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
              Externo
            </span>
          )}
        </div>

        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {system.description}
        </p>

        <span
          className={`
            mt-2 block text-xs font-medium opacity-0 transition-all duration-300
            group-hover:translate-x-0.5 group-hover:opacity-100
            ${textHoverClass}
          `}
        >
          Acceder al sistema →
        </span>
      </div>

      <ExternalLink
        className={`
          h-4 w-4 shrink-0 text-slate-400
          transition-all duration-300 ease-out
          group-hover:translate-x-0.5 group-hover:-translate-y-0.5
          ${textHoverClass}
        `}
      />
    </Link>
  );
}