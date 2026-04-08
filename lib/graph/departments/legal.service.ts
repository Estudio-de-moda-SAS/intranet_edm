/**
 * @module graph/departments/legal.service
 * Tipos y datos mock para el departamento Jurídico de la intranet EDM.
 *
 * @remarks
 * Centraliza toda la superficie de tipos del módulo legal — contratos,
 * solicitudes, litigios, documentos, alertas regulatorias y calendario
 * jurídico — junto con el service {@link getLegalData} que los agrega.
 *
 * En producción, los datos provendrán de listas de SharePoint y del
 * calendario de Outlook a través de Microsoft Graph. Actualmente todos
 * los datos se sirven desde mock hasta obtener los permisos necesarios.
 *
 * **Integraciones pendientes:**
 * | Dato                | Fuente prevista                              |
 * |---------------------|----------------------------------------------|
 * | `contracts`         | SharePoint List "Contratos"                  |
 * | `myRequests`        | SharePoint List "Solicitudes Jurídicas"      |
 * | `litigations`       | SharePoint List "Litigios"                   |
 * | `recentDocuments`   | Biblioteca de documentos SharePoint          |
 * | `regulatoryAlerts`  | SharePoint List "Alertas Regulatorias"       |
 * | `calendarEvents`    | Calendario de Outlook del área Jurídica      |
 *
 * @example
 * ```tsx
 * // En un Server Component:
 * export default async function LegalPage() {
 *   const data = await getLegalData();
 *   return <LegalDashboard data={data} />;
 * }
 * ```
 */

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Estado de un contrato a lo largo de su ciclo de vida jurídico.
 *
 * | Valor               | Descripción                                    |
 * |---------------------|------------------------------------------------|
 * | `draft`             | Borrador en elaboración                        |
 * | `in_review`         | En revisión por el área jurídica               |
 * | `pending_signature` | Aprobado, pendiente de firma por las partes    |
 * | `active`            | Vigente y en ejecución                         |
 * | `expired`           | Vencido sin renovación                         |
 * | `cancelled`         | Cancelado antes de su vencimiento              |
 */
export type ContractStatus =
  | "draft"
  | "in_review"
  | "pending_signature"
  | "active"
  | "expired"
  | "cancelled";

/**
 * Tipo de contrato según la naturaleza de la relación jurídica.
 *
 * | Valor              | Descripción                              |
 * |--------------------|------------------------------------------|
 * | `cliente`          | Contrato con cliente                     |
 * | `proveedor`        | Contrato con proveedor de bienes/servicios|
 * | `laboral`          | Contrato colectivo o individual de trabajo|
 * | `confidencialidad` | Acuerdo de confidencialidad (NDA)        |
 * | `licencia`         | Licencia de uso de software o propiedad  |
 * | `otro`             | Otros tipos de contratos                 |
 */
export type ContractType =
  | "cliente"
  | "proveedor"
  | "laboral"
  | "confidencialidad"
  | "licencia"
  | "otro";

/**
 * Estado de una solicitud jurídica en su flujo de atención.
 *
 * | Valor       | Descripción                                    |
 * |-------------|------------------------------------------------|
 * | `pending`   | Recibida, pendiente de asignación              |
 * | `in_review` | En proceso de atención por el área jurídica    |
 * | `completed` | Atendida y cerrada                             |
 * | `rejected`  | Rechazada con motivo registrado                |
 */
export type RequestStatus = "pending" | "in_review" | "completed" | "rejected";

/**
 * Nivel de prioridad de una solicitud jurídica.
 *
 * | Valor    | SLA orientativo |
 * |----------|-----------------|
 * | `low`    | 5 días hábiles  |
 * | `medium` | 3 días hábiles  |
 * | `high`   | 1 día hábil     |
 * | `urgent` | Mismo día       |
 */
export type RequestPriority = "low" | "medium" | "high" | "urgent";

