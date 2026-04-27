import {
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  Paperclip,
  XCircle,
} from "lucide-react";
import type { RequestStatus, StatusConfig, TabConfig, TicketDetail } from "./types";

/**
 * @module TicketDetailModal/config
 * Configuración visual y datos de apoyo del modal.
 */

/**
 * Configuración visual de cada estado del ticket.
 *
 * @remarks
 * Define:
 * - texto visible,
 * - color principal,
 * - fondo del badge,
 * - color del punto indicador,
 * - ícono asociado.
 */
export const STATUS_CONFIG: Record<RequestStatus, StatusConfig> = {
  pending: {
    label: "Pendiente",
    color: "#b45309",
    bg: "#fef3c7",
    dot: "#f59e0b",
    icon: <Circle className="h-3 w-3" />,
  },
  in_progress: {
    label: "En proceso",
    color: "#1d4ed8",
    bg: "#dbeafe",
    dot: "#3b82f6",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  resolved: {
    label: "Resuelto",
    color: "#15803d",
    bg: "#dcfce7",
    dot: "#22c55e",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  rejected: {
    label: "Rechazado",
    color: "#b91c1c",
    bg: "#fee2e2",
    dot: "#ef4444",
    icon: <XCircle className="h-3 w-3" />,
  },
};

/**
 * Configuración de pestañas mostradas en la navegación superior del modal.
 */
export const TABS: TabConfig[] = [
  { id: "details", label: "Detalles", icon: <FileText className="h-3.5 w-3.5" /> },
  { id: "comments", label: "Comentarios", icon: <MessageSquare className="h-3.5 w-3.5" /> },
  { id: "attachments", label: "Adjuntos", icon: <Paperclip className="h-3.5 w-3.5" /> },
  { id: "timeline", label: "Historial", icon: <Clock className="h-3.5 w-3.5" /> },
];

/**
 * Ejemplo mock de detalle de ticket.
 *
 * @remarks
 * Este objeto sirve como referencia visual y funcional para pruebas locales.
 * En producción debería ser reemplazado por datos obtenidos desde API o backend.
 */
export const MOCK_DETAIL: TicketDetail = {
  id: "1",
  ticketNumber: "TI-0041",
  title: "Instalación de software",
  description:
    "Se requiere instalación de Adobe Creative Cloud completo (Photoshop, Illustrator, Premiere Pro) para el equipo del área de Marketing. El equipo actualmente no cuenta con licencia activa y necesita las herramientas para la campaña Q3.",
  departmentId: "ti",
  departmentLabel: "Tecnología",
  status: "in_progress",
  date: "2025-06-10",
  dueDate: "2025-06-20",
  requester: "Laura Martínez",
  assignee: "Carlos Jiménez",
  category: "Software",
  tags: ["Adobe", "Licencias", "Marketing"],
  timeline: [
    { id: "t1", type: "created", label: "Ticket creado", by: "Laura Martínez", date: "10 jun · 9:14 am" },
    { id: "t2", type: "status_change", label: "Estado cambiado a En proceso", by: "Carlos Jiménez", date: "11 jun · 8:02 am" },
    { id: "t3", type: "comment", label: "Comentario agregado", by: "Carlos Jiménez", date: "11 jun · 8:05 am" },
    { id: "t4", type: "attachment", label: "Adjunto: Licencia_Adobe_2025.pdf", by: "Laura Martínez", date: "12 jun · 2:31 pm" },
  ],
  comments: [
    {
      id: "c1",
      author: "Carlos Jiménez",
      initials: "CJ",
      color: "#2563eb",
      message:
        "Revisé el ticket. Estoy coordinando con el proveedor para la activación de la licencia. Espero tener novedades antes del miércoles.",
      date: "11 jun · 8:05 am",
    },
    {
      id: "c2",
      author: "Laura Martínez",
      initials: "LM",
      color: "#7c3aed",
      message:
        "Perfecto, adjunto la orden de compra aprobada por finanzas para agilizar el proceso.",
      date: "12 jun · 2:30 pm",
    },
  ],
  attachments: [
    { id: "a1", name: "Orden_de_compra_Adobe.pdf", size: "284 KB", ext: "PDF" },
    { id: "a2", name: "Licencia_Adobe_2025.pdf", size: "118 KB", ext: "PDF" },
  ],
};