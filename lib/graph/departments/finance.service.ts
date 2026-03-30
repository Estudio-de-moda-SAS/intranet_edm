import { getSharedData, getToken } from "@/lib/graph/shared.service";
import { getHighPriorityTasks } from "@/lib/graph/helpers/todo.helper"

const IS_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

// ─── Types — Invoices ─────────────────────────────────────────────────────────

export type InvoiceStatus   = "Pendiente" | "Aprobada" | "Rechazada" | "Pagada" | "Vencida";
export type InvoiceCategory =
  | "Servicios TI"
  | "Logística"
  | "Marketing"
  | "Recursos Humanos"
  | "Infraestructura"
  | "Materiales"
  | "Consultoría";

export interface Invoice {
  id:               string;
  number:           string;
  concept:          string;
  supplier:         string;
  supplierNit:      string;
  supplierEmail:    string;
  category:         InvoiceCategory;
  issueDate:        string;
  due:              string;
  receivedDate:     string;
  amount:           number;
  tax:              number;
  status:           InvoiceStatus;
  approvedBy?:      string;
  rejectionReason?: string;
  notes?:           string;
  attachmentUrl?:   string;
}

// ─── Types — Expenses ─────────────────────────────────────────────────────────

export type ExpenseStatus =
  | "Borrador"
  | "Enviado"
  | "En revisión"
  | "Aprobado"
  | "Rechazado"
  | "Pagado";

export type ExpenseCategory =
  | "Viáticos"
  | "Transporte"
  | "Alojamiento"
  | "Alimentación"
  | "Tecnología"
  | "Papelería"
  | "Servicios"
  | "Mantenimiento"
  | "Marketing"
  | "Capacitación"
  | "Otros";

export type ExpenseDepartment =
  | "Finanzas"
  | "Logística"
  | "Marketing"
  | "Recursos Humanos"
  | "Tecnología"
  | "Comercial"
  | "Jurídica"
  | "Gerencia";

export const APPROVAL_THRESHOLDS = {
  AUTO:    500_000,
  MANAGER: 5_000_000,
} as const;

export interface Expense {
  id:               string;
  number:           string;
  concept:          string;
  category:         ExpenseCategory;
  department:       ExpenseDepartment;
  submittedBy:      string;
  submittedByEmail: string;
  amount:           number;
  date:             string;
  submittedAt:      string;
  status:           ExpenseStatus;
  approvalLevel:    "auto" | "manager" | "finance";
  approvedBy?:      string;
  approvedAt?:      string;
  rejectionReason?: string;
  notes?:           string;
  attachmentUrl?:   string;
}

// ─── Types — Budget ───────────────────────────────────────────────────────────

export type BudgetQuarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type BudgetStatus  = 'healthy' | 'warning' | 'critical' | 'overbudget';

export interface BudgetLine {
  category: string;
  assigned: number;
  executed: number;
}

export interface DepartmentBudget {
  id:         string;
  department: string;
  area:       string;
  assignedQ1: number;
  assignedQ2: number;
  assignedQ3: number;
  assignedQ4: number;
  executedQ1: number;
  executedQ2: number;
  executedQ3: number;
  executedQ4: number;
  lines:      BudgetLine[];
  owner:      string;
  ownerEmail: string;
  notes?:     string;
}

// ─── Types — Reports ──────────────────────────────────────────────────────────

export type ReportStatus = 'Completado' | 'Pendiente' | 'En revisión' | 'Archivado';
export type ReportType   =
  | 'Cierre mensual'
  | 'Proyección'
  | 'Análisis de gastos'
  | 'Flujo de caja'
  | 'Balance general'
  | 'Estado de resultados'
  | 'Presupuesto vs real'
  | 'Informe ejecutivo';
export type ReportPeriod = 'Mensual' | 'Trimestral' | 'Anual' | 'Ad hoc';

export interface StrategicReport {
  id:             string;
  title:          string;
  type:           ReportType;
  period:         ReportPeriod;
  status:         ReportStatus;
  date:           string;
  author:         string;
  pages?:         number;
  size?:          string;
  tags?:          string[];
  summary?:       string;
  attachmentUrl?: string;
}

export interface FinancialKpiTrend {
  month:    string;
  ingresos: number;
  gastos:   number;
  utilidad: number;
}

export interface StrategicAnalysis {
  currentMonth:     string;
  ingresosMes:      number;
  gastosMes:        number;
  utilidadMes:      number;
  margenNeto:       number;
  variacionMes:     number;
  trend:            FinancialKpiTrend[];
  topAlerts:        string[];
  topOpportunities: string[];
}

// ─── Types — Shared ───────────────────────────────────────────────────────────

export interface Budget {
  id:       string;
  area:     string;
  assigned: number;
  executed: number;
}

export interface FinanceAlert {
  id:       string;
  message:  string;
  severity: "high" | "medium" | "low";
}

export interface FinanceReport {
  id:     string;
  title:  string;
  status: "Completado" | "Pendiente";
  date:   string;
}

export interface FinanceKpis {
  ingresosMensuales:    string;
  gastosMensuales:      string;
  gananciaNeta:         string;
  facturasPendientes:   string;
  presupuestoEjecutado: string;
  porCobrar:            string;
  porPagar:             string;
  reportesMes:          string;
}

export type PaymentStatus =
  | 'Pendiente'     // factura aprobada, pago no iniciado
  | 'Programado'    // fecha de pago asignada
  | 'En proceso'    // transferencia iniciada en el banco
  | 'Completado'    // pago confirmado por el banco
  | 'Rechazado';    // error en la transferencia
 
export type PaymentMethod =
  | 'Transferencia ACH'
  | 'PSE'
  | 'Cheque'
  | 'Efectivo'
  | 'Tarjeta corporativa';
 
export interface Payment {
  id:             string;
  number:         string;         // "PG-2026-00021"
  invoiceId:      string;         // referencia a la factura origen
  invoiceNumber:  string;         // "FV-2025-00298"
  supplier:       string;
  supplierNit:    string;
  supplierBank:   string;
  supplierAccount: string;        // número de cuenta (enmascarado)
  amount:         number;         // monto total COP
  method:         PaymentMethod;
  status:         PaymentStatus;
  dueDate:        string;         // fecha límite de pago
  scheduledDate?: string;         // fecha programada
  paidDate?:      string;         // fecha real de pago
  reference?:     string;         // número de transacción bancaria
  approvedBy?:    string;
  notes?:         string;
}
 
export interface Supplier {
  id:            string;
  name:          string;
  nit:           string;
  email:         string;
  phone?:        string;
  category:      string;          // categoría principal de sus facturas
  bank:          string;
  accountType:   'Ahorros' | 'Corriente';
  account:       string;          // enmascarado: "****4821"
  totalPaid:     number;          // histórico total pagado COP
  totalPending:  number;          // pendiente por pagar COP
  invoiceCount:  number;
  lastPayment?:  string;          // ISO
  status:        'Activo' | 'Inactivo' | 'En revisión';
}

export type VendorType     = 'Proveedor de servicios' | 'Suministrador';
export type VendorStatus   = 'Activo' | 'Inactivo' | 'En revisión' | 'Bloqueado';
export type VendorCategory =
  | 'Servicios TI'
  | 'Logística'
  | 'Marketing'
  | 'Consultoría'
  | 'Infraestructura'
  | 'Materiales'
  | 'Recursos Humanos'
  | 'Telecomunicaciones'
  | 'Insumos de oficina'
  | 'Eventos';
 
export interface VendorContact {
  name:     string;
  role:     string;
  email:    string;
  phone?:   string;
}
 
export interface VendorDocument {
  id:          string;
  title:       string;
  type:        'Contrato' | 'RUT' | 'Cámara de comercio' | 'Certificado bancario' | 'Otro';
  uploadedAt:  string;
  expiresAt?:  string;
  attachmentUrl?: string;
}
 
export interface VendorScore {
  quality:     number;   // 1–5
  delivery:    number;   // 1–5
  pricing:     number;   // 1–5
  service:     number;   // 1–5
  compliance:  number;   // 1–5
  lastReview:  string;   // ISO
  reviewedBy:  string;
  notes?:      string;
}
 
