"use client";

import { useState } from "react";
import { Modal } from "@/app/components/ui/Modal";

type Ticket = {
  title: string;
  user: string;
  area: string;
  description: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (ticket: Ticket) => void;

  modalTitle?: string;
  subtitle?: string;
  defaultArea?: string;
}

export default function TicketCreateModal({
  open,
  onClose,
  onCreate,
  modalTitle,
  subtitle,
  defaultArea,
}: Props) {

  const [title, setTitle] = useState("");
  const [user, setUser] = useState("");
  const [area, setArea] = useState(defaultArea || "");
  const [description, setDescription] = useState("");

  function handleSubmit() {
    if (!title || !user || !area) return;

    onCreate({
      title,
      user,
      area,
      description,
    });

    setTitle("");
    setUser("");
    setArea(defaultArea || ""); // 🔥 mantiene el default si existe
    setDescription("");

    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle || "Crear Ticket de Soporte"}
      subtitle={subtitle || "Registrar nueva solicitud de TI"}
      size="md"
      accentColor="bg-indigo-600"
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
          >
            Crear Ticket
          </button>
        </div>
      }
    >
      <div className="space-y-4">

        <div>
          <label className="text-xs text-slate-500">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-slate-500">Usuario</label>
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-slate-500">Área / Origen</label>
          <input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            readOnly={!!defaultArea}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-100"
          />
        </div>

        <div>
          <label className="text-xs text-slate-500">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

      </div>
    </Modal>
  );
}