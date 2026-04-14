/**
 * @module ITTicketController
 * Controlador de interacción para la creación de tickets de TI.
 *
 * @remarks
 * Este componente cliente gestiona la apertura y cierre del modal de creación
 * de tickets, además de centralizar el callback ejecutado cuando se registra
 * un nuevo ticket.
 *
 * Su responsabilidad principal es:
 * - Mostrar el botón de creación
 * - Controlar el estado de visibilidad del modal
 * - Recibir la información del ticket creado
 * - Delegar la lógica de creación mediante un handler local
 */

"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import TicketCreateModal from "./TicketCreateModal";

/**
 * Controlador de creación de tickets.
 *
 * @returns Botón de acción y modal para registrar un nuevo ticket.
 *
 * @remarks
 * Este componente encapsula la lógica mínima necesaria para operar
 * el flujo de creación de tickets desde la interfaz.
 *
 * Actualmente:
 * - Abre el modal al presionar el botón
 * - Cierra el modal mediante el callback `onClose`
 * - Simula la creación del ticket escribiéndolo en consola
 *
 * En una integración real, el handler de creación podría conectarse con:
 * - Un servicio HTTP
 * - Una Server Action
 * - Un endpoint interno
 * - Un gestor de estado global
 *
 * @example
 * ```tsx
 * <ITTicketController />
 * ```
 */
export default function ITTicketController() {
  const [open, setOpen] = useState(false);

  /**
   * Maneja la creación de un ticket desde el modal.
   *
   * @param ticket Información capturada del ticket creado.
   *
   * @remarks
   * Por ahora esta función actúa como simulación, registrando el ticket
   * en consola. Puede reemplazarse posteriormente por la lógica real
   * de persistencia o envío al backend.
   */
  function handleCreate(ticket: any) {
    console.log("Ticket creado (simulación):", ticket);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="
        flex items-center gap-2
        rounded-lg
        border border-white/20
        bg-white/10
        px-4 py-2
        text-sm font-semibold
        text-white
        backdrop-blur-md
        hover:bg-white/20
        transition
        "
      >
        <Plus className="h-4 w-4" />
        Crear Ticket
      </button>

      <TicketCreateModal
        open={open}
        onClose={() => setOpen(false)}
        onCreate={handleCreate}
      />
    </>
  );
}