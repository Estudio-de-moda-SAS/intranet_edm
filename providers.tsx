/**
 * @module providers
 * Árbol de providers globales de la intranet EDM.
 *
 * @remarks
 * Envuelve toda la aplicación con los providers necesarios para el
 * funcionamiento de autenticación, caché de datos, animaciones y
 * configuración de apariencia. Es el componente raíz de contexto
 * montado en `app/layout.tsx`.
 *
 * **Providers incluidos (de exterior a interior):**
 * 1. **`SessionProvider`** (NextAuth) — disponible solo en modo producción.
 *    En modo bypass se omite completamente para evitar llamadas a
 *    `/api/auth/session` innecesarias.
 * 2. **`QueryClientProvider`** (TanStack Query) — gestión de caché y
 *    estado asíncrono para Client Components.
 * 3. **`MotionConfig`** (Framer Motion) — control global de animaciones
 *    sincronizado con las preferencias de apariencia del colaborador.
 * 4. **`SettingsInitializer`** — aplica dark mode, densidad, fuente y
 *    otras preferencias en cada navegación.
 *
 * **Sincronización de animaciones:**
 * El estado `animationsEnabled` se inicializa desde `localStorage` y se
 * mantiene sincronizado mediante dos listeners:
 * - `edm:animations` — evento personalizado disparado desde el panel de
 *   configuración cuando el colaborador cambia la preferencia en la misma
 *   pestaña.
 * - `storage` — evento nativo del navegador para sincronizar el cambio
 *   entre pestañas abiertas simultáneamente.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import Providers from "@/providers";
 *
 * export default async function RootLayout({ children }) {
 *   const session = await auth();
 *   return (
 *     <html>
 *       <body>
 *         <Providers session={session}>
 *           {children}
 *         </Providers>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */

"use client";

import { SessionProvider }                        from "next-auth/react";
import { Session }                                from "next-auth";
import { QueryClient, QueryClientProvider }       from "@tanstack/react-query";
import { ReactQueryDevtools }                     from "@tanstack/react-query-devtools";
import { useState, useEffect }                    from "react";
import { MotionConfig }                           from "framer-motion";
import { SettingsInitializer }                    from "@/app/components/SettingsInitializer";

// ── Constantes ────────────────────────────────────────────────────────────────

/**
 * `true` cuando el bypass de autenticación está activo.
 * Evaluado en tiempo de build — no cambia en tiempo de ejecución.
 *
 * @remarks
 * Cuando es `true`, el componente `SessionProvider` no se monta,
 * evitando llamadas a `/api/auth/session` y permitiendo el desarrollo
 * local sin Microsoft Entra ID.
 */
const isBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

/**
 * Clave de `localStorage` donde se persisten las preferencias de
 * apariencia del colaborador.
 *
 * @remarks
 * Debe coincidir con la clave usada en el hook `useSettings` y en
 * `SettingsInitializer`. Cambiar este valor requiere actualizar todas
 * las referencias en la aplicación.
 */
const STORAGE_KEY = "edm_intranet_settings";

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Props del componente {@link Providers}.
 */
export interface ProvidersProps {
  /** Árbol de componentes de la aplicación a envolver con los providers. */
  children: React.ReactNode;

  /**
   * Sesión inicial de NextAuth obtenida en el Server Component raíz
   * (`app/layout.tsx`) mediante `auth()`.
   *
   * @remarks
   * Pasar la sesión desde el servidor evita un flash de "no autenticado"
   * en la hidratación inicial del cliente. `null` indica que no hay
   * sesión activa. `undefined` delega la obtención de la sesión al
   * `SessionProvider` mediante fetch al cliente.
   */
  session?: Session | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Lee el estado de las animaciones desde `localStorage` de forma segura.
 *
 * @remarks
 * Retorna `true` (animaciones activas) en los siguientes casos:
 * - Ejecución en servidor (`window === "undefined"`).
 * - No hay preferencias guardadas en `localStorage`.
 * - Error al parsear el JSON almacenado.
 * - El campo `appearance.animations` no existe en las preferencias.
 *
 * Esta función se invoca tanto en la inicialización del componente
 * como en el listener del evento `storage` para mantener la sincronización
 * entre pestañas.
 *
 * @returns `true` si las animaciones están habilitadas, `false` si el
 *   colaborador las ha desactivado en sus preferencias de apariencia.
 */
function getAnimationsEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    return JSON.parse(raw)?.appearance?.animations ?? true;
  } catch {
    return true;
  }
}

// ── Componente principal ──────────────────────────────────────────────────────

/**
 * Árbol de providers globales que envuelve toda la intranet EDM.
 *
 * @remarks
 * Debe montarse como hijo directo del `<body>` en `app/layout.tsx`.
 * Es un Client Component (`"use client"`) porque gestiona estado de
 * animaciones que debe sincronizarse con eventos del navegador.
 *
 * **Configuración de TanStack Query:**
 * - `staleTime: 60s` — los datos se consideran frescos durante 1 minuto,
 *   reduciendo refetches innecesarios en navegaciones rápidas.
 * - `retry: 2` — reintenta peticiones fallidas hasta 2 veces antes de
 *   marcarlas como error.
 * - `refetchOnWindowFocus: false` — evita refetches automáticos al
 *   volver a la pestaña, priorizando los datos en caché.
 *
 * **Control de animaciones con Framer Motion:**
 * `MotionConfig` con `reducedMotion="always"` desactiva todas las
 * animaciones de Framer Motion globalmente cuando el colaborador las
 * ha deshabilitado en sus preferencias, sin necesidad de pasar props
 * a cada componente animado individualmente.
 *
 * @param props - Ver {@link ProvidersProps}.
 */
export default function Providers({ children, session }: ProvidersProps) {

  // ── TanStack Query client ─────────────────────────────────────────────────

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime:           1000 * 60,
            retry:               2,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  // ── Animaciones ───────────────────────────────────────────────────────────

  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  useEffect(() => {
    // Leer preferencia inicial desde localStorage
    setAnimationsEnabled(getAnimationsEnabled());

    /**
     * Listener del evento personalizado `edm:animations`.
     * Se dispara desde el panel de configuración cuando el colaborador
     * cambia la preferencia de animaciones en la pestaña actual.
     */
    const handleCustom = (e: Event) => {
      const enabled = (e as CustomEvent<{ enabled: boolean }>).detail.enabled;
      setAnimationsEnabled(enabled);
    };

    /**
     * Listener del evento nativo `storage`.
     * Se dispara cuando `localStorage` cambia en otra pestaña del
     * mismo origen, manteniendo la preferencia sincronizada entre
     * todas las pestañas abiertas de la intranet.
     */
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setAnimationsEnabled(getAnimationsEnabled());
    };

    window.addEventListener("edm:animations", handleCustom);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("edm:animations", handleCustom);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // ── Árbol de providers ────────────────────────────────────────────────────

  const content = (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion={animationsEnabled ? "never" : "always"}>
        {/* Aplica dark mode, densidad, fuente, etc. en cada navegación */}
        <SettingsInitializer />
        {children}
      </MotionConfig>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );

  // En modo bypass no se monta SessionProvider para evitar
  // llamadas a /api/auth/session innecesarias en desarrollo
  if (isBypass) return content;

  return (
    <SessionProvider session={session ?? null}>
      {content}
    </SessionProvider>
  );
}