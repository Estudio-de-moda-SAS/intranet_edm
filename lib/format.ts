/**
 * @module format
 * Utilidades generales de presentación para la intranet EDM: saludos
 * contextuales y formateo de fechas.
 *
 * @remarks
 * Funciones puras sin dependencias externas, reutilizables en cualquier
 * Server o Client Component. Cualquier lógica de presentación que no
 * pertenezca a un dominio específico (anuncios, reconocimientos, etc.)
 * debe centralizarse aquí.
 */

// ── Saludos ───────────────────────────────────────────────────────────────────

/**
 * Genera un saludo contextual en español según la hora local del servidor
 * en el momento de la invocación.
 *
 * @remarks
 * Los rangos horarios utilizados son:
 *
 * | Rango        | Saludo          |
 * |--------------|-----------------|
 * | 00:00–11:59  | ¡Buenos días    |
 * | 12:00–18:59  | ¡Buenas tardes  |
 * | 19:00–23:59  | ¡Buenas noches  |
 *
 * @param nombre - Nombre del colaborador a incluir en el saludo.
 *   Si se omite, se retorna únicamente la fórmula de cortesía.
 * @returns Cadena de saludo con signo de exclamación de cierre.
 *
 * @example
 * ```ts
 * saludo("Ana")  // "¡Buenos días, Ana!"  (si son las 9:00)
 * saludo()       // "¡Buenas tardes!"     (si son las 15:00)
 * ```
 */
export function saludo(nombre?: string): string {
  const h = new Date().getHours();
  const s =
    h < 12 ? "¡Buenos días" : h < 19 ? "¡Buenas tardes" : "¡Buenas noches";

  return `${s}${nombre ? ", " + nombre : ""}!`;
}

// ── Fechas ────────────────────────────────────────────────────────────────────

/**
 * Formatea una fecha ISO 8601 a una representación legible para la UI,
 * usando la configuración regional de Colombia por defecto.
 *
 * @remarks
 * Delega en {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat | Intl.DateTimeFormat}
 * con `dateStyle: "medium"`. Al activar `withTime`, añade `timeStyle: "short"`
 * para incluir la hora en formato HH:mm según el locale indicado.
 *
 * @param fechaISO - Fecha en formato ISO 8601
 *   (ej. `"2024-03-15"` o `"2024-03-15T10:30:00Z"`).
 * @param withTime - Si es `true`, incluye la hora en formato corto (HH:mm).
 *   Por defecto `false`.
 * @param locale   - Código BCP 47 del locale a usar para el formateo.
 *   Por defecto `"es-CO"`.
 * @returns Cadena de fecha formateada según el locale indicado.
 *
 * @example
 * ```ts
 * fmtFecha("2024-03-15")                     // "15 mar. 2024"
 * fmtFecha("2024-03-15T10:30:00Z", true)     // "15 mar. 2024, 10:30"
 * fmtFecha("2024-03-15", false, "en-US")     // "Mar 15, 2024"
 * ```
 */
export function fmtFecha(
  fechaISO: string,
  withTime = false,
  locale = "es-CO"
): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" } : {}),
  }).format(new Date(fechaISO));
}