export interface Vendor {
  id:            string;
  code:          string;           // "PROV-0042"
  name:          string;
  nit:           string;
  type:          VendorType;
  category:      VendorCategory;
  status:        VendorStatus;
  // Contacto principal
  email:         string;
  phone?:        string;
  address?:      string;
  city?:         string;
  contacts:      VendorContact[];
  // Datos bancarios
  bank:          string;
  accountType:   'Ahorros' | 'Corriente';
  account:       string;           // enmascarado
  // Métricas financieras (calculadas desde invoices/payments)
  totalBilled:   number;           // total facturado histórico COP
  totalPaid:     number;
  totalPending:  number;
  invoiceCount:  number;
  lastInvoice?:  string;           // ISO
  // Evaluación
  score?:        VendorScore;
  // Documentos
  documents:     VendorDocument[];
  // Metadata
  createdAt:     string;
  notes?:        string;
}

// ─── Budget helpers ───────────────────────────────────────────────────────────

export function getBudgetStatus(pct: number): BudgetStatus {
  if (pct >= 100) return 'overbudget';
  if (pct >= 90)  return 'critical';
  if (pct >= 75)  return 'warning';
  return 'healthy';
}

export function getBudgetForQuarter(b: DepartmentBudget, q: BudgetQuarter) {
  const assigned        = b[`assigned${q}` as keyof DepartmentBudget] as number;
  const executed        = b[`executed${q}` as keyof DepartmentBudget] as number;
  const available       = Math.max(0, assigned - executed);
  const pct             = assigned > 0 ? Math.round((executed / assigned) * 100) : 0;
  const qIndex          = ['Q1','Q2','Q3','Q4'].indexOf(q) + 1;
  const annualAssigned  = b.assignedQ1 + b.assignedQ2 + b.assignedQ3 + b.assignedQ4;
  const annualExecuted  = b.executedQ1 + b.executedQ2 + b.executedQ3 + b.executedQ4;
  const projectedAnnual = qIndex > 0 ? (annualExecuted / qIndex) * 4 : 0;
  const projectionPct   = annualAssigned > 0
    ? Math.round((projectedAnnual / annualAssigned) * 100) : 0;
  return { assigned, executed, available, pct, projectedAnnual, projectionPct, status: getBudgetStatus(pct) };
}

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'pg1', number: 'PG-2026-00021',
    invoiceId: 'i6', invoiceNumber: 'FV-2025-00260',
    supplier: 'Agencia Creativa Boom', supplierNit: '901.234.567-3',
    supplierBank: 'Bancolombia', supplierAccount: '****8821',
    amount: 9_758_000, method: 'Transferencia ACH',
    status: 'Pendiente', dueDate: '2026-03-20',
    approvedBy: 'Carolina Méndez',
    notes: 'Campaña digital Q1 — pago completo pendiente.',
  },
  {
    id: 'pg2', number: 'PG-2026-00022',
    invoiceId: 'i10', invoiceNumber: 'FV-2025-00290',
    supplier: 'Eventos & Protocolo SAS', supplierNit: '800.999.000-8',
    supplierBank: 'Davivienda', supplierAccount: '****3342',
    amount: 11_186_000, method: 'Transferencia ACH',
    status: 'Programado', dueDate: '2026-03-25',
    scheduledDate: '2026-03-22',
    approvedBy: 'Carolina Méndez',
  },
  {
    id: 'pg3', number: 'PG-2026-00023',
    invoiceId: 'i2', invoiceNumber: 'FV-2025-00315',
    supplier: 'CloudStack AWS Partner', supplierNit: '901.606.707-2',
    supplierBank: 'BBVA', supplierAccount: '****5571',
    amount: 2_201_500, method: 'Transferencia ACH',
    status: 'Programado', dueDate: '2026-03-28',
    scheduledDate: '2026-03-25',
    approvedBy: 'Paola Herrera',
  },
  {
    id: 'pg4', number: 'PG-2026-00018',
    invoiceId: 'i7', invoiceNumber: 'FV-2025-00241',
    supplier: 'Constructora Noreste S.A', supplierNit: '860.333.444-5',
    supplierBank: 'Bancolombia', supplierAccount: '****9914',
    amount: 38_080_000, method: 'Transferencia ACH',
    status: 'Completado', dueDate: '2026-02-28',
    scheduledDate: '2026-02-26', paidDate: '2026-02-26',
    reference: 'TRF-20260226-00441',
    approvedBy: 'Luis Herrera',
  },
  {
    id: 'pg5', number: 'PG-2026-00017',
    invoiceId: 'i4', invoiceNumber: 'FV-2025-00275',
    supplier: 'Strategy Partners Co.', supplierNit: '901.010.111-9',
    supplierBank: 'Itaú', supplierAccount: '****2287',
    amount: 2_439_500, method: 'PSE',
    status: 'Completado', dueDate: '2026-03-05',
    scheduledDate: '2026-03-03', paidDate: '2026-03-03',
    reference: 'PSE-20260303-88821',
    approvedBy: 'Andrés Rueda',
  },
  {
    id: 'pg6', number: 'PG-2026-00019',
    invoiceId: 'i11', invoiceNumber: 'FV-2025-00210',
    supplier: 'Telecom Empresarial SA', supplierNit: '860.202.303-1',
    supplierBank: 'Banco de Bogotá', supplierAccount: '****6643',
    amount: 2_618_000, method: 'Transferencia ACH',
    status: 'Completado', dueDate: '2026-02-15',
    scheduledDate: '2026-02-14', paidDate: '2026-02-14',
    reference: 'TRF-20260214-00389',
    approvedBy: 'Luis Herrera',
  },
  {
    id: 'pg7', number: 'PG-2026-00020',
    invoiceId: 'i12', invoiceNumber: 'FV-2025-00228',
    supplier: 'Office Depot Colombia', supplierNit: '890.555.666-6',
    supplierBank: 'Bancolombia', supplierAccount: '****1128',
    amount: 1_606_500, method: 'Tarjeta corporativa',
    status: 'Completado', dueDate: '2026-02-20',
    paidDate: '2026-02-19',
    reference: 'CORP-20260219-00112',
    approvedBy: 'Andrés Rueda',
  },
  {
    id: 'pg8', number: 'PG-2026-00024',
    invoiceId: 'i3', invoiceNumber: 'FV-2025-00330',
    supplier: 'Inmobiliaria Andina S.A.', supplierNit: '860.202.303-0',
    supplierBank: 'Davivienda', supplierAccount: '****7751',
    amount: 3_689_000, method: 'Transferencia ACH',
    status: 'En proceso', dueDate: '2026-03-28',
    scheduledDate: '2026-03-18',
    reference: 'TRF-20260318-00512',
    approvedBy: 'Paola Herrera',
  },
  {
    id: 'pg9', number: 'PG-2026-00025',
    invoiceId: 'i5', invoiceNumber: 'FV-2025-00341',
    supplier: 'Soluciones TI S.A.S', supplierNit: '900.123.456-1',
    supplierBank: 'Bancolombia', supplierAccount: '****3390',
    amount: 14_875_000, method: 'Transferencia ACH',
    status: 'Pendiente', dueDate: '2026-04-05',
    notes: 'En espera de validación del área TI antes de proceder.',
  },
  {
    id: 'pg10', number: 'PG-2026-00016',
    invoiceId: 'i8', invoiceNumber: 'FV-2025-00280',
    supplier: 'DataSecure Ltda', supplierNit: '902.777.888-7',
    supplierBank: 'BBVA', supplierAccount: '****4419',
    amount: 6_664_000, method: 'Transferencia ACH',
    status: 'Rechazado', dueDate: '2026-03-10',
    notes: 'Factura rechazada — pago cancelado. Pendiente nota crédito del proveedor.',
  },
];
 
