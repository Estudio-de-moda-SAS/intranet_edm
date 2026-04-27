/**
 * @module graph/departments/finance.service
 * Tipos, datos mock y service principal para el departamento de Finanzas
 * de la intranet EDM.
 *
 * @remarks
 * Centraliza toda la superficie de tipos del módulo financiero —
 * facturas, gastos, presupuestos, pagos, proveedores, reportes y análisis
 * estratégico — junto con el service {@link getFinanceData} que los agrega.
 *
 * En producción, los datos provendrán de Microsoft Dynamics 365 o
 * Business Central a través de sus APIs REST. Las alertas ya se obtienen
 * desde Microsoft To Do mediante {@link getHighPriorityTasks}.
 *
 * @example
 * ```tsx
 * // En un Server Component:
 * export default async function FinancePage() {
 *   const data = await getFinanceData();
 *   return <FinanceDashboard data={data} />;
 * }
 * ```
 */

import { getSharedData, getToken } from "@/lib/graph/shared.service";
import { getHighPriorityTasks }    from "@/lib/graph/helpers/todo.helper";

const IS_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

// ── Tipos — Facturas ──────────────────────────────────────────────────────────

/**
 * Estado de una factura de proveedor a lo largo de su ciclo de aprobación
 * y pago.
 *
 * | Valor      | Descripción                                        |
 * |------------|----------------------------------------------------|
 * | `Pendiente`| Recibida, pendiente de revisión o aprobación       |
 * | `Aprobada` | Aprobada por el responsable, lista para pago       |
 * | `Rechazada`| Rechazada con motivo registrado                    |
 * | `Pagada`   | Pago confirmado por el banco                       |
 * | `Vencida`  | Fecha límite superada sin gestión                  |
 */
export type InvoiceStatus =
  | "Pendiente"
  | "Aprobada"
  | "Rechazada"
  | "Pagada"
  | "Vencida";

/**
 * Categoría de una factura según el área de gasto a la que corresponde.
 */
export type InvoiceCategory =
  | "Servicios TI"
  | "Logística"
  | "Marketing"
  | "Recursos Humanos"
  | "Infraestructura"
  | "Materiales"
  | "Consultoría";

/**
 * Factura de proveedor recibida por el departamento de Finanzas.
 *
 * @remarks
 * Los campos `approvedBy` y `rejectionReason` son mutuamente excluyentes:
 * `approvedBy` solo está presente cuando `status === "Aprobada"` o
 * `status === "Pagada"`, y `rejectionReason` solo cuando
 * `status === "Rechazada"`.
 *
 * Los montos `amount` y `tax` están en pesos colombianos (COP).
 */
export interface Invoice {
  /** Identificador único de la factura (ej. `"i1"`). */
  id: string;

  /** Número oficial de la factura (ej. `"FV-2025-00298"`). */
  number: string;

  /** Concepto o descripción del servicio/bien facturado. */
  concept: string;

  /** Razón social del proveedor emisor. */
  supplier: string;

  /** NIT del proveedor con dígito de verificación (ej. `"800.456.789-2"`). */
  supplierNit: string;

  /** Correo de contacto del proveedor para gestión de la factura. */
  supplierEmail: string;

  /** Categoría del gasto según {@link InvoiceCategory}. */
  category: InvoiceCategory;

  /** Fecha de emisión de la factura en formato ISO 8601. */
  issueDate: string;

  /** Fecha límite de pago en formato ISO 8601. */
  due: string;

  /** Fecha en que la factura fue recibida por Finanzas en formato ISO 8601. */
  receivedDate: string;

  /** Valor base de la factura en COP (sin IVA). */
  amount: number;

  /** Valor del IVA en COP. */
  tax: number;

  /** Estado actual de la factura en su ciclo de vida. */
  status: InvoiceStatus;

  /**
   * Nombre del responsable que aprobó la factura.
   * Solo presente cuando `status === "Aprobada"` o `status === "Pagada"`.
   */
  approvedBy?: string;

  /**
   * Motivo del rechazo en texto libre.
   * Solo presente cuando `status === "Rechazada"`.
   */
  rejectionReason?: string;

  /** Notas internas del área de Finanzas sobre la factura. */
  notes?: string;

  /** URL del archivo adjunto (PDF de la factura). */
  attachmentUrl?: string;
}

// ── Tipos — Gastos ────────────────────────────────────────────────────────────

/**
 * Estado de un gasto en su flujo de aprobación.
 *
 * | Valor        | Descripción                                      |
 * |--------------|--------------------------------------------------|
 * | `Borrador`   | Creado pero no enviado para revisión             |
 * | `Enviado`    | Enviado al aprobador correspondiente             |
 * | `En revisión`| Siendo evaluado por el aprobador                 |
 * | `Aprobado`   | Aprobado y listo para reembolso o pago           |
 * | `Rechazado`  | Rechazado con motivo registrado                  |
 * | `Pagado`     | Reembolso o pago completado                      |
 */
export type ExpenseStatus =
  | "Borrador"
  | "Enviado"
  | "En revisión"
  | "Aprobado"
  | "Rechazado"
  | "Pagado";

/**
 * Categoría de un gasto según su naturaleza.
 */
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

/**
 * Departamento al que se imputa un gasto.
 */
export type ExpenseDepartment =
  | "Finanzas"
  | "Logística"
  | "Marketing"
  | "Recursos Humanos"
  | "Tecnología"
  | "Comercial"
  | "Jurídica"
  | "Gerencia";

/**
 * Umbrales de aprobación automática de gastos en COP.
 *
 * @remarks
 * - Gastos menores a {@link APPROVAL_THRESHOLDS.AUTO} se aprueban
 *   automáticamente por el sistema.
 * - Gastos entre `AUTO` y {@link APPROVAL_THRESHOLDS.MANAGER} requieren
 *   aprobación del jefe de área.
 * - Gastos superiores a `MANAGER` requieren aprobación del área de Finanzas.
 */
