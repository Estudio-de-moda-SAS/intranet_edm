// lib/avatar.ts

/**
 * @module avatar
 * Utilidades de avatar reutilizadas en `UserMenu`, `PerfilPage` y cualquier
 * componente que necesite representar visualmente a un usuario sin foto.
 */

/**
 * Extrae las iniciales de un nombre completo.
 *
 * Toma la primera letra de cada palabra y devuelve las dos primeras en
 * mayúsculas. Útil como texto de fallback cuando el usuario no tiene foto
 * de perfil.
 *
 * @param name - Nombre completo del usuario (ej. `"Juan Esteban Avendaño"`).
 * @returns Cadena de hasta dos caracteres en mayúsculas (ej. `"JA"`).
 *
 * @example
 * ```ts
 * getInitials('Camila Torres')          // "CT"
 * getInitials('Sebastián Vargas Ruiz')  // "SV"
 * getInitials('Ana')                    // "A"
 * ```
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Genera un valor de tono (_hue_) HSL determinista a partir de un nombre.
 *
 * Aplica un hash djb2 simplificado sobre los caracteres del nombre y mapea
 * el resultado al rango `[240, 300)` (azules y violetas). El mismo nombre
 * produce siempre el mismo tono, garantizando consistencia visual entre
 * sesiones y componentes.
 *
 * @param name - Nombre completo del usuario.
 * @returns Entero en el rango `[240, 300)` que representa el ángulo de tono
 *   en el espacio de color HSL.
 *
 * @example
 * ```ts
 * nameToHue('Camila Torres')  // p. ej. 258
 * ```
 */
export function nameToHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 60 + 240;
}

/**
 * Genera un degradado CSS lineal personalizado a partir de un nombre.
 *
 * Usa {@link nameToHue} para derivar el tono base y construye un gradiente
 * de 135° entre dos tonos HSL adyacentes (+20° de diferencia). El resultado
 * puede asignarse directamente a la propiedad CSS `background` o
 * `backgroundImage` del elemento de avatar.
 *
 * @param name - Nombre completo del usuario.
 * @returns Cadena CSS `linear-gradient(...)` lista para usar como valor de
 *   `background` o `backgroundImage`.
 *
 * @example
 * ```ts
 * avatarGradient('Camila Torres')
 * // "linear-gradient(135deg, hsl(258,70%,55%), hsl(278,65%,45%))"
 * ```
 */
export function avatarGradient(name: string): string {
  const hue = nameToHue(name);
  return `linear-gradient(135deg, hsl(${hue},70%,55%), hsl(${hue + 20},65%,45%))`;
}