export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 's1', name: 'LogiRápido Colombia Ltda', nit: '800.456.789-2',
    email: 'cuentas@logirapido.com.co', phone: '601 234 5678',
    category: 'Logística', bank: 'Bancolombia',
    accountType: 'Corriente', account: '****2241',
    totalPaid: 4_998_000, totalPending: 4_998_000,
    invoiceCount: 2, status: 'Activo',
  },
  {
    id: 's2', name: 'CloudStack AWS Partner', nit: '901.606.707-2',
    email: 'billing@cloudstack.co',
    category: 'Servicios TI', bank: 'BBVA',
    accountType: 'Corriente', account: '****5571',
    totalPaid: 0, totalPending: 2_201_500,
    invoiceCount: 1, lastPayment: '2026-03-03', status: 'Activo',
  },
  {
    id: 's3', name: 'Inmobiliaria Andina S.A.', nit: '860.202.303-0',
    email: 'pagos@inmoandina.co', phone: '601 987 6543',
    category: 'Infraestructura', bank: 'Davivienda',
    accountType: 'Corriente', account: '****7751',
    totalPaid: 0, totalPending: 3_689_000,
    invoiceCount: 1, status: 'Activo',
  },
  {
    id: 's4', name: 'Strategy Partners Co.', nit: '901.010.111-9',
    email: 'invoicing@strategypartners.co',
    category: 'Consultoría', bank: 'Itaú',
    accountType: 'Ahorros', account: '****2287',
    totalPaid: 2_439_500, totalPending: 0,
    invoiceCount: 1, lastPayment: '2026-03-03', status: 'Activo',
  },
  {
    id: 's5', name: 'Soluciones TI S.A.S', nit: '900.123.456-1',
    email: 'facturacion@solucionesti.co', phone: '601 555 1234',
    category: 'Servicios TI', bank: 'Bancolombia',
    accountType: 'Corriente', account: '****3390',
    totalPaid: 0, totalPending: 14_875_000,
    invoiceCount: 1, status: 'Activo',
  },
  {
    id: 's6', name: 'Agencia Creativa Boom', nit: '901.234.567-3',
    email: 'billing@agenciaboom.co',
    category: 'Marketing', bank: 'Bancolombia',
    accountType: 'Corriente', account: '****8821',
    totalPaid: 0, totalPending: 9_758_000,
    invoiceCount: 1, status: 'Activo',
  },
  {
    id: 's7', name: 'Constructora Noreste S.A', nit: '860.333.444-5',
    email: 'facturacion@noreste.co', phone: '604 321 9876',
    category: 'Infraestructura', bank: 'Bancolombia',
    accountType: 'Corriente', account: '****9914',
    totalPaid: 38_080_000, totalPending: 0,
    invoiceCount: 1, lastPayment: '2026-02-26', status: 'Activo',
  },
  {
    id: 's8', name: 'DataSecure Ltda', nit: '902.777.888-7',
    email: 'cobros@datasecure.co',
    category: 'Servicios TI', bank: 'BBVA',
    accountType: 'Corriente', account: '****4419',
    totalPaid: 0, totalPending: 0,
    invoiceCount: 1, status: 'En revisión',
  },
  {
    id: 's9', name: 'Eventos & Protocolo SAS', nit: '800.999.000-8',
    email: 'admin@eventosprotocolo.co', phone: '601 777 4321',
    category: 'Marketing', bank: 'Davivienda',
    accountType: 'Corriente', account: '****3342',
    totalPaid: 0, totalPending: 11_186_000,
    invoiceCount: 1, status: 'Activo',
  },
  {
    id: 's10', name: 'Proveedor Textil Andino', nit: '900.404.505-1',
    email: 'cuentas@textilAndino.co', phone: '604 888 2211',
    category: 'Materiales', bank: 'Banco de Bogotá',
    accountType: 'Corriente', account: '****6612',
    totalPaid: 0, totalPending: 32_725_000,
    invoiceCount: 1, status: 'Activo',
  },
  {
    id: 's11', name: 'Telecom Empresarial SA', nit: '860.202.303-1',
    email: 'factura@telecomempresarial.co',
    category: 'Infraestructura', bank: 'Banco de Bogotá',
    accountType: 'Corriente', account: '****6643',
    totalPaid: 2_618_000, totalPending: 0,
    invoiceCount: 1, lastPayment: '2026-02-14', status: 'Activo',
  },
  {
    id: 's12', name: 'Office Depot Colombia', nit: '890.555.666-6',
    email: 'ventas@officedepot.com.co', phone: '601 100 2233',
    category: 'Materiales', bank: 'Bancolombia',
    accountType: 'Corriente', account: '****1128',
    totalPaid: 1_606_500, totalPending: 0,
    invoiceCount: 1, lastPayment: '2026-02-19', status: 'Activo',
  },
];

