// lib/graph/departments/legal.service.ts
// Integración: SharePoint Lists + Outlook Calendar vía MS Graph

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type ContractStatus   = "draft" | "in_review" | "pending_signature" | "active" | "expired" | "cancelled";
export type ContractType     = "cliente" | "proveedor" | "laboral" | "confidencialidad" | "licencia" | "otro";
export type RequestStatus    = "pending" | "in_review" | "completed" | "rejected";
export type RequestPriority  = "low" | "medium" | "high" | "urgent";
export type LitigationStatus = "active" | "suspended" | "resolved" | "appeal";
export type DocumentCategory = "contract_template" | "policy" | "power_of_attorney" | "regulatory" | "form";

export type LegalContract = {
  id: string;
  title: string;
  counterparty: string;         // Cliente o proveedor
  type: ContractType;
  status: ContractStatus;
  startDate: string;
  expiryDate: string;
  daysUntilExpiry: number;      // negativo = vencido
  responsibleAttorney: string;
  amount?: string;              // Opcional, si aplica monto
};

export type LegalRequest = {
  id: string;
  title: string;
  requester: string;
  department: string;
  type: "revision_contrato" | "consulta_legal" | "poder_notarial" | "compliance" | "otro";
  status: RequestStatus;
  priority: RequestPriority;
  createdAt: string;
  dueDate: string;
  assignedTo?: string;
};

export type LegalLitigation = {
  id: string;
  title: string;
  caseNumber: string;
  court: string;
  type: "civil" | "laboral" | "mercantil" | "administrativo";
  status: LitigationStatus;
  nextHearing?: string;
  externalCounsel?: string;
};

export type LegalDocument = {
  id: string;
  title: string;
  category: DocumentCategory;
  updatedAt: string;
  size: string;
  downloadUrl: string;
  restricted: boolean;          // Solo visible para ciertas áreas
};

export type RegulatoryAlert = {
  id: string;
  title: string;
  description: string;
  effectiveDate: string;
  area: string;                 // "Privacidad" | "Laboral" | "Fiscal" | "Mercantil"
  severity: "info" | "warning" | "critical";
};

export type LegalCalendarEvent = {
  id: string;
  title: string;
  date: string;
  type: "hearing" | "contract_expiry" | "deadline" | "filing" | "renewal";
};

export type LegalKPI = {
  contractsActive: number;
  contractsExpiringSoon: number;   // ≤ 30 días
  contractsExpired: number;
  requestsPending: number;
  requestsThisMonth: number;
  litigationsActive: number;
  avgReviewDays: number;
  complianceScore: number;         // porcentaje
};

export type LegalData = {
  kpis: LegalKPI;
  contracts: LegalContract[];
  myRequests: LegalRequest[];
  litigations: LegalLitigation[];
  recentDocuments: LegalDocument[];
  regulatoryAlerts: RegulatoryAlert[];
  calendarEvents: LegalCalendarEvent[];
};

// ─── Mock data — reemplazar con MS Graph / SharePoint List calls ─────────────