/**
 * Estado de un litigio o proceso judicial activo.
 *
 * | Valor      | Descripción                                    |
 * |------------|------------------------------------------------|
 * | `active`   | Proceso judicial activo con audiencias         |
 * | `suspended`| Proceso suspendido temporalmente               |
 * | `resolved` | Proceso concluido con resolución firme         |
 * | `appeal`   | En fase de apelación o recurso                 |
 */
export type LitigationStatus = "active" | "suspended" | "resolved" | "appeal";

/**
 * Categoría de un documento jurídico según su naturaleza.
 *
 * | Valor               | Descripción                              |
 * |---------------------|------------------------------------------|
 * | `contract_template` | Plantilla de contrato reutilizable       |
 * | `policy`            | Política corporativa vigente             |
 * | `power_of_attorney` | Modelo de poder notarial                 |
 * | `regulatory`        | Guía de cumplimiento normativo           |
 * | `form`              | Formulario de solicitud                  |
 */
export type DocumentCategory =
  | "contract_template"
  | "policy"
  | "power_of_attorney"
  | "regulatory"
  | "form";

/**
 * Contrato corporativo gestionado por el área Jurídica.
 *
 * @remarks
 * El campo `daysUntilExpiry` puede ser negativo para contratos ya
 * vencidos. El campo `amount` es opcional — no todos los contratos
 * tienen un monto económico asociado (ej. NDAs, contratos laborales).
 */
export type LegalContract = {
  /** Identificador único del contrato (ej. `"CTR-2041"`). */
  id: string;

  /** Título descriptivo del contrato. */
  title: string;

  /** Nombre de la contraparte: cliente, proveedor o sindicato. */
  counterparty: string;

  /** Tipo de contrato según la relación jurídica. */
  type: ContractType;

  /** Estado actual del contrato en su ciclo de vida. */
  status: ContractStatus;

  /** Fecha de inicio de vigencia en formato ISO 8601. */
  startDate: string;

  /** Fecha de vencimiento en formato ISO 8601. */
  expiryDate: string;

  /**
   * Días restantes hasta el vencimiento.
   * Negativo si el contrato ya está vencido.
   */
  daysUntilExpiry: number;

  /** Nombre del abogado responsable del contrato en el área jurídica. */
  responsibleAttorney: string;

  /**
   * Monto económico del contrato en formato legible
   * (ej. `"$1,200,000 MXN"`).
   * `undefined` si el contrato no tiene monto económico asociado.
   */
  amount?: string;
};

/**
 * Solicitud de servicio jurídico realizada por un colaborador o área.
 *
 * @remarks
 * El campo `assignedTo` puede estar ausente en solicitudes recién
 * creadas que aún no han sido asignadas a un abogado del área.
 */
export type LegalRequest = {
  /** Identificador único de la solicitud (ej. `"LEG-0441"`). */
  id: string;

  /** Título descriptivo de la solicitud. */
  title: string;

  /** Nombre del colaborador que realizó la solicitud. */
  requester: string;

  /** Departamento del solicitante. */
  department: string;

  /**
   * Tipo de servicio jurídico solicitado.
   *
   * | Valor               | Descripción                          |
   * |---------------------|--------------------------------------|
   * | `revision_contrato` | Revisión o elaboración de contrato   |
   * | `consulta_legal`    | Consulta jurídica puntual             |
   * | `poder_notarial`    | Elaboración de poder notarial        |
   * | `compliance`        | Revisión de cumplimiento normativo   |
   * | `otro`              | Otro tipo de servicio jurídico       |
   */
  type:
    | "revision_contrato"
    | "consulta_legal"
    | "poder_notarial"
    | "compliance"
    | "otro";

  /** Estado actual de la solicitud. */
  status: RequestStatus;

  /** Nivel de prioridad asignado. */
  priority: RequestPriority;

  /** Fecha de creación en formato ISO 8601. */
  createdAt: string;

  /** Fecha límite de atención en formato ISO 8601. */
  dueDate: string;

  /**
   * Nombre del abogado asignado para atender la solicitud.
   * `undefined` si aún no ha sido asignada.
   */
  assignedTo?: string;
};