export const MOCK_VENDORS: Vendor[] = [
  {
    id: 'v1', code: 'PROV-0001',
    name: 'LogiRápido Colombia Ltda',
    nit: '800.456.789-2',
    type: 'Suministrador',
    category: 'Logística',
    status: 'Activo',
    email: 'cuentas@logirapido.com.co',
    phone: '601 234 5678',
    address: 'Cra 30 #45-12 Bodega 8',
    city: 'Bogotá',
    contacts: [
      { name: 'Ricardo Lozano', role: 'Gerente comercial', email: 'r.lozano@logirapido.com.co', phone: '300 111 2233' },
      { name: 'Sandra Mora',    role: 'Cuentas por cobrar', email: 's.mora@logirapido.com.co' },
    ],
    bank: 'Bancolombia', accountType: 'Corriente', account: '****2241',
    totalBilled: 4_998_000, totalPaid: 4_200_000, totalPending: 798_000,
    invoiceCount: 2, lastInvoice: '2026-02-10',
    score: {
      quality: 4, delivery: 5, pricing: 3, service: 4, compliance: 5,
      lastReview: '2026-01-15', reviewedBy: 'Carlos Vargas',
      notes: 'Excelente cumplimiento en tiempos de entrega. Precio ligeramente alto vs mercado.',
    },
    documents: [
      { id: 'd1', title: 'Contrato marco 2026', type: 'Contrato', uploadedAt: '2026-01-05', expiresAt: '2026-12-31' },
      { id: 'd2', title: 'RUT vigente', type: 'RUT', uploadedAt: '2026-01-05' },
      { id: 'd3', title: 'Cámara de comercio', type: 'Cámara de comercio', uploadedAt: '2026-01-05', expiresAt: '2026-06-30' },
    ],
    createdAt: '2024-03-01',
  },
  {
    id: 'v2', code: 'PROV-0002',
    name: 'CloudStack AWS Partner',
    nit: '901.606.707-2',
    type: 'Proveedor de servicios',
    category: 'Servicios TI',
    status: 'Activo',
    email: 'billing@cloudstack.co',
    city: 'Bogotá',
    contacts: [
      { name: 'Felipe Ramos', role: 'Account Manager', email: 'f.ramos@cloudstack.co', phone: '310 555 8899' },
    ],
    bank: 'BBVA', accountType: 'Corriente', account: '****5571',
    totalBilled: 2_201_500, totalPaid: 0, totalPending: 2_201_500,
    invoiceCount: 1, lastInvoice: '2026-02-18',
    score: {
      quality: 5, delivery: 5, pricing: 3, service: 5, compliance: 5,
      lastReview: '2025-12-01', reviewedBy: 'Julián Ríos',
      notes: 'Servicio técnico excelente. Precios en USD — expuesto a TRM.',
    },
    documents: [
      { id: 'd4', title: 'Contrato de servicios cloud', type: 'Contrato', uploadedAt: '2025-06-01', expiresAt: '2027-05-31' },
      { id: 'd5', title: 'RUT vigente', type: 'RUT', uploadedAt: '2025-06-01' },
    ],
    createdAt: '2025-06-01',
  },
  {
    id: 'v3', code: 'PROV-0003',
    name: 'Inmobiliaria Andina S.A.',
    nit: '860.202.303-0',
    type: 'Proveedor de servicios',
    category: 'Infraestructura',
    status: 'Activo',
    email: 'pagos@inmoandina.co',
    phone: '601 987 6543',
    address: 'Av. El Dorado 92-31 Of. 502',
    city: 'Bogotá',
    contacts: [
      { name: 'Claudia Peña', role: 'Administradora', email: 'c.pena@inmoandina.co', phone: '315 777 4422' },
    ],
    bank: 'Davivienda', accountType: 'Corriente', account: '****7751',
    totalBilled: 3_689_000, totalPaid: 0, totalPending: 3_689_000,
    invoiceCount: 1, lastInvoice: '2026-02-25',
    score: {
      quality: 4, delivery: 4, pricing: 3, service: 3, compliance: 4,
      lastReview: '2025-11-01', reviewedBy: 'Paola Herrera',
    },
    documents: [
      { id: 'd6', title: 'Contrato de arrendamiento 2026', type: 'Contrato', uploadedAt: '2026-01-02', expiresAt: '2026-12-31' },
    ],
    createdAt: '2023-01-15',
    notes: 'Contrato de arrendamiento sede principal. Renovación anual.',
  },
  {
    id: 'v4', code: 'PROV-0004',
    name: 'Strategy Partners Co.',
    nit: '901.010.111-9',
    type: 'Proveedor de servicios',
    category: 'Consultoría',
    status: 'Activo',
    email: 'invoicing@strategypartners.co',
    city: 'Bogotá',
    contacts: [
      { name: 'Andrés Mejía',  role: 'Socio director', email: 'a.mejia@strategypartners.co', phone: '320 888 1122' },
    ],
    bank: 'Itaú', accountType: 'Ahorros', account: '****2287',
    totalBilled: 2_439_500, totalPaid: 2_439_500, totalPending: 0,
    invoiceCount: 1, lastInvoice: '2026-02-05',
    score: {
      quality: 5, delivery: 4, pricing: 2, service: 5, compliance: 5,
      lastReview: '2026-02-01', reviewedBy: 'Carolina Méndez',
      notes: 'Consultoría de alto valor pero tarifa elevada. Evaluar alternativas para proyectos menores.',
    },
    documents: [
      { id: 'd7', title: 'Contrato de consultoría Q1 2026', type: 'Contrato', uploadedAt: '2026-01-10', expiresAt: '2026-03-31' },
      { id: 'd8', title: 'RUT vigente', type: 'RUT', uploadedAt: '2026-01-10' },
    ],
    createdAt: '2025-01-20',
  },
  {
    id: 'v5', code: 'PROV-0005',
    name: 'Soluciones TI S.A.S',
    nit: '900.123.456-1',
    type: 'Proveedor de servicios',
    category: 'Servicios TI',
    status: 'Activo',
    email: 'facturacion@solucionesti.co',
    phone: '601 555 1234',
    city: 'Medellín',
    contacts: [
      { name: 'Jorge Salazar', role: 'Gerente de cuenta', email: 'j.salazar@solucionesti.co', phone: '312 444 9900' },
      { name: 'Ana Ríos',      role: 'Soporte técnico',  email: 'a.rios@solucionesti.co'    },
    ],
    bank: 'Bancolombia', accountType: 'Corriente', account: '****3390',
    totalBilled: 14_875_000, totalPaid: 0, totalPending: 14_875_000,
    invoiceCount: 1, lastInvoice: '2026-03-01',
    score: {
      quality: 4, delivery: 4, pricing: 4, service: 4, compliance: 5,
      lastReview: '2026-01-20', reviewedBy: 'Julián Ríos',
    },
    documents: [
      { id: 'd9',  title: 'Contrato de mantenimiento 2026', type: 'Contrato', uploadedAt: '2026-01-03', expiresAt: '2026-12-31' },
      { id: 'd10', title: 'Certificado bancario', type: 'Certificado bancario', uploadedAt: '2026-01-03' },
    ],
    createdAt: '2024-07-01',
  },
  {
    id: 'v6', code: 'PROV-0006',
    name: 'Agencia Creativa Boom',
    nit: '901.234.567-3',
    type: 'Proveedor de servicios',
    category: 'Marketing',
    status: 'Activo',
    email: 'billing@agenciaboom.co',
    city: 'Bogotá',
    contacts: [
      { name: 'Laura Serrano', role: 'Directora creativa', email: 'l.serrano@agenciaboom.co', phone: '317 222 5566' },
    ],
    bank: 'Bancolombia', accountType: 'Corriente', account: '****8821',
    totalBilled: 9_758_000, totalPaid: 0, totalPending: 9_758_000,
    invoiceCount: 1, lastInvoice: '2026-02-10',
    score: {
      quality: 5, delivery: 3, pricing: 3, service: 4, compliance: 4,
      lastReview: '2025-10-15', reviewedBy: 'Valentina Cruz',
      notes: 'Creatividad excepcional. Tiempos de entrega ajustados — requiere seguimiento.',
    },
    documents: [
      { id: 'd11', title: 'Contrato campaña Q1 2026', type: 'Contrato', uploadedAt: '2026-01-15', expiresAt: '2026-03-31' },
    ],
    createdAt: '2025-03-10',
  },
  {
    id: 'v7', code: 'PROV-0007',
    name: 'Constructora Noreste S.A',
    nit: '860.333.444-5',
    type: 'Suministrador',
    category: 'Infraestructura',
    status: 'Activo',
    email: 'facturacion@noreste.co',
    phone: '604 321 9876',
    address: 'Cll 80 #33-21',
    city: 'Medellín',
    contacts: [
      { name: 'Héctor Gómez', role: 'Director de proyectos', email: 'h.gomez@noreste.co', phone: '313 666 7788' },
    ],
    bank: 'Bancolombia', accountType: 'Corriente', account: '****9914',
    totalBilled: 38_080_000, totalPaid: 38_080_000, totalPending: 0,
    invoiceCount: 1, lastInvoice: '2026-01-28',
    score: {
      quality: 4, delivery: 4, pricing: 4, service: 4, compliance: 5,
      lastReview: '2026-02-28', reviewedBy: 'Luis Herrera',
    },
    documents: [
      { id: 'd12', title: 'Contrato de obra 2026',      type: 'Contrato',           uploadedAt: '2026-01-10', expiresAt: '2026-06-30' },
      { id: 'd13', title: 'Cámara de comercio',         type: 'Cámara de comercio', uploadedAt: '2026-01-10', expiresAt: '2026-09-15' },
      { id: 'd14', title: 'Certificado bancario',       type: 'Certificado bancario',uploadedAt: '2026-01-10' },
    ],
    createdAt: '2025-09-01',
  },
  {
    id: 'v8', code: 'PROV-0008',
    name: 'DataSecure Ltda',
    nit: '902.777.888-7',
    type: 'Proveedor de servicios',
    category: 'Servicios TI',
    status: 'En revisión',
    email: 'cobros@datasecure.co',
    city: 'Bogotá',
    contacts: [
      { name: 'Martín Pedraza', role: 'Ejecutivo de cuenta', email: 'm.pedraza@datasecure.co' },
    ],
    bank: 'BBVA', accountType: 'Corriente', account: '****4419',
    totalBilled: 6_664_000, totalPaid: 0, totalPending: 0,
    invoiceCount: 1, lastInvoice: '2026-02-14',
    documents: [
      { id: 'd15', title: 'RUT vigente', type: 'RUT', uploadedAt: '2025-08-01' },
    ],
    createdAt: '2025-08-01',
    notes: 'En revisión por discrepancia en cotización vs factura. Suspendido temporalmente.',
  },
  {
    id: 'v9', code: 'PROV-0009',
    name: 'Eventos & Protocolo SAS',
    nit: '800.999.000-8',
    type: 'Proveedor de servicios',
    category: 'Eventos',
    status: 'Activo',
    email: 'admin@eventosprotocolo.co',
    phone: '601 777 4321',
    city: 'Bogotá',
    contacts: [
      { name: 'Camila Torres', role: 'Coordinadora de eventos', email: 'c.torres@eventosprotocolo.co', phone: '314 333 6677' },
    ],
    bank: 'Davivienda', accountType: 'Corriente', account: '****3342',
    totalBilled: 11_186_000, totalPaid: 0, totalPending: 11_186_000,
    invoiceCount: 1, lastInvoice: '2026-02-20',
    score: {
      quality: 4, delivery: 4, pricing: 4, service: 5, compliance: 4,
      lastReview: '2025-12-10', reviewedBy: 'Valentina Cruz',
    },
    documents: [
      { id: 'd16', title: 'Contrato evento lanzamiento S/S', type: 'Contrato', uploadedAt: '2026-02-01', expiresAt: '2026-03-31' },
    ],
    createdAt: '2025-05-20',
  },
  {
    id: 'v10', code: 'PROV-0010',
    name: 'Proveedor Textil Andino',
    nit: '900.404.505-1',
    type: 'Suministrador',
    category: 'Materiales',
    status: 'Activo',
    email: 'cuentas@textilAndino.co',
    phone: '604 888 2211',
    address: 'Zona Industrial Itagüí, Bodega 12',
    city: 'Medellín',
    contacts: [
      { name: 'Rodrigo Arias',  role: 'Jefe de ventas',  email: 'r.arias@textilAndino.co',  phone: '311 999 0011' },
      { name: 'Patricia Vélez', role: 'Cartera',          email: 'p.velez@textilAndino.co'                       },
    ],
    bank: 'Banco de Bogotá', accountType: 'Corriente', account: '****6612',
    totalBilled: 32_725_000, totalPaid: 0, totalPending: 32_725_000,
    invoiceCount: 1, lastInvoice: '2026-03-02',
    score: {
      quality: 5, delivery: 4, pricing: 5, service: 4, compliance: 5,
      lastReview: '2026-01-10', reviewedBy: 'Valentina Cruz',
      notes: 'Mejor relación calidad/precio del catálogo. Proveedor estratégico para colecciones.',
    },
    documents: [
      { id: 'd17', title: 'Contrato marco suministro 2026', type: 'Contrato',           uploadedAt: '2026-01-08', expiresAt: '2026-12-31' },
      { id: 'd18', title: 'Cámara de comercio',            type: 'Cámara de comercio', uploadedAt: '2026-01-08', expiresAt: '2026-08-20' },
      { id: 'd19', title: 'RUT vigente',                   type: 'RUT',                uploadedAt: '2026-01-08' },
    ],
    createdAt: '2024-01-15',
    notes: 'Proveedor estratégico para línea de producción principal.',
  },
  {
    id: 'v11', code: 'PROV-0011',
    name: 'Telecom Empresarial SA',
    nit: '860.202.303-1',
    type: 'Proveedor de servicios',
    category: 'Telecomunicaciones',
    status: 'Activo',
    email: 'factura@telecomempresarial.co',
    city: 'Bogotá',
    contacts: [
      { name: 'Sandra Gil', role: 'Ejecutiva empresarial', email: 's.gil@telecomempresarial.co', phone: '601 100 5500' },
    ],
    bank: 'Banco de Bogotá', accountType: 'Corriente', account: '****6643',
    totalBilled: 2_618_000, totalPaid: 2_618_000, totalPending: 0,
    invoiceCount: 1, lastInvoice: '2026-01-15',
    score: {
      quality: 4, delivery: 5, pricing: 3, service: 4, compliance: 5,
      lastReview: '2025-09-01', reviewedBy: 'Julián Ríos',
    },
    documents: [
      { id: 'd20', title: 'Contrato corporativo telecomunicaciones', type: 'Contrato', uploadedAt: '2025-01-05', expiresAt: '2026-12-31' },
    ],
    createdAt: '2023-06-01',
  },
  {
    id: 'v12', code: 'PROV-0012',
    name: 'Office Depot Colombia',
    nit: '890.555.666-6',
    type: 'Suministrador',
    category: 'Insumos de oficina',
    status: 'Activo',
    email: 'ventas@officedepot.com.co',
    phone: '601 100 2233',
    city: 'Bogotá',
    contacts: [
      { name: 'Mario Cano', role: 'Asesor corporativo', email: 'm.cano@officedepot.com.co', phone: '318 200 4455' },
    ],
    bank: 'Bancolombia', accountType: 'Corriente', account: '****1128',
    totalBilled: 1_606_500, totalPaid: 1_606_500, totalPending: 0,
    invoiceCount: 1, lastInvoice: '2026-01-20',
    score: {
      quality: 4, delivery: 5, pricing: 4, service: 4, compliance: 5,
      lastReview: '2025-12-15', reviewedBy: 'Paola Herrera',
    },
    documents: [
      { id: 'd21', title: 'Acuerdo marco suministros', type: 'Contrato', uploadedAt: '2025-01-15', expiresAt: '2026-12-31' },
    ],
    createdAt: '2023-02-10',
  },
];


// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_DATA = {
  kpis: {
    ingresosMensuales:    "$120K",
    gastosMensuales:      "$80K",
    gananciaNeta:         "$40K",
    facturasPendientes:   "18",
    presupuestoEjecutado: "67%",
    porCobrar:            "$24.5K",
    porPagar:             "$11.2K",
    reportesMes:          "7",

  } satisfies FinanceKpis,

  alerts: [
    { id: "al1", message: "5 facturas vencidas sin gestionar",         severity: "high"   },
    { id: "al2", message: "$11.2K por pagar vence esta semana",        severity: "high"   },
    { id: "al3", message: "Presupuesto de marketing al 89% ejecutado", severity: "medium" },
    { id: "al4", message: "3 reportes pendientes de cierre mensual",   severity: "low"    },
  ] satisfies FinanceAlert[],
    payments:   MOCK_PAYMENTS,
    suppliers:  MOCK_SUPPLIERS,
    vendors: MOCK_VENDORS,
  invoices: [
    {
      id: "i1", number: "FV-2025-00298",
      concept: "Transporte y distribución nacional",
      supplier: "LogiRápido Colombia Ltda", supplierNit: "800.456.789-2",
      supplierEmail: "cuentas@logirapido.com.co", category: "Logística",
      issueDate: "2026-02-10", due: "2026-03-10", receivedDate: "2026-02-12",
      amount: 4200000, tax: 798000, status: "Vencida",
      notes: "Factura vencida — gestionar nota de cobro con el proveedor.",
    },
    {
      id: "i2", number: "FV-2025-00315",
      concept: "Servicios Cloud Azure — feb 2026",
      supplier: "CloudStack AWS Partner", supplierNit: "901.606.707-2",
      supplierEmail: "billing@cloudstack.co", category: "Servicios TI",
      issueDate: "2026-02-18", due: "2026-03-14", receivedDate: "2026-02-19",
      amount: 1850000, tax: 351500, status: "Pendiente",
    },
    {
      id: "i3", number: "FV-2025-00330",
      concept: "Arriendo oficinas Bogotá — marzo 2026",
      supplier: "Inmobiliaria Andina S.A.", supplierNit: "860.202.303-0",
      supplierEmail: "pagos@inmoandina.co", category: "Infraestructura",
      issueDate: "2026-02-25", due: "2026-03-15", receivedDate: "2026-02-26",
      amount: 3100000, tax: 589000, status: "Pendiente",
    },
    {
      id: "i4", number: "FV-2025-00275",
      concept: "Consultoría contable Q1 2026",
      supplier: "Strategy Partners Co.", supplierNit: "901.010.111-9",
      supplierEmail: "invoicing@strategypartners.co", category: "Consultoría",
      issueDate: "2026-02-05", due: "2026-03-20", receivedDate: "2026-02-06",
      amount: 2050000, tax: 389500, status: "Pagada", approvedBy: "Andrés Rueda",
    },
    {
      id: "i5", number: "FV-2025-00341",
      concept: "Mantenimiento plataforma ERP — marzo 2026",
      supplier: "Soluciones TI S.A.S", supplierNit: "900.123.456-1",
      supplierEmail: "facturacion@solucionesti.co", category: "Servicios TI",
      issueDate: "2026-03-01", due: "2026-04-01", receivedDate: "2026-03-03",
      amount: 12500000, tax: 2375000, status: "Pendiente",
      notes: "Mantenimiento mensual — requiere validación con área TI antes de aprobar.",
    },
    {
      id: "i6", number: "FV-2025-00260",
      concept: "Campaña digital Q1 2026",
      supplier: "Agencia Creativa Boom", supplierNit: "901.234.567-3",
      supplierEmail: "billing@agenciaboom.co", category: "Marketing",
      issueDate: "2026-02-10", due: "2026-03-12", receivedDate: "2026-02-12",
      amount: 8200000, tax: 1558000, status: "Aprobada", approvedBy: "Carolina Méndez",
    },
    {
      id: "i7", number: "FV-2025-00241",
      concept: "Adecuaciones sede principal",
      supplier: "Constructora Noreste S.A", supplierNit: "860.333.444-5",
      supplierEmail: "facturacion@noreste.co", category: "Infraestructura",
      issueDate: "2026-01-28", due: "2026-02-28", receivedDate: "2026-01-30",
      amount: 32000000, tax: 6080000, status: "Pagada", approvedBy: "Luis Herrera",
    },
    {
      id: "i8", number: "FV-2025-00280",
      concept: "Licencias antivirus corporativo — 50 equipos",
      supplier: "DataSecure Ltda", supplierNit: "902.777.888-7",
      supplierEmail: "cobros@datasecure.co", category: "Servicios TI",
      issueDate: "2026-02-14", due: "2026-03-16", receivedDate: "2026-02-15",
      amount: 5600000, tax: 1064000, status: "Rechazada",
      rejectionReason: "Valor superior al contrato marco vigente. Requiere cotización adicional.",
    },
    {
      id: "i9", number: "FV-2025-00338",
      concept: "Telas temporada otoño-invierno 2026",
      supplier: "Proveedor Textil Andino", supplierNit: "900.404.505-1",
      supplierEmail: "cuentas@textilAndino.co", category: "Materiales",
      issueDate: "2026-03-02", due: "2026-04-02", receivedDate: "2026-03-04",
      amount: 27500000, tax: 5225000, status: "Pendiente",
      notes: "Requiere validación con área de diseño antes de aprobar.",
    },
    {
      id: "i10", number: "FV-2025-00290",
      concept: "Evento lanzamiento colección S/S 2026",
      supplier: "Eventos & Protocolo SAS", supplierNit: "800.999.000-8",
      supplierEmail: "admin@eventosprotocolo.co", category: "Marketing",
      issueDate: "2026-02-20", due: "2026-03-22", receivedDate: "2026-02-21",
      amount: 9400000, tax: 1786000, status: "Aprobada", approvedBy: "Carolina Méndez",
      notes: "Segunda cuota — primera ya pagada el 15 feb.",
    },
    {
      id: "i11", number: "FV-2025-00210",
      concept: "Internet y telefonía empresarial — feb 2026",
      supplier: "Telecom Empresarial SA", supplierNit: "860.202.303-1",
      supplierEmail: "factura@telecomempresarial.co", category: "Infraestructura",
      issueDate: "2026-01-15", due: "2026-02-15", receivedDate: "2026-01-16",
      amount: 2200000, tax: 418000, status: "Pagada", approvedBy: "Luis Herrera",
    },
    {
      id: "i12", number: "FV-2025-00228",
      concept: "Suministros de oficina Q1 2026",
      supplier: "Office Depot Colombia", supplierNit: "890.555.666-6",
      supplierEmail: "ventas@officedepot.com.co", category: "Materiales",
      issueDate: "2026-01-20", due: "2026-02-20", receivedDate: "2026-01-22",
      amount: 1350000, tax: 256500, status: "Pagada", approvedBy: "Andrés Rueda",
    },
  ] satisfies Invoice[],

  budgets: [
    { id: "b1", area: "Marketing",   assigned: 40000, executed: 35600 },
    { id: "b2", area: "Operaciones", assigned: 60000, executed: 38200 },
    { id: "b3", area: "TI",          assigned: 30000, executed: 21000 },
    { id: "b4", area: "Comercial",   assigned: 50000, executed: 26500 },
  ] satisfies Budget[],

  reports: [
    { id: "r1", title: "Cierre febrero 2026",    status: "Completado", date: "2026-03-01" },
    { id: "r2", title: "Proyección Q1 2026",     status: "Pendiente",  date: "2026-03-15" },
    { id: "r3", title: "Informe de gastos TI",   status: "Pendiente",  date: "2026-03-12" },
    { id: "r4", title: "Análisis flujo de caja", status: "Completado", date: "2026-02-28" },
  ] satisfies FinanceReport[],

  expenses: [
    {
      id: "e1", number: "GS-2026-00041",
      concept: "Tiquetes aéreos — visita proveedor Medellín",
      category: "Transporte", department: "Logística",
      submittedBy: "Carlos Vargas", submittedByEmail: "c.vargas@estudiomoda.co",
      amount: 1_240_000, date: "2026-03-10", submittedAt: "2026-03-11",
      status: "Aprobado", approvalLevel: "manager",
      approvedBy: "Andrés Rueda", approvedAt: "2026-03-12",
    },
    {
      id: "e2", number: "GS-2026-00042",
      concept: "Hotel 2 noches — feria textil Bogotá",
      category: "Alojamiento", department: "Comercial",
      submittedBy: "Sofía Nieto", submittedByEmail: "s.nieto@estudiomoda.co",
      amount: 680_000, date: "2026-03-12", submittedAt: "2026-03-13",
      status: "En revisión", approvalLevel: "manager",
      notes: "Incluye desayuno. Factura adjunta.",
    },
    {
      id: "e3", number: "GS-2026-00043",
      concept: "Suscripción Adobe Creative Cloud — anual",
      category: "Tecnología", department: "Marketing",
      submittedBy: "Valentina Cruz", submittedByEmail: "v.cruz@estudiomoda.co",
      amount: 8_400_000, date: "2026-03-01", submittedAt: "2026-03-02",
      status: "Aprobado", approvalLevel: "finance",
      approvedBy: "Carolina Méndez", approvedAt: "2026-03-05",
      notes: "10 licencias equipo creativo.",
    },
    {
      id: "e4", number: "GS-2026-00044",
      concept: "Almuerzo de trabajo con cliente — Andino",
      category: "Alimentación", department: "Comercial",
      submittedBy: "Miguel Torres", submittedByEmail: "m.torres@estudiomoda.co",
      amount: 285_000, date: "2026-03-14", submittedAt: "2026-03-14",
      status: "Aprobado", approvalLevel: "auto",
      approvedBy: "Sistema automático", approvedAt: "2026-03-14",
    },
    {
      id: "e5", number: "GS-2026-00045",
      concept: "Reparación impresora sala de diseño",
      category: "Mantenimiento", department: "Tecnología",
      submittedBy: "Julián Ríos", submittedByEmail: "j.rios@estudiomoda.co",
      amount: 420_000, date: "2026-03-08", submittedAt: "2026-03-09",
      status: "Pagado", approvalLevel: "auto",
      approvedBy: "Sistema automático", approvedAt: "2026-03-09",
    },
    {
      id: "e6", number: "GS-2026-00046",
      concept: "Curso liderazgo — equipo RRHH",
      category: "Capacitación", department: "Recursos Humanos",
      submittedBy: "Laura Gómez", submittedByEmail: "l.gomez@estudiomoda.co",
      amount: 3_200_000, date: "2026-03-05", submittedAt: "2026-03-06",
      status: "Rechazado", approvalLevel: "manager",
      rejectionReason: "Presupuesto de capacitación Q1 agotado. Reprogramar para Q2.",
    },
    {
      id: "e7", number: "GS-2026-00047",
      concept: "Papelería y útiles oficina — marzo",
      category: "Papelería", department: "Finanzas",
      submittedBy: "Paola Herrera", submittedByEmail: "p.herrera@estudiomoda.co",
      amount: 198_000, date: "2026-03-15", submittedAt: "2026-03-15",
      status: "Aprobado", approvalLevel: "auto",
      approvedBy: "Sistema automático", approvedAt: "2026-03-15",
    },
    {
      id: "e8", number: "GS-2026-00048",
      concept: "Stand feria moda internacional — Corferias",
      category: "Marketing", department: "Marketing",
      submittedBy: "Valentina Cruz", submittedByEmail: "v.cruz@estudiomoda.co",
      amount: 18_500_000, date: "2026-03-03", submittedAt: "2026-03-04",
      status: "En revisión", approvalLevel: "finance",
      notes: "Incluye montaje, materiales y personal externo. Cotización adjunta.",
    },
    {
      id: "e9", number: "GS-2026-00049",
      concept: "Viáticos viaje Cali — reunión distribuidores",
      category: "Viáticos", department: "Comercial",
      submittedBy: "Miguel Torres", submittedByEmail: "m.torres@estudiomoda.co",
      amount: 950_000, date: "2026-03-17", submittedAt: "2026-03-17",
      status: "Enviado", approvalLevel: "manager",
    },
    {
      id: "e10", number: "GS-2026-00050",
      concept: "Servicio mensajería documentos legales",
      category: "Servicios", department: "Jurídica",
      submittedBy: "Ana Bermúdez", submittedByEmail: "a.bermudez@estudiomoda.co",
      amount: 145_000, date: "2026-03-10", submittedAt: "2026-03-10",
      status: "Pagado", approvalLevel: "auto",
      approvedBy: "Sistema automático", approvedAt: "2026-03-10",
    },
    {
      id: "e11", number: "GS-2026-00051",
      concept: "Consultoría estratégica transformación digital",
      category: "Servicios", department: "Gerencia",
      submittedBy: "Luis Herrera", submittedByEmail: "l.herrera@estudiomoda.co",
      amount: 22_000_000, date: "2026-03-01", submittedAt: "2026-03-02",
      status: "Borrador", approvalLevel: "finance",
      notes: "Pendiente de adjuntar propuesta final antes de enviar.",
    },
    {
      id: "e12", number: "GS-2026-00052",
      concept: "Taxi aeropuerto — viaje ejecutivo",
      category: "Transporte", department: "Gerencia",
      submittedBy: "Luis Herrera", submittedByEmail: "l.herrera@estudiomoda.co",
      amount: 85_000, date: "2026-03-16", submittedAt: "2026-03-16",
      status: "Pagado", approvalLevel: "auto",
      approvedBy: "Sistema automático", approvedAt: "2026-03-16",
    },
  ] satisfies Expense[],

  departmentBudgets: [
    {
      id: "db1", department: "Marketing", area: "Marketing",
      assignedQ1: 40_000_000, assignedQ2: 42_000_000, assignedQ3: 38_000_000, assignedQ4: 55_000_000,
      executedQ1: 35_600_000, executedQ2: 28_000_000, executedQ3: 0,          executedQ4: 0,
      owner: "Valentina Cruz", ownerEmail: "v.cruz@estudiomoda.co",
      notes: "Presupuesto Q4 elevado por temporada de lanzamientos.",
      lines: [
        { category: "Publicidad digital",      assigned: 18_000_000, executed: 15_200_000 },
        { category: "Eventos y activaciones",  assigned: 12_000_000, executed: 12_800_000 },
        { category: "Producción de contenido", assigned:  6_000_000, executed:  4_800_000 },
        { category: "Agencias externas",       assigned:  4_000_000, executed:  2_800_000 },
      ],
    },
    {
      id: "db2", department: "Logística", area: "Logística",
      assignedQ1: 60_000_000, assignedQ2: 60_000_000, assignedQ3: 65_000_000, assignedQ4: 60_000_000,
      executedQ1: 38_200_000, executedQ2: 41_000_000, executedQ3: 0,          executedQ4: 0,
      owner: "Carlos Vargas", ownerEmail: "c.vargas@estudiomoda.co",
      lines: [
        { category: "Transporte y distribución", assigned: 30_000_000, executed: 20_100_000 },
        { category: "Almacenamiento",            assigned: 15_000_000, executed: 10_200_000 },
        { category: "Importaciones",             assigned: 10_000_000, executed:  6_400_000 },
        { category: "Tecnología logística",      assigned:  5_000_000, executed:  1_500_000 },
      ],
    },
    {
      id: "db3", department: "Tecnología", area: "TI",
      assignedQ1: 30_000_000, assignedQ2: 30_000_000, assignedQ3: 30_000_000, assignedQ4: 32_000_000,
      executedQ1: 21_000_000, executedQ2: 18_500_000, executedQ3: 0,          executedQ4: 0,
      owner: "Julián Ríos", ownerEmail: "j.rios@estudiomoda.co",
      lines: [
        { category: "Infraestructura cloud",  assigned: 12_000_000, executed:  9_800_000 },
        { category: "Licencias de software",  assigned: 10_000_000, executed:  8_400_000 },
        { category: "Seguridad informática",  assigned:  5_000_000, executed:  2_100_000 },
        { category: "Hardware y equipos",     assigned:  3_000_000, executed:    700_000 },
      ],
    },
    {
      id: "db4", department: "Comercial", area: "Comercial",
      assignedQ1: 50_000_000, assignedQ2: 52_000_000, assignedQ3: 48_000_000, assignedQ4: 65_000_000,
      executedQ1: 26_500_000, executedQ2: 31_000_000, executedQ3: 0,          executedQ4: 0,
      owner: "Miguel Torres", ownerEmail: "m.torres@estudiomoda.co",
      lines: [
        { category: "Fuerza de ventas",  assigned: 20_000_000, executed: 11_200_000 },
        { category: "Viáticos y viajes", assigned: 12_000_000, executed:  8_300_000 },
        { category: "Material POP",      assigned: 10_000_000, executed:  5_400_000 },
        { category: "Incentivos",        assigned:  8_000_000, executed:  1_600_000 },
      ],
    },
    {
      id: "db5", department: "Recursos Humanos", area: "RRHH",
      assignedQ1: 25_000_000, assignedQ2: 25_000_000, assignedQ3: 28_000_000, assignedQ4: 30_000_000,
      executedQ1: 22_800_000, executedQ2: 19_000_000, executedQ3: 0,          executedQ4: 0,
      owner: "Laura Gómez", ownerEmail: "l.gomez@estudiomoda.co",
      notes: "Ejecución Q1 alta por proceso de reclutamiento masivo.",
      lines: [
        { category: "Capacitación y formación", assigned: 10_000_000, executed:  9_200_000 },
        { category: "Reclutamiento",            assigned:  8_000_000, executed:  8_600_000 },
        { category: "Bienestar laboral",        assigned:  4_000_000, executed:  3_200_000 },
        { category: "Nómina variable",          assigned:  3_000_000, executed:  1_800_000 },
      ],
    },
    {
      id: "db6", department: "Jurídica", area: "Jurídica",
      assignedQ1: 18_000_000, assignedQ2: 18_000_000, assignedQ3: 18_000_000, assignedQ4: 20_000_000,
      executedQ1: 14_200_000, executedQ2: 10_500_000, executedQ3: 0,          executedQ4: 0,
      owner: "Ana Bermúdez", ownerEmail: "a.bermudez@estudiomoda.co",
      lines: [
        { category: "Honorarios externos",  assigned: 10_000_000, executed: 8_400_000 },
        { category: "Litigios activos",     assigned:  5_000_000, executed: 4_200_000 },
        { category: "Registros y trámites", assigned:  3_000_000, executed: 1_600_000 },
      ],
    },
    {
      id: "db7", department: "Finanzas", area: "Finanzas",
      assignedQ1: 15_000_000, assignedQ2: 15_000_000, assignedQ3: 15_000_000, assignedQ4: 16_000_000,
      executedQ1: 11_400_000, executedQ2:  9_800_000, executedQ3: 0,          executedQ4: 0,
      owner: "Paola Herrera", ownerEmail: "p.herrera@estudiomoda.co",
      lines: [
        { category: "Auditoría externa",  assigned: 6_000_000, executed: 5_200_000 },
        { category: "Software contable",  assigned: 5_000_000, executed: 4_400_000 },
        { category: "Consultoría fiscal", assigned: 4_000_000, executed: 1_800_000 },
      ],
    },
    {
      id: "db8", department: "Gerencia", area: "Gerencia",
      assignedQ1: 20_000_000, assignedQ2: 20_000_000, assignedQ3: 22_000_000, assignedQ4: 25_000_000,
      executedQ1: 18_600_000, executedQ2: 14_000_000, executedQ3: 0,          executedQ4: 0,
      owner: "Luis Herrera", ownerEmail: "l.herrera@estudiomoda.co",
      lines: [
        { category: "Consultoría estratégica", assigned: 10_000_000, executed: 10_200_000 },
        { category: "Representación",          assigned:  6_000_000, executed:  5_400_000 },
        { category: "Membresías y gremios",    assigned:  4_000_000, executed:  3_000_000 },
      ],
    },
  ] satisfies DepartmentBudget[],

  // ── Strategic reports ─────────────────────────────────────────────────────
  strategicReports: [
    {
      id: 'rp1', title: 'Cierre financiero febrero 2026',
      type: 'Cierre mensual', period: 'Mensual',
      status: 'Completado', date: '2026-03-01',
      author: 'Paola Herrera', pages: 18, size: '3.2 MB',
      tags: ['cierre', 'feb-2026', 'validado'],
      summary: 'Cierre del período con utilidad neta de $40M COP. Ingresos superaron meta en 8%.',
    },
    {
      id: 'rp2', title: 'Proyección financiera Q2 2026',
      type: 'Proyección', period: 'Trimestral',
      status: 'Pendiente', date: '2026-03-15',
      author: 'Carolina Méndez', pages: 12,
      tags: ['proyección', 'Q2-2026'],
      summary: 'Estimación de ingresos y gastos para el segundo trimestre considerando estacionalidad.',
    },
    {
      id: 'rp3', title: 'Análisis de gastos TI — marzo 2026',
      type: 'Análisis de gastos', period: 'Mensual',
      status: 'En revisión', date: '2026-03-12',
      author: 'Julián Ríos', pages: 8, size: '1.1 MB',
      tags: ['TI', 'gastos', 'marzo'],
      summary: 'Revisión detallada del gasto tecnológico: licencias, cloud e infraestructura.',
    },
    {
      id: 'rp4', title: 'Análisis flujo de caja — feb 2026',
      type: 'Flujo de caja', period: 'Mensual',
      status: 'Completado', date: '2026-02-28',
      author: 'Paola Herrera', pages: 10, size: '2.1 MB',
      tags: ['flujo', 'feb-2026'],
      summary: 'Flujo operativo positivo con mejora del 12% respecto a enero. Cuentas por cobrar en control.',
    },
    {
      id: 'rp5', title: 'Balance general Q1 2026',
      type: 'Balance general', period: 'Trimestral',
      status: 'Pendiente', date: '2026-03-31',
      author: 'Carolina Méndez',
      tags: ['balance', 'Q1-2026'],
      summary: 'Consolidación de activos, pasivos y patrimonio al cierre del primer trimestre.',
    },
    {
      id: 'rp6', title: 'Estado de resultados enero 2026',
      type: 'Estado de resultados', period: 'Mensual',
      status: 'Completado', date: '2026-02-05',
      author: 'Paola Herrera', pages: 14, size: '2.8 MB',
      tags: ['P&L', 'ene-2026'],
      summary: 'Ingresos netos de $112M con margen operativo del 32%. Sin anomalías contables.',
    },
    {
      id: 'rp7', title: 'Presupuesto vs real — enero 2026',
      type: 'Presupuesto vs real', period: 'Mensual',
      status: 'Completado', date: '2026-02-10',
      author: 'Carolina Méndez', pages: 16, size: '2.5 MB',
      tags: ['presupuesto', 'varianza', 'ene-2026'],
      summary: 'Varianza positiva del 6% en ingresos. Marketing superó presupuesto en 14%.',
    },
    {
      id: 'rp8', title: 'Informe ejecutivo anual 2025',
      type: 'Informe ejecutivo', period: 'Anual',
      status: 'Archivado', date: '2026-01-15',
      author: 'Luis Herrera', pages: 42, size: '8.7 MB',
      tags: ['ejecutivo', 'anual', '2025', 'junta'],
      summary: 'Resumen estratégico del año fiscal 2025 para presentación ante junta directiva.',
    },
  ] satisfies StrategicReport[],

  // ── Strategic analysis ────────────────────────────────────────────────────
  strategicAnalysis: {
    currentMonth:    'Febrero 2026',
    ingresosMes:     120_000_000,
    gastosMes:        80_000_000,
    utilidadMes:      40_000_000,
    margenNeto:       33.3,
    variacionMes:     8.2,
    trend: [
      { month: 'Sep', ingresos:  98_000_000, gastos: 72_000_000, utilidad: 26_000_000 },
      { month: 'Oct', ingresos: 104_000_000, gastos: 75_000_000, utilidad: 29_000_000 },
      { month: 'Nov', ingresos: 115_000_000, gastos: 78_000_000, utilidad: 37_000_000 },
      { month: 'Dic', ingresos: 142_000_000, gastos: 95_000_000, utilidad: 47_000_000 },
      { month: 'Ene', ingresos: 110_000_000, gastos: 74_000_000, utilidad: 36_000_000 },
      { month: 'Feb', ingresos: 120_000_000, gastos: 80_000_000, utilidad: 40_000_000 },
    ],
    topAlerts: [
      'Marketing ejecutó 89% del presupuesto Q1 — riesgo de sobrecosto',
      '5 facturas vencidas pendientes de gestión por $19.9M COP',
      'Reclutamiento RRHH superó presupuesto asignado para Q1',
    ],
    topOpportunities: [
      'Margen neto mejoró 2.1pp vs enero — tendencia positiva sostenida',
      'TI tiene 30% del presupuesto Q1 disponible — oportunidad de inversión',
      'Flujo de caja operativo cubre 1.8x las obligaciones del próximo trimestre',
    ],
  } satisfies StrategicAnalysis,
};

