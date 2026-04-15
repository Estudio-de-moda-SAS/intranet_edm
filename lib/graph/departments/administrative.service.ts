/**
 * @module graph/departments/administrative.service
 * Tipos, stubs de acción y datos mock para el departamento de Servicios
 * Administrativos de la intranet EDM.
 *
 * @remarks
 * Centraliza toda la superficie de tipos del módulo administrativo —
 * solicitudes, documentos, visitantes, tarjetas de acceso y salas — junto
 * con las funciones de acción que los operan. Las funciones actualmente
 * retornan datos mock con delays simulados y están preparadas para migrar
 * a Microsoft Graph o a una API propia mediante los `TODO` documentados
 * en cada función.
 *
 * El tipo {@link AdminData} se declara explícitamente (en lugar de inferirse
 * del retorno de {@link getAdminData}) para garantizar compatibilidad con
 * `isolatedModules` de Next.js.
 */

// ── Tipos base ────────────────────────────────────────────────────────────────

/**
 * Estado de una solicitud administrativa a lo largo de su ciclo de vida.
 *
 * | Valor       | Descripción                                      |
 * |-------------|--------------------------------------------------|
 * | `pending`   | Recibida, pendiente de revisión                  |
 * | `in_review` | En proceso de evaluación por el área responsable |
 * | `approved`  | Aprobada y en proceso de ejecución               |
 * | `rejected`  | Rechazada con motivo registrado                  |
 */
export type AdminRequestStatus = "pending" | "in_review" | "approved" | "rejected";

/**
 * Nivel de prioridad de una solicitud administrativa.
 *
 * | Valor    | SLA orientativo |
 * |----------|-----------------|
 * | `low`    | 5 días hábiles  |
 * | `medium` | 3 días hábiles  |
 * | `high`   | 1 día hábil     |
 */
export type AdminRequestPriority = "low" | "medium" | "high";

/**
 * Categoría de un documento administrativo según su naturaleza.
 *
 * | Valor       | Descripción                      |
 * |-------------|----------------------------------|
 * | `policy`    | Política corporativa vigente     |
 * | `form`      | Formulario descargable           |
 * | `procedure` | Procedimiento operativo estándar |
 * | `template`  | Plantilla reutilizable           |
 */
export type AdminDocumentCategory = "policy" | "form" | "procedure" | "template";

/**
 * Solicitud administrativa creada por un colaborador.
 *
 * @remarks
 * Cubre las categorías operativas del área: tarjetas de acceso,
 * reservas de sala, pre-registro de visitas y servicios generales.
 * El campo `category` es un discriminador de negocio — no debe confundirse
 * con {@link AdminDocumentCategory}.
 */
export type AdminRequest = {
  /** Identificador único de la solicitud (ej. `"ADM-1041"`). */
  id: string;

  /** Título descriptivo de la solicitud. */
  title: string;

  /** Nombre del colaborador que creó la solicitud. */
  requester: string;

  /** Departamento al que pertenece el solicitante. */
  department: string;

  /** Estado actual de la solicitud en su ciclo de vida. */
  status: AdminRequestStatus;

  /** Nivel de prioridad asignado. */
  priority: AdminRequestPriority;

  /** Tipo de servicio solicitado. */
  category:
    | "Tarjeta de acceso"
    | "Reserva de sala"
    | "Visita"
    | "Servicio general"
    | "Documentos"
    | "Otro";

  /** Fecha de creación en formato ISO 8601 (ej. `"2025-07-08"`). */
  createdAt: string;

  /** Fecha límite de atención en formato ISO 8601. */
  dueDate: string;
};

/**
 * Documento administrativo publicado en la intranet.
 */
export type AdminDocument = {
  /** Identificador único del documento (ej. `"DOC-201"`). */
  id: string;

  /** Título del documento tal como aparece en la biblioteca. */
  title: string;

  /** Categoría del documento según {@link AdminDocumentCategory}. */
  category: AdminDocumentCategory;

  /** Fecha de última actualización en formato ISO 8601. */
  updatedAt: string;

  /** Tamaño del archivo en formato legible (ej. `"480 KB"`). */
  size: string;

  /** URL de descarga directa del documento. */
  downloadUrl: string;
};

