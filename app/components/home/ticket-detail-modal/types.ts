import type React from "react";

/**
 * @module TicketDetailModal/types
 * Tipos compartidos del modal de detalle de tickets.
 */

/**
 * Estados posibles de una solicitud o ticket.
 */
export type RequestStatus = "pending" | "in_progress" | "resolved" | "rejected";

/**
 * Representa un evento dentro del historial del ticket.
 */
export type TimelineEvent = {
  /**
   * Identificador único del evento.
   */
  id: string;

  /**
   * Tipo de evento registrado en la línea de tiempo.
   */
  type: "created" | "status_change" | "comment" | "attachment";

  /**
   * Texto descriptivo del evento.
   */
  label: string;

  /**
   * Usuario o actor que realizó la acción.
   */
  by: string;

  /**
   * Fecha legible del evento.
   */
  date: string;
};

/**
 * Representa un comentario asociado al ticket.
 */
export type Comment = {
  /**
   * Identificador único del comentario.
   */
  id: string;

  /**
   * Nombre del autor del comentario.
   */
  author: string;

  /**
   * Iniciales del autor para el avatar.
   */
  initials: string;

  /**
   * Color principal usado en el avatar del autor.
   */
  color: string;

  /**
   * Contenido del comentario.
   */
  message: string;

  /**
   * Fecha legible del comentario.
   */
  date: string;
};

/**
 * Representa un archivo adjunto del ticket.
 */
export type Attachment = {
  /**
   * Identificador único del adjunto.
   */
  id: string;

  /**
   * Nombre del archivo.
   */
  name: string;

  /**
   * Tamaño legible del archivo.
   */
  size: string;

  /**
   * Extensión del archivo.
   */
  ext: string;
};

/**
 * Modelo completo de detalle de ticket usado por el modal.
 *
 * @remarks
 * Este tipo concentra toda la información necesaria para las pestañas:
 * detalles, comentarios, adjuntos e historial.
 */
export type TicketDetail = {
  /**
   * Identificador interno del ticket.
   */
  id: string;

  /**
   * Código visible del ticket.
   */
  ticketNumber: string;

  /**
   * Título resumido de la solicitud.
   */
  title: string;

  /**
   * Descripción detallada del requerimiento.
   */
  description: string;

  /**
   * Identificador del departamento asociado.
   */
  departmentId: string;

  /**
   * Nombre legible del departamento.
   */
  departmentLabel: string;

  /**
   * Estado actual del ticket.
   */
  status: RequestStatus;

  /**
   * Fecha de creación.
   */
  date: string;

  /**
   * Fecha estimada o comprometida de vencimiento.
   */
  dueDate?: string;

  /**
   * Nombre del solicitante.
   */
  requester: string;

  /**
   * Nombre del responsable asignado.
   */
  assignee?: string;

  /**
   * Categoría funcional del ticket.
   */
  category?: string;

  /**
   * Etiquetas asociadas al ticket.
   */
  tags?: string[];

  /**
   * Historial cronológico del ticket.
   */
  timeline: TimelineEvent[];

  /**
   * Comentarios registrados en el ticket.
   */
  comments: Comment[];

  /**
   * Archivos adjuntos vinculados al ticket.
   */
  attachments: Attachment[];
};

/**
 * Tabs disponibles en el modal.
 */
export type Tab = "details" | "comments" | "attachments" | "timeline";

/**
 * Props del componente {@link import("../TicketDetailModal").TicketDetailModal}.
 */
export interface TicketDetailModalProps {
  /**
   * Indica si el modal está abierto.
   */
  open: boolean;

  /**
   * Callback de cierre del modal.
   */
  onClose: () => void;

  /**
   * Información completa del ticket a mostrar.
   */
  ticket: TicketDetail;
}

/**
 * Configuración visual de estado del ticket.
 */
export interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  dot: string;
  icon: React.ReactNode;
}

/**
 * Configuración visual de una pestaña.
 */
export interface TabConfig {
  id: Tab;
  label: string;
  icon: React.ReactNode;
}