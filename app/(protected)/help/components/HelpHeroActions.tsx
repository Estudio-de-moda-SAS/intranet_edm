"use client";

// app/(protected)/(intranet)/help/components/HelpHeroActions.tsx

import { useState } from "react";
import { Ticket, BookOpen } from "lucide-react";
import TicketCreateModal from "@/app/(protected)/(intranet)/departments/it/components/TicketCreateModal";
import { useTickets } from "../context/HelpTicketsContext";



export default function HelpHeroActions() {
  const [open, setOpen] = useState(false);
  const { addTicket } = useTickets();

  function handleCreate(ticket: any) {
  addTicket(ticket);
}

    // Aquí luego se puede puede:
    // - enviar a API
    // - guardar en estado global
    // - redirigir

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors shadow-sm"
        >
          <Ticket className="w-4 h-4" />
          Nuevo ticket
        </button>

        <button className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors">
          <BookOpen className="w-4 h-4" />
          Base de conocimiento
        </button>
      </div>

      {/* MODAL REUTILIZADO */}
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