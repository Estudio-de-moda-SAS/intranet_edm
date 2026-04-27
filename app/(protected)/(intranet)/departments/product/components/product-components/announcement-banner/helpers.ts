import { STORAGE_KEY } from "./config";

/**
 * @module ProductAnnouncementBanner/helpers
 * Helpers de persistencia y estado del banner.
 */

/**
 * Obtiene el conjunto de anuncios descartados desde `sessionStorage`.
 *
 * @returns Un conjunto con los identificadores de anuncios descartados.
 *
 * @remarks
 * Si el entorno no es navegador o ocurre un error al leer el storage,
 * la función devuelve un conjunto vacío.
 */
export function getDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set();

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

/**
 * Persiste en `sessionStorage` el conjunto de anuncios descartados.
 *
 * @param ids Conjunto de identificadores descartados.
 *
 * @remarks
 * En caso de error de escritura, la función falla silenciosamente
 * para no interrumpir la experiencia de usuario.
 */
export function saveDismissed(ids: Set<string>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // noop
  }
}