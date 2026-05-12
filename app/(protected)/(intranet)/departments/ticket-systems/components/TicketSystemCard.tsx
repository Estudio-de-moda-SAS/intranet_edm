"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Info } from "lucide-react";
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
  violet: "hover:border-violet-300 hover:bg-violet-50/40",
  emerald: "hover:border-emerald-300 hover:bg-emerald-50/40",
  amber: "hover:border-amber-300 hover:bg-amber-50/40",
  sky: "hover:border-sky-300 hover:bg-sky-50/40",
};

export function TicketSystemCard({ system }: Props) {
  const [openInfo, setOpenInfo] = useState(false);
  const Icon = system.icon;

  const accentClass = ACCENT_STYLES[system.accent] ?? ACCENT_STYLES.violet;
  const hoverClass = HOVER_STYLES[system.accent] ?? HOVER_STYLES.violet;

  return (
    <>
      <div
        className={`
          group flex h-full items-center gap-4 rounded-2xl
          border border-slate-200 border-l-4 bg-white p-5 shadow-sm
          transition-all duration-300 ease-out
          hover:-translate-y-1 hover:shadow-lg
          ${hoverClass}
        `}
      >
        <Link
          href={system.url}
          target={system.external ? "_blank" : undefined}
          rel={system.external ? "noopener noreferrer" : undefined}
          className="flex min-w-0 flex-1 items-center gap-4"
          aria-label={`Acceder a ${system.name}`}
        >
          <div
            className={`
              flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl
              transition-all duration-300 ease-out group-hover:scale-105
              ${accentClass}
            `}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-800 transition-colors group-hover:text-violet-800">
              {system.name}
            </h3>

            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
              {system.description}
            </p>

            <span className="mt-2 block text-xs font-medium text-violet-600 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
              Acceder al sistema →
            </span>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setOpenInfo(true);
            }}
            aria-label={`Ver información sobre ${system.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-violet-100 hover:text-violet-700"
          >
            <Info className="h-4 w-4" />
          </button>

          <Link
            href={system.url}
            target={system.external ? "_blank" : undefined}
            rel={system.external ? "noopener noreferrer" : undefined}
            aria-label={`Abrir ${system.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-violet-100 hover:text-violet-700"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>

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