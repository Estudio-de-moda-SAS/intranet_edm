/**
 * @module tickets
 * Fuente central de tipos, configuraciones, datos mock y utilidades
 * para el módulo de solicitudes (tickets) en la intranet.
 *
 * @remarks
 * Este archivo actúa como la fuente única de verdad del dominio de solicitudes,
 * concentrando:
 *
 * - tipos de estado y prioridad
 * - contratos de datos para solicitudes y detalle de ticket
 * - configuraciones visuales de estado y prioridad
 * - dataset mock de solicitudes
 * - funciones auxiliares para construir y consultar detalles
 *
 * Actualmente trabaja con datos simulados para facilitar el desarrollo
 * de la interfaz. En una futura integración con backend, este archivo puede
 * evolucionar para reemplazar los mocks por llamadas reales a la API.
 *
 * Es consumido por componentes como:
 *
 * - `RequestsPanelWithModal`
 * - `TicketDetailPage`
 */

// app/solicitudes/_data/tickets.ts

import { DEPARTMENTS } from "@/config/config";
export { DEPARTMENTS } from "@/config/config";

/* -------------------------------------------------------------------------- */
/* Tipos del dominio                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Estados posibles de una solicitud.
 *
 * @remarks
 * Define el ciclo de vida general de un ticket dentro del sistema.
 */
export type RequestStatus =
  | "pending"
  | "in_progress"
  | "resolved"
  | "rejected";

/**
 * Niveles de prioridad posibles para una solicitud.
 *
 * @remarks
 * Se utiliza para representar la urgencia relativa del ticket
 * tanto a nivel visual como semántico.
 */
export type RequestPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

/**
 * Estructura base de una solicitud.
 *
 * @property id Identificador interno único de la solicitud.
 * @property title Título principal de la solicitud.
 * @property departmentId Identificador del área responsable.
 * @property status Estado actual del ticket.
 * @property priority Nivel de prioridad asignado.
 * @property date Fecha de creación de la solicitud.
 * @property description Descripción general del requerimiento.
 * @property ticketNumber Código visible del ticket.
 * @property category Categoría funcional del requerimiento.
 */
export type Request = {
  id: string;
  title: string;
  departmentId: string;
  status: RequestStatus;
  priority: RequestPriority;
  date: string;
  description: string;
  ticketNumber: string;
  category: string;
};

/**
 * Evento dentro de la línea de tiempo de un ticket.
 *
 * @property id Identificador único del evento.
 * @property type Tipo de evento registrado.
 * @property label Descripción visible del evento.
 * @property by Actor que realizó o registró el evento.
 * @property date Fecha mostrada del evento.
 */
export type TimelineEvent = {
  id: string;
  type: "created" | "status_change" | "comment" | "attachment";
  label: string;
  by: string;
  date: string;
};

/**
 * Comentario asociado a un ticket.
 *
 * @property id Identificador único del comentario.
 * @property author Nombre del autor.
 * @property initials Iniciales del autor para uso visual.
 * @property color Color asociado al autor o al área.
 * @property message Contenido del comentario.
 * @property date Fecha mostrada del comentario.
 */
export type Comment = {
  id: string;
  author: string;
  initials: string;
  color: string;
  message: string;
  date: string;
};

/**
 * Archivo adjunto asociado a un ticket.
 *
 * @property id Identificador único del adjunto.
 * @property name Nombre del archivo.
 * @property size Tamaño mostrado del archivo.
 * @property ext Extensión o tipo corto del archivo.
 */
export type Attachment = {
  id: string;
  name: string;
  size: string;
  ext: string;
};