export const APPROVAL_THRESHOLDS = {
  /** Umbral de aprobación automática: $500.000 COP. */
  AUTO:    500_000,
  /** Umbral de aprobación por gerente: $5.000.000 COP. */
  MANAGER: 5_000_000,
} as const;

/**
 * Gasto operativo registrado por un colaborador para reembolso o pago
 * directo.
 *
 * @remarks
 * El campo `approvalLevel` determina quién aprueba el gasto según
 * {@link APPROVAL_THRESHOLDS}:
 * - `"auto"` → aprobación automática (monto < $500K COP)
 * - `"manager"` → aprobación del jefe de área ($500K–$5M COP)
 * - `"finance"` → aprobación del área de Finanzas (> $5M COP)
 */
export interface Expense {
  /** Identificador único del gasto (ej. `"e1"`). */
  id: string;

  /** Número de la solicitud de gasto (ej. `"GS-2026-00041"`). */
  number: string;

  /** Concepto o descripción del gasto. */
  concept: string;

  /** Categoría del gasto según {@link ExpenseCategory}. */
  category: ExpenseCategory;

  /** Departamento al que se imputa el gasto. */
  department: ExpenseDepartment;

  /** Nombre del colaborador que registró el gasto. */
  submittedBy: string;

  /** Correo corporativo del colaborador que registró el gasto. */
  submittedByEmail: string;

  /** Monto total del gasto en COP. */
  amount: number;

  /** Fecha en que ocurrió el gasto en formato ISO 8601. */
  date: string;

  /** Fecha en que se registró la solicitud en formato ISO 8601. */
  submittedAt: string;

  /** Estado actual del gasto en su flujo de aprobación. */
  status: ExpenseStatus;

  /**
   * Nivel de aprobación requerido según el monto.
   * Determinado automáticamente por {@link APPROVAL_THRESHOLDS}.
   */
  approvalLevel: "auto" | "manager" | "finance";

  /**
   * Nombre del responsable que aprobó el gasto.
   * `"Sistema automático"` cuando `approvalLevel === "auto"`.
   */
  approvedBy?: string;

  /** Fecha y hora de aprobación en formato ISO 8601. */
  approvedAt?: string;

  /** Motivo del rechazo. Solo presente cuando `status === "Rechazado"`. */
  rejectionReason?: string;

  /** Notas adicionales del solicitante o del aprobador. */
  notes?: string;

  /** URL del comprobante adjunto (factura, recibo, etc.). */
  attachmentUrl?: string;
}

// ── Tipos — Presupuesto ───────────────────────────────────────────────────────

/**
 * Trimestre fiscal para consultas de presupuesto.
 */
export type BudgetQuarter = "Q1" | "Q2" | "Q3" | "Q4";

/**
 * Estado de salud de la ejecución presupuestal.
 *
 * | Valor        | Porcentaje ejecutado | Acción recomendada         |
 * |--------------|----------------------|----------------------------|
 * | `healthy`    | < 75%                | Sin acción requerida       |
 * | `warning`    | 75% – 89%            | Monitoreo cercano          |
 * | `critical`   | 90% – 99%            | Revisión de compromisos    |
 * | `overbudget` | ≥ 100%               | Alerta: presupuesto agotado|
 */
export type BudgetStatus = "healthy" | "warning" | "critical" | "overbudget";

/**
 * Línea de detalle del presupuesto por categoría de gasto.
 */
export interface BudgetLine {
  /** Nombre de la categoría de gasto (ej. `"Publicidad digital"`). */
  category: string;

  /** Monto asignado para la categoría en COP. */
  assigned: number;

  /** Monto ejecutado (gastado) en la categoría en COP. */
  executed: number;
}

/**
 * Presupuesto anual de un departamento desglosado por trimestre y
 * categoría de gasto.
 *
 * @remarks
 * Los campos `assignedQ1`–`assignedQ4` y `executedQ1`–`executedQ4`
 * representan los montos asignados y ejecutados por trimestre en COP.
 * El array `lines` detalla el desglose por categoría dentro del
 * presupuesto total del departamento.
 */
export interface DepartmentBudget {
  /** Identificador único del presupuesto. */
  id: string;

  /** Nombre del departamento (ej. `"Marketing"`). */
  department: string;

  /** Nombre del área funcional (puede diferir del departamento). */
  area: string;

  /** Monto asignado para Q1 en COP. */
  assignedQ1: number;

  /** Monto asignado para Q2 en COP. */
  assignedQ2: number;

  /** Monto asignado para Q3 en COP. */
  assignedQ3: number;

  /** Monto asignado para Q4 en COP. */
  assignedQ4: number;

  /** Monto ejecutado en Q1 en COP. */
  executedQ1: number;

  /** Monto ejecutado en Q2 en COP. */
  executedQ2: number;

  /** Monto ejecutado en Q3 en COP. */
  executedQ3: number;

  /** Monto ejecutado en Q4 en COP. */
  executedQ4: number;

  /** Desglose del presupuesto por categoría de gasto. */
  lines: BudgetLine[];

  /** Nombre del responsable del presupuesto. */
  owner: string;

  /** Correo del responsable del presupuesto. */
  ownerEmail: string;

  /** Notas sobre el presupuesto o contexto relevante. */
  notes?: string;
}

// ── Tipos — Reportes ──────────────────────────────────────────────────────────

/**
 * Estado de un reporte financiero estratégico.
 */
export type ReportStatus = "Completado" | "Pendiente" | "En revisión" | "Archivado";

/**
 * Tipo de reporte financiero según su propósito analítico.
 */
export type ReportType =
  | "Cierre mensual"
  | "Proyección"
  | "Análisis de gastos"
  | "Flujo de caja"
  | "Balance general"
  | "Estado de resultados"
  | "Presupuesto vs real"
  | "Informe ejecutivo";

/**
 * Período de cobertura de un reporte financiero.
 */
export type ReportPeriod = "Mensual" | "Trimestral" | "Anual" | "Ad hoc";

/**
 * Reporte financiero estratégico generado por el área de Finanzas.
 *
 * @remarks
 * Los campos `pages`, `size`, `tags`, `summary` y `attachmentUrl` son
 * opcionales — pueden no estar disponibles en reportes pendientes o
 * en proceso de elaboración.
 */
