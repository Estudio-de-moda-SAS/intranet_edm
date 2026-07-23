"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, Info } from "lucide-react";
import { Modal } from "@/app/components/ui/Modal";
import type { TicketSystem } from "../config/ticketSystems.config";

type Props = {
  system: TicketSystem;
};

export function TicketSystemCard({ system }: Props) {
  const [openInfo, setOpenInfo] = useState(false);
  const Icon = system.icon;

  return (
    <>
      <article
        className={`
          group relative flex h-full min-h-[108px] flex-col justify-between gap-5
          rounded-2xl border border-slate-200 bg-white p-5
          transition-all duration-300 ease-out
          hover:-translate-y-[3px] hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100
        `}
      >
        <div className="flex min-w-0 items-center gap-4 pr-2">
          <div
            className={`
              flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl
              bg-slate-100 text-slate-600
              transition-transform duration-300 ease-out
              group-hover:scale-[1.03]
            `}
          >
            {system.logo ? (
              <img
                src={system.logo}
                alt={system.name}
                className="h-8 w-8 object-contain"
              />
            ) : (
              <Icon className="h-6 w-6" />
            )}
          </div>

          <h3 className="min-w-0 truncate text-[16px] font-medium leading-tight text-slate-700 transition-colors group-hover:text-violet-700">
            {system.name}
          </h3>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
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
              className="flex items-center gap-1.5 rounded-full bg-violet-100 px-4 py-2 text-xs font-semibold text-violet-700 transition-all duration-300 hover:bg-violet-600 hover:text-white"
            >
              Abrir
              <ExternalLink className="h-3.5 w-3.5" />
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