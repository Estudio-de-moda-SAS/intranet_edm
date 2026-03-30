"use client";

import { useState } from "react";
import TicketCreateModal from "@/app/(protected)/(intranet)/departments/it/components/TicketCreateModal";
import { useTickets } from "../context/HelpTicketsContext";

export default function HelpNewTicketButton() {
  const [open, setOpen] = useState(false);
  const { addTicket } = useTickets();

  function handleCreate(ticket: any) {
    addTicket(ticket);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-white text-blue-700 font-bold text-xs px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0"
      >
        + Nuevo ticket
      </button>

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