/**
 * Litigio o proceso judicial activo en el que EDM es parte.
 *
 * @remarks
 * El campo `externalCounsel` identifica el despacho externo que lleva el
 * proceso cuando se requiere representación legal externa al área jurídica
 * interna.
 */
export type LegalLitigation = {
  /** Identificador único del litigio (ej. `"LIT-018"`). */
  id: string;

  /** Título descriptivo del caso. */
  title: string;

  /** Número de expediente oficial asignado por el tribunal. */
  caseNumber: string;

  /** Nombre del tribunal o juzgado donde se tramita el caso. */
  court: string;

  /**
   * Tipo de proceso judicial.
   *
   * | Valor           | Descripción                          |
   * |-----------------|--------------------------------------|
   * | `civil`         | Proceso civil                        |
   * | `laboral`       | Proceso laboral                      |
   * | `mercantil`     | Proceso mercantil                    |
   * | `administrativo`| Proceso ante tribunal administrativo |
   */
  type: "civil" | "laboral" | "mercantil" | "administrativo";

  /** Estado actual del proceso judicial. */
  status: LitigationStatus;

  /**
   * Fecha de la próxima audiencia en formato ISO 8601.
   * `undefined` si no hay audiencia programada.
   */
  nextHearing?: string;

  /**
   * Nombre del despacho externo que representa a EDM en el proceso.
   * `undefined` si el caso es llevado íntegramente por el área jurídica interna.
   */
  externalCounsel?: string;
};

/**
 * Documento jurídico publicado en la biblioteca del área Legal.
 *
 * @remarks
 * Los campos `downloadUrl`, `previewUrl`, `restricted`, `author` y
 * `version` son opcionales — pueden no estar disponibles en todos los
 * documentos dependiendo de su categoría y estado de publicación.
 *
 * Los documentos con `restricted: true` requieren nivel de acceso
 * `legal` para ser descargados — la restricción debe aplicarse en el
 * componente consumidor.
 */
export type LegalDocument = {
  /** Identificador único del documento (ej. `"DOC-L01"`). */
  id: string;

  /** Título del documento tal como aparece en la biblioteca. */
  title: string;

  /** Categoría del documento según {@link DocumentCategory}. */
  category: DocumentCategory;

  /** Fecha de última actualización en formato ISO 8601. */
  updatedAt: string;

  /** Tamaño del archivo en formato legible (ej. `"380 KB"`). */
  size: string;

  /**
   * URL de descarga directa del documento.
   * `undefined` si el documento aún no está disponible para descarga.
   */
  downloadUrl?: string;

  /**
   * Si es `true`, el documento solo es accesible para usuarios con
   * nivel de acceso `legal`.
   * `undefined` equivale a `false` — documento de acceso general.
   */
  restricted?: boolean;

  /** Nombre del autor o área responsable del documento. */
  author?: string;

  /** Versión del documento (ej. `"v3.1"`). */
  version?: string;

  /** URL de previsualización del documento en el visor de la intranet. */
  previewUrl?: string;
};

/**
 * Alerta regulatoria que afecta las operaciones jurídicas de EDM.
 *
 * @remarks
 * Las alertas `"critical"` requieren acción inmediata antes de la fecha
 * de entrada en vigor. Las `"warning"` requieren revisión y planificación.
 * Las `"info"` son informativas para seguimiento del área.
 */
export type RegulatoryAlert = {
  /** Identificador único de la alerta (ej. `"REG-01"`). */
  id: string;

  /** Título de la norma o modificación regulatoria. */
  title: string;

  /** Descripción del impacto y acciones requeridas. */
  description: string;

  /** Fecha de entrada en vigor de la norma en formato ISO 8601. */
  effectiveDate: string;

  /**
   * Área jurídica o normativa afectada.
   * Valores típicos: `"Privacidad"`, `"Laboral"`, `"Fiscal"`, `"Mercantil"`.
   */
  area: string;

  /**
   * Nivel de severidad de la alerta.
   *
   * | Valor      | Descripción                              |
   * |------------|------------------------------------------|
   * | `critical` | Requiere acción inmediata antes del plazo|
   * | `warning`  | Requiere revisión y planificación        |
   * | `info`     | Informativa para seguimiento del área    |
   */
  severity: "info" | "warning" | "critical";
};