/**
 * Evento del calendario administrativo del departamento.
 *
 * @remarks
 * Incluye fechas relevantes para el área: cierres, vencimientos,
 * recordatorios y fechas de nómina.
 */
export type AdminCalendarEvent = {
  /** Identificador único del evento. */
  id: string;

  /** Título descriptivo del evento. */
  title: string;

  /** Fecha del evento en formato ISO 8601 (ej. `"2025-07-15"`). */
  date: string;

  /**
   * Tipo de evento para determinar el color e icono en el calendario.
   *
   * | Valor      | Uso                                         |
   * |------------|---------------------------------------------|
   * | `payroll`  | Fecha de pago o corte de nómina             |
   * | `deadline` | Vencimiento de trámite o contrato           |
   * | `closure`  | Cierre administrativo o día no laborable    |
   * | `reminder` | Recordatorio de actividad programada        |
   */
  type: "payroll" | "deadline" | "closure" | "reminder";
};

/**
 * Comunicado publicado por el área de Servicios Administrativos.
 */
export type AdminAnnouncement = {
  /** Identificador único del comunicado. */
  id: string;

  /** Título del comunicado. */
  title: string;

  /** Cuerpo completo del comunicado en texto plano. */
  body: string;

  /** Fecha de publicación en formato ISO 8601. */
  publishedAt: string;

  /**
   * Si es `true`, el comunicado se ancla en la parte superior de la lista
   * y permanece visible independientemente de la fecha de publicación.
   */
  pinned: boolean;
};

/**
 * Registro de visita en el libro de control de acceso.
 *
 * @remarks
 * `checkOut` es opcional porque un visitante que aún está en las
 * instalaciones (`status: "inside"`) todavía no tiene hora de salida.
 * `company` es opcional para visitas de tipo personal.
 */
export type VisitorLog = {
  /** Identificador único del registro (ej. `"VIS-091"`). */
  id: string;

  /** Nombre completo del visitante. */
  visitorName: string;

  /** Nombre del colaborador anfitrión. */
  host: string;

  /**
   * Empresa u organización del visitante.
   * `undefined` para visitas de tipo personal.
   */
  company?: string;

  /** Hora de entrada en formato `"HH:mm"`. */
  checkIn: string;

  /**
   * Hora de salida en formato `"HH:mm"`.
   * `undefined` si el visitante aún está en las instalaciones.
   */
  checkOut?: string;

  /**
   * Estado actual del visitante.
   *
   * | Valor      | Descripción                             |
   * |------------|-----------------------------------------|
   * | `inside`   | Actualmente dentro de las instalaciones |
   * | `departed` | Ya salió de las instalaciones           |
   */
  status: "inside" | "departed";
};

/**
 * Solicitud de gestión de tarjeta de acceso físico.
 */
export type AccessCardRequest = {
  /** Identificador único de la solicitud (ej. `"ACC-041"`). */
  id: string;

  /** Nombre del colaborador al que pertenece la tarjeta. */
  employee: string;

  /** Departamento del colaborador. */
  department: string;

  /**
   * Tipo de gestión solicitada.
   *
   * | Valor          | Descripción                     |
   * |----------------|---------------------------------|
   * | `new`          | Emisión de tarjeta nueva        |
   * | `replacement`  | Reposición por pérdida o daño   |
   * | `deactivation` | Desactivación de tarjeta activa |
   */
  type: "new" | "replacement" | "deactivation";

  /** Estado actual de la solicitud. */
  status: AdminRequestStatus;

  /** Fecha de creación de la solicitud en formato ISO 8601. */
  requestedAt: string;
};

/**
 * Indicadores clave de operación del área de Servicios Administrativos.
 *
 * @remarks
 * Los campos opcionales (`documentsPublished`, `pendingApprovals`) pueden
 * no estar disponibles dependiendo del nivel de acceso del usuario o del
 * origen de los datos.
 */
