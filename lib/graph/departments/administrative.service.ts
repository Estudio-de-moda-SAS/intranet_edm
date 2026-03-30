// lib/graph/departments/administrative.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// ARCHIVO ORIGINAL — no se modifica ningún tipo ni función existente.
// Solo se agregan re-exports al final para que los componentes que importan
// AdminData, AdminRequest, etc. desde este path sigan funcionando.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type AdminRequestStatus   = "pending" | "in_review" | "approved" | "rejected";
export type AdminRequestPriority = "low" | "medium" | "high";
export type AdminDocumentCategory = "policy" | "form" | "procedure" | "template";

export type AdminRequest = {
  id: string;
  title: string;
  requester: string;
  department: string;
  status: AdminRequestStatus;
  priority: AdminRequestPriority;
  category: "Tarjeta de acceso" | "Reserva de sala" | "Visita" | "Servicio general" | "Documentos" | "Otro";
  createdAt: string;
  dueDate: string;
};

export type AdminDocument = {
  id: string;
  title: string;
  category: AdminDocumentCategory;
  updatedAt: string;
  size: string;
  downloadUrl: string;
};

export type AdminCalendarEvent = {
  id: string;
  title: string;
  date: string;
  type: "payroll" | "deadline" | "closure" | "reminder";
};

export type AdminAnnouncement = {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  pinned: boolean;
};

export type VisitorLog = {
  id: string;
  visitorName: string;
  host: string;
  company?: string;
  checkIn: string;
  checkOut?: string;
  status: "inside" | "departed";
};

export type AccessCardRequest = {
  id: string;
  employee: string;
  department: string;
  type: "new" | "replacement" | "deactivation";
  status: AdminRequestStatus;
  requestedAt: string;
};

export type AdminKPI = {
  visitorsToday: number;
  activeAccessCards: number;
  blockedAccesses: number;
  roomsOccupied: number;
  roomsTotal: number;
  requestsThisMonth: number;
  avgAttentionMinutes: number;
  documentsPublished?: number;
  pendingApprovals?: number;
};

// ── AdminData — exportado explícitamente como type ────────────────────────────
// Este era el tipo faltante. Declararlo aquí en lugar de inferirlo del
// return de getAdminData() evita el error con isolatedModules de Next.js.

export type AdminData = {
  kpis:               AdminKPI;
  myRequests:         AdminRequest[];
  recentDocuments:    AdminDocument[];
  calendarEvents:     AdminCalendarEvent[];
  announcements:      AdminAnnouncement[];
  visitorLog:         VisitorLog[];
  accessCardRequests: AccessCardRequest[];
};

// ─── Tipos nuevos — modales de acción ────────────────────────────────────────
// Agregados para NewRequestModal, AccessCardModal, VisitorRegistrationModal
// y RoomBookingPage. No modifican ningún tipo existente.

export type RequestCategory  = "access" | "room" | "service";
export type RequestPriority  = "low" | "medium" | "high";
export type RequestStatus    = "pending" | "in_review" | "approved" | "rejected";

export type AccessCardAction = "request_new" | "report_lost" | "report_damaged" | "deactivate";
export type AccessZone       = "general" | "offices" | "warehouse" | "restricted";

export type VisitorType    = "supplier" | "client" | "candidate" | "contractor" | "personal" | "other";
export type IDDocumentType = "cedula" | "passport" | "foreign_id";

export interface NewRequestPayload {
  category:         RequestCategory;
  title:            string;
  description:      string;
  priority:         RequestPriority;
  accessZones?:     AccessZone[];
  accessStartDate?: string;
  accessEndDate?:   string;
  roomId?:          string;
  roomDate?:        string;
  roomStartTime?:   string;
  roomEndTime?:     string;
  attendeesCount?:  number;
  serviceType?:     string;
  attachments?:     File[];
  requesterName?:   string;
  requesterEmail?:  string;
  department?:      string;
}

export interface NewRequestResult {
  id:        string;
  createdAt: string;
  status:    RequestStatus;
}

export interface AccessCardPayload {
  action:         AccessCardAction;
  employeeId?:    string;
  employeeName?:  string;
  employeeEmail?: string;
  department?:    string;
  cardNumber?:    string;
  zones?:         AccessZone[];
  reason?:        string;
  urgency?:       "normal" | "urgent";
}

export interface AccessCardResult {
  ticketId:            string;
  createdAt:           string;
  estimatedResolution: string;
}

export interface Room {
  id:        string;
  name:      string;
  floor:     string;
  capacity:  number;
  amenities: string[];
  imageUrl?: string;
}

export interface RoomSlot {
  start:    string;
  end:      string;
  taken:    boolean;
  takenBy?: string;
}

export interface RoomBookingPayload {
  roomId:           string;
  date:             string;
  startTime:        string;
  endTime:          string;
  title:            string;
  attendeesCount:   number;
  attendeesEmails?: string[];
  notes?:           string;
  requesterName?:   string;
  requesterEmail?:  string;
}

export interface RoomBookingResult {
  bookingId:        string;
  calendarEventId?: string;
  createdAt:        string;
}