/**
 * Evento del calendario jurídico del área Legal.
 *
 * @remarks
 * Incluye audiencias judiciales, vencimientos de contratos, plazos
 * regulatorios, presentación de escritos y renovaciones programadas.
 */
export type LegalCalendarEvent = {
  /** Identificador único del evento. */
  id: string;

  /** Título descriptivo del evento. */
  title: string;

  /** Fecha del evento en formato ISO 8601. */
  date: string;

  /**
   * Tipo de evento jurídico.
   *
   * | Valor             | Descripción                          |
   * |-------------------|--------------------------------------|
   * | `hearing`         | Audiencia judicial                   |
   * | `contract_expiry` | Vencimiento de contrato              |
   * | `deadline`        | Plazo regulatorio o procesal         |
   * | `filing`          | Presentación de escrito o demanda    |
   * | `renewal`         | Renovación de contrato               |
   */
  type: "hearing" | "contract_expiry" | "deadline" | "filing" | "renewal";
};

/**
 * Indicadores clave de operación del área Jurídica.
 */
export type LegalKPI = {
  /** Número de contratos actualmente vigentes. */
  contractsActive: number;

  /** Contratos que vencen en los próximos 30 días. */
  contractsExpiringSoon: number;

  /** Contratos vencidos sin renovación gestionada. */
  contractsExpired: number;

  /** Solicitudes jurídicas pendientes de atención. */
  requestsPending: number;

  /** Solicitudes recibidas en el mes en curso. */
  requestsThisMonth: number;

  /** Litigios activos en los que EDM es parte. */
  litigationsActive: number;

  /** Tiempo promedio de revisión jurídica en días hábiles. */
  avgReviewDays: number;

  /**
   * Porcentaje de cumplimiento normativo de la organización (0–100).
   * Calculado sobre el total de controles evaluados en el período.
   */
  complianceScore: number;
};

/**
 * Agregado principal de datos del dashboard del departamento Jurídico.
 *
 * @remarks
 * Declarado explícitamente como tipo para garantizar compatibilidad con
 * `isolatedModules` de Next.js y permitir su uso en componentes sin
 * necesidad de inferir el tipo del retorno de {@link getLegalData}.
 */
export type LegalData = {
  /** Indicadores KPI del área Jurídica. */
  kpis: LegalKPI;

  /** Contratos corporativos activos y en gestión. */
  contracts: LegalContract[];

  /** Solicitudes jurídicas recientes del área. */
  myRequests: LegalRequest[];

  /** Litigios y procesos judiciales activos. */
  litigations: LegalLitigation[];

  /** Documentos publicados recientemente en la biblioteca jurídica. */
  recentDocuments: LegalDocument[];

  /** Alertas regulatorias vigentes que afectan a EDM. */
  regulatoryAlerts: RegulatoryAlert[];

  /** Eventos próximos del calendario jurídico. */
  calendarEvents: LegalCalendarEvent[];
};

// ── Mock data ─────────────────────────────────────────────────────────────────

/**
 * Retorna el conjunto completo de datos mock para el dashboard del
 * departamento Jurídico.
 *
 * @remarks
 * Simula la respuesta que en producción provendrá de listas de SharePoint
 * y del calendario de Outlook a través de Microsoft Graph. Incluye
 * contratos con distintos estados y plazos de vencimiento, solicitudes
 * con diferentes prioridades, litigios activos en distintas etapas,
 * documentos de la biblioteca, alertas regulatorias vigentes y eventos
 * del calendario jurídico.
 *
 * ⏳ Pendiente de reemplazar con llamadas reales a Graph y SharePoint
 * una vez se obtengan los permisos necesarios (`Sites.Read.All`,
 * `Calendars.Read`).
 *
 * @returns Objeto {@link LegalData} con todos los datos del dashboard.
 */