export type AdminKPI = {
  /** Número de visitantes registrados en el día actual. */
  visitorsToday: number;

  /** Número de tarjetas de acceso activas en el sistema. */
  activeAccessCards: number;

  /** Número de accesos bloqueados o con incidencia activa. */
  blockedAccesses: number;

  /** Número de salas de reuniones actualmente ocupadas. */
  roomsOccupied: number;

  /** Número total de salas de reuniones disponibles en el edificio. */
  roomsTotal: number;

  /** Número de solicitudes administrativas recibidas en el mes en curso. */
  requestsThisMonth: number;

  /** Tiempo promedio de atención de solicitudes en minutos. */
  avgAttentionMinutes: number;

  /**
   * Número de documentos publicados en la biblioteca del mes en curso.
   * `undefined` si el dato no está disponible para el nivel de acceso actual.
   */
  documentsPublished?: number;

  /**
   * Número de solicitudes pendientes de aprobación.
   * `undefined` si el dato no está disponible para el nivel de acceso actual.
   */
  pendingApprovals?: number;
};

/**
 * Agregado principal de datos del dashboard de Servicios Administrativos.
 *
 * @remarks
 * Declarado explícitamente como tipo en lugar de inferirse del retorno de
 * {@link getAdminData} para garantizar compatibilidad con `isolatedModules`
 * de Next.js, que requiere que los tipos re-exportados estén declarados
 * de forma explícita.
 */
export type AdminData = {
  /** Indicadores KPI del área. */
  kpis: AdminKPI;

  /** Solicitudes administrativas recientes del colaborador autenticado. */
  myRequests: AdminRequest[];

  /** Documentos publicados recientemente en la biblioteca. */
  recentDocuments: AdminDocument[];

  /** Eventos del calendario administrativo próximos. */
  calendarEvents: AdminCalendarEvent[];

  /** Comunicados publicados por el área. */
  announcements: AdminAnnouncement[];

  /** Registros del libro de visitas del día. */
  visitorLog: VisitorLog[];

  /** Solicitudes de gestión de tarjetas de acceso recientes. */
  accessCardRequests: AccessCardRequest[];
};

// ── Tipos de modales de acción ────────────────────────────────────────────────

/**
 * Categoría de una solicitud nueva creada desde el modal de solicitudes.
 *
 * | Valor     | Descripción          |
 * |-----------|----------------------|
 * | `access`  | Gestión de accesos   |
 * | `room`    | Reserva de sala      |
 * | `service` | Servicio general     |
 */
export type RequestCategory = "access" | "room" | "service";

/**
 * Prioridad de una solicitud nueva.
 * Equivalente a {@link AdminRequestPriority} — se mantiene separado para
 * desacoplar el modelo de UI del modelo de datos de Graph.
 */
export type RequestPriority = "low" | "medium" | "high";

/**
 * Estado de una solicitud nueva.
 * Equivalente a {@link AdminRequestStatus} — se mantiene separado para
 * desacoplar el modelo de UI del modelo de datos de Graph.
 */
export type RequestStatus = "pending" | "in_review" | "approved" | "rejected";

/**
 * Acción de gestión que puede realizarse sobre una tarjeta de acceso.
 *
 * | Valor            | Descripción                        |
 * |------------------|------------------------------------|
 * | `request_new`    | Solicitar tarjeta nueva            |
 * | `report_lost`    | Reportar tarjeta perdida           |
 * | `report_damaged` | Reportar tarjeta dañada            |
 * | `deactivate`     | Solicitar desactivación de tarjeta |
 */
export type AccessCardAction =
  | "request_new"
  | "report_lost"
  | "report_damaged"
  | "deactivate";

/**
 * Zona de acceso físico del edificio.
 *
 * | Valor        | Descripción                 |
 * |--------------|-----------------------------|
 * | `general`    | Áreas comunes y recepción   |
 * | `offices`    | Plantas de oficinas         |
 * | `warehouse`  | Bodega y almacén            |
 * | `restricted` | Áreas de acceso restringido |
 */
