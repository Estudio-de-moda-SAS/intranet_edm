/**
 * @module api/finance
 * Cliente de API para el módulo de Finanzas de la intranet EDM.
 *
 * @remarks
 * Agrupa todas las consultas al backend relacionadas con el departamento
 * de Finanzas, delegando el transporte en {@link apiGet} del módulo
 * {@link module:api/client}.
 *
 * Cada método del objeto {@link financeApi} corresponde a un endpoint
 * específico y retorna el tipo exacto que el componente consumidor
 * necesita, evitando casteos manuales en la capa de UI.
 *
 * @example
 * ```ts
 * // En un Server Component:
 * const kpis      = await financeApi.getKPIs();
 * const dashboard = await financeApi.getDashboard();
 * ```
 */

import { apiGet }                              from "./client";
import type { FinanceKPIs, FinanceDashboard }  from "@/types/finance";

// ── API ───────────────────────────────────────────────────────────────────────

/**
 * Colección de métodos para consumir los endpoints del módulo de Finanzas.
 *
 * @remarks
 * Se define como objeto literal en lugar de funciones independientes para
 * agrupar semánticamente todos los endpoints del dominio y facilitar el
 * mocking en tests — basta con reemplazar `financeApi` completo.
 */
export const financeApi = {
  /**
   * Obtiene los indicadores clave de desempeño (KPIs) del área de Finanzas.
   *
   * @returns Promesa que resuelve con {@link FinanceKPIs}.
   * @throws `Error` si el endpoint responde con un código HTTP no exitoso.
   *
   * @example
   * ```ts
   * const kpis = await financeApi.getKPIs();
   * console.log(kpis.revenue, kpis.expenses);
   * ```
   */
  getKPIs: () => apiGet<FinanceKPIs>("/finance/kpis"),

  /**
   * Obtiene el agregado completo de datos para el dashboard de Finanzas.
   *
   * @remarks
   * Incluye KPIs, gráficas, tablas y cualquier dato adicional necesario
   * para renderizar la página principal del departamento de Finanzas.
   *
   * @returns Promesa que resuelve con {@link FinanceDashboard}.
   * @throws `Error` si el endpoint responde con un código HTTP no exitoso.
   *
   * @example
   * ```ts
   * const dashboard = await financeApi.getDashboard();
   * ```
   */
  getDashboard: () => apiGet<FinanceDashboard>("/finance/dashboard"),
};