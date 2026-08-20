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
 * 1. **`initMSALCore()`** — corre `msal.initialize()` ANTES de montar
 *    `MsalProvider` (requisito de `msal-react`). Mientras esto no termina,
 *    se muestra un loader mínimo en vez del árbol de providers.
 * 2. **`MsalProvider`** — disponible solo en modo producción. Expone el
 *    contexto de autenticación a todos los componentes cliente. En modo
 *    bypass se omite para evitar llamadas a Azure innecesarias.
 * 3. **`MsalBootstrap`** — YA DENTRO de `MsalProvider`, procesa
 *    `handleRedirectPromise()` y reconcilia la cookie `edm_authed` (que
 *    lee el middleware) contra la sesión real de MSAL (`localStorage`).
 *    Deja pasar `/login` siempre, sin bloquear, porque ahí "sin cuenta"
 *    es el estado esperado. Ver el comentario dentro de `MsalBootstrap`
 *    para el detalle completo.
 * 4. **`QueryClientProvider`** (TanStack Query) — gestión de caché y
 *    estado asíncrono para Client Components.
 * 5. **`MotionConfig`** (Framer Motion) — control global de animaciones
 *    sincronizado con las preferencias de apariencia del colaborador.
 * 6. **`SettingsInitializer`** — aplica dark mode, densidad, fuente y
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

import { MsalProvider, useMsal }                from "@azure/msal-react";
import { msal, initMSALCore, initMSAL }         from "@/app/api/auth/msal";
import { QueryClient, QueryClientProvider }     from "@tanstack/react-query";
import { ReactQueryDevtools }                   from "@tanstack/react-query-devtools";
import { useState, useEffect }                  from "react";
import { usePathname, useRouter }               from "next/navigation";
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

/**
 * Nombres de cookie compartidos con `middleware.ts` (proxy.ts). Se
 * duplican aquí (en vez de importarlas) porque ese archivo corre en Edge
 * Runtime e importa `next/server`, que no debe entrar al bundle de
 * cliente. Si cambian los nombres allá, deben actualizarse aquí también.
 */
const AUTH_COOKIE         = "edm_authed";
const ACCESS_LEVEL_COOKIE = "edm_access_level";
const LAST_PAGE_COOKIE    = "edm_last_page";

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

/**
 * Borra las cookies de sesión del lado del cliente.
 *
 * @remarks
 * Se usa cuando detectamos que la cookie `edm_authed` dice "autenticado"
 * pero la sesión real de MSAL (`localStorage`) no existe — un estado
 * desincronizado que, sin esta limpieza, deja al middleware creyendo
 * para siempre que el usuario tiene sesión válida.
 */
function clearAuthCookies(): void {
  const expired = "path=/; max-age=0; samesite=lax";
  document.cookie = `${AUTH_COOKIE}=; ${expired}`;
  document.cookie = `${ACCESS_LEVEL_COOKIE}=; ${expired}`;
  document.cookie = `${LAST_PAGE_COOKIE}=; ${expired}`;
}

/**
 * Bloquea el renderizado de `children` mientras `MsalProvider` todavía
 * está procesando su propio arranque (`inProgress !== "none"`), y
 * reconcilia la cookie `edm_authed` contra la sesión real de MSAL.
 *
 * @remarks
 * **`inProgress` es la única fuente de verdad para saber si el redirect
 * ya se procesó.** `MsalProvider` llama `handleRedirectPromise()`
 * automáticamente por su cuenta (comportamiento incorporado de la
 * librería) y actualiza `inProgress` de forma confiable a medida que
 * avanza. Este componente ya NO llama `handleRedirectPromise()` por su
 * lado — hacerlo generaba una condición de carrera real con la llamada
 * interna de `MsalProvider` (ver el comentario de {@link initMSAL} en
 * `msal.ts` para el detalle completo del bug y su causa).
 *
 * **Reconciliación cookie vs. sesión real de MSAL:**
 * El middleware (`proxy.ts`) decide si dejar pasar a una ruta protegida
 * basándose SOLO en la cookie `edm_authed`. Esa cookie es un flag
 * optimista que el cliente escribe tras un login exitoso — no una
 * verificación en vivo en cada request. Si el `localStorage` de MSAL se
 * vacía sin que la cookie se borre, el middleware sigue dejando pasar al
 * usuario, pero `useMsal()` aquí reporta `accounts: []`. Se centraliza
 * aquí: en cuanto `inProgress` llega a `"none"`, si no hay ninguna
 * cuenta real, se borra la cookie desactualizada y se redirige a
 * `/login`.
 *
 * **`/login` es un caso especial:** ahí "sin cuenta" es el estado
 * NORMAL y esperado. Por eso `isLoginRoute` excluye esa ruta tanto del
 * efecto de redirección como del bloqueo de renderizado.
 */