export type AccessZone = "general" | "offices" | "warehouse" | "restricted";

/**
 * Tipo de visitante para clasificar el propósito de la visita.
 *
 * | Valor        | Descripción          |
 * |--------------|----------------------|
 * | `supplier`   | Proveedor            |
 * | `client`     | Cliente              |
 * | `candidate`  | Candidato entrevista |
 * | `contractor` | Contratista externo  |
 * | `personal`   | Visita personal      |
 * | `other`      | Otro tipo de visita  |
 */
export type VisitorType =
  | "supplier"
  | "client"
  | "candidate"
  | "contractor"
  | "personal"
  | "other";

/**
 * Tipo de documento de identidad del visitante.
 *
 * | Valor        | Descripción                     |
 * |--------------|---------------------------------|
 * | `cedula`     | Cédula de ciudadanía colombiana |
 * | `passport`   | Pasaporte                       |
 * | `foreign_id` | Cédula de extranjería           |
 */
export type IDDocumentType = "cedula" | "passport" | "foreign_id";

// ── Payloads y resultados ─────────────────────────────────────────────────────

/**
 * Payload para crear una nueva solicitud administrativa desde el modal
 * de solicitudes.
 *
 * @remarks
 * Los campos opcionales aplican según la `category`:
 * - `access`  → `accessZones`, `accessStartDate`, `accessEndDate`
 * - `room`    → `roomId`, `roomDate`, `roomStartTime`, `roomEndTime`, `attendeesCount`
 * - `service` → `serviceType`
 */
export interface NewRequestPayload {
  /** Categoría de la solicitud. Determina qué campos opcionales aplican. */
  category: RequestCategory;

  /** Título descriptivo de la solicitud. */
  title: string;

  /** Descripción detallada del requerimiento. */
  description: string;

  /** Nivel de prioridad solicitado. */
  priority: RequestPriority;

  /** Zonas de acceso requeridas. Solo aplica cuando `category === "access"`. */
  accessZones?: AccessZone[];

  /** Fecha de inicio del acceso en formato ISO 8601. Solo para `category === "access"`. */
  accessStartDate?: string;

  /** Fecha de fin del acceso en formato ISO 8601. Solo para `category === "access"`. */
  accessEndDate?: string;

  /** ID de la sala a reservar. Solo aplica cuando `category === "room"`. */
  roomId?: string;

  /** Fecha de la reserva en formato ISO 8601. Solo para `category === "room"`. */
  roomDate?: string;

  /** Hora de inicio de la reserva en formato `"HH:mm"`. Solo para `category === "room"`. */
  roomStartTime?: string;

  /** Hora de fin de la reserva en formato `"HH:mm"`. Solo para `category === "room"`. */
  roomEndTime?: string;

  /** Número de asistentes esperados. Solo para `category === "room"`. */
  attendeesCount?: number;

  /** Tipo específico de servicio general. Solo para `category === "service"`. */
  serviceType?: string;

  /** Archivos adjuntos opcionales a incluir con la solicitud. */
  attachments?: File[];

  /** Nombre del solicitante. Si se omite, se infiere de la sesión activa. */
  requesterName?: string;

  /** Correo del solicitante. Si se omite, se infiere de la sesión activa. */
  requesterEmail?: string;

  /** Departamento del solicitante. Si se omite, se infiere de la sesión activa. */
  department?: string;
}

/**
 * Resultado retornado por {@link createAdminRequest} tras crear una solicitud.
 */
export interface NewRequestResult {
  /** Identificador único asignado a la solicitud (ej. `"REQ-1720000000000"`). */
  id: string;

  /** Fecha y hora de creación en formato ISO 8601. */
  createdAt: string;

  /** Estado inicial de la solicitud, siempre `"pending"` al crearse. */
  status: RequestStatus;
}

/**
 * Payload para gestionar una tarjeta de acceso físico desde el modal
 * de tarjetas.
 */
