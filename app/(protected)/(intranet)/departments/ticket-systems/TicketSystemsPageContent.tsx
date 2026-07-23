"use client";

import { LifeBuoy } from "lucide-react";
import { TicketSystemCard } from "./components/TicketSystemCard";
import { TICKET_SYSTEMS } from "./config/ticketSystems.config";

export function TicketSystemsPageContent() {
  return (
    <main className="space-y-6">
      <section className="px-6 pt-10 pb-12 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <LifeBuoy className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Plataformas disponibles
              </h2>
              <p className="text-sm text-slate-500">
                Elige el sistema donde quieres crear o consultar tickets.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {TICKET_SYSTEMS.map((system) => (
              <TicketSystemCard key={system.id} system={system} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}