export interface VisitorPayload {
  visitorName:    string;
  visitorCompany: string;
  visitorEmail?:  string;
  visitorPhone?:  string;
  documentType:   IDDocumentType;
  documentNumber: string;
  visitType:      VisitorType;
  hostName:       string;
  hostEmail?:     string;
  hostDepartment: string;
  visitDate:      string;
  visitTime:      string;
  purpose:        string;
  vehiclePlate?:  string;
  notes?:         string;
}

export interface VisitorResult {
  visitorId: string;
  qrCode?:   string;
  createdAt: string;
}

// ─── Funciones de acción — stubs listos para MS Graph / API propia ────────────

/**
 * Crea una nueva solicitud administrativa.
 * TODO MS Graph: POST /sites/{site-id}/lists/{list-id}/items
 * TODO API propia: POST /api/administrative/requests
 */
export async function createAdminRequest(
  _payload: NewRequestPayload,
): Promise<NewRequestResult> {
    await new Promise((r) => setTimeout(r, 900));
  return {
    id:        `REQ-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status:    "pending",
  };
}

/**
 * Crea un ticket de gestión de tarjeta de acceso.
 * TODO MS Graph: POST /sites/{site-id}/lists/AccessCardRequests/items
 * TODO API propia: POST /api/administrative/access-cards
 */
export async function submitAccessCardRequest(
  payload: AccessCardPayload,
): Promise<AccessCardResult> {
  await new Promise((r) => setTimeout(r, 700));
  return {
    ticketId:            `TAR-${Date.now()}`,
    createdAt:           new Date().toISOString(),
    estimatedResolution: payload.urgency === "urgent" ? "24h" : "48h",
  };
}

/**
 * Devuelve la lista de salas disponibles.
 * TODO MS Graph: GET /places/microsoft.graph.room
 */
export async function getRooms(): Promise<Room[]> {
  await new Promise((r) => setTimeout(r, 400));
  return [
    { id: "sala-a", name: "Sala Directiva A",      floor: "Piso 3", capacity: 12,
      amenities: ["Proyector", "Videoconferencia", "Pizarrón"] },
    { id: "sala-b", name: "Sala de Reuniones B",   floor: "Piso 2", capacity: 8,
      amenities: ["TV", "Pizarrón"] },
    { id: "sala-c", name: "Sala de Capacitación",  floor: "Piso 1", capacity: 20,
      amenities: ["Proyector", "TV", "Pizarrón"] },
    { id: "sala-d", name: "Sala Privada D",         floor: "Piso 3", capacity: 4,
      amenities: ["TV"] },
  ];
}

/**
 * Devuelve slots disponibles de una sala en una fecha.
 * TODO MS Graph: POST /users/{room-email}/calendar/getSchedule
 */
export async function getRoomAvailability(
  _roomId: string,
  _date:   string,
): Promise<RoomSlot[]> {
  await new Promise((r) => setTimeout(r, 500));
  const HOURS = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00",
                 "14:00","15:00","16:00","17:00","18:00"];
  const TAKEN = ["09:00","10:00","14:00"];
  return HOURS.map((h, i) => {
    const taken = TAKEN.includes(h);
    const slot: RoomSlot = {
      start: h,
      end:   HOURS[i + 1] ?? "19:00",
      taken,
    };
    if (taken) slot.takenBy = "Reunión de equipo";
    return slot;
  });
}

/**
 * Reserva una sala.
 * TODO MS Graph: POST /users/{organizer}/events
 */
export async function bookRoom(
  _payload: RoomBookingPayload,
): Promise<RoomBookingResult> {
  await new Promise((r) => setTimeout(r, 800));
  return {
    bookingId: `RES-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Pre-registra un visitante.
 * TODO MS Graph: POST /sites/{site-id}/lists/Visitors/items
 * TODO API propia: POST /api/administrative/visitors
 */
export async function registerVisitor(
  _payload: VisitorPayload,
): Promise<VisitorResult> {
  await new Promise((r) => setTimeout(r, 750));
  return {
    visitorId: `VIS-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
}

// ─── Mock data — reemplazar con MS Graph / SharePoint List calls ─────────────

export async function getAdminData(): Promise<AdminData> {
  return {
    kpis: {
      visitorsToday:       38,
      activeAccessCards:   12,
      blockedAccesses:     2,
      roomsOccupied:       9,
      roomsTotal:          12,
      requestsThisMonth:   87,
      avgAttentionMinutes: 4.2,
    },
    myRequests: [
      {
        id:         "ADM-1041",
        title:      "Tarjeta de acceso — colaborador nuevo",
        requester:  "Ana García",
        department: "Marketing",
        status:     "in_review",
        priority:   "medium",
        category:   "Tarjeta de acceso",
        createdAt:  "2025-07-08",
        dueDate:    "2025-07-12",
      },
      {
        id:         "ADM-1040",
        title:      "Reserva sala Boardroom — presentación Q3",
        requester:  "Luis Hernández",
        department: "Ventas",
        status:     "approved",
        priority:   "high",
        category:   "Reserva de sala",
        createdAt:  "2025-07-07",
        dueDate:    "2025-07-10",
      },
      {
        id:         "ADM-1039",
        title:      "Visita proveedor — Integración AV",
        requester:  "Paola Torres",
        department: "TI",
        status:     "pending",
        priority:   "low",
        category:   "Visita",
        createdAt:  "2025-07-07",
        dueDate:    "2025-07-15",
      },
      {
        id:         "ADM-1038",
        title:      "Tarjeta bloqueada — reposición urgente",
        requester:  "Carlos Ruiz",
        department: "Operaciones",
        status:     "approved",
        priority:   "high",
        category:   "Tarjeta de acceso",
        createdAt:  "2025-07-06",
        dueDate:    "2025-07-07",
      },
      {
        id:         "ADM-1037",
        title:      "Servicio de mensajería — envío documentos legales",
        requester:  "Sofía Mendoza",
        department: "Legal",
        status:     "rejected",
        priority:   "medium",
        category:   "Servicio general",
        createdAt:  "2025-07-05",
        dueDate:    "2025-07-08",
      },
    ],
    recentDocuments: [
      {
        id:          "DOC-201",
        title:       "Política de acceso a instalaciones 2025",
        category:    "policy",
        updatedAt:   "2025-07-01",
        size:        "480 KB",
        downloadUrl: "/docs/politica-acceso-instalaciones-2025.pdf",
      },
      {
        id:          "DOC-202",
        title:       "Formato de registro de visitantes",
        category:    "form",
        updatedAt:   "2025-06-28",
        size:        "120 KB",
        downloadUrl: "/docs/formato-registro-visitantes.xlsx",
      },
      {
        id:          "DOC-203",
        title:       "Procedimiento de emisión de tarjetas",
        category:    "procedure",
        updatedAt:   "2025-06-20",
        size:        "310 KB",
        downloadUrl: "/docs/procedimiento-tarjetas-acceso.pdf",
      },
      {
        id:          "DOC-204",
        title:       "Reglamento de uso de salas de juntas",
        category:    "policy",
        updatedAt:   "2025-06-15",
        size:        "210 KB",
        downloadUrl: "/docs/reglamento-salas-juntas.pdf",
      },
    ],
    calendarEvents: [
      { id: "cal-1", title: "Simulacro de evacuación",         date: "2025-07-15", type: "reminder" },
      { id: "cal-2", title: "Cierre administrativo",           date: "2025-07-15", type: "closure"  },
      { id: "cal-3", title: "Auditoría de tarjetas de acceso", date: "2025-07-22", type: "deadline" },
      { id: "cal-4", title: "Mantenimiento lectores — Piso 3", date: "2025-07-28", type: "reminder" },
      { id: "cal-5", title: "Renovación contrato vigilancia",  date: "2025-07-31", type: "deadline" },
    ],
    announcements: [
      {
        id:          "ANN-01",
        title:       "Nuevo proceso de pre-registro de visitantes",
        body:        "A partir del 15 de julio todos los visitantes deben ser pre-registrados desde la intranet con mínimo 24 horas de anticipación.",
        publishedAt: "2025-07-06",
        pinned:      true,
      },
      {
        id:          "ANN-02",
        title:       "Simulacro de evacuación — 15 de julio",
        body:        "Se realizará simulacro general a las 10:00 hrs. Todo el personal debe dirigirse al punto de reunión asignado por piso.",
        publishedAt: "2025-07-04",
        pinned:      true,
      },
      {
        id:          "ANN-03",
        title:       "Mantenimiento lector — acceso Piso 3",
        body:        "El lunes 28 de julio el lector de acceso del piso 3 estará fuera de servicio de 8:00 a 10:00 hrs. Usar acceso por escalera principal.",
        publishedAt: "2025-07-03",
        pinned:      false,
      },
    ],
    visitorLog: [
      {
        id:          "VIS-091",
        visitorName: "Roberto Salinas",
        host:        "Mariana Solís",
        company:     "Proveedor AV Tech",
        checkIn:     "09:14",
        status:      "inside",
      },
      {
        id:          "VIS-090",
        visitorName: "Fernanda López",
        host:        "Ricardo Fuentes",
        company:     "Despacho Jurídico RL",
        checkIn:     "08:50",
        checkOut:    "10:22",
        status:      "departed",
      },
      {
        id:          "VIS-089",
        visitorName: "Andrés Mora",
        host:        "Luis Hernández",
        checkIn:     "08:30",
        status:      "inside",
      },
    ],
    accessCardRequests: [
      {
        id:          "ACC-041",
        employee:    "Diana Flores",
        department:  "Marketing",
        type:        "new",
        status:      "in_review",
        requestedAt: "2025-07-08",
      },
      {
        id:          "ACC-040",
        employee:    "Miguel Ángel Reyes",
        department:  "Finanzas",
        type:        "replacement",
        status:      "approved",
        requestedAt: "2025-07-06",
      },
      {
        id:          "ACC-039",
        employee:    "Claudia Herrera",
        department:  "Legal",
        type:        "deactivation",
        status:      "pending",
        requestedAt: "2025-07-05",
      },
    ],
  };
}