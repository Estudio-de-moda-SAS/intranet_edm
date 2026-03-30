// app/solicitudes/_data/tickets.ts
// Fuente única de verdad para tipos, datos mock, configs y buildDetail.
// Importado por RequestsPanelWithModal y TicketDetailPage.
// Cuando tengas API real, reemplaza MOCK_REQUESTS y buildDetail por tus fetches.

// ─── Si tienes DEPARTMENTS en @/lib/config, reemplaza este import ────────────
import { DEPARTMENTS } from "@/lib/config";
export { DEPARTMENTS } from "@/lib/config";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RequestStatus   = "pending" | "in_progress" | "resolved" | "rejected";
export type RequestPriority = "low" | "medium" | "high" | "critical";

export type Request = {
  id:           string;
  title:        string;
  departmentId: string;
  status:       RequestStatus;
  priority:     RequestPriority;
  date:         string;
  description:  string;
  ticketNumber: string;
  category:     string;
};

export type TimelineEvent = {
  id:    string;
  type:  "created" | "status_change" | "comment" | "attachment";
  label: string;
  by:    string;
  date:  string;
};

export type Comment = {
  id:       string;
  author:   string;
  initials: string;
  color:    string;
  message:  string;
  date:     string;
};

export type Attachment = {
  id:   string;
  name: string;
  size: string;
  ext:  string;
};

export type TicketDetail = Request & {
  dueDate?:        string;
  requester:       string;
  assignee?:       string;
  tags?:           string[];
  departmentLabel: string;
  timeline:        TimelineEvent[];
  comments:        Comment[];
  attachments:     Attachment[];
};

// ─── Status + Priority config ─────────────────────────────────────────────────

export const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; color: string; bg: string; dot: string; ring: string }
> = {
  pending:     { label: "Pendiente",   color: "#b45309", bg: "#fef3c7", dot: "#f59e0b", ring: "#fde68a" },
  in_progress: { label: "En proceso",  color: "#1d4ed8", bg: "#dbeafe", dot: "#3b82f6", ring: "#bfdbfe" },
  resolved:    { label: "Resuelto",    color: "#15803d", bg: "#dcfce7", dot: "#22c55e", ring: "#bbf7d0" },
  rejected:    { label: "Rechazado",   color: "#b91c1c", bg: "#fee2e2", dot: "#ef4444", ring: "#fecaca" },
};

export const PRIORITY_CONFIG: Record<
  RequestPriority,
  { label: string; color: string; bg: string; bar: string; dot: string }
> = {
  low:      { label: "Baja",     color: "#64748b", bg: "#f1f5f9", bar: "w-1/4",  dot: "#94a3b8" },
  medium:   { label: "Media",    color: "#d97706", bg: "#fef3c7", bar: "w-2/4",  dot: "#f59e0b" },
  high:     { label: "Alta",     color: "#ea580c", bg: "#fff7ed", bar: "w-3/4",  dot: "#f97316" },
  critical: { label: "Crítica",  color: "#dc2626", bg: "#fef2f2", bar: "w-full", dot: "#ef4444" },
};

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_REQUESTS: Request[] = [
  // ── TI
  { id: "ti-1",  title: "Instalación de software",       departmentId: "ti",        status: "in_progress", priority: "high",     date: "2025-06-10", category: "Software",     description: "Solicitud de instalación de Adobe Creative Cloud para el área de Marketing.",     ticketNumber: "TI-0041" },
  { id: "ti-2",  title: "Reemplazo de laptop",           departmentId: "ti",        status: "pending",     priority: "medium",   date: "2025-06-12", category: "Hardware",     description: "Laptop HP EliteBook presenta falla de hardware — disco duro dañado.",           ticketNumber: "TI-0045" },
  { id: "ti-3",  title: "Acceso a sistema ERP",          departmentId: "ti",        status: "resolved",    priority: "low",      date: "2025-06-05", category: "Accesos",      description: "Creación de usuario en SAP Business One para contratación nueva.",             ticketNumber: "TI-0038" },
  { id: "ti-4",  title: "Falla en impresora de red",     departmentId: "ti",        status: "rejected",    priority: "low",      date: "2025-06-09", category: "Hardware",     description: "Impresora HP piso 3 no responde. Revisión de drivers y conexión de red.",      ticketNumber: "TI-0039" },
  { id: "ti-5",  title: "VPN corporativa sin conexión",  departmentId: "ti",        status: "in_progress", priority: "critical", date: "2025-06-13", category: "Redes",        description: "Colaboradores en trabajo remoto no pueden conectarse al servidor VPN.",        ticketNumber: "TI-0047" },
  // ── RRHH
  { id: "rh-1",  title: "Solicitud de vacaciones",       departmentId: "rrhh",      status: "resolved",    priority: "low",      date: "2025-06-01", category: "Vacaciones",   description: "Aprobación de período vacacional del 14 al 25 de julio de 2025.",              ticketNumber: "RH-0089" },
  { id: "rh-2",  title: "Certificado laboral",           departmentId: "rrhh",      status: "resolved",    priority: "low",      date: "2025-06-05", category: "Certificados", description: "Expedición de certificado laboral para trámite de crédito bancario.",          ticketNumber: "RH-0091" },
  { id: "rh-3",  title: "Actualización de datos",        departmentId: "rrhh",      status: "pending",     priority: "low",      date: "2025-06-14", category: "Datos",        description: "Cambio de cuenta bancaria para pago de nómina — adjunto soporte.",           ticketNumber: "RH-0094" },
  { id: "rh-4",  title: "Permiso por calamidad",         departmentId: "rrhh",      status: "in_progress", priority: "high",     date: "2025-06-13", category: "Permisos",     description: "Permiso de 3 días por fallecimiento de familiar directo.",                    ticketNumber: "RH-0093" },
  { id: "rh-5",  title: "Constancia de ingreso",         departmentId: "rrhh",      status: "pending",     priority: "low",      date: "2025-06-15", category: "Certificados", description: "Certificado de fecha de ingreso y cargo actual para trámite de visa.",        ticketNumber: "RH-0095" },
  // ── FINANZAS
  { id: "fn-1",  title: "Reembolso de viáticos",         departmentId: "finanzas",  status: "in_progress", priority: "medium",   date: "2025-06-08", category: "Reembolsos",   description: "Reembolso de gastos de viaje Medellín–Bogotá · factura adjunta.",            ticketNumber: "FN-0067" },
  { id: "fn-2",  title: "Aprobación de presupuesto",     departmentId: "finanzas",  status: "pending",     priority: "high",     date: "2025-06-14", category: "Presupuesto",  description: "Aprobación de presupuesto Q3 para compra de activos fijos área de TI.",      ticketNumber: "FN-0070" },
  { id: "fn-3",  title: "Anticipo de nómina",            departmentId: "finanzas",  status: "resolved",    priority: "medium",   date: "2025-06-03", category: "Nómina",       description: "Solicitud de anticipo del 30 % de salario por urgencia médica.",             ticketNumber: "FN-0063" },
  { id: "fn-4",  title: "Legalización de caja menor",    departmentId: "finanzas",  status: "pending",     priority: "low",      date: "2025-06-16", category: "Caja menor",   description: "Legalización de gastos de caja menor mes de mayo — soportes adjuntos.",     ticketNumber: "FN-0071" },
  // ── JURÍDICA
  { id: "jr-1",  title: "Revisión de contrato",          departmentId: "juridica",  status: "pending",     priority: "high",     date: "2025-06-14", category: "Contratos",    description: "Revisión de contrato con proveedor logístico — cláusula de exclusividad.",   ticketNumber: "JR-0012" },
  { id: "jr-2",  title: "Poder notarial",                departmentId: "juridica",  status: "in_progress", priority: "medium",   date: "2025-06-10", category: "Trámites",     description: "Elaboración de poder para representar a la empresa ante entidad pública.",   ticketNumber: "JR-0013" },
  { id: "jr-3",  title: "Consulta política LAFT",        departmentId: "juridica",  status: "resolved",    priority: "low",      date: "2025-06-07", category: "Consultas",    description: "Consulta sobre obligaciones SARLAFT para nuevas líneas de negocio.",         ticketNumber: "JR-0011" },
  // ── LOGÍSTICA
  { id: "lg-1",  title: "Envío urgente zona franca",     departmentId: "logistica", status: "rejected",    priority: "high",     date: "2025-06-09", category: "Envíos",       description: "Solicitud rechazada — documentación de exportación incompleta.",             ticketNumber: "LG-0034" },
  { id: "lg-2",  title: "Pedido de insumos de oficina",  departmentId: "logistica", status: "resolved",    priority: "low",      date: "2025-06-04", category: "Insumos",      description: "Papelería, tóneres y material de oficina para Q2 — orden aprobada.",        ticketNumber: "LG-0031" },
  { id: "lg-3",  title: "Seguimiento de despacho",       departmentId: "logistica", status: "in_progress", priority: "medium",   date: "2025-06-12", category: "Seguimiento",  description: "Pedido #4821 cliente Creaciones Valeria sin movimiento en 48 h.",           ticketNumber: "LG-0035" },
  { id: "lg-4",  title: "Devolución de mercancía",       departmentId: "logistica", status: "pending",     priority: "medium",   date: "2025-06-13", category: "Devoluciones", description: "Proceso de devolución por producto en mal estado — cliente #4821.",         ticketNumber: "LG-0036" },
  // ── RETAIL
  { id: "rt-1",  title: "Descuento especial cliente",    departmentId: "retail",    status: "pending",     priority: "medium",   date: "2025-06-13", category: "Descuentos",   description: "Autorización de descuento del 15 % para cliente mayorista Fenix Store.",    ticketNumber: "RT-0023" },
  { id: "rt-2",  title: "Cambio de precio en sistema",   departmentId: "retail",    status: "in_progress", priority: "low",      date: "2025-06-11", category: "Precios",      description: "Actualización de precios lista temporada verano 2025 en el POS.",          ticketNumber: "RT-0022" },
  { id: "rt-3",  title: "Cierre de caja con diferencia", departmentId: "retail",    status: "resolved",    priority: "medium",   date: "2025-06-08", category: "Caja",         description: "Diferencia de $45.000 en cierre de caja punto de venta Bello.",            ticketNumber: "RT-0020" },
  // ── MARKETING
  { id: "mk-1",  title: "Aprobación de artes campaña",   departmentId: "marketing", status: "pending",     priority: "high",     date: "2025-06-14", category: "Creatividad",  description: "Revisión y aprobación de artes finales campaña Q3 — deadline 18 jun.",     ticketNumber: "MK-0018" },
  { id: "mk-2",  title: "Acceso a Meta Ads",             departmentId: "marketing", status: "resolved",    priority: "low",      date: "2025-06-06", category: "Digital",      description: "Acceso de editor a cuenta publicitaria de Meta para nuevo community.",     ticketNumber: "MK-0016" },
  { id: "mk-3",  title: "Presupuesto pauta digital",     departmentId: "marketing", status: "in_progress", priority: "high",     date: "2025-06-11", category: "Presupuesto",  description: "Aprobación de $8.000.000 para pauta digital Instagram y TikTok julio.",    ticketNumber: "MK-0017" },
  // ── GERENCIA
  { id: "ge-1",  title: "Aprobación de convenio",        departmentId: "gerencia",  status: "pending",     priority: "critical", date: "2025-06-15", category: "Convenios",    description: "Firma de convenio de colaboración con Universidad EAFIT.",                  ticketNumber: "GE-0005" },
  { id: "ge-2",  title: "Autorización de viaje",         departmentId: "gerencia",  status: "resolved",    priority: "medium",   date: "2025-06-03", category: "Viajes",       description: "Autorización de viaje a Feria Colombiamoda — representación comercial.",   ticketNumber: "GE-0004" },
];

// ─── buildDetail ──────────────────────────────────────────────────────────────
// Construye un TicketDetail a partir de un Request.
// Reemplaza con fetch real: GET /api/tickets/:id

export function buildDetail(req: Request): TicketDetail {
  const dept   = DEPARTMENTS.find((d) => d.id === req.departmentId);
  const dayNum = new Date(req.date).getDate();

  const detail: TicketDetail = {
    ...req,
    departmentLabel: dept?.label ?? req.departmentId,
    dueDate:   "2025-06-25",
    requester: "Laura Martínez",
    tags:      [req.category, req.priority === "critical" ? "Urgente" : ""].filter(Boolean),
    timeline: [
      { id: "t1", type: "created",       label: "Ticket creado",                              by: "Sistema",          date: `${dayNum} jun · 9:00 am`       },
      { id: "t2", type: "status_change", label: `Estado: ${STATUS_CONFIG[req.status].label}`, by: "Área responsable", date: `${dayNum + 1} jun · 8:00 am`   },
    ],
    comments: [
      {
        id:       "c1",
        author:   dept?.label ?? "Área",
        initials: (dept?.label ?? "AR").slice(0, 2).toUpperCase(),
        color:    "#7c3aed",
        message:  "Solicitud recibida y en proceso de revisión. Te notificaremos cuando haya novedades.",
        date:     `${dayNum + 1} jun · 8:05 am`,
      },
    ],
    attachments: [],
  };

  if (req.status !== "pending") {
    detail.assignee = "Carlos Jiménez";
  }

  return detail;
}

// ─── getTicketById ────────────────────────────────────────────────────────────
// Busca por id en MOCK_REQUESTS y devuelve el detalle construido.
// Reemplaza con fetch real cuando tengas API.

export function getTicketById(id: string): TicketDetail | null {
  const req = MOCK_REQUESTS.find((r) => r.id === id);
  return req ? buildDetail(req) : null;
}