// ── Service ───────────────────────────────────────────────────────────────────

export async function getFinanceData() {
  const shared = await getSharedData();

  if (IS_BYPASS) {
    return { ...shared, ...MOCK_DATA };
  }

  const token = await getToken();
const tasks = await getHighPriorityTasks(token)

const alerts: FinanceAlert[] = tasks.map(t => ({
  id:       t.id,
  message:  t.title,
  severity: "high" as const,
}))

  return {
    ...shared,
    // Cuando conectes el ERP real:
    //   invoices           → Dynamics 365: /data/VendorInvoiceHeaders
    //                      → Business Central: /api/v2.0/companies({id})/purchaseInvoices
    //   expenses           → Dynamics 365: /data/ExpenseReportHeaders?$expand=Lines
    //                      → Business Central: /api/v2.0/companies({id})/purchaseOrders
    //   departmentBudgets  → Dynamics 365: /data/BudgetPlanHeaders + /data/BudgetPlanLines
    //                      → Business Central: /api/v2.0/companies({id})/budgets
    //   strategicReports   → Dynamics 365: /data/FinancialReportHeaders
    //                      → SharePoint List o Power BI Embedded
    //   strategicAnalysis  → Cálculo en tiempo real desde los endpoints anteriores
    kpis:              MOCK_DATA.kpis,
    invoices:          MOCK_DATA.invoices,
    expenses:          MOCK_DATA.expenses,
    budgets:           MOCK_DATA.budgets,
    departmentBudgets: MOCK_DATA.departmentBudgets,
    reports:           MOCK_DATA.reports,
    strategicReports:  MOCK_DATA.strategicReports,
    strategicAnalysis: MOCK_DATA.strategicAnalysis,
    alerts:            alerts.length > 0 ? alerts : MOCK_DATA.alerts,
    payments:          MOCK_DATA.payments,
    suppliers:         MOCK_DATA.suppliers,
    vendors:           MOCK_DATA.vendors
  };
}

export type FinanceData = Awaited<ReturnType<typeof getFinanceData>>;