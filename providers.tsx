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
 * 1. **`MsalProvider`** — disponible solo en modo producción. Inicializa
 *    la instancia de MSAL Browser y expone el contexto de autenticación
 *    a todos los componentes cliente. En modo bypass se omite para evitar
 *    llamadas a Azure innecesarias.
 * 2. **`QueryClientProvider`** (TanStack Query) — gestión de caché y
 *    estado asíncrono para Client Components.
 * 3. **`MotionConfig`** (Framer Motion) — control global de animaciones
 *    sincronizado con las preferencias de apariencia del colaborador.
 * 4. **`SettingsInitializer`** — aplica dark mode, densidad, fuente y
 *    otras preferencias en cada navegación.
 *
 * **Cambio respecto a la versión NextAuth:**
 * `SessionProvider` fue reemplazado por `MsalProvider`. La prop `session`
 * fue eliminada — MSAL gestiona su propio estado de sesión en `localStorage`
 * sin necesidad de inyección desde el servidor.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import Providers from "@/providers";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <Providers>{children}</Providers>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */

"use client";

import { MsalProvider }                         from "@azure/msal-react";
import { msal }                                 from "@/app/api/auth/msal";
import { QueryClient, QueryClientProvider }     from "@tanstack/react-query";
import { ReactQueryDevtools }                   from "@tanstack/react-query-devtools";
import { useState, useEffect }                  from "react";
import { MotionConfig }                         from "framer-motion";
import { SettingsInitializer }                  from "@/app/components/SettingsInitializer";

// ── Constantes ────────────────────────────────────────────────────────────────

/**
 * `true` cuando el bypass de autenticación está activo.
 * Evaluado en tiempo de build — no cambia en tiempo de ejecución.
 */
const isBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

/**
 * Clave de `localStorage` donde se persisten las preferencias de
 * apariencia del colaborador.
 */
const STORAGE_KEY = "edm_intranet_settings";

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Props del componente {@link Providers}.
 *
 * @remarks
 * La prop `session` fue eliminada respecto a la versión NextAuth —
 * MSAL no necesita inyección de sesión desde el servidor.
 */
export interface ProvidersProps {
  /** Árbol de componentes de la aplicación a envolver con los providers. */
  children: React.ReactNode;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Lee el estado de las animaciones desde `localStorage` de forma segura.
 *
 * @returns `true` si las animaciones están habilitadas o si no hay
 *   preferencia guardada.
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
 *
 * **TanStack Query:**
 * - `staleTime: 60s` — datos frescos durante 1 minuto.
 * - `retry: 2` — reintenta peticiones fallidas hasta 2 veces.
 * - `refetchOnWindowFocus: false` — evita refetches al volver a la pestaña.
 *
 * **Animaciones:**
 * `MotionConfig` con `reducedMotion="always"` desactiva todas las
 * animaciones de Framer Motion cuando el colaborador las ha deshabilitado.
 *
 * @param props - Ver {@link ProvidersProps}.
 */
export default function Providers({ children }: ProvidersProps) {

  // ── TanStack Query client ───────────────────────────────────────────────
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime:            1000 * 60,
            retry:                2,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  // ── Animaciones ─────────────────────────────────────────────────────────
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  useEffect(() => {
    setAnimationsEnabled(getAnimationsEnabled());

    const handleCustom = (e: Event) => {
      const enabled = (e as CustomEvent<{ enabled: boolean }>).detail.enabled;
      setAnimationsEnabled(enabled);
    };

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

  // ── Árbol de providers ──────────────────────────────────────────────────
  const content = (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion={animationsEnabled ? "never" : "always"}>
        <SettingsInitializer />
        {children}
      </MotionConfig>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );

  // En modo bypass no se monta MsalProvider para evitar
  // inicializaciones de MSAL innecesarias en desarrollo
  if (isBypass) return content;

  return (
    <MsalProvider instance={msal}>
      {content}
    </MsalProvider>
  );
}