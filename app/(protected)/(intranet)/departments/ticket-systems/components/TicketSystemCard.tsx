"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, Info } from "lucide-react";
import { Modal } from "@/app/components/ui/Modal";
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
  violet: "hover:border-violet-300 hover:bg-violet-50/35",
  emerald: "hover:border-emerald-300 hover:bg-emerald-50/35",
  amber: "hover:border-amber-300 hover:bg-amber-50/35",
  sky: "hover:border-sky-300 hover:bg-sky-50/35",
};

const STATUS_STYLES: Record<string, string> = {
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  sky: "bg-sky-50 text-sky-700 ring-sky-100",
};

const ACTION_STYLES: Record<string, string> = {
  violet: "bg-violet-100 text-violet-700 hover:bg-violet-600 hover:text-white",
  emerald:
    "bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white",
  amber: "bg-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white",
  sky: "bg-sky-100 text-sky-700 hover:bg-sky-600 hover:text-white",
};

export function TicketSystemCard({ system }: Props) {
  const [openInfo, setOpenInfo] = useState(false);
  const Icon = system.icon;

  const accentClass = ACCENT_STYLES[system.accent] ?? ACCENT_STYLES.violet;
  const hoverClass = HOVER_STYLES[system.accent] ?? HOVER_STYLES.violet;
  const statusClass = STATUS_STYLES[system.accent] ?? STATUS_STYLES.violet;
  const actionClass = ACTION_STYLES[system.accent] ?? ACTION_STYLES.violet;

  return (
    <>
      <article
        className={`
          group relative flex h-full min-h-[128px] flex-col justify-between gap-5
          rounded-2xl border border-slate-200 border-l-4 bg-white p-5 shadow-sm
          transition-all duration-300 ease-out
          hover:-translate-y-1 hover:shadow-xl
          ${hoverClass}
        `}
      >
        <div className="flex min-w-0 items-start gap-4 pr-2">
          <div
            className={`
              flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl
              transition-all duration-300 ease-out group-hover:scale-105
              ${accentClass}
            `}
          >
            <Icon className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[17px] font-bold leading-tight tracking-[-0.02em] text-slate-600 transition-colors group-hover:text-violet-700">
              {system.name}
            </h3>

            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
              {system.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass}`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Disponible
          </span>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setOpenInfo(true);
              }}
              aria-label={`Ver información sobre ${system.name}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-700"
            >
              <Info className="h-4 w-4" />
            </button>

            <Link
              href={system.url}
              target={system.external ? "_blank" : undefined}
              rel={system.external ? "noopener noreferrer" : undefined}
              aria-label={`Abrir ${system.name}`}
              className={`flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-0.5 ${actionClass}`}
            >
              <ExternalLink className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>
      </article>

      <Modal
        open={openInfo}
        onClose={() => setOpenInfo(false)}
        title={system.name}
        subtitle="Información del sistema"
        size="md"
        accentColor="bg-violet-600"
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-slate-600">
            {system.details}
          </p>

          {system.useCases && system.useCases.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-800">
                ¿Para qué sirve?
              </h4>

              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                {system.useCases.map((useCase) => (
                  <li key={useCase} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                    <span>{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}