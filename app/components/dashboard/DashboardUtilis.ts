/**
 * @module DashboardUtils
 * Utilidades para el análisis y procesamiento de datos dentro del dashboard.
 *
 * @remarks
 * Este archivo centraliza funciones auxiliares relacionadas con la
 * interpretación de datos, permitiendo generar insights simples a partir
 * de estructuras utilizadas en componentes analíticos.
 *
 * Su objetivo es desacoplar la lógica de cálculo del componente visual,
 * facilitando reutilización, mantenimiento y escalabilidad.
 */

/**
 * Genera un insight textual basado en la evolución de una serie de datos.
 *
 * @param data Conjunto de datos a analizar.
 * @param dataKey Clave utilizada para extraer el valor numérico de cada elemento.
 * @returns Texto descriptivo que resume la tendencia del conjunto de datos.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Verifica si existen datos suficientes para el análisis.
 * 2. Extrae el primer y último valor de la serie usando `dataKey`.
 * 3. Calcula:
 *    - Diferencia absoluta (`diff`) entre el último y el primer valor.
 *    - Porcentaje de cambio (`pct`) relativo al valor inicial.
 * 4. Determina la tendencia:
 *    - Positiva si `diff > 0`.
 *    - Negativa si `diff < 0`.
 *    - Estable si no hay variación.
 * 5. Retorna un mensaje interpretativo basado en el resultado.
 *
 * Este método está diseñado para generar insights simples y rápidos,
 * ideales para dashboards donde se requiere una lectura inmediata
 * del comportamiento de una métrica.
 *
 * @example
 * ```ts
 * const data = [
 *   { name: "Ene", value: 100 },
 *   { name: "Feb", value: 120 },
 *   { name: "Mar", value: 140 },
 * ];
 *
 * const insight = calculateInsight(data, "value");
 * // "El rendimiento muestra una tendencia positiva de 40% durante el periodo analizado."
 * ```
 */
export function calculateInsight(
  data: Record<string, unknown>[],
  dataKey = "value"
): string {
  /**
   * Validación de datos disponibles.
   */
  if (!data?.length) {
    return "Sin datos suficientes para generar un análisis.";
  }

  /**
   * Valor inicial de la serie.
   */
  const first = Number(data[0]?.[dataKey]) || 0;

  /**
   * Valor final de la serie.
   */
  const last = Number(data[data.length - 1]?.[dataKey]) || 0;

  /**
   * Diferencia absoluta entre el valor final e inicial.
   */
  const diff = last - first;

  /**
   * Porcentaje de variación respecto al valor inicial.
   */
  const pct = first ? Math.abs(Math.round((diff / first) * 100)) : 0;

  /**
   * Evaluación de la tendencia y generación del mensaje.
   */
  if (diff > 0) {
    return `El rendimiento muestra una tendencia positiva de ${pct}% durante el periodo analizado.`;
  }

  if (diff < 0) {
    return `Se observa una disminución del ${pct}% comparado con el inicio del periodo.`;
  }

  return "El rendimiento se ha mantenido estable durante el periodo.";
}