export interface AccessCardPayload {
  /** Tipo de gestión a realizar sobre la tarjeta. */
  action: AccessCardAction;

  /** ID del colaborador en el directorio de Entra ID. */
  employeeId?: string;

  /** Nombre completo del colaborador. */
  employeeName?: string;

  /** Correo corporativo del colaborador. */
  employeeEmail?: string;

  /** Departamento del colaborador. */
  department?: string;

  /** Número de la tarjeta actual. Requerido para `report_lost`, `report_damaged` y `deactivate`. */
  cardNumber?: string;

  /** Zonas de acceso a habilitar en la nueva tarjeta. Solo para `request_new`. */
  zones?: AccessZone[];

  /** Motivo de la gestión en texto libre. */
  reason?: string;

  /**
   * Nivel de urgencia de la gestión.
   * `"urgent"` reduce el SLA estimado de 48h a 24h.
   */
  urgency?: "normal" | "urgent";
}

/**
 * Resultado retornado por {@link submitAccessCardRequest} tras crear
 * un ticket de gestión de tarjeta.
 */
export interface AccessCardResult {
  /** Identificador del ticket creado (ej. `"TAR-1720000000000"`). */
  ticketId: string;

  /** Fecha y hora de creación en formato ISO 8601. */
  createdAt: string;

  /**
   * Tiempo estimado de resolución.
   * `"24h"` si `urgency === "urgent"`, `"48h"` en caso contrario.
   */
  estimatedResolution: string;
}

/**
 * Sala de reuniones disponible para reserva.
 */
export interface Room {
  /** Identificador único de la sala (ej. `"sala-a"`). */
  id: string;

  /** Nombre de la sala (ej. `"Sala Directiva A"`). */
  name: string;

  /** Piso donde se encuentra la sala (ej. `"Piso 3"`). */
  floor: string;

  /** Capacidad máxima de personas. */
  capacity: number;

  /** Lista de amenidades disponibles (ej. `["Proyector", "Videoconferencia"]`). */
  amenities: string[];

  /**
   * URL de la imagen de la sala para mostrar en el selector.
   * `undefined` si no hay imagen configurada.
   */
  imageUrl?: string;
}

/**
 * Slot horario de disponibilidad de una sala de reuniones.
 *
 * @remarks
 * `takenBy` solo está presente cuando `taken === true` e indica el nombre
 * de la reunión que ocupa ese slot, para mostrarlo como tooltip en el
 * selector de horarios.
 */
export interface RoomSlot {
  /** Hora de inicio del slot en formato `"HH:mm"`. */
  start: string;

  /** Hora de fin del slot en formato `"HH:mm"`. */
  end: string;

  /** `true` si el slot ya está reservado. */
  taken: boolean;

  /**
   * Nombre de la reunión que ocupa este slot.
   * Solo presente cuando `taken === true`.
   */
  takenBy?: string;
}

/**
 * Payload para reservar una sala de reuniones.
 */
export interface RoomBookingPayload {
  /** ID de la sala a reservar, obtenido de {@link Room.id}. */
  roomId: string;

  /** Fecha de la reserva en formato ISO 8601 (ej. `"2025-07-15"`). */
  date: string;

  /** Hora de inicio en formato `"HH:mm"`. */
  startTime: string;

  /** Hora de fin en formato `"HH:mm"`. */
  endTime: string;

  /** Nombre o asunto de la reunión. */
  title: string;

  /** Número de asistentes confirmados. */
  attendeesCount: number;

  /** Correos de los asistentes para enviar invitación de calendario. */
  attendeesEmails?: string[];

  /** Notas adicionales para el administrador de la sala. */
  notes?: string;

  /** Nombre del organizador. Si se omite, se infiere de la sesión activa. */
  requesterName?: string;

  /** Correo del organizador. Si se omite, se infiere de la sesión activa. */
  requesterEmail?: string;
}

/**
 * Resultado retornado por {@link bookRoom} tras crear una reserva.
 */