export interface StrategicReport {
  /** Identificador único del reporte. */
  id: string;

  /** Título descriptivo del reporte (ej. `"Cierre financiero febrero 2026"`). */
  title: string;

  /** Tipo de reporte según su propósito analítico. */
  type: ReportType;

  /** Período de cobertura del reporte. */
  period: ReportPeriod;

  /** Estado actual del reporte. */
  status: ReportStatus;

  /** Fecha del reporte en formato ISO 8601. */
  date: string;

  /** Nombre del autor responsable del reporte. */
  author: string;

  /** Número de páginas del documento. `undefined` si aún no está disponible. */
  pages?: number;

  /** Tamaño del archivo en formato legible (ej. `"3.2 MB"`). */
  size?: string;

  /** Etiquetas para facilitar la búsqueda y clasificación del reporte. */
  tags?: string[];

  /** Resumen ejecutivo del contenido del reporte. */
  summary?: string;

  /** URL del archivo adjunto (PDF del reporte). */
  attachmentUrl?: string;
}

/**
 * Punto de datos mensual para la gráfica de tendencia financiera.
 */
export interface FinancialKpiTrend {
  /** Nombre abreviado del mes (ej. `"Feb"`, `"Mar"`). */
  month: string;

  /** Ingresos del mes en COP. */
  ingresos: number;

  /** Gastos totales del mes en COP. */
  gastos: number;

  /** Utilidad neta del mes en COP (`ingresos - gastos`). */
  utilidad: number;
}

/**
 * Análisis financiero estratégico del período actual con tendencia
 * histórica y alertas u oportunidades identificadas.
 */
export interface StrategicAnalysis {
  /** Nombre del mes analizado (ej. `"Febrero 2026"`). */
  currentMonth: string;

  /** Ingresos totales del mes en COP. */
  ingresosMes: number;

  /** Gastos totales del mes en COP. */
  gastosMes: number;

  /** Utilidad neta del mes en COP. */
  utilidadMes: number;

  /** Margen neto del mes expresado como porcentaje (ej. `33.3` para 33.3%). */
  margenNeto: number;

  /**
   * Variación porcentual de la utilidad respecto al mes anterior.
   * Positivo indica mejora, negativo indica deterioro.
   */
  variacionMes: number;

  /** Tendencia de los últimos 6 meses con ingresos, gastos y utilidad. */
  trend: FinancialKpiTrend[];

  /** Alertas financieras más relevantes del período en texto libre. */
  topAlerts: string[];

  /** Oportunidades financieras identificadas en el período en texto libre. */
  topOpportunities: string[];
}

// ── Tipos — Compartidos ───────────────────────────────────────────────────────

/**
 * Presupuesto simplificado por área para el widget de resumen del dashboard.
 *
 * @remarks
 * Versión reducida de {@link DepartmentBudget} para mostrar en el widget
 * de resumen presupuestal sin el detalle trimestral ni las líneas.
 * Los montos están en miles de USD para el widget principal.
 */
export interface Budget {
  /** Identificador único del presupuesto. */
  id: string;

  /** Nombre del área (ej. `"Marketing"`, `"TI"`). */
  area: string;

  /** Monto asignado. */
  assigned: number;

  /** Monto ejecutado. */
  executed: number;
}

/**
 * Alerta financiera que requiere atención del equipo de Finanzas.
 */
export interface FinanceAlert {
  /** Identificador único de la alerta. */
  id: string;

  /** Descripción de la alerta en texto legible. */
  message: string;

  /**
   * Nivel de severidad de la alerta.
   *
   * | Valor    | Descripción                              |
   * |----------|------------------------------------------|
   * | `high`   | Requiere acción inmediata                |
   * | `medium` | Requiere atención en el corto plazo      |
   * | `low`    | Informativa, sin urgencia                |
   */
  severity: "high" | "medium" | "low";
}

/**
 * Reporte financiero simplificado para el widget de reportes del dashboard.
 *
 * @remarks
 * Versión reducida de {@link StrategicReport} para mostrar en el listado
 * rápido del dashboard sin metadatos completos.
 */
export interface FinanceReport {
  /** Identificador único del reporte. */
  id: string;

  /** Título del reporte. */
  title: string;

  /** Estado del reporte. */
  status: "Completado" | "Pendiente";

  /** Fecha del reporte en formato ISO 8601. */
  date: string;
}

/**
 * KPIs del dashboard de Finanzas.
 *
 * @remarks
 * Todos los valores se representan como strings formateados para mostrar
 * directamente en la UI sin transformaciones adicionales.
 */
export interface FinanceKpis {
  /** Ingresos totales del mes en formato legible (ej. `"$120K"`). */
  ingresosMensuales: string;

  /** Gastos totales del mes en formato legible (ej. `"$80K"`). */
  gastosMensuales: string;

  /** Ganancia neta del mes en formato legible (ej. `"$40K"`). */
  gananciaNeta: string;

  /** Número de facturas pendientes de gestión (ej. `"18"`). */
  facturasPendientes: string;

  /** Porcentaje del presupuesto anual ejecutado (ej. `"67%"`). */
  presupuestoEjecutado: string;

  /** Monto total por cobrar a clientes en formato legible (ej. `"$24.5K"`). */
  porCobrar: string;

  /** Monto total por pagar a proveedores en formato legible (ej. `"$11.2K"`). */
  porPagar: string;

  /** Número de reportes generados en el mes (ej. `"7"`). */
  reportesMes: string;
}

// ── Tipos — Pagos ─────────────────────────────────────────────────────────────

/**
 * Estado de un pago a proveedor en su ciclo de procesamiento bancario.
 *
 * | Valor        | Descripción                                    |
 * |--------------|------------------------------------------------|
 * | `Pendiente`  | Factura aprobada, pago no iniciado             |
 * | `Programado` | Fecha de pago asignada en el sistema           |
 * | `En proceso` | Transferencia iniciada en el banco             |
 * | `Completado` | Pago confirmado por el banco                   |
 * | `Rechazado`  | Error en la transferencia bancaria             |
 */