export async function getLegalData(): Promise<LegalData> {
  return {
    kpis: {
      contractsActive:       142,
      contractsExpiringSoon: 8,
      contractsExpired:      3,
      requestsPending:       11,
      requestsThisMonth:     34,
      litigationsActive:     5,
      avgReviewDays:         3.8,
      complianceScore:       97,
    },
    contracts: [
      {
        id: "CTR-2041",
        title: "Contrato de servicios profesionales — Deloitte",
        counterparty: "Deloitte México",
        type: "proveedor", status: "active",
        startDate: "2025-01-15", expiryDate: "2025-07-31",
        daysUntilExpiry: 23,
        responsibleAttorney: "Valentina Cruz",
        amount: "$1,200,000 MXN",
      },
      {
        id: "CTR-2040",
        title: "Acuerdo de confidencialidad — Proyecto Fénix",
        counterparty: "TechPartners S.A.",
        type: "confidencialidad", status: "pending_signature",
        startDate: "2025-07-01", expiryDate: "2026-07-01",
        daysUntilExpiry: 357,
        responsibleAttorney: "Rodrigo Ibáñez",
      },
      {
        id: "CTR-2039",
        title: "Contrato marco de distribución",
        counterparty: "Distribuidora Nacional S.A.",
        type: "cliente", status: "in_review",
        startDate: "2025-07-10", expiryDate: "2026-07-10",
        daysUntilExpiry: 366,
        responsibleAttorney: "Valentina Cruz",
        amount: "$4,500,000 MXN",
      },
      {
        id: "CTR-2035",
        title: "Licencia de uso de software ERP",
        counterparty: "SAP México",
        type: "licencia", status: "active",
        startDate: "2024-08-01", expiryDate: "2025-07-20",
        daysUntilExpiry: 12,
        responsibleAttorney: "Rodrigo Ibáñez",
        amount: "$890,000 MXN",
      },
      {
        id: "CTR-2028",
        title: "Contrato colectivo de trabajo",
        counterparty: "Sindicato Nacional",
        type: "laboral", status: "active",
        startDate: "2024-01-01", expiryDate: "2025-12-31",
        daysUntilExpiry: 174,
        responsibleAttorney: "Camila Fuentes",
      },
    ],
    myRequests: [
      {
        id: "LEG-0441",
        title: "Revisión de contrato — proveedor logística",
        requester: "Paola Torres", department: "Operaciones",
        type: "revision_contrato", status: "in_review", priority: "high",
        createdAt: "2025-07-08", dueDate: "2025-07-11",
        assignedTo: "Valentina Cruz",
      },
      {
        id: "LEG-0440",
        title: "Consulta laboral — modificación de contrato",
        requester: "Ana García", department: "RRHH",
        type: "consulta_legal", status: "completed", priority: "medium",
        createdAt: "2025-07-07", dueDate: "2025-07-09",
        assignedTo: "Camila Fuentes",
      },
      {
        id: "LEG-0439",
        title: "Poder notarial — representación legal",
        requester: "Diego Morales", department: "Dirección General",
        type: "poder_notarial", status: "pending", priority: "urgent",
        createdAt: "2025-07-07", dueDate: "2025-07-10",
      },
      {
        id: "LEG-0438",
        title: "Revisión cláusulas de privacidad — App móvil",
        requester: "Luis Hernández", department: "TI",
        type: "compliance", status: "in_review", priority: "medium",
        createdAt: "2025-07-05", dueDate: "2025-07-14",
        assignedTo: "Rodrigo Ibáñez",
      },
      {
        id: "LEG-0435",
        title: "Contrato nuevo cliente — Sector retail",
        requester: "Carlos Ruiz", department: "Ventas",
        type: "revision_contrato", status: "pending", priority: "high",
        createdAt: "2025-07-04", dueDate: "2025-07-12",
      },
    ],
    litigations: [
      {
        id: "LIT-018",
        title: "Demanda laboral — ex colaborador",
        caseNumber: "LAB/2024/3821",
        court: "Junta Local de Conciliación No. 4",
        type: "laboral", status: "active",
        nextHearing: "2025-07-18",
        externalCounsel: "Despacho Garza & Asociados",
      },
      {
        id: "LIT-017",
        title: "Controversia mercantil — incumplimiento de contrato",
        caseNumber: "MER/2024/1102",
        court: "Juzgado 7mo de Distrito Mercantil",
        type: "mercantil", status: "active",
        nextHearing: "2025-07-25",
        externalCounsel: "Despacho Garza & Asociados",
      },
      {
        id: "LIT-015",
        title: "Impugnación administrativa — resolución SAT",
        caseNumber: "ADM/2023/0489",
        court: "TFJA — Sala Regional Norte",
        type: "administrativo", status: "appeal",
        nextHearing: "2025-08-05",
      },
    ],
    recentDocuments: [
      {
        id: "DOC-L01",
        title: "Contrato marco estándar de servicios 2025",
        category: "contract_template", updatedAt: "2025-07-01",
        size: "380 KB",
        downloadUrl: "/docs/legal/contrato-marco-servicios-2025.docx",
        restricted: false,
      },
      {
        id: "DOC-L02",
        title: "Política de protección de datos personales",
        category: "policy", updatedAt: "2025-06-20",
        size: "520 KB",
        downloadUrl: "/docs/legal/politica-proteccion-datos.pdf",
        restricted: false,
      },
      {
        id: "DOC-L03",
        title: "Modelo de poder notarial general",
        category: "power_of_attorney", updatedAt: "2025-06-15",
        size: "210 KB",
        downloadUrl: "/docs/legal/modelo-poder-notarial.docx",
        restricted: true,
      },
      {
        id: "DOC-L04",
        title: "Guía de cumplimiento normativo 2025",
        category: "regulatory", updatedAt: "2025-06-10",
        size: "1.2 MB",
        downloadUrl: "/docs/legal/guia-cumplimiento-2025.pdf",
        restricted: false,
      },
      {
        id: "DOC-L05",
        title: "Formato de solicitud de revisión legal",
        category: "form", updatedAt: "2025-06-01",
        size: "95 KB",
        downloadUrl: "/docs/legal/formato-solicitud-revision.xlsx",
        restricted: false,
      },
    ],
    regulatoryAlerts: [
      {
        id: "REG-01",
        title: "Reforma a la Ley Federal de Protección de Datos",
        description: "Nuevas obligaciones para el tratamiento de datos sensibles entran en vigor el 1 de septiembre de 2025.",
        effectiveDate: "2025-09-01", area: "Privacidad", severity: "critical",
      },
      {
        id: "REG-02",
        title: "Actualización NOM-035 — Factores de riesgo psicosocial",
        description: "Segunda etapa de aplicación. Las empresas con más de 50 colaboradores deben completar evaluación antes del 31 de agosto.",
        effectiveDate: "2025-08-31", area: "Laboral", severity: "warning",
      },
      {
        id: "REG-03",
        title: "Modificación a la tasa de retención ISR 2025",
        description: "El SAT ajustó las tablas de retención aplicables desde julio. Revisar impacto en nómina y contratos vigentes.",
        effectiveDate: "2025-07-01", area: "Fiscal", severity: "info",
      },
    ],
    calendarEvents: [
      { id: "lc-1", title: "Audiencia — LIT-018 Junta Laboral",      date: "2025-07-18", type: "hearing"        },
      { id: "lc-2", title: "Vencimiento contrato SAP ERP",           date: "2025-07-20", type: "contract_expiry" },
      { id: "lc-3", title: "Audiencia — LIT-017 Juzgado Mercantil", date: "2025-07-25", type: "hearing"         },
      { id: "lc-4", title: "Vencimiento contrato Deloitte",          date: "2025-07-31", type: "contract_expiry" },
      { id: "lc-5", title: "Plazo NOM-035 — evaluación obligatoria", date: "2025-08-31", type: "deadline"        },
      { id: "lc-6", title: "Audiencia — LIT-015 TFJA",               date: "2025-08-05", type: "hearing"         },
    ],
  };
}