export interface RoomBookingResult {
  /** Identificador único de la reserva (ej. `"RES-1720000000000"`). */
  bookingId: string;

  /**
   * ID del evento creado en el calendario de Microsoft 365.
   * `undefined` hasta que se implemente la integración con Graph.
   */
  calendarEventId?: string;

  /** Fecha y hora de creación de la reserva en formato ISO 8601. */
  createdAt: string;
}

/**
 * Payload para pre-registrar un visitante desde el modal de visitas.
 */
export interface VisitorPayload {
  /** Nombre completo del visitante. */
  visitorName: string;

  /** Empresa u organización del visitante. */
  visitorCompany: string;

  /** Correo electrónico del visitante para enviar confirmación. */
  visitorEmail?: string;

  /** Teléfono de contacto del visitante. */
  visitorPhone?: string;

  /** Tipo de documento de identidad presentado. */
  documentType: IDDocumentType;

  /** Número del documento de identidad. */
  documentNumber: string;

  /** Tipo de visita según su propósito. */
  visitType: VisitorType;

  /** Nombre del colaborador anfitrión. */
  hostName: string;

  /** Correo del anfitrión para notificarle la llegada del visitante. */
  hostEmail?: string;

  /** Departamento del anfitrión. */
  hostDepartment: string;

  /** Fecha programada de la visita en formato ISO 8601. */
  visitDate: string;

  /** Hora programada de la visita en formato `"HH:mm"`. */
  visitTime: string;

  /** Motivo o propósito de la visita en texto libre. */
  purpose: string;

  /** Placa del vehículo si el visitante ingresa en carro. */
  vehiclePlate?: string;

  /** Notas adicionales para el personal de recepción. */
  notes?: string;
}

/**
 * Resultado retornado por {@link registerVisitor} tras pre-registrar
 * un visitante.
 */
export interface VisitorResult {
  /** Identificador único del registro (ej. `"VIS-1720000000000"`). */
  visitorId: string;

  /**
   * Código QR generado para el visitante en formato data URL o URL externa.
   * `undefined` hasta que se implemente la generación de QR.
   */
  qrCode?: string;

  /** Fecha y hora de creación del registro en formato ISO 8601. */
  createdAt: string;
}

// ── Funciones de acción ───────────────────────────────────────────────────────

/**
 * Crea una nueva solicitud administrativa en el sistema.
 *
 * @remarks
 * Actualmente retorna un resultado mock con delay simulado de 900ms.
 * Pendiente de integración con la fuente de datos definitiva:
 * - **MS Graph**: `POST /sites/{site-id}/lists/{list-id}/items`
 * - **API propia**: `POST /api/administrative/requests`
 *
 * @param _payload - Datos de la solicitud a crear según {@link NewRequestPayload}.
 * @returns Resultado con el ID asignado, fecha de creación y estado inicial.
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
 * Crea un ticket de gestión de tarjeta de acceso físico.
 *
 * @remarks
 * Actualmente retorna un resultado mock con delay simulado de 700ms.
 * El `estimatedResolution` se calcula según `payload.urgency`:
 * `"urgent"` → `"24h"`, cualquier otro valor → `"48h"`.
 *
 * Pendiente de integración:
 * - **MS Graph**: `POST /sites/{site-id}/lists/AccessCardRequests/items`
 * - **API propia**: `POST /api/administrative/access-cards`
 *
 * @param payload - Datos de la gestión según {@link AccessCardPayload}.
 * @returns Ticket creado con ID, fecha y tiempo estimado de resolución.
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
 * Obtiene la lista de salas de reuniones disponibles para reserva.
 *
 * @remarks
 * Actualmente retorna datos mock con delay simulado de 400ms.
 *
 * Pendiente de integración:
 * - **MS Graph**: `GET /places/microsoft.graph.room`
 *
 * @returns Array de {@link Room} con las salas configuradas en el edificio.
 */