export async function getLegalData(): Promise<LegalData> {
  return {
    kpis: {
      contractsActive: 142,
      contractsExpiringSoon: 8,
      contractsExpired: 3,
      requestsPending: 11,
      requestsThisMonth: 34,
      litigationsActive: 5,
      avgReviewDays: 3.8,
      complianceScore: 97,
    },
    contracts: [
      {
        id: "CTR-2041",
        title: "Contrato de servicios profesionales — Deloitte",
        counterparty: "Deloitte México",
        type: "proveedor",
        status: "active",
        startDate: "2025-01-15",
        expiryDate: "2025-07-31",
        daysUntilExpiry: 23,
        responsibleAttorney: "Valentina Cruz",
        amount: "$1,200,000 MXN",
      },
      {
        id: "CTR-2040",
        title: "Acuerdo de confidencialidad — Proyecto Fénix",
        counterparty: "TechPartners S.A.",
        type: "confidencialidad",
        status: "pending_signature",
        startDate: "2025-07-01",
        expiryDate: "2026-07-01",
        daysUntilExpiry: 357,
        responsibleAttorney: "Rodrigo Ibáñez",
      },
      {
        id: "CTR-2039",
        title: "Contrato marco de distribución",
        counterparty: "Distribuidora Nacional S.A.",
        type: "cliente",
        status: "in_review",
        startDate: "2025-07-10",
        expiryDate: "2026-07-10",
        daysUntilExpiry: 366,
        responsibleAttorney: "Valentina Cruz",
        amount: "$4,500,000 MXN",
      },
      {
        id: "CTR-2035",
        title: "Licencia de uso de software ERP",
        counterparty: "SAP México",
        type: "licencia",
        status: "active",
        startDate: "2024-08-01",
        expiryDate: "2025-07-20",
        daysUntilExpiry: 12,
        responsibleAttorney: "Rodrigo Ibáñez",
        amount: "$890,000 MXN",
      },
      {
        id: "CTR-2028",
        title: "Contrato colectivo de trabajo",
        counterparty: "Sindicato Nacional",
        type: "laboral",
        status: "active",
        startDate: "2024-01-01",
        expiryDate: "2025-12-31",
        daysUntilExpiry: 174,
        responsibleAttorney: "Camila Fuentes",
      },
    ],
    myRequests: [
      {
        id: "LEG-0441",
        title: "Revisión de contrato — proveedor logística",
        requester: "Paola Torres",
        department: "Operaciones",
        type: "revision_contrato",
        status: "in_review",
        priority: "high",
        createdAt: "2025-07-08",
        dueDate: "2025-07-11",
        assignedTo: "Valentina Cruz",
      },
      {
        id: "LEG-0440",
        title: "Consulta laboral — modificación de contrato",
        requester: "Ana García",
        department: "RRHH",
        type: "consulta_legal",
        status: "completed",
        priority: "medium",
        createdAt: "2025-07-07",
        dueDate: "2025-07-09",
        assignedTo: "Camila Fuentes",
      },
      {
        id: "LEG-0439",
        title: "Poder notarial — representación legal",
        requester: "Diego Morales",
        department: "Dirección General",
        type: "poder_notarial",
        status: "pending",
        priority: "urgent",
        createdAt: "2025-07-07",
        dueDate: "2025-07-10",
      },
      {
        id: "LEG-0438",
        title: "Revisión cláusulas de privacidad — App móvil",
        requester: "Luis Hernández",
        department: "TI",
        type: "compliance",
        status: "in_review",
        priority: "medium",
        createdAt: "2025-07-05",
        dueDate: "2025-07-14",
        assignedTo: "Rodrigo Ibáñez",
      },
      {
        id: "LEG-0435",
        title: "Contrato nuevo cliente — Sector retail",
        requester: "Carlos Ruiz",
        department: "Ventas",
        type: "revision_contrato",
        status: "pending",
        priority: "high",
        createdAt: "2025-07-04",
        dueDate: "2025-07-12",
      },
    ],
    litigations: [
      {
        id: "LIT-018",
        title: "Demanda laboral — ex colaborador",
        caseNumber: "LAB/2024/3821",
        court: "Junta Local de Conciliación No. 4",
        type: "laboral",
        status: "active",
        nextHearing: "2025-07-18",
        externalCounsel: "Despacho Garza & Asociados",
      },
      {
        id: "LIT-017",
        title: "Controversia mercantil — incumplimiento de contrato",
        caseNumber: "MER/2024/1102",
        court: "Juzgado 7mo de Distrito Mercantil",
        type: "mercantil",
        status: "active",
        nextHearing: "2025-07-25",
        externalCounsel: "Despacho Garza & Asociados",
      },
      {
        id: "LIT-015",
        title: "Impugnación administrativa — resolución SAT",
        caseNumber: "ADM/2023/0489",
        court: "TFJA — Sala Regional Norte",
        type: "administrativo",
        status: "appeal",
        nextHearing: "2025-08-05",
      },
    ],
    recentDocuments: [
      {
        id: "DOC-L01",
        title: "Contrato marco estándar de servicios 2025",
        category: "contract_template",
        updatedAt: "2025-07-01",
        size: "380 KB",
        downloadUrl: "/docs/legal/contrato-marco-servicios-2025.docx",
        restricted: false,
      },
      {
        id: "DOC-L02",
        title: "Política de protección de datos personales",
        category: "policy",
        updatedAt: "2025-06-20",
        size: "520 KB",
        downloadUrl: "/docs/legal/politica-proteccion-datos.pdf",
        restricted: false,
      },
      {
        id: "DOC-L03",
        title: "Modelo de poder notarial general",
        category: "power_of_attorney",
        updatedAt: "2025-06-15",
        size: "210 KB",
        downloadUrl: "/docs/legal/modelo-poder-notarial.docx",
        restricted: true,
      },
      {
        id: "DOC-L04",
        title: "Guía de cumplimiento normativo 2025",
        category: "regulatory",
        updatedAt: "2025-06-10",
        size: "1.2 MB",
        downloadUrl: "/docs/legal/guia-cumplimiento-2025.pdf",
        restricted: false,
      },
      {
        id: "DOC-L05",
        title: "Formato de solicitud de revisión legal",
        category: "form",
        updatedAt: "2025-06-01",
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
        effectiveDate: "2025-09-01",
        area: "Privacidad",
        severity: "critical",
      },
      {
        id: "REG-02",
        title: "Actualización NOM-035 — Factores de riesgo psicosocial",
        description: "Segunda etapa de aplicación. Las empresas con más de 50 colaboradores deben completar evaluación antes del 31 de agosto.",
        effectiveDate: "2025-08-31",
        area: "Laboral",
        severity: "warning",
      },
      {
        id: "REG-03",
        title: "Modificación a la tasa de retención ISR 2025",
        description: "El SAT ajustó las tablas de retención aplicables desde julio. Revisar impacto en nómina y contratos vigentes.",
        effectiveDate: "2025-07-01",
        area: "Fiscal",
        severity: "info",
      },
    ],
    calendarEvents: [
      { id: "lc-1", title: "Audiencia — LIT-018 Junta Laboral",       date: "2025-07-18", type: "hearing"         },
      { id: "lc-2", title: "Vencimiento contrato SAP ERP",            date: "2025-07-20", type: "contract_expiry"  },
      { id: "lc-3", title: "Audiencia — LIT-017 Juzgado Mercantil",  date: "2025-07-25", type: "hearing"          },
      { id: "lc-4", title: "Vencimiento contrato Deloitte",           date: "2025-07-31", type: "contract_expiry"  },
      { id: "lc-5", title: "Plazo NOM-035 — evaluación obligatoria",  date: "2025-08-31", type: "deadline"         },
      { id: "lc-6", title: "Audiencia — LIT-015 TFJA",                date: "2025-08-05", type: "hearing"          },
    ],
  };
}