/**
 * Estructura completa del detalle de un ticket.
 *
 * @remarks
 * Extiende la estructura base de {@link Request} con información adicional
 * de contexto, seguimiento y colaboración.
 *
 * @property dueDate Fecha límite estimada de resolución.
 * @property requester Nombre de la persona solicitante.
 * @property assignee Responsable asignado del ticket.
 * @property tags Etiquetas asociadas al ticket.
 * @property departmentLabel Nombre legible del área responsable.
 * @property timeline Historial de eventos del ticket.
 * @property comments Comentarios asociados al ticket.
 * @property attachments Archivos adjuntos del ticket.
 */
export type TicketDetail = Request & {
  dueDate?: string;
  requester: string;
  assignee?: string;
  tags?: string[];
  departmentLabel: string;
  timeline: TimelineEvent[];
  comments: Comment[];
  attachments: Attachment[];
};

/* -------------------------------------------------------------------------- */
/* Configuración visual                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Configuración visual por estado de solicitud.
 *
 * @remarks
 * Define etiquetas, colores y estilos auxiliares para representar
 * visualmente el estado del ticket en la interfaz.
 */
export const STATUS_CONFIG: Record<
  RequestStatus,
  {
    label: string;
    color: string;
    bg: string;
    dot: string;
    ring: string;
  }
> = {
  pending: {
    label: "Pendiente",
    color: "#b45309",
    bg: "#fef3c7",
    dot: "#f59e0b",
    ring: "#fde68a",
  },
  in_progress: {
    label: "En proceso",
    color: "#1d4ed8",
    bg: "#dbeafe",
    dot: "#3b82f6",
    ring: "#bfdbfe",
  },
  resolved: {
    label: "Resuelto",
    color: "#15803d",
    bg: "#dcfce7",
    dot: "#22c55e",
    ring: "#bbf7d0",
  },
  rejected: {
    label: "Rechazado",
    color: "#b91c1c",
    bg: "#fee2e2",
    dot: "#ef4444",
    ring: "#fecaca",
  },
};

/**
 * Configuración visual por prioridad de solicitud.
 *
 * @remarks
 * Permite representar la severidad o urgencia del ticket mediante:
 *
 * - etiqueta legible
 * - color principal
 * - fondo de apoyo
 * - longitud de barra visual
 * - color de punto auxiliar
 */
export const PRIORITY_CONFIG: Record<
  RequestPriority,
  {
    label: string;
    color: string;
    bg: string;
    bar: string;
    dot: string;
  }
> = {
  low: {
    label: "Baja",
    color: "#64748b",
    bg: "#f1f5f9",
    bar: "w-1/4",
    dot: "#94a3b8",
  },
  medium: {
    label: "Media",
    color: "#d97706",
    bg: "#fef3c7",
    bar: "w-2/4",
    dot: "#f59e0b",
  },
  high: {
    label: "Alta",
    color: "#ea580c",
    bg: "#fff7ed",
    bar: "w-3/4",
    dot: "#f97316",
  },
  critical: {
    label: "Crítica",
    color: "#dc2626",
    bg: "#fef2f2",
    bar: "w-full",
    dot: "#ef4444",
  },
};

/* -------------------------------------------------------------------------- */
/* Datos mock                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Colección mock de solicitudes disponibles en la intranet.
 *
 * @remarks
 * Este arreglo simula tickets de diferentes áreas organizacionales,
 * incluyendo casos de:
 *
 * - TI
 * - Recursos Humanos
 * - Finanzas
 * - Jurídica
 * - Logística
 * - Retail
 * - Marketing
 * - Gerencia
 *
 * Su propósito actual es:
 *
 * - poblar la interfaz de solicitudes
 * - permitir navegación por detalle
 * - probar estados y prioridades
 * - facilitar desarrollo sin backend real
 *
 * Cuando exista API, este dataset debería reemplazarse por datos remotos.
 */