export async function getRooms(): Promise<Room[]> {
  await new Promise((r) => setTimeout(r, 400));
  return [
    { id: "sala-a", name: "Sala Directiva A",     floor: "Piso 3", capacity: 12,
      amenities: ["Proyector", "Videoconferencia", "Pizarrón"] },
    { id: "sala-b", name: "Sala de Reuniones B",  floor: "Piso 2", capacity: 8,
      amenities: ["TV", "Pizarrón"] },
    { id: "sala-c", name: "Sala de Capacitación", floor: "Piso 1", capacity: 20,
      amenities: ["Proyector", "TV", "Pizarrón"] },
    { id: "sala-d", name: "Sala Privada D",        floor: "Piso 3", capacity: 4,
      amenities: ["TV"] },
  ];
}

/**
 * Obtiene los slots de disponibilidad horaria de una sala en una fecha
 * específica.
 *
 * @remarks
 * Actualmente retorna slots mock con delay simulado de 500ms, con los
 * horarios `09:00`, `10:00` y `14:00` marcados como ocupados.
 *
 * Pendiente de integración:
 * - **MS Graph**: `POST /users/{room-email}/calendar/getSchedule`
 *
 * @param _roomId - ID de la sala a consultar, obtenido de {@link Room.id}.
 * @param _date   - Fecha a consultar en formato ISO 8601.
 * @returns Array de {@link RoomSlot} con los slots horarios de 07:00 a 19:00
 *   y su disponibilidad.
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
    const slot: RoomSlot = { start: h, end: HOURS[i + 1] ?? "19:00", taken };
    if (taken) slot.takenBy = "Reunión de equipo";
    return slot;
  });
}

/**
 * Crea una reserva de sala de reuniones.
 *
 * @remarks
 * Actualmente retorna un resultado mock con delay simulado de 800ms.
 * `calendarEventId` permanece `undefined` hasta implementar la
 * integración con el calendario de Microsoft 365.
 *
 * Pendiente de integración:
 * - **MS Graph**: `POST /users/{organizer}/events`
 *
 * @param _payload - Datos de la reserva según {@link RoomBookingPayload}.
 * @returns Reserva creada con ID y fecha de creación.
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
 * Pre-registra un visitante en el sistema de control de acceso.
 *
 * @remarks
 * Actualmente retorna un resultado mock con delay simulado de 750ms.
 * `qrCode` permanece `undefined` hasta implementar la generación de QR
 * para entrega al visitante en recepción.
 *
 * Pendiente de integración:
 * - **MS Graph**: `POST /sites/{site-id}/lists/Visitors/items`
 * - **API propia**: `POST /api/administrative/visitors`
 *
 * @param _payload - Datos del visitante según {@link VisitorPayload}.
 * @returns Registro creado con ID, QR opcional y fecha de creación.
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

// ── Mock data ─────────────────────────────────────────────────────────────────

/**
 * Retorna el conjunto completo de datos mock para el dashboard de
 * Servicios Administrativos.
 *
 * @remarks
 * Simula la respuesta que en producción provendrá de Microsoft Graph
 * y las listas de SharePoint del área. Incluye KPIs, solicitudes
 * recientes, documentos, calendario, comunicados, registro de visitas
 * y solicitudes de tarjetas de acceso con datos representativos del
 * contexto operativo de EDM.
 *
 * ⏳ Pendiente de reemplazar con llamadas reales a Graph y SharePoint
 * una vez se obtengan los permisos necesarios.
 *
 * @returns Objeto {@link AdminData} con todos los datos del dashboard.
 */
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
        id: "ADM-1041", title: "Tarjeta de acceso — colaborador nuevo",
        requester: "Ana García", department: "Marketing",
        status: "in_review", priority: "medium", category: "Tarjeta de acceso",
        createdAt: "2025-07-08", dueDate: "2025-07-12",
      },
      {
        id: "ADM-1040", title: "Reserva sala Boardroom — presentación Q3",
        requester: "Luis Hernández", department: "Ventas",
        status: "approved", priority: "high", category: "Reserva de sala",
        createdAt: "2025-07-07", dueDate: "2025-07-10",
      },
      {
        id: "ADM-1039", title: "Visita proveedor — Integración AV",
        requester: "Paola Torres", department: "TI",
        status: "pending", priority: "low", category: "Visita",
        createdAt: "2025-07-07", dueDate: "2025-07-15",
      },
      {
        id: "ADM-1038", title: "Tarjeta bloqueada — reposición urgente",
        requester: "Carlos Ruiz", department: "Operaciones",
        status: "approved", priority: "high", category: "Tarjeta de acceso",
        createdAt: "2025-07-06", dueDate: "2025-07-07",
      },
      {
        id: "ADM-1037", title: "Servicio de mensajería — envío documentos legales",
        requester: "Sofía Mendoza", department: "Legal",
        status: "rejected", priority: "medium", category: "Servicio general",
        createdAt: "2025-07-05", dueDate: "2025-07-08",
      },
    ],
    recentDocuments: [
      {
        id: "DOC-201", title: "Política de acceso a instalaciones 2025",
        category: "policy", updatedAt: "2025-07-01",
        size: "480 KB", downloadUrl: "/docs/politica-acceso-instalaciones-2025.pdf",
      },
      {
        id: "DOC-202", title: "Formato de registro de visitantes",
        category: "form", updatedAt: "2025-06-28",
        size: "120 KB", downloadUrl: "/docs/formato-registro-visitantes.xlsx",
      },
      {
        id: "DOC-203", title: "Procedimiento de emisión de tarjetas",
        category: "procedure", updatedAt: "2025-06-20",
        size: "310 KB", downloadUrl: "/docs/procedimiento-tarjetas-acceso.pdf",
      },
      {
        id: "DOC-204", title: "Reglamento de uso de salas de juntas",
        category: "policy", updatedAt: "2025-06-15",
        size: "210 KB", downloadUrl: "/docs/reglamento-salas-juntas.pdf",
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
        id: "ANN-01", title: "Nuevo proceso de pre-registro de visitantes",
        body: "A partir del 15 de julio todos los visitantes deben ser pre-registrados desde la intranet con mínimo 24 horas de anticipación.",
        publishedAt: "2025-07-06", pinned: true,
      },
      {
        id: "ANN-02", title: "Simulacro de evacuación — 15 de julio",
        body: "Se realizará simulacro general a las 10:00 hrs. Todo el personal debe dirigirse al punto de reunión asignado por piso.",
        publishedAt: "2025-07-04", pinned: true,
      },
      {
        id: "ANN-03", title: "Mantenimiento lector — acceso Piso 3",
        body: "El lunes 28 de julio el lector de acceso del piso 3 estará fuera de servicio de 8:00 a 10:00 hrs. Usar acceso por escalera principal.",
        publishedAt: "2025-07-03", pinned: false,
      },
    ],
    visitorLog: [
      {
        id: "VIS-091", visitorName: "Roberto Salinas", host: "Mariana Solís",
        company: "Proveedor AV Tech", checkIn: "09:14", status: "inside",
      },
      {
        id: "VIS-090", visitorName: "Fernanda López", host: "Ricardo Fuentes",
        company: "Despacho Jurídico RL", checkIn: "08:50",
        checkOut: "10:22", status: "departed",
      },
      {
        id: "VIS-089", visitorName: "Andrés Mora", host: "Luis Hernández",
        checkIn: "08:30", status: "inside",
      },
    ],
    accessCardRequests: [
      {
        id: "ACC-041", employee: "Diana Flores", department: "Marketing",
        type: "new", status: "in_review", requestedAt: "2025-07-08",
      },
      {
        id: "ACC-040", employee: "Miguel Ángel Reyes", department: "Finanzas",
        type: "replacement", status: "approved", requestedAt: "2025-07-06",
      },
      {
        id: "ACC-039", employee: "Claudia Herrera", department: "Legal",
        type: "deactivation", status: "pending", requestedAt: "2025-07-05",
      },
    ],
  };
}