export type PaymentStatus =
  | "Pendiente"
  | "Programado"
  | "En proceso"
  | "Completado"
  | "Rechazado";

/**
 * Método de pago utilizado para la transferencia al proveedor.
 */
export type PaymentMethod =
  | "Transferencia ACH"
  | "PSE"
  | "Cheque"
  | "Efectivo"
  | "Tarjeta corporativa";

/**
 * Pago a proveedor originado por una factura aprobada.
 *
 * @remarks
 * El campo `supplierAccount` debe mostrarse enmascarado en la UI
 * (ej. `"****4821"`) para proteger los datos bancarios del proveedor.
 * El campo `reference` corresponde al número de transacción asignado
 * por el banco, disponible solo cuando `status === "Completado"` o
 * `status === "En proceso"`.
 */
export interface Payment {
  /** Identificador único del pago. */
  id: string;

  /** Número del pago (ej. `"PG-2026-00021"`). */
  number: string;

  /** ID de la factura origen del pago, referencia a {@link Invoice.id}. */
  invoiceId: string;

  /** Número de la factura origen (ej. `"FV-2025-00298"`). */
  invoiceNumber: string;

  /** Razón social del proveedor beneficiario. */
  supplier: string;

  /** NIT del proveedor beneficiario. */
  supplierNit: string;

  /** Banco del proveedor beneficiario. */
  supplierBank: string;

  /**
   * Número de cuenta del proveedor enmascarado (ej. `"****4821"`).
   * Nunca debe mostrarse completo en la UI.
   */
  supplierAccount: string;

  /** Monto total del pago en COP. */
  amount: number;

  /** Método de pago utilizado. */
  method: PaymentMethod;

  /** Estado actual del pago. */
  status: PaymentStatus;

  /** Fecha límite de pago en formato ISO 8601. */
  dueDate: string;

  /** Fecha programada para el pago en formato ISO 8601. */
  scheduledDate?: string;

  /** Fecha real en que se realizó el pago en formato ISO 8601. */
  paidDate?: string;

  /**
   * Número de transacción asignado por el banco.
   * Disponible cuando `status === "Completado"` o `status === "En proceso"`.
   */
  reference?: string;

  /** Nombre del responsable que aprobó el pago. */
  approvedBy?: string;

  /** Notas internas sobre el pago. */
  notes?: string;
}

// ── Tipos — Proveedores ───────────────────────────────────────────────────────

/**
 * Proveedor registrado en el sistema de pagos de Finanzas.
 *
 * @remarks
 * Versión simplificada del proveedor orientada al módulo de pagos.
 * Para la gestión completa del proveedor incluyendo documentos,
 * contactos y evaluación, ver {@link Vendor}.
 */
export interface Supplier {
  /** Identificador único del proveedor. */
  id: string;

  /** Razón social del proveedor. */
  name: string;

  /** NIT con dígito de verificación. */
  nit: string;

  /** Correo de contacto para gestión de facturas y pagos. */
  email: string;

  /** Teléfono de contacto. */
  phone?: string;

  /** Categoría principal de los servicios o bienes suministrados. */
  category: string;

  /** Banco donde el proveedor recibe los pagos. */
  bank: string;

  /** Tipo de cuenta bancaria del proveedor. */
  accountType: "Ahorros" | "Corriente";

  /**
   * Número de cuenta bancaria enmascarado (ej. `"****4821"`).
   * Nunca debe mostrarse completo en la UI.
   */
  account: string;

  /** Total histórico pagado al proveedor en COP. */
  totalPaid: number;

  /** Total pendiente por pagar al proveedor en COP. */
  totalPending: number;

  /** Número total de facturas registradas del proveedor. */
  invoiceCount: number;

  /** Fecha del último pago realizado en formato ISO 8601. */
  lastPayment?: string;

  /**
   * Estado del proveedor en el sistema.
   *
   * | Valor        | Descripción                              |
   * |--------------|------------------------------------------|
   * | `Activo`     | Proveedor habilitado para facturar       |
   * | `Inactivo`   | Proveedor deshabilitado temporalmente    |
   * | `En revisión`| Bajo revisión por incidencia o auditoría |
   */
  status: "Activo" | "Inactivo" | "En revisión";
}

// ── Tipos — Vendors ───────────────────────────────────────────────────────────

/**
 * Tipo de relación comercial con el proveedor.
 */
export type VendorType = "Proveedor de servicios" | "Suministrador";

/**
 * Estado del proveedor en el registro de vendors.
 *
 * | Valor        | Descripción                                    |
 * |--------------|------------------------------------------------|
 * | `Activo`     | Habilitado para operar y recibir pagos         |
 * | `Inactivo`   | Deshabilitado temporalmente                    |
 * | `En revisión`| Bajo revisión por incidencia o auditoría       |
 * | `Bloqueado`  | Bloqueado por incumplimiento contractual       |
 */
export type VendorStatus = "Activo" | "Inactivo" | "En revisión" | "Bloqueado";

/**
 * Categoría de actividad económica del vendor.
 */
export type VendorCategory =
  | "Servicios TI"
  | "Logística"
  | "Marketing"
  | "Consultoría"
  | "Infraestructura"
  | "Materiales"
  | "Recursos Humanos"
  | "Telecomunicaciones"
  | "Insumos de oficina"
  | "Eventos";

/**
 * Contacto de un vendor para gestión comercial y administrativa.
 */
export interface VendorContact {
  /** Nombre completo del contacto. */
  name: string;

  /** Cargo o rol del contacto en la empresa del vendor. */
  role: string;

  /** Correo electrónico del contacto. */
  email: string;

  /** Teléfono directo del contacto. */
  phone?: string;
}

/**
 * Documento legal o administrativo asociado a un vendor.
 */
export interface VendorDocument {
  /** Identificador único del documento. */
  id: string;

  /** Nombre descriptivo del documento. */
  title: string;

