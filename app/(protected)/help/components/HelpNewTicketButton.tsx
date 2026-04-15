/**
 * @module HelpNewTicketButton
 * Botón de creación de tickets dentro del Help Center.
 *
 * @remarks
 * Este componente actúa como punto de entrada para la creación de nuevos
 * tickets de soporte desde el módulo de ayuda.
 *
 * Su responsabilidad principal es:
 *
 * - controlar la apertura/cierre del modal de creación
 * - delegar la creación del ticket al contexto global de tickets
 * - encapsular la interacción entre UI y lógica de estado
 *
 * Utiliza:
 *
 * - {@link TicketCreateModal} para la captura de datos
 * - {@link useTickets} para registrar el nuevo ticket en el sistema
 *
 * Este componente es cliente (`"use client"`) debido al uso de estado
 * local (`useState`) y contexto.
 */

"use client";

import { useState } from "react";
import TicketCreateModal from "@/app/(protected)/(intranet)/departments/it/components/TicketCreateModal";
import { useTickets } from "../context/HelpTicketsContext";

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Botón para crear un nuevo ticket de soporte.
 *
 * @returns Botón que abre el modal de creación de tickets.
 *
 * @remarks
 * Flujo de funcionamiento:
 *
 * 1. El usuario hace clic en el botón
 * 2. Se abre {@link TicketCreateModal}
 * 3. El usuario completa el formulario
 * 4. Se ejecuta `handleCreate`
 * 5. Se delega la persistencia al contexto (`addTicket`)
 *
 * Este diseño desacopla:
 *
 * - la UI (botón + modal)
 * - la lógica de estado (contexto de tickets)
 *
 * @example
 * ```tsx
 * <HelpNewTicketButton />
 * ```
 */
export default function HelpNewTicketButton() {
  /**
   * Estado que controla la visibilidad del modal.
   */
  const [open, setOpen] = useState(false);

  /**
   * Función del contexto para agregar nuevos tickets.
   */
  const { addTicket } = useTickets();

  /**
   * Maneja la creación de un nuevo ticket.
   *
   * @param ticket - Objeto con la información del ticket creado.
   *
   * @remarks
   * Actualmente el tipo es `any`, lo cual debería tiparse en el futuro
   * usando el modelo `Request` o un DTO específico de creación.
   */
  function handleCreate(ticket: any) {
    addTicket(ticket);
  }

  return (
    <>
      {/* -------------------------------------------------------------- */}
      {/* Botón de apertura                                              */}
      {/* -------------------------------------------------------------- */}
      <button
        onClick={() => setOpen(true)}
        className="bg-white text-blue-700 font-bold text-xs px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0"
      >
        + Nuevo ticket
      </button>

      {/* -------------------------------------------------------------- */}
      {/* Modal de creación                                              */}
      {/* -------------------------------------------------------------- */}
      <TicketCreateModal
        open={open}
        onClose={() => setOpen(false)}
        onCreate={handleCreate}
        modalTitle="Crear Ticket de Ayuda"
        subtitle="Describe tu solicitud para soporte"
        defaultArea="Help Center"
      />
    </>
  );
}