/**
 * @module TicketCreateModal
 * Modal para la creación de tickets de soporte en el módulo de TI.
 *
 * @remarks
 * Este componente permite registrar una nueva solicitud de soporte técnico
 * mediante un formulario embebido dentro de {@link Modal}.
 *
 * Incluye:
 * - Título del ticket
 * - Usuario solicitante
 * - Área de origen
 * - Descripción opcional
 *
 * Está implementado como componente cliente porque administra estado local
 * del formulario con `useState`.
 */

"use client";

import { useState } from "react";
import { Modal } from "@/app/components/ui/Modal";

/**
 * Estructura de un ticket de soporte.
 *
 * @property title Título breve del incidente o requerimiento.
 * @property user Nombre o identificador del usuario solicitante.
 * @property area Área de origen del ticket.
 * @property description Descripción adicional del problema o solicitud.
 */
type Ticket = {
  title: string;
  user: string;
  area: string;
  description: string;
};

/**
 * Props del componente {@link TicketCreateModal}.
 *
 * @property open Indica si el modal está abierto.
 * @property onClose Callback para cerrar el modal.
 * @property onCreate Callback ejecutado al crear un ticket válido.
 * @property modalTitle Título opcional del modal.
 * @property subtitle Subtítulo opcional del modal.
 * @property defaultArea Área predeterminada del ticket.
 *
 * @remarks
 * Si `defaultArea` existe:
 * - Se usa como valor inicial del campo `area`
 * - El campo queda en modo solo lectura
 */
interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (ticket: Ticket) => void;

  modalTitle?: string;
  subtitle?: string;
  defaultArea?: string;
}

/**
 * Modal de creación de tickets de soporte.
 *
 * @param props Propiedades del componente.
 * @returns Formulario modal para registrar un nuevo ticket.
 *
 * @remarks
 * Flujo de uso:
 * 1. El usuario diligencia los campos requeridos
 * 2. `handleSubmit` valida título, usuario y área
 * 3. Se ejecuta `onCreate` con el objeto `Ticket`
 * 4. El formulario se reinicia
 * 5. El modal se cierra
 *
 * Comportamientos relevantes:
 * - Mantiene `defaultArea` después del submit si fue definida
 * - Impide crear tickets si faltan campos obligatorios
 * - Reutiliza el componente base {@link Modal}
 *
 * @example
 * ```tsx
 * <TicketCreateModal
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   onCreate={(ticket) => console.log(ticket)}
 *   defaultArea="Ventas"
 * />
 * ```
 */
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

  /**
   * Procesa el envío del formulario.
   *
   * @remarks
   * Valida que existan los campos mínimos requeridos:
   * - `title`
   * - `user`
   * - `area`
   *
   * Si la validación es exitosa:
   * - Ejecuta `onCreate`
   * - Limpia el formulario
   * - Conserva `defaultArea` si existe
   * - Cierra el modal
   */
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
    setArea(defaultArea || "");
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