export const MOCK_REQUESTS: Request[] = [
  { id: "ti-1",  title: "Instalación de software",       departmentId: "ti",        status: "in_progress", priority: "high",     date: "2025-06-10", category: "Software",     description: "Solicitud de instalación de Adobe Creative Cloud para el área de Marketing.",     ticketNumber: "TI-0041" },
  { id: "ti-2",  title: "Reemplazo de laptop",           departmentId: "ti",        status: "pending",     priority: "medium",   date: "2025-06-12", category: "Hardware",     description: "Laptop HP EliteBook presenta falla de hardware — disco duro dañado.",           ticketNumber: "TI-0045" },
  { id: "ti-3",  title: "Acceso a sistema ERP",          departmentId: "ti",        status: "resolved",    priority: "low",      date: "2025-06-05", category: "Accesos",      description: "Creación de usuario en SAP Business One para contratación nueva.",             ticketNumber: "TI-0038" },
  { id: "ti-4",  title: "Falla en impresora de red",     departmentId: "ti",        status: "rejected",    priority: "low",      date: "2025-06-09", category: "Hardware",     description: "Impresora HP piso 3 no responde. Revisión de drivers y conexión de red.",      ticketNumber: "TI-0039" },
  { id: "ti-5",  title: "VPN corporativa sin conexión",  departmentId: "ti",        status: "in_progress", priority: "critical", date: "2025-06-13", category: "Redes",        description: "Colaboradores en trabajo remoto no pueden conectarse al servidor VPN.",        ticketNumber: "TI-0047" },

  { id: "rh-1",  title: "Solicitud de vacaciones",       departmentId: "rrhh",      status: "resolved",    priority: "low",      date: "2025-06-01", category: "Vacaciones",   description: "Aprobación de período vacacional del 14 al 25 de julio de 2025.",              ticketNumber: "RH-0089" },
  { id: "rh-2",  title: "Certificado laboral",           departmentId: "rrhh",      status: "resolved",    priority: "low",      date: "2025-06-05", category: "Certificados", description: "Expedición de certificado laboral para trámite de crédito bancario.",          ticketNumber: "RH-0091" },
  { id: "rh-3",  title: "Actualización de datos",        departmentId: "rrhh",      status: "pending",     priority: "low",      date: "2025-06-14", category: "Datos",        description: "Cambio de cuenta bancaria para pago de nómina — adjunto soporte.",           ticketNumber: "RH-0094" },
  { id: "rh-4",  title: "Permiso por calamidad",         departmentId: "rrhh",      status: "in_progress", priority: "high",     date: "2025-06-13", category: "Permisos",     description: "Permiso de 3 días por fallecimiento de familiar directo.",                    ticketNumber: "RH-0093" },
  { id: "rh-5",  title: "Constancia de ingreso",         departmentId: "rrhh",      status: "pending",     priority: "low",      date: "2025-06-15", category: "Certificados", description: "Certificado de fecha de ingreso y cargo actual para trámite de visa.",        ticketNumber: "RH-0095" },

  { id: "fn-1",  title: "Reembolso de viáticos",         departmentId: "finanzas",  status: "in_progress", priority: "medium",   date: "2025-06-08", category: "Reembolsos",   description: "Reembolso de gastos de viaje Medellín–Bogotá · factura adjunta.",            ticketNumber: "FN-0067" },
  { id: "fn-2",  title: "Aprobación de presupuesto",     departmentId: "finanzas",  status: "pending",     priority: "high",     date: "2025-06-14", category: "Presupuesto",  description: "Aprobación de presupuesto Q3 para compra de activos fijos área de TI.",      ticketNumber: "FN-0070" },
  { id: "fn-3",  title: "Anticipo de nómina",            departmentId: "finanzas",  status: "resolved",    priority: "medium",   date: "2025-06-03", category: "Nómina",       description: "Solicitud de anticipo del 30 % de salario por urgencia médica.",             ticketNumber: "FN-0063" },
  { id: "fn-4",  title: "Legalización de caja menor",    departmentId: "finanzas",  status: "pending",     priority: "low",      date: "2025-06-16", category: "Caja menor",   description: "Legalización de gastos de caja menor mes de mayo — soportes adjuntos.",     ticketNumber: "FN-0071" },

  { id: "jr-1",  title: "Revisión de contrato",          departmentId: "juridica",  status: "pending",     priority: "high",     date: "2025-06-14", category: "Contratos",    description: "Revisión de contrato con proveedor logístico — cláusula de exclusividad.",   ticketNumber: "JR-0012" },
  { id: "jr-2",  title: "Poder notarial",                departmentId: "juridica",  status: "in_progress", priority: "medium",   date: "2025-06-10", category: "Trámites",     description: "Elaboración de poder para representar a la empresa ante entidad pública.",   ticketNumber: "JR-0013" },
  { id: "jr-3",  title: "Consulta política LAFT",        departmentId: "juridica",  status: "resolved",    priority: "low",      date: "2025-06-07", category: "Consultas",    description: "Consulta sobre obligaciones SARLAFT para nuevas líneas de negocio.",         ticketNumber: "JR-0011" },

  { id: "lg-1",  title: "Envío urgente zona franca",     departmentId: "logistica", status: "rejected",    priority: "high",     date: "2025-06-09", category: "Envíos",       description: "Solicitud rechazada — documentación de exportación incompleta.",             ticketNumber: "LG-0034" },
  { id: "lg-2",  title: "Pedido de insumos de oficina",  departmentId: "logistica", status: "resolved",    priority: "low",      date: "2025-06-04", category: "Insumos",      description: "Papelería, tóneres y material de oficina para Q2 — orden aprobada.",        ticketNumber: "LG-0031" },
  { id: "lg-3",  title: "Seguimiento de despacho",       departmentId: "logistica", status: "in_progress", priority: "medium",   date: "2025-06-12", category: "Seguimiento",  description: "Pedido #4821 cliente Creaciones Valeria sin movimiento en 48 h.",           ticketNumber: "LG-0035" },
  { id: "lg-4",  title: "Devolución de mercancía",       departmentId: "logistica", status: "pending",     priority: "medium",   date: "2025-06-13", category: "Devoluciones", description: "Proceso de devolución por producto en mal estado — cliente #4821.",         ticketNumber: "LG-0036" },

  { id: "rt-1",  title: "Descuento especial cliente",    departmentId: "retail",    status: "pending",     priority: "medium",   date: "2025-06-13", category: "Descuentos",   description: "Autorización de descuento del 15 % para cliente mayorista Fenix Store.",    ticketNumber: "RT-0023" },
  { id: "rt-2",  title: "Cambio de precio en sistema",   departmentId: "retail",    status: "in_progress", priority: "low",      date: "2025-06-11", category: "Precios",      description: "Actualización de precios lista temporada verano 2025 en el POS.",          ticketNumber: "RT-0022" },
  { id: "rt-3",  title: "Cierre de caja con diferencia", departmentId: "retail",    status: "resolved",    priority: "medium",   date: "2025-06-08", category: "Caja",         description: "Diferencia de $45.000 en cierre de caja punto de venta Bello.",            ticketNumber: "RT-0020" },

  { id: "mk-1",  title: "Aprobación de artes campaña",   departmentId: "marketing", status: "pending",     priority: "high",     date: "2025-06-14", category: "Creatividad",  description: "Revisión y aprobación de artes finales campaña Q3 — deadline 18 jun.",     ticketNumber: "MK-0018" },
  { id: "mk-2",  title: "Acceso a Meta Ads",             departmentId: "marketing", status: "resolved",    priority: "low",      date: "2025-06-06", category: "Digital",      description: "Acceso de editor a cuenta publicitaria de Meta para nuevo community.",     ticketNumber: "MK-0016" },
  { id: "mk-3",  title: "Presupuesto pauta digital",     departmentId: "marketing", status: "in_progress", priority: "high",     date: "2025-06-11", category: "Presupuesto",  description: "Aprobación de $8.000.000 para pauta digital Instagram y TikTok julio.",    ticketNumber: "MK-0017" },

  { id: "ge-1",  title: "Aprobación de convenio",        departmentId: "gerencia",  status: "pending",     priority: "critical", date: "2025-06-15", category: "Convenios",    description: "Firma de convenio de colaboración con Universidad EAFIT.",                  ticketNumber: "GE-0005" },
  { id: "ge-2",  title: "Autorización de viaje",         departmentId: "gerencia",  status: "resolved",    priority: "medium",   date: "2025-06-03", category: "Viajes",       description: "Autorización de viaje a Feria Colombiamoda — representación comercial.",   ticketNumber: "GE-0004" },
];

