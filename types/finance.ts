/**
 * @module types/finance
 * Tipos para el módulo financiero de la intranet EDM.
 *
 * @remarks
 * Define las estructuras de datos consumidas por el cliente de API
 * de Finanzas en `lib/api/finance.ts` — estos tipos representan la
 * respuesta de la API interna (`/finance/kpis`, `/finance/dashboard`),
 * no los datos de Microsoft Graph ni del ERP.
 *
 * Para los tipos del dashboard completo de Finanzas con facturas,
 * gastos, presupuestos y proveedores, ver
 * `lib/graph/departments/finance.service.ts`.
 */

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Transacción financiera individual registrada en el sistema.
 *
 * @remarks
 * Representa tanto ingresos como egresos. El campo `category` es un
 * string libre que corresponde a las categorías configuradas en la
 * API interna — no está restringido a un union type para permitir
 * extensibilidad sin cambios de tipos.
 */
export type FinanceTransaction = {
  /** Identificador único de la transacción. */
  id: string;

  /**
   * Tipo de movimiento financiero.
   *
   * | Valor     | Descripción          |
   * |-----------|----------------------|
   * | `income`  | Ingreso de dinero    |
   * | `expense` | Egreso o gasto       |
   */
  type: "income" | "expense";

  /**
   * Categoría de la transacción según la clasificación de la API
   * interna (ej. `"Ventas"`, `"Nómina"`, `"Servicios"`).
   */
  category: string;

  /** Monto de la transacción en la moneda base del sistema (COP). */
  amount: number;

  /** Fecha de la transacción en formato ISO 8601 (ej. `"2026-03-10"`). */
  date: string;
};

/**
 * Resumen financiero del período actual.
 *
 * @remarks
 * Agrupa los tres indicadores financieros principales para el widget
 * de resumen del dashboard. Todos los montos están en COP.
 */
export type FinanceSummary = {
  /** Saldo actual: diferencia entre ingresos y egresos del período. */
  balance: number;

  /** Total de ingresos del período en COP. */
  income: number;

  /** Total de egresos del período en COP. */
  expenses: number;
};

/**
 * Categoría de gasto o ingreso con su total acumulado en el período.
 *
 * @remarks
 * Usado para construir gráficas de distribución por categoría en el
 * dashboard financiero.
 */
export type FinanceCategory = {
  /** Nombre de la categoría (ej. `"Nómina"`, `"Servicios TI"`). */
  name: string;

  /** Total acumulado de la categoría en el período en COP. */
  total: number;
};

/**
 * KPIs financieros del período para el widget de indicadores.
 *
 * @remarks
 * Retornado por el endpoint `/finance/kpis` de la API interna a través
 * de `financeApi.getKPIs()`. Todos los montos están en COP.
 */
export type FinanceKPIs = {
  /** Saldo actual del período en COP. */
  balance: number;

  /** Total de ingresos del período en COP. */
  income: number;

  /** Total de egresos del período en COP. */
  expenses: number;

  /** Número total de transacciones registradas en el período. */
  transactions: number;
};

/**
 * Agregado completo del dashboard financiero retornado por la API interna.
 *
 * @remarks
 * Retornado por el endpoint `/finance/dashboard` a través de
 * `financeApi.getDashboard()`. Incluye el resumen del período, el
 * listado de transacciones recientes y el desglose por categoría
 * para las gráficas del dashboard.
 */
export type FinanceDashboard = {
  /** Resumen financiero del período actual. */
  summary: FinanceSummary;

  /** Transacciones recientes del período ordenadas por fecha descendente. */
  transactions: FinanceTransaction[];

  /** Desglose de totales por categoría para las gráficas de distribución. */
  categories: FinanceCategory[];
};