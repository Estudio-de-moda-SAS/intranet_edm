/**
 * @module utils
 * Utilidades de UI generales: composición de clases CSS y formateo de fechas
 * y saludos para la intranet EDM.
 */


// ── Saludos ───────────────────────────────────────────────────────────────────

/**
 * Genera un saludo contextual en español según la hora local del servidor.
 *
 * @remarks
 * Los rangos horarios utilizados son:
 * - **00:00 – 11:59** → "¡Buenos días"
 * - **12:00 – 18:59** → "¡Buenas tardes"
 * - **19:00 – 23:59** → "¡Buenas noches"
 *
 * @param nombre - Nombre del colaborador a incluir en el saludo.
 *   Si se omite, se devuelve únicamente la fórmula de cortesía.
 * @returns Cadena de saludo con signo de exclamación de cierre.
 *
 * @example
 * ```ts
 * saludo("Ana")    // "¡Buenos días, Ana!"
 * saludo()         // "¡Buenos días!"
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
 * Internamente delega en {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat | Intl.DateTimeFormat}
 * con `dateStyle: "medium"`. Con `withTime = true` añade `timeStyle: "short"`.
 *
 * @param fechaISO - Fecha en formato ISO 8601 (ej. `"2024-03-15T10:30:00Z"`).
 * @param withTime - Si es `true`, incluye la hora en formato corto (HH:mm).
 *   Por defecto `false`.
 * @param locale   - Código BCP del locale a usar. Por defecto `"es-CO"`.
 * @returns Cadena de fecha formateada según el locale indicado.
 *
 * @example
 * ```ts
 * fmtFecha("2024-03-15")                    // "15 mar. 2024"
 * fmtFecha("2024-03-15T10:30:00Z", true)    // "15 mar. 2024, 10:30"
 * fmtFecha("2024-03-15", false, "en-US")    // "Mar 15, 2024"
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

/**
 * @module cn
 * Utilidad de composición de clases CSS para la intranet EDM.
 *
 * @remarks
 * Implementación ligera equivalente a `clsx` sin dependencias externas.
 * Soporta strings, números, arrays anidados y objetos condicionales.
 * Úsala junto con Tailwind CSS para construir nombres de clase dinámicos
 * de forma legible y sin concatenaciones manuales.
 */

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Valor aceptado por {@link cn} como argumento de clase CSS.
 *
 * - `string | number`            → se incluye directamente.
 * - `null | undefined | false`   → se ignora.
 * - `ClassValue[]`               → se procesa de forma recursiva.
 * - `{ [key: string]: boolean }` → solo se incluyen las claves con valor `true`.
 */
export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | { [key: string]: boolean };

// ── Función principal ─────────────────────────────────────────────────────────

/**
 * Combina múltiples valores de clase CSS en una única cadena separada por
 * espacios, descartando valores falsy.
 *
 * @remarks
 * El orden de los argumentos se preserva en la cadena resultante,
 * lo que resulta relevante cuando Tailwind CSS aplica reglas de especificidad
 * basadas en posición (ej. combinación de `text-red-500` y `text-blue-500`).
 *
 * @param inputs - Uno o más valores de clase. Se aceptan strings, números,
 *   arrays anidados y objetos condicionales `{ clase: boolean }`.
 *   Los valores `null`, `undefined` y `false` se ignoran silenciosamente.
 * @returns Cadena con todas las clases activas separadas por un espacio,
 *   o `""` si no hay ninguna clase válida.
 *
 * @example
 * ```ts
 * cn("px-4 py-2", "rounded")
 * // → "px-4 py-2 rounded"
 *
 * cn("btn", isActive && "btn-active", null)
 * // → "btn btn-active"  (si isActive es true)
 * // → "btn"             (si isActive es false)
 *
 * cn({ "font-bold": true, "opacity-50": false })
 * // → "font-bold"
 *
 * cn(["text-sm", ["leading-tight"]])
 * // → "text-sm leading-tight"
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  inputs.forEach((input) => {
    if (!input) return;

    if (typeof input === "string" || typeof input === "number") {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      classes.push(cn(...input));
    } else if (typeof input === "object") {
      Object.entries(input).forEach(([key, value]) => {
        if (value) classes.push(key);
      });
    }
  });

  return classes.join(" ");
}