/* -------------------------------------------------------------------------- */
/* Utilidades                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Construye un objeto {@link TicketDetail} a partir de una solicitud base.
 *
 * @param req Solicitud base sobre la cual se construirá el detalle.
 * @returns Objeto enriquecido con metadata adicional, timeline y comentarios.
 *
 * @remarks
 * Esta función simula el enriquecimiento de una solicitud simple para su
 * visualización completa en la pantalla de detalle.
 *
 * Actualmente:
 *
 * - obtiene el nombre del departamento desde {@link DEPARTMENTS}
 * - agrega fecha límite simulada
 * - construye etiquetas
 * - genera timeline básico
 * - agrega un comentario inicial
 * - define responsable si el ticket ya no está pendiente
 *
 * En una integración real, esta lógica debería ser reemplazada por una
 * respuesta del backend, por ejemplo:
 *
 * `GET /api/tickets/:id`
 */
export function buildDetail(req: Request): TicketDetail {
  const department = DEPARTMENTS.find((dept) => dept.id === req.departmentId);
  const dayNumber = new Date(req.date).getDate();

  const detail: TicketDetail = {
    ...req,
    departmentLabel: department?.label ?? req.departmentId,
    dueDate: "2025-06-25",
    requester: "Laura Martínez",
    tags: [
      req.category,
      req.priority === "critical" ? "Urgente" : "",
    ].filter(Boolean),
    timeline: [
      {
        id: "t1",
        type: "created",
        label: "Ticket creado",
        by: "Sistema",
        date: `${dayNumber} jun · 9:00 am`,
      },
      {
        id: "t2",
        type: "status_change",
        label: `Estado: ${STATUS_CONFIG[req.status].label}`,
        by: "Área responsable",
        date: `${dayNumber + 1} jun · 8:00 am`,
      },
    ],
    comments: [
      {
        id: "c1",
        author: department?.label ?? "Área",
        initials: (department?.label ?? "AR").slice(0, 2).toUpperCase(),
        color: "#7c3aed",
        message:
          "Solicitud recibida y en proceso de revisión. Te notificaremos cuando haya novedades.",
        date: `${dayNumber + 1} jun · 8:05 am`,
      },
    ],
    attachments: [],
  };

  if (req.status !== "pending") {
    detail.assignee = "Carlos Jiménez";
  }

  return detail;
}

/**
 * Busca una solicitud por su identificador y devuelve su detalle construido.
 *
 * @param id Identificador interno de la solicitud.
 * @returns El detalle del ticket si existe; de lo contrario, `null`.
 *
 * @remarks
 * Esta función actúa como helper de consulta sobre el dataset mock.
 *
 * Flujo actual:
 *
 * - busca el request base en {@link MOCK_REQUESTS}
 * - si existe, construye el detalle mediante {@link buildDetail}
 * - si no existe, retorna `null`
 *
 * En una futura integración, esta función puede reemplazarse por un fetch real
 * al backend o a una capa de servicios.
 */
export function getTicketById(id: string): TicketDetail | null {
  const request = MOCK_REQUESTS.find((item) => item.id === id);
  return request ? buildDetail(request) : null;
}