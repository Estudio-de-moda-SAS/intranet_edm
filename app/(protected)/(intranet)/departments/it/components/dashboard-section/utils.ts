/**
 * @module ITDashboardSection/utils
 * Utilidades visuales del dashboard operativo de TI.
 */

/**
 * Determina el color de barra según el porcentaje de uso.
 *
 * @param v Valor porcentual a evaluar.
 * @returns Clase CSS para representar visualmente el nivel de uso.
 *
 * @remarks
 * Rangos:
 * - >= 80: alto
 * - >= 60: medio
 * - < 60: normal
 */
export function cpuColor(v: number) {
  if (v >= 80) return "bg-red-500";
  if (v >= 60) return "bg-amber-400";
  return "bg-emerald-400";
}