function MsalBootstrap({ children }: { children: React.ReactNode }) {
  const { inProgress, accounts } = useMsal();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Ya no gestiona el redirect (eso lo hace MsalProvider por su
    // cuenta) — solo se asegura de que initMSALCore() haya resuelto,
    // registra nuestro propio listener de eventos, y selecciona la
    // cuenta activa si existe. Ver el comentario de initMSAL en msal.ts.
    void initMSAL();
  }, []);

  const isLoginRoute = pathname?.startsWith("/login") ?? false;

  useEffect(() => {
    if (inProgress !== "none") return;
    if (accounts.length > 0) return;
    if (isLoginRoute) return;

    clearAuthCookies();
    router.replace(`/login?callbackUrl=${encodeURIComponent(pathname ?? "/")}`);
  }, [inProgress, accounts.length, isLoginRoute, pathname, router]);

  // Sin cuenta y fuera de /login: se está a punto de redirigir (efecto de
  // arriba) — mostrar el loader mientras tanto. En /login, "sin cuenta"
  // es el estado esperado y nunca debe bloquearse.
  const awaitingRedirect =
    inProgress === "none" && accounts.length === 0 && !isLoginRoute;

  if (inProgress !== "none" || awaitingRedirect) {
    return (
      <div className="min-h-screen bg-slate-50/70 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
// ── Componente principal ──────────────────────────────────────────────────────

/**
 * Árbol de providers globales que envuelve toda la intranet EDM.
 *
 * @remarks
 * Debe montarse como hijo directo del `<body>` en `app/layout.tsx`.
 *
 * **Inicialización de MSAL (en dos fases, ver {@link MsalBootstrap}):**
 * 1. `msalCoreReady` — controla `msal.initialize()`, ANTES de montar
 *    `MsalProvider`.
 * 2. Dentro de `MsalBootstrap` — controla `handleRedirectPromise()` y la
 *    reconciliación de sesión, DESPUÉS de montar `MsalProvider`.
 *
 * En modo bypass ninguna de las dos fases corre — se salta directo al
 * árbol de contenido.
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

  // ── Inicialización de MSAL (fase 1: solo initialize()) ──────────────────
  const [msalCoreReady, setMsalCoreReady] = useState(isBypass);

  useEffect(() => {
    if (isBypass) return;
    // Solo `msal.initialize()` — el procesamiento del redirect
    // (`handleRedirectPromise`) y la reconciliación de sesión se hacen
    // más abajo, DENTRO de `<MsalProvider>`, via `MsalBootstrap`. Ver
    // initMSAL() en msal.ts para el porqué de esta separación.
    initMSALCore().finally(() => setMsalCoreReady(true));
  }, []);

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

  // No montar MsalProvider hasta que msal.initialize() haya terminado
  // (requisito de msal-react). El procesamiento del redirect y la
  // reconciliación de sesión todavía no corrieron en este punto — eso lo
  // hace MsalBootstrap, ya dentro del provider.
  if (!msalCoreReady) {
    return (
      <div className="min-h-screen bg-slate-50/70 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <MsalProvider instance={msal}>
      <MsalBootstrap>
        {content}
      </MsalBootstrap>
    </MsalProvider>
  );
}