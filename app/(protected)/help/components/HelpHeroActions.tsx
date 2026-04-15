/**
 * @module HelpHeroActions
 * Acciones principales del Hero del Help Center.
 *
 * @remarks
 * Este componente define las acciones disponibles en el encabezado
 * principal (Hero) del módulo de ayuda.
 *
 * Actualmente incluye:
 *
 * - creación de nuevos tickets
 * - acceso a la base de conocimiento (placeholder)
 *
 * También encapsula la lógica de apertura del modal de creación
 * de tickets y su integración con el contexto global.
 *
 * Es un componente cliente (`"use client"`) debido al uso de estado
 * local y contexto.
 */

// app/(protected)/(intranet)/help/components/HelpHeroActions.tsx

"use client";

import { useState } from "react";
import { Ticket, BookOpen } from "lucide-react";
import TicketCreateModal from "@/app/(protected)/(intranet)/departments/it/components/TicketCreateModal";
import { useTickets } from "../context/HelpTicketsContext";

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Acciones del Hero del Help Center.
 *
 * @returns Botones de acción contextual del módulo.
 *
 * @remarks
 * Flujo principal:
 *
 * 1. El usuario hace clic en "Nuevo ticket"
 * 2. Se abre {@link TicketCreateModal}
 * 3. El usuario completa el formulario
 * 4. Se ejecuta `handleCreate`
 * 5. Se registra el ticket mediante el contexto (`addTicket`)
 *
 * Este componente:
 *
 * - centraliza acciones del Hero
 * - reutiliza lógica de creación de tickets
 * - mantiene desacoplada la UI del estado global
 *
 * @example
 * ```tsx
 * <HelpHeroActions />
 * ```
 */
export default function HelpHeroActions() {
  /**
   * Estado que controla la visibilidad del modal.
   */
  const [open, setOpen] = useState(false);

  /**
   * Función del contexto para registrar nuevos tickets.
   */
  const { addTicket } = useTickets();

  /**
   * Maneja la creación de un ticket desde el modal.
   *
   * @param ticket - Datos del ticket creado.
   *
   * @remarks
   * Actualmente el tipo es `any`. Se recomienda tiparlo
   * con `Request` o un DTO específico en el futuro.
   */
  function handleCreate(ticket: any) {
    addTicket(ticket);
    setOpen(false); // mejora UX: cerrar modal automáticamente
  }

  return (
    <>
      {/* -------------------------------------------------------------- */}
      {/* Botones de acción                                              */}
      {/* -------------------------------------------------------------- */}
      <div className="flex flex-wrap gap-3">
        
        {/* Nuevo ticket */}
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors shadow-sm"
        >
          <Ticket className="w-4 h-4" />
          Nuevo ticket
        </button>

        {/* Base de conocimiento */}
        <button
          className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          Base de conocimiento
        </button>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* Modal de creación                                              */}
      {/* -------------------------------------------------------------- */}
      <TicketCreateModal
        open={open}
        onClose={() => setOpen(false)}
        onCreate={handleCreate}
        modalTitle="Crear Ticket de Ayuda"
        subtitle="Describe tu solicitud para el equipo de soporte"
        defaultArea="Help Center"
      />
    </>
  );
}