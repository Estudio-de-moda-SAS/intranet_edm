import { TicketSystemCard } from "./components/TicketSystemCard";
import { TICKET_SYSTEMS } from "./config/ticketSystems.config";
import { DepartmentHeroBanner } from "@/app/components/ui/animated/DepartmentHeroBanner";

export function TicketSystemsPageContent() {
  return (
    <main className="space-y-6">
      {/* Banner reutilizable */}
      <DepartmentHeroBanner
        breadcrumb="Departamentos · Tickets"
        title="Sistemas de Tickets"
        subtitle="Accede de forma centralizada a las plataformas de tickets habilitadas por la compañía."
        gradientFrom="from-slate-900"
        gradientVia="via-indigo-800"
        gradientTo="to-violet-700"
        dotPatternId="tickets-dot-pattern"
        pills={[
          {
            type: "status",
            text: `${TICKET_SYSTEMS.length} sistemas disponibles`,
          },
          {
            type: "info",
            text: "Acceso centralizado",
          },
        ]}
      />

      {/* Contenido */}
      <section className="px-6 pt-10 pb-12 lg:px-14">
        <div className="mx-auto max-w-6xl">
          
          {/* Header de sección */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Plataformas disponibles
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Selecciona el sistema al que necesitas acceder.
            </p>
          </div>

          {/* Grid de sistemas */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {TICKET_SYSTEMS.map((system) => (
              <TicketSystemCard key={system.id} system={system} />
            ))}
          </div>

        </div>
      </section>
    </main>
  );
}