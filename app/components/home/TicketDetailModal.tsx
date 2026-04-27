"use client";

/**
 * @module TicketDetailModal
 * Modal de detalle para visualizar la información completa de un ticket o solicitud.
 *
 * @remarks
 * Este archivo implementa un componente modal reutilizable que permite consultar:
 *
 * - información general del ticket,
 * - comentarios,
 * - archivos adjuntos,
 * - historial de eventos,
 * - y acciones rápidas desde una interfaz tabulada.
 *
 * Actualmente está preparado para recibir datos reales desde props.
 */

import { useEffect, useState } from "react";
import { Modal } from "@/app/components/ui/Modal";
import { ExternalLinkIcon } from "./ticket-detail-modal/components/Icons";
import { TicketHeader } from "./ticket-detail-modal/components/TicketHeader";
import { TicketTabs } from "./ticket-detail-modal/components/TicketTabs";
import { DetailsTab } from "./ticket-detail-modal/components/tabs/DetailsTab";
import { CommentsTab } from "./ticket-detail-modal/components/tabs/CommentsTab";
import { AttachmentsTab } from "./ticket-detail-modal/components/tabs/AttachmentsTab";
import { TimelineTab } from "./ticket-detail-modal/components/tabs/TimelineTab";
import type { Tab, TicketDetailModalProps } from "./ticket-detail-modal/types";

/**
 * Modal principal para visualizar el detalle completo de un ticket.
 *
 * @param props Propiedades del componente.
 * @param props.open Estado de apertura del modal.
 * @param props.onClose Función para cerrar el modal.
 * @param props.ticket Ticket seleccionado.
 * @returns Modal tabulado con información completa del ticket.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Recibe el ticket completo por props.
 * 2. Inicializa la pestaña activa en `details`.
 * 3. Ejecuta una animación de entrada al abrirse.
 * 4. Renderiza pestañas para detalles, comentarios, adjuntos e historial.
 * 5. Muestra acciones de cierre y acceso externo desde el footer.
 */
export function TicketDetailModal({ open, onClose, ticket }: TicketDetailModalProps) {
  /**
   * Pestaña actualmente seleccionada.
   */
  const [activeTab, setActiveTab] = useState<Tab>("details");

  /**
   * Texto del comentario en el composer.
   */
  const [comment, setComment] = useState("");

  /**
   * Estado usado para animar visualmente la entrada del contenido.
   */
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAnimateIn(false);
    const t = setTimeout(() => setAnimateIn(true), 20);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (open) setActiveTab("details");
  }, [open]);

  const footer = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: "11px", color: "#94a3b8" }}>
        Última actualización:{" "}
        {new Date(ticket.date).toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </span>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={onClose}
          style={{
            padding: "7px 16px",
            borderRadius: "8px",
            border: "1.5px solid #e2e8f0",
            background: "transparent",
            color: "#64748b",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Cerrar
        </button>

        <button
          style={{
            padding: "7px 16px",
            borderRadius: "8px",
            border: "none",
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <ExternalLinkIcon />
          Ver en portal
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      accentColor="bg-blue-600"
      footer={footer}
      hideCloseButton
    >
      <div
        style={{
          fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
          opacity: animateIn ? 1 : 0,
          transform: animateIn ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}
      >
        <TicketHeader ticket={ticket} onClose={onClose} />

        <TicketTabs activeTab={activeTab} onChange={setActiveTab} ticket={ticket} />

        <div style={{ minHeight: "220px" }}>
          {activeTab === "details" && <DetailsTab ticket={ticket} />}
          {activeTab === "comments" && (
            <CommentsTab ticket={ticket} comment={comment} setComment={setComment} />
          )}
          {activeTab === "attachments" && <AttachmentsTab ticket={ticket} />}
          {activeTab === "timeline" && <TimelineTab ticket={ticket} />}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>
    </Modal>
  );
}