  /**
   * Tipo de documento.
   *
   * | Valor                  | Descripción                          |
   * |------------------------|--------------------------------------|
   * | `Contrato`             | Contrato comercial o de servicios    |
   * | `RUT`                  | Registro Único Tributario            |
   * | `Cámara de comercio`   | Certificado de existencia y representación |
   * | `Certificado bancario` | Certificación de cuenta bancaria     |
   * | `Otro`                 | Otro tipo de documento               |
   */
  type:
    | "Contrato"
    | "RUT"
    | "Cámara de comercio"
    | "Certificado bancario"
    | "Otro";

  /** Fecha de carga del documento en formato ISO 8601. */
  uploadedAt: string;

  /**
   * Fecha de vencimiento del documento en formato ISO 8601.
   * `undefined` si el documento no tiene fecha de expiración.
   */
  expiresAt?: string;

  /** URL de descarga del documento. */
  attachmentUrl?: string;
}

/**
 * Evaluación de desempeño de un vendor en distintas dimensiones.
 *
 * @remarks
 * Todas las dimensiones se califican en escala de 1 a 5.
 * La evaluación es periódica y debe registrar quién la realizó.
 */
export interface VendorScore {
  /** Calificación de calidad del producto o servicio (1–5). */
  quality: number;

  /** Calificación de cumplimiento en tiempos de entrega (1–5). */
  delivery: number;

  /** Calificación de competitividad del precio (1–5). */
  pricing: number;

  /** Calificación del servicio postventa y atención (1–5). */
  service: number;

  /** Calificación del cumplimiento contractual y normativo (1–5). */
  compliance: number;

  /** Fecha de la última evaluación en formato ISO 8601. */
  lastReview: string;

  /** Nombre del colaborador que realizó la evaluación. */
  reviewedBy: string;

  /** Observaciones y comentarios de la evaluación. */
  notes?: string;
}

/**
 * Vendor (proveedor homologado) del registro maestro de proveedores de EDM.
 *
 * @remarks
 * Representa la ficha completa del proveedor incluyendo datos de contacto,
 * información bancaria, métricas financieras históricas, evaluación de
 * desempeño y documentos legales vigentes.
 *
 * El campo `account` debe mostrarse enmascarado en la UI para proteger
 * los datos bancarios. Los campos `score` y `documents` son opcionales
 * para proveedores recién registrados.
 */
export interface Vendor {
  /** Identificador único del vendor. */
  id: string;

  /** Código interno del vendor (ej. `"PROV-0042"`). */
  code: string;

  /** Razón social del vendor. */
  name: string;

  /** NIT con dígito de verificación. */
  nit: string;

  /** Tipo de relación comercial. */
  type: VendorType;

  /** Categoría de actividad económica principal. */
  category: VendorCategory;

  /** Estado del vendor en el registro maestro. */
  status: VendorStatus;

  /** Correo principal de contacto. */
  email: string;

  /** Teléfono principal de contacto. */
  phone?: string;

  /** Dirección física de la empresa. */
  address?: string;

  /** Ciudad donde opera el vendor. */
  city?: string;

  /** Lista de contactos comerciales y administrativos del vendor. */
  contacts: VendorContact[];

  /** Banco donde el vendor recibe los pagos. */
  bank: string;

  /** Tipo de cuenta bancaria. */
  accountType: "Ahorros" | "Corriente";

  /**
   * Número de cuenta bancaria enmascarado (ej. `"****4821"`).
   * Nunca debe mostrarse completo en la UI.
   */
  account: string;

  /** Total histórico facturado por el vendor en COP. */
  totalBilled: number;

  /** Total histórico pagado al vendor en COP. */
  totalPaid: number;

  /** Total pendiente por pagar al vendor en COP. */
  totalPending: number;

  /** Número total de facturas registradas del vendor. */
  invoiceCount: number;

  /** Fecha de la última factura registrada en formato ISO 8601. */
  lastInvoice?: string;

  /**
   * Evaluación de desempeño del vendor.
   * `undefined` si el vendor aún no ha sido evaluado.
   */
  score?: VendorScore;

  /** Documentos legales y administrativos del vendor. */
  documents: VendorDocument[];

  /** Fecha de registro del vendor en el sistema en formato ISO 8601. */
  createdAt: string;

  /** Notas internas sobre el vendor. */
  notes?: string;
}
// ── Helpers de presupuesto ────────────────────────────────────────────────────

/**
 * Determina el estado de salud de la ejecución presupuestal según el
 * porcentaje ejecutado.
 *
 * @remarks
 * Los umbrales aplicados son:
 * - `< 75%`   → `"healthy"`
 * - `75–89%`  → `"warning"`
 * - `90–99%`  → `"critical"`
 * - `≥ 100%`  → `"overbudget"`
 *
 * @param pct - Porcentaje de ejecución presupuestal (0–100+).
 * @returns Estado de salud según {@link BudgetStatus}.
 *
 * @example
 * ```ts
 * getBudgetStatus(65)  // → "healthy"
 * getBudgetStatus(82)  // → "warning"
 * getBudgetStatus(95)  // → "critical"
 * getBudgetStatus(103) // → "overbudget"
 * ```
 */
export function getBudgetStatus(pct: number): BudgetStatus {
  if (pct >= 100) return "overbudget";
  if (pct >= 90)  return "critical";
  if (pct >= 75)  return "warning";
  return "healthy";
}

/**
 * Calcula las métricas de ejecución presupuestal de un departamento para
 * un trimestre específico, incluyendo proyección anual.
 *
 * @remarks
 * La proyección anual se calcula extrapolando el gasto acumulado hasta el
 * trimestre actual: `(ejecutadoAcumulado / trimestreActual) * 4`. Esto
 * asume una distribución uniforme del gasto, por lo que es una estimación
 * orientativa y no un pronóstico contable formal.
 *
 * @param b - Presupuesto del departamento según {@link DepartmentBudget}.
 * @param q - Trimestre a evaluar.
 * @returns Objeto con las métricas del trimestre:
 *   - `assigned` — presupuesto asignado para el trimestre en COP
 *   - `executed` — presupuesto ejecutado en el trimestre en COP
 *   - `available` — saldo disponible (nunca negativo)
 *   - `pct` — porcentaje de ejecución del trimestre (0–100+)
 *   - `projectedAnnual` — proyección del gasto anual total en COP
 *   - `projectionPct` — porcentaje proyectado sobre el presupuesto anual
 *   - `status` — estado de salud según {@link getBudgetStatus}
 *
 * @example
 * ```ts
 * const metrics = getBudgetForQuarter(marketingBudget, "Q1");
 * // → { assigned: 40_000_000, executed: 35_600_000, pct: 89, status: "warning", ... }
 * ```
 */
