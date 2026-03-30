"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import TicketCreateModal from "./TicketCreateModal";

export default function ITTicketController() {

  const [open, setOpen] = useState(false);

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