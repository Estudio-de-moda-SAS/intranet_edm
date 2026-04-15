/**
 * @module useDevSession
 * Hook de acceso directo a la sesión de desarrollo para la intranet EDM.
 *
 * @remarks
 * Expone {@link DEV_SESSION} únicamente cuando el bypass de autenticación
 * está activo (`NEXT_PUBLIC_AUTH_BYPASS === "true"`). En cualquier otro
 * entorno retorna `null`, garantizando que los datos de desarrollo nunca
 * sean accesibles en producción.
 *
 * Para la mayoría de los casos de uso en componentes de la intranet, se
 * recomienda {@link useAppSession} en lugar de este hook, ya que unifica
 * bypass y producción en una misma interfaz. `useDevSession` está pensado
 * exclusivamente para componentes de depuración o paneles de desarrollo
 * que necesitan acceso explícito e intencionado a la sesión mock.
 *
 * @example
 * ```tsx
 * // Panel de debug — solo visible en desarrollo
 * export function DevPanel() {
 *   const devSession = useDevSession();
 *
 *   if (!devSession) return null;
 *
 *   return (
 *     <pre>{JSON.stringify(devSession, null, 2)}</pre>
 *   );
 * }
 * ```
 */

'use client';

import { DEV_SESSION } from '@/lib/devSession';

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Retorna la sesión de desarrollo cuando el bypass de autenticación está
 * activo, o `null` en cualquier otro entorno.
 *
 * @remarks
 * La comprobación se realiza contra `NEXT_PUBLIC_AUTH_BYPASS`, variable
 * pública de Next.js reemplazada en tiempo de build. En producción el
 * condicional siempre evalúa a `false` y el bundle elimina la referencia
 * a {@link DEV_SESSION} mediante tree-shaking, por lo que los datos mock
 * nunca llegan al cliente en producción.
 *
 * Este hook no invoca `useSession()` de NextAuth ni realiza ninguna
 * petición de red — es una lectura síncrona de una constante de módulo.
 *
 * @returns {@link DEV_SESSION} si `NEXT_PUBLIC_AUTH_BYPASS === "true"`,
 *   `null` en cualquier otro entorno.
 *
 * @example
 * ```ts
 * const devSession = useDevSession();
 *
 * // Verificar que el bypass está activo antes de usar la sesión
 * if (!devSession) return;
 *
 * console.log(devSession.user.accessLevel); // "admin", "finance", etc.
 * ```
 */
export function useDevSession(): typeof DEV_SESSION | null {
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true') {
    return DEV_SESSION;
  }
  return null;
}

// ── Re-exportación ────────────────────────────────────────────────────────────

/**
 * Re-exportación de {@link DEV_SESSION} para acceso directo desde este
 * módulo sin necesidad de importar desde `devSession.ts`.
 *
 * @remarks
 * Útil en contextos donde se necesita la sesión mock fuera de un componente
 * React (ej. en utilidades de testing o scripts de seed), donde no es posible
 * invocar hooks.
 */
export { DEV_SESSION };