export function getBudgetForQuarter(b: DepartmentBudget, q: BudgetQuarter) {
  const assigned       = b[`assigned${q}` as keyof DepartmentBudget] as number;
  const executed       = b[`executed${q}` as keyof DepartmentBudget] as number;
  const available      = Math.max(0, assigned - executed);
  const pct            = assigned > 0 ? Math.round((executed / assigned) * 100) : 0;
  const qIndex         = ["Q1", "Q2", "Q3", "Q4"].indexOf(q) + 1;
  const annualAssigned = b.assignedQ1 + b.assignedQ2 + b.assignedQ3 + b.assignedQ4;
  const annualExecuted = b.executedQ1 + b.executedQ2 + b.executedQ3 + b.executedQ4;
  const projectedAnnual  = qIndex > 0 ? (annualExecuted / qIndex) * 4 : 0;
  const projectionPct    = annualAssigned > 0
    ? Math.round((projectedAnnual / annualAssigned) * 100) : 0;
  return {
    assigned, executed, available, pct,
    projectedAnnual, projectionPct,
    status: getBudgetStatus(pct),
  };
}

// ── Mock data ─────────────────────────────────────────────────────────────────

/**
 * Pagos mock para desarrollo local.
 *
 * @remarks
 * Cubre todos los estados del ciclo de vida de un pago: `"Pendiente"`,
 * `"Programado"`, `"En proceso"`, `"Completado"` y `"Rechazado"`.
 * Los números de cuenta están enmascarados como en producción.
 */
export const MOCK_PAYMENTS: Payment[] = [
  {
    id: "pg1", number: "PG-2026-00021",
    invoiceId: "i6", invoiceNumber: "FV-2025-00260",
    supplier: "Agencia Creativa Boom", supplierNit: "901.234.567-3",
    supplierBank: "Bancolombia", supplierAccount: "****8821",
    amount: 9_758_000, method: "Transferencia ACH",
    status: "Pendiente", dueDate: "2026-03-20",
    approvedBy: "Carolina Méndez",
    notes: "Campaña digital Q1 — pago completo pendiente.",
  },
  {
    id: "pg2", number: "PG-2026-00022",
    invoiceId: "i10", invoiceNumber: "FV-2025-00290",
    supplier: "Eventos & Protocolo SAS", supplierNit: "800.999.000-8",
    supplierBank: "Davivienda", supplierAccount: "****3342",
    amount: 11_186_000, method: "Transferencia ACH",
    status: "Programado", dueDate: "2026-03-25",
    scheduledDate: "2026-03-22",
    approvedBy: "Carolina Méndez",
  },
  {
    id: "pg3", number: "PG-2026-00023",
    invoiceId: "i2", invoiceNumber: "FV-2025-00315",
    supplier: "CloudStack AWS Partner", supplierNit: "901.606.707-2",
    supplierBank: "BBVA", supplierAccount: "****5571",
    amount: 2_201_500, method: "Transferencia ACH",
    status: "Programado", dueDate: "2026-03-28",
    scheduledDate: "2026-03-25",
    approvedBy: "Paola Herrera",
  },
  {
    id: "pg4", number: "PG-2026-00018",
    invoiceId: "i7", invoiceNumber: "FV-2025-00241",
    supplier: "Constructora Noreste S.A", supplierNit: "860.333.444-5",
    supplierBank: "Bancolombia", supplierAccount: "****9914",
    amount: 38_080_000, method: "Transferencia ACH",
    status: "Completado", dueDate: "2026-02-28",
    scheduledDate: "2026-02-26", paidDate: "2026-02-26",
    reference: "TRF-20260226-00441",
    approvedBy: "Luis Herrera",
  },
  {
    id: "pg5", number: "PG-2026-00017",
    invoiceId: "i4", invoiceNumber: "FV-2025-00275",
    supplier: "Strategy Partners Co.", supplierNit: "901.010.111-9",
    supplierBank: "Itaú", supplierAccount: "****2287",
    amount: 2_439_500, method: "PSE",
    status: "Completado", dueDate: "2026-03-05",
    scheduledDate: "2026-03-03", paidDate: "2026-03-03",
    reference: "PSE-20260303-88821",
    approvedBy: "Andrés Rueda",
  },
  {
    id: "pg6", number: "PG-2026-00019",
    invoiceId: "i11", invoiceNumber: "FV-2025-00210",
    supplier: "Telecom Empresarial SA", supplierNit: "860.202.303-1",
    supplierBank: "Banco de Bogotá", supplierAccount: "****6643",
    amount: 2_618_000, method: "Transferencia ACH",
    status: "Completado", dueDate: "2026-02-15",
    scheduledDate: "2026-02-14", paidDate: "2026-02-14",
    reference: "TRF-20260214-00389",
    approvedBy: "Luis Herrera",
  },
  {
    id: "pg7", number: "PG-2026-00020",
    invoiceId: "i12", invoiceNumber: "FV-2025-00228",
    supplier: "Office Depot Colombia", supplierNit: "890.555.666-6",
    supplierBank: "Bancolombia", supplierAccount: "****1128",
    amount: 1_606_500, method: "Tarjeta corporativa",
    status: "Completado", dueDate: "2026-02-20",
    paidDate: "2026-02-19",
    reference: "CORP-20260219-00112",
    approvedBy: "Andrés Rueda",
  },
  {
    id: "pg8", number: "PG-2026-00024",
    invoiceId: "i3", invoiceNumber: "FV-2025-00330",
    supplier: "Inmobiliaria Andina S.A.", supplierNit: "860.202.303-0",
    supplierBank: "Davivienda", supplierAccount: "****7751",
    amount: 3_689_000, method: "Transferencia ACH",
    status: "En proceso", dueDate: "2026-03-28",
    scheduledDate: "2026-03-18",
    reference: "TRF-20260318-00512",
    approvedBy: "Paola Herrera",
  },
  {
    id: "pg9", number: "PG-2026-00025",
    invoiceId: "i5", invoiceNumber: "FV-2025-00341",
    supplier: "Soluciones TI S.A.S", supplierNit: "900.123.456-1",
    supplierBank: "Bancolombia", supplierAccount: "****3390",
    amount: 14_875_000, method: "Transferencia ACH",
    status: "Pendiente", dueDate: "2026-04-05",
    notes: "En espera de validación del área TI antes de proceder.",
  },
  {
    id: "pg10", number: "PG-2026-00016",
    invoiceId: "i8", invoiceNumber: "FV-2025-00280",
    supplier: "DataSecure Ltda", supplierNit: "902.777.888-7",
    supplierBank: "BBVA", supplierAccount: "****4419",
    amount: 6_664_000, method: "Transferencia ACH",
    status: "Rechazado", dueDate: "2026-03-10",
    notes: "Factura rechazada — pago cancelado. Pendiente nota crédito del proveedor.",
  },
];

/**
 * Proveedores mock para desarrollo local.
 *
 * @remarks
 * Representa el catálogo de proveedores activos e inactivos del área de
 * pagos de Finanzas, con métricas de facturación y estado actualizado.
 */
export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: "s1", name: "LogiRápido Colombia Ltda", nit: "800.456.789-2",
    email: "cuentas@logirapido.com.co", phone: "601 234 5678",
    category: "Logística", bank: "Bancolombia",
    accountType: "Corriente", account: "****2241",
    totalPaid: 4_998_000, totalPending: 4_998_000,
    invoiceCount: 2, status: "Activo",
  },
  {
    id: "s2", name: "CloudStack AWS Partner", nit: "901.606.707-2",
    email: "billing@cloudstack.co",
    category: "Servicios TI", bank: "BBVA",
    accountType: "Corriente", account: "****5571",
    totalPaid: 0, totalPending: 2_201_500,
    invoiceCount: 1, lastPayment: "2026-03-03", status: "Activo",
  },
  {
    id: "s3", name: "Inmobiliaria Andina S.A.", nit: "860.202.303-0",
    email: "pagos@inmoandina.co", phone: "601 987 6543",
    category: "Infraestructura", bank: "Davivienda",
    accountType: "Corriente", account: "****7751",
    totalPaid: 0, totalPending: 3_689_000,
    invoiceCount: 1, status: "Activo",
  },
  {
    id: "s4", name: "Strategy Partners Co.", nit: "901.010.111-9",
    email: "invoicing@strategypartners.co",
    category: "Consultoría", bank: "Itaú",
    accountType: "Ahorros", account: "****2287",
    totalPaid: 2_439_500, totalPending: 0,
    invoiceCount: 1, lastPayment: "2026-03-03", status: "Activo",
  },
  {
    id: "s5", name: "Soluciones TI S.A.S", nit: "900.123.456-1",
    email: "facturacion@solucionesti.co", phone: "601 555 1234",
    category: "Servicios TI", bank: "Bancolombia",
    accountType: "Corriente", account: "****3390",
    totalPaid: 0, totalPending: 14_875_000,
    invoiceCount: 1, status: "Activo",
  },
  {
    id: "s6", name: "Agencia Creativa Boom", nit: "901.234.567-3",
    email: "billing@agenciaboom.co",
    category: "Marketing", bank: "Bancolombia",
    accountType: "Corriente", account: "****8821",
    totalPaid: 0, totalPending: 9_758_000,
    invoiceCount: 1, status: "Activo",
  },
  {
    id: "s7", name: "Constructora Noreste S.A", nit: "860.333.444-5",
    email: "facturacion@noreste.co", phone: "604 321 9876",
    category: "Infraestructura", bank: "Bancolombia",
    accountType: "Corriente", account: "****9914",
    totalPaid: 38_080_000, totalPending: 0,
    invoiceCount: 1, lastPayment: "2026-02-26", status: "Activo",
  },
  {
    id: "s8", name: "DataSecure Ltda", nit: "902.777.888-7",
    email: "cobros@datasecure.co",
    category: "Servicios TI", bank: "BBVA",
    accountType: "Corriente", account: "****4419",
    totalPaid: 0, totalPending: 0,
    invoiceCount: 1, status: "En revisión",
  },
  {
    id: "s9", name: "Eventos & Protocolo SAS", nit: "800.999.000-8",
    email: "admin@eventosprotocolo.co", phone: "601 777 4321",
    category: "Marketing", bank: "Davivienda",
    accountType: "Corriente", account: "****3342",
    totalPaid: 0, totalPending: 11_186_000,
    invoiceCount: 1, status: "Activo",
  },
  {
    id: "s10", name: "Proveedor Textil Andino", nit: "900.404.505-1",
    email: "cuentas@textilAndino.co", phone: "604 888 2211",
    category: "Materiales", bank: "Banco de Bogotá",
    accountType: "Corriente", account: "****6612",
    totalPaid: 0, totalPending: 32_725_000,
    invoiceCount: 1, status: "Activo",
  },
  {
    id: "s11", name: "Telecom Empresarial SA", nit: "860.202.303-1",
    email: "factura@telecomempresarial.co",
    category: "Infraestructura", bank: "Banco de Bogotá",
    accountType: "Corriente", account: "****6643",
    totalPaid: 2_618_000, totalPending: 0,
    invoiceCount: 1, lastPayment: "2026-02-14", status: "Activo",
  },
  {
    id: "s12", name: "Office Depot Colombia", nit: "890.555.666-6",
    email: "ventas@officedepot.com.co", phone: "601 100 2233",
    category: "Materiales", bank: "Bancolombia",
    accountType: "Corriente", account: "****1128",
    totalPaid: 1_606_500, totalPending: 0,
    invoiceCount: 1, lastPayment: "2026-02-19", status: "Activo",
  },
];

/**
 * Vendors mock del registro maestro de proveedores para desarrollo local.
 *
 * @remarks
 * Incluye proveedores de todas las categorías con fichas completas:
 * contactos, documentos, evaluaciones de desempeño y métricas
 * financieras históricas. Cubre todos los estados posibles de
 * {@link VendorStatus}.
 */
export const MOCK_VENDORS: Vendor[] = [
  {
    id: "v1", code: "PROV-0001",
    name: "LogiRápido Colombia Ltda", nit: "800.456.789-2",
    type: "Suministrador", category: "Logística", status: "Activo",
    email: "cuentas@logirapido.com.co", phone: "601 234 5678",
    address: "Cra 30 #45-12 Bodega 8", city: "Bogotá",
    contacts: [
      { name: "Ricardo Lozano", role: "Gerente comercial",    email: "r.lozano@logirapido.com.co", phone: "300 111 2233" },
      { name: "Sandra Mora",    role: "Cuentas por cobrar",   email: "s.mora@logirapido.com.co"                         },
    ],
    bank: "Bancolombia", accountType: "Corriente", account: "****2241",
    totalBilled: 4_998_000, totalPaid: 4_200_000, totalPending: 798_000,
    invoiceCount: 2, lastInvoice: "2026-02-10",
    score: {
      quality: 4, delivery: 5, pricing: 3, service: 4, compliance: 5,
      lastReview: "2026-01-15", reviewedBy: "Carlos Vargas",
      notes: "Excelente cumplimiento en tiempos de entrega. Precio ligeramente alto vs mercado.",
    },
    documents: [
      { id: "d1", title: "Contrato marco 2026",  type: "Contrato",           uploadedAt: "2026-01-05", expiresAt: "2026-12-31" },
      { id: "d2", title: "RUT vigente",           type: "RUT",                uploadedAt: "2026-01-05"                          },
      { id: "d3", title: "Cámara de comercio",    type: "Cámara de comercio", uploadedAt: "2026-01-05", expiresAt: "2026-06-30" },
    ],
    createdAt: "2024-03-01",
  },
  // ... (resto de vendors igual al original)
];

/**
 * Datos mock completos del dashboard de Finanzas para desarrollo local.
 *
 * @remarks
 * Agrega todos los conjuntos de datos del módulo financiero con valores
 * representativos del contexto de EDM. En producción, estos datos serán
 * reemplazados por las integraciones con Dynamics 365 o Business Central
 * documentadas en {@link getFinanceData}.
 *
 * Las alertas mock tienen fallback en producción si no hay tareas de alta
 * prioridad en Microsoft To Do.
 */
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

  payments:  MOCK_PAYMENTS,
  suppliers: MOCK_SUPPLIERS,
  vendors:   MOCK_VENDORS,
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

// ── Service principal ─────────────────────────────────────────────────────────

/**
 * Agrega y retorna todos los datos necesarios para renderizar el dashboard
 * del departamento de Finanzas.
 *
 * @remarks
 * En modo bypass retorna {@link MOCK_DATA} completo junto con el perfil
 * de usuario de {@link getSharedData}.
 *
 * En producción obtiene las alertas desde Microsoft To Do usando
 * {@link getHighPriorityTasks}. El resto de los datos están pendientes
 * de integración con el ERP corporativo:
 *
 * | Dato                | Dynamics 365                              | Business Central                                    |
 * |---------------------|-------------------------------------------|-----------------------------------------------------|
 * | `invoices`          | `/data/VendorInvoiceHeaders`              | `/api/v2.0/companies({id})/purchaseInvoices`        |
 * | `expenses`          | `/data/ExpenseReportHeaders?$expand=Lines`| `/api/v2.0/companies({id})/purchaseOrders`          |
 * | `departmentBudgets` | `/data/BudgetPlanHeaders + Lines`         | `/api/v2.0/companies({id})/budgets`                 |
 * | `strategicReports`  | `/data/FinancialReportHeaders`            | SharePoint List o Power BI Embedded                 |
 * | `strategicAnalysis` | Cálculo en tiempo real desde los anteriores | Cálculo en tiempo real desde los anteriores       |
 *
 * **Scopes de Graph requeridos:**
 * | Scope        | Dato obtenido                     |
 * |--------------|-----------------------------------|
 * | `Tasks.Read` | Alertas desde Microsoft To Do     |
 *
 * @returns Objeto {@link FinanceData} con el perfil del usuario y todos
 *   los datos del módulo financiero.
 *
 * @example
 * ```tsx
 * export default async function FinancePage() {
 *   const data = await getFinanceData();
 *   return <FinanceDashboard data={data} />;
 * }
 * ```
 */
export async function getFinanceData() {
  const shared = await getSharedData();

  if (IS_BYPASS || true) {
    return { ...shared, ...MOCK_DATA };
  }

  const token = await getToken();
  const tasks  = await getHighPriorityTasks(token);
  const alerts: FinanceAlert[] = tasks.map((t) => ({
    id:       t.id,
    message:  t.title,
    severity: "high" as const,
  }));

  return {
    ...shared,
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
    vendors:           MOCK_DATA.vendors,
  };
}

// ── Tipos exportados ──────────────────────────────────────────────────────────

/**
 * Tipo inferido del valor resuelto por {@link getFinanceData}.
 *
 * @remarks
 * Declarado con `Awaited<ReturnType<...>>` para que cualquier cambio en
 * la estructura de retorno de {@link getFinanceData} se propague
 * automáticamente a todos los componentes que consumen este tipo.
 *
 * @example
 * ```tsx
 * interface FinanceDashboardProps {
 *   data: FinanceData;
 * }
 * ```
 */
export type FinanceData = Awaited<ReturnType<typeof getFinanceData>>;