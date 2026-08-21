/**
 * @module msal
 * Configuración e instancia central de MSAL Browser para la intranet EDM.
 *
 * @remarks
 * Exporta la instancia singleton de {@link PublicClientApplication} junto
 * con todas las utilidades de autenticación: login por popup/redirect,
 * obtención de tokens y logout.
 *
 * **Variables de entorno requeridas (todas `NEXT_PUBLIC_` porque corren en cliente):**
 * | Variable                        | Descripción                          |
 * |---------------------------------|--------------------------------------|
 * | `NEXT_PUBLIC_MSAL_CLIENT_ID`    | Client ID de la app en Azure AD      |
 * | `NEXT_PUBLIC_MSAL_TENANT_ID`    | Tenant ID del directorio corporativo |
 *
 * @remarks
 * **Sobre `initMSALCore()` vs `initMSAL()`:**
 * Se dividió la inicialización en dos pasos porque tienen requisitos de
 * timing distintos respecto a `<MsalProvider>` (de `@azure/msal-react`):
 *
 * - {@link initMSALCore} — solo `msal.initialize()`. Debe correr ANTES de
 *   montar `<MsalProvider>` (requisito de la librería).
 * - {@link initMSAL} — además llama `msal.handleRedirectPromise()`. Debe
 *   correr DESPUÉS de montar `<MsalProvider>`, porque el provider se
 *   suscribe a los eventos internos de MSAL (`HANDLE_REDIRECT_START`/`END`)
 *   para actualizar su `inProgress` de `"startup"` a `"none"`. Si el
 *   redirect se procesa antes de que el provider exista, esos eventos se
 *   pierden y `inProgress` queda atascado en `"startup"` para siempre.
 *
 * Ver `providers.tsx` para el orden real de estas llamadas.
 *
 * @example
 * ```ts
 * import { getAccessToken } from "@/app/api/auth/msal";
 * const token = await getAccessToken();
 * ```
 */

import {
  PublicClientApplication,
  EventType,
  InteractionRequiredAuthError,
  type AccountInfo,
  type Configuration,
  type EventMessage,
  type PopupRequest,
  type RedirectRequest,
  type SilentRequest,
} from "@azure/msal-browser";

// -- Constantes de entorno -----------------------------------------------------

const CLIENT_ID = process.env.NEXT_PUBLIC_MSAL_CLIENT_ID!;
const TENANT_ID = process.env.NEXT_PUBLIC_MSAL_TENANT_ID!;

/**
 * Scopes centralizados para login y obtención de tokens.
 * Se usan en todas las llamadas a MSAL para garantizar consistencia.
 */
export const SCOPES = ["openid", "profile", "email", "User.Read"] as const;

// -- Instancia MSAL (lazy) -------------------------------------------------

/**
 * Config de MSAL. Extraída a función porque no debe evaluarse hasta que
 * sepamos que estamos en el navegador (ver {@link getMsalInstance}).
 *
 * @remarks
 * `redirectUri` apunta a `window.location.origin` para que Microsoft
 * redirija al origen de la app. `cacheLocation: "localStorage"` persiste
 * la sesión entre pestañas y recargas de página.
 */
function createMsalConfig(): Configuration {
  return {
    auth: {
      clientId:    CLIENT_ID,
      authority:   `https://login.microsoftonline.com/${TENANT_ID}`,
      redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI ?? "https://intranet-edm.netlify.app/",
    },
    cache: {
      cacheLocation: "localStorage",
    },
    system: {
      loggerOptions: {
        loggerCallback: (level, message) => {
          if (message?.includes("msal")) {
            console.debug("[MSAL]", level, message);
          }
        },
        piiLoggingEnabled: false,
      },
    },
  };
}

let _msalInstance: PublicClientApplication | null = null;

/**
 * Crea (una sola vez) y devuelve la instancia real de
 * {@link PublicClientApplication}, exclusivamente en el navegador.
 *
 * @remarks
 * Antes, `msal` se instanciaba directamente al nivel del módulo
 * (`export const msal = new PublicClientApplication(...)`), lo que
 * ejecutaba código dependiente del navegador en el momento en que
 * CUALQUIER cosa importara este archivo — incluido, por accidente, un
 * Server Component, un `layout.tsx`, o el proceso de build de Next.js
 * corriendo en Node.js, donde `window` no existe. Eso es la causa del
 * `ReferenceError: window is not defined` que loguea `@azure/msal-browser`
 * internamente.
 *
 * Con esta función, la instancia no se crea hasta que alguien accede
 * realmente a una propiedad de `msal` (ver el `Proxy` más abajo), y si
 * eso llega a pasar en el servidor, falla con un mensaje claro en vez de
 * un `ReferenceError` interno de la librería.
 */
function getMsalInstance(): PublicClientApplication {
  if (typeof window === "undefined") {
    throw new Error(
      "[MSAL] Se intentó usar la instancia de MSAL fuera del navegador " +
      "(SSR/servidor). Este módulo es exclusivamente de cliente — revisá " +
      "si algo lo está importando desde un Server Component o similar."
    );
  }
  if (!_msalInstance) {
    _msalInstance = new PublicClientApplication(createMsalConfig());
  }
  return _msalInstance;
}

/**
 * Instancia singleton de {@link PublicClientApplication}, expuesta como
 * `Proxy` para que la creación real sea perezosa (ver
 * {@link getMsalInstance}). Todo el resto del código puede seguir
 * usándola exactamente igual que antes (`msal.loginRedirect(...)`,
 * `msal.getActiveAccount()`, etc.) — el `Proxy` es transparente.
 */
export const msal = new Proxy({} as PublicClientApplication, {
  get(_target, prop, _receiver) {
    const instance = getMsalInstance();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

// -- Estado interno ------------------------------------------------------------

let eventsWired = false;

/**
 * Promesa compartida de solo `msal.initialize()` — se usa para el guard
 * de pre-render en `Providers`, ANTES de montar `MsalProvider`.
 */
let coreInitPromise: Promise<void> | null = null;



// -- Requests reutilizables ----------------------------------------------------

const loginPopupRequest: PopupRequest = {
  scopes: [...SCOPES],
  prompt: "select_account",
};

const loginRedirectRequest: RedirectRequest = {
  scopes: [...SCOPES],
  prompt: "select_account",
};

// -- Inicialización ------------------------------------------------------------

/**
 * Inicializa únicamente `msal.initialize()`, sin procesar el redirect.
 *
 * @remarks
 * Debe completarse antes de montar `<MsalProvider>`. A diferencia de
 * `handleRedirectPromise()`, esta llamada no depende de que `MsalProvider`
 * esté escuchando eventos, así que es segura de correr en pre-render.
 *
 * Idempotente y a prueba de llamadas concurrentes: la existencia de
 * `coreInitPromise` (no un booleano) es el guard, para que dos llamadas
 * casi simultáneas esperen la MISMA promesa en vez de llamar
 * `msal.initialize()` dos veces en paralelo.
 */
export function initMSALCore(): Promise<void> {
  if (coreInitPromise) return coreInitPromise;
  coreInitPromise = msal.initialize();
  return coreInitPromise;
}

/**
 * Procesa el retorno del redirect de Azure AD y deja MSAL listo para usarse.
 *
 * @remarks
 * CRÍTICO: debe llamarse desde un componente que ya esté montado DENTRO de
 * `<MsalProvider>` (nunca antes) — ver {@link MsalBootstrap} en
 * `providers.tsx`. Llamarla antes de montar el provider deja el
 * `inProgress` de `useMsal()` atascado en `"startup"` de forma permanente,
 * porque los eventos que el provider necesita escuchar ya se dispararon
 * sin testigos.
 *
 * Internamente espera a {@link initMSALCore}, así que es seguro llamarla
 * sin garantizar el orden manualmente.
 *
 * `handleRedirectPromise()` se cachea en {@link redirectPromise} para que
 * se ejecute una única vez por carga de página, sin importar cuántas
 * veces se invoque `initMSAL()` (ver el comentario de esa variable).
 */
/**
 * Prepara MSAL para usarse: espera `msal.initialize()` (compartido con
 * {@link initMSALCore}), registra nuestro propio listener de eventos
 * ({@link wireEventsOnce}) y selecciona la cuenta activa si existe.
 *
 * @remarks
 * **IMPORTANTE — por qué esta función YA NO llama `handleRedirectPromise()`:**
 * `MsalProvider` (de `@azure/msal-react`) llama `instance.handleRedirectPromise()`
 * automáticamente, por su cuenta, en su propio `useEffect` interno, apenas
 * se monta — es un comportamiento incorporado de la librería, no algo que
 * la app deba replicar.
 *
 * La versión anterior de esta función también lo llamaba manualmente
 * desde `MsalBootstrap` (que vive DENTRO de `MsalProvider`). Eso generaba
 * DOS llamadas independientes a `handleRedirectPromise()` — la de
 * `MsalProvider` y esta — compitiendo por las mismas entradas temporales
 * de `localStorage` (`code_verifier`, `nonce`, `state`) que MSAL usa para
 * validar el login. El guard con una promesa cacheada solo evitaba que
 * ESTE módulo se llamara a sí mismo dos veces — no tenía forma de
 * coordinarse con la llamada interna de `MsalProvider`, que ocurre de
 * forma completamente independiente.
 *
 * Es exactamente el escenario descrito en un issue conocido de la
 * librería ("Race condition when calling handleRedirectPromise... using
 * @azure/msal-react"): la falla es intermitente porque depende del
 * timing de cuál llamada "gana" — coincide con el síntoma real
 * observado (falla a veces, no siempre, y navegar a `/login` lo
 * destraba al reiniciar el timing).
 *
 * **La fuente de verdad correcta** para saber si el redirect ya se
 * procesó es `inProgress` de `useMsal()` — que `MsalProvider` actualiza
 * de forma confiable, porque es él quien de verdad ejecuta
 * `handleRedirectPromise()`. Ver `MsalBootstrap` en `providers.tsx`,
 * que ya lee `inProgress` para esto.
 *
 * **Nota sobre `navigateToLoginRequestUrl`:** en versiones antiguas de
 * MSAL Browser esa opción vivía en `Configuration.auth`. En esta versión
 * (5.x), se movió a ser un parámetro de la llamada `handleRedirectPromise()`
 * misma (`HandleRedirectPromiseOptions`) — y como esta app deliberadamente
 * no llama `handleRedirectPromise()` manualmente (ver el punto anterior),
 * no hay un lugar limpio para pasarla sin reintroducir la condición de
 * carrera que ya se resolvió. Se descartó por eso. El caso real de
 * `block_iframe_reload` que motivó considerarla se resuelve en
 * `app/login/page.tsx` con una guarda `window.self !== window.top`, que
 * no depende de esta opción de configuración.
 */
export async function initMSAL(): Promise<void> {
  await initMSALCore();
  wireEventsOnce();
  ensureActiveAccount();
}

// -- Gestión de cuenta activa --------------------------------------------------

/**
 * Selecciona y retorna una cuenta activa si existe alguna en caché.
 *
 * @returns La cuenta activa, o `null` si no hay ninguna sesión guardada.
 */
export function ensureActiveAccount(): AccountInfo | null {
  const acc = msal.getActiveAccount() ?? msal.getAllAccounts()[0] ?? null;
  if (acc) msal.setActiveAccount(acc);
  return acc;
}

/**
 * Indica si hay una sesión activa en MSAL.
 *
 * @returns `true` si existe al menos una cuenta en caché.
 */
export function isLoggedIn(): boolean {
  return !!(msal.getActiveAccount() ?? msal.getAllAccounts()[0]);
}

/**
 * Obtiene la cuenta activa o la primera disponible en caché.
 *
 * @returns {@link AccountInfo} o `null` si no hay sesión.
 */
export function getAccount(): AccountInfo | null {
  return msal.getActiveAccount() ?? msal.getAllAccounts()[0] ?? null;
}

// -- Utilidad de storage ---------------------------------------------------

/**
 * Limpia todas las entradas `msal.*` de `localStorage`.
 *
 * @remarks
 * Se usa como recuperación defensiva cuando el storage está lleno
 * (`QuotaExceededError`) — por ejemplo en Safari en modo privado o en
 * webviews corporativos con cuota reducida — para poder reintentar el
 * login o el logout sin quedar atascados.
 */
function clearMsalStorage(): void {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("msal."))
      .forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.warn("[MSAL] No se pudo limpiar el storage:", e);
  }
}

function isQuotaExceededError(e: unknown): boolean {
  return e instanceof Error && e.name === "QuotaExceededError";
}

// -- Login ---------------------------------------------------------------------

/**
 * Inicia sesión por popup. Si el popup es bloqueado o cancelado, hace
 * fallback automático a redirect.
 *
 * @returns La cuenta autenticada.
 */
export async function ensureLoginPopup(): Promise<AccountInfo> {
  await initMSAL();
  let account = ensureActiveAccount();
  if (!account) {
    try {
      const res = await msal.loginPopup(loginPopupRequest);
      account = res.account ?? msal.getAllAccounts()[0]!;
      msal.setActiveAccount(account);
    } catch (e) {
      console.warn("[MSAL] loginPopup fallo, fallback a redirect...", e);
      await msal.loginRedirect(loginRedirectRequest);
      return new Promise<AccountInfo>(() => {});
    }
  }
  return account;
}

/**
 * Inicia sesión por redirect. Usar solo cuando el popup no es viable
 * (ej: flujo iniciado sin gesto del usuario).
 *
 * @returns La cuenta autenticada (tras volver del redirect).
 */
export async function ensureLoginRedirect(): Promise<AccountInfo> {
  await initMSAL();
  const account = ensureActiveAccount();
  if (!account) {
    try {
      await msal.loginRedirect(loginRedirectRequest);
    } catch (e) {
      if (isQuotaExceededError(e)) {
        console.warn("[MSAL] Storage lleno, limpiando entradas msal.* y reintentando...");
        clearMsalStorage();
        await msal.loginRedirect(loginRedirectRequest);
      } else {
        throw e;
      }
    }
    return new Promise<AccountInfo>(() => {});
  }
  return account;
}

/**
 * Inicia sesión con el modo indicado.
 *
 * @remarks
 * El modo por defecto es `'popup'` para que la experiencia de login sea
 * siempre una ventana emergente sin salir de la intranet. Pasar
 * `'redirect'` explícitamente solo cuando sea estrictamente necesario.
 *
 * @param mode - `'popup'` (default) o `'redirect'`.
 * @returns La cuenta autenticada.
 */
export async function ensureLogin(
  mode: "popup" | "redirect" = "popup" // ← default popup, no redirect
): Promise<AccountInfo> {
  return mode === "popup" ? ensureLoginPopup() : ensureLoginRedirect();
}

// -- Tokens --------------------------------------------------------------------

/**
 * Obtiene un access token siguiendo la cascada:
 * 1. `acquireTokenSilent` — sin interaccion del usuario.
 * 2. Si falla con {@link InteractionRequiredAuthError} y `interactionMode`
 *    es `'redirect'`: navega a Microsoft para renovar la sesión. Esta
 *    ruta es obligatoria para cualquier flujo que se dispare sin un gesto
 *    directo del usuario (montaje de componente, `useQuery`, `useEffect`),
 *    porque `acquireTokenPopup` depende de `window.open`, que los
 *    navegadores bloquean cuando no hay un clic real detrás.
 * 3. Si falla y `interactionMode` es `'popup'` (default): intenta popup.
 *    Usar este modo SOLO dentro de un handler de clic real del usuario.
 * 4. Si no hay sesion activa: lanza error — el login debe hacerse desde
 *    la página de login via {@link ensureLogin}.
 *
 * @param opts.interactionMode            - Modo de interaccion si el silent falla (default: `'popup'`).
 * @param opts.silentExtraScopesToConsent - Scopes adicionales para el silent request.
 * @param opts.forceSilent                - Si `true`, lanza el error en lugar de intentar interaccion.
 * @returns El access token como string.
 */
export async function getAccessToken(opts?: {
  interactionMode?: "popup" | "redirect";
  silentExtraScopesToConsent?: string[];
  forceSilent?: boolean;
}): Promise<string> {
  await initMSAL();

  const account = ensureActiveAccount();

  if (!account) {
    throw new Error("[getAccessToken] No hay sesión activa de MSAL");
  }

  const silentReq: SilentRequest = {
    account: ensureActiveAccount()!,
    scopes:  [...SCOPES, ...(opts?.silentExtraScopesToConsent ?? [])],
  };

  try {
    const res = await msal.acquireTokenSilent(silentReq);
    return res.accessToken;
  } catch (e) {
    if (opts?.forceSilent) throw e;

    if (e instanceof InteractionRequiredAuthError) {
      const mode = opts?.interactionMode ?? "popup";

      // Redirect: navegación de página completa. No depende de que el
      // navegador permita cookies de terceros (a diferencia del silent
      // iframe) ni de un gesto de clic (a diferencia del popup), por lo
      // que es la única vía segura de usar dentro de flujos automáticos
      // como useQuery en el montaje de un componente.
      if (mode === "redirect") {
        await msal.acquireTokenRedirect({
          scopes: [...SCOPES, ...(opts?.silentExtraScopesToConsent ?? [])],
          ...(silentReq.account && { account: silentReq.account }),
        });
        // acquireTokenRedirect navega fuera de la página; esta promesa
        // nunca debe resolver en esta pestaña.
        return new Promise<string>(() => {});
      }

      try {
        const res = await msal.acquireTokenPopup({
          scopes: [...SCOPES, ...(opts?.silentExtraScopesToConsent ?? [])],
          ...(silentReq.account && { account: silentReq.account }),
        });
        return res.accessToken;
      } catch (popupErr) {
        console.warn("[MSAL] acquireTokenPopup falló:", popupErr);
        throw popupErr;
      }
    }
    throw e;
  }
}
/**
 * Obtiene el ID Token del usuario autenticado.
 *
 * @remarks
 * A diferencia de {@link getAccessToken} (pensado para llamar a Microsoft
 * Graph), el ID Token trae como audiencia (`aud`) el propio `clientId` de
 * esta app — es lo que usa el backend de la Intranet para verificar la
 * identidad del usuario en los endpoints de gestión (ej. EDM News),
 * sin necesitar un scope de API expuesto en Azure AD.
 *
 * @returns El ID Token como string (JWT).
 */
export async function getIdToken(): Promise<string> {
  await initMSAL();

  const account = ensureActiveAccount();
  if (!account) {
    throw new Error("[getIdToken] No hay sesión activa de MSAL");
  }

  const silentReq: SilentRequest = {
    account,
    scopes: [...SCOPES],
  };

  try {
    const res = await msal.acquireTokenSilent(silentReq);
    return res.idToken;
  } catch (e) {
    if (e instanceof InteractionRequiredAuthError) {
      const res = await msal.acquireTokenPopup({
        scopes: [...SCOPES],
        account,
      });
      return res.idToken;
    }
    throw e;
  }
}
// -- Logout --------------------------------------------------------------------

/**
 * Cierra la sesion del colaborador autenticado y redirige al login.
 *
 * @remarks
 * `msal.logoutRedirect()` necesita escribir estado temporal en
 * `localStorage` antes de navegar (igual que el login). Si esa escritura
 * falla con `QuotaExceededError` — por ejemplo en Safari en modo privado
 * o en webviews corporativos con cuota reducida — el usuario podía
 * quedar con las cookies ya borradas pero sin completar el logout. Mismo
 * patrón de recuperación que {@link ensureLoginRedirect}: limpiar
 * `msal.*` y reintentar una vez; si vuelve a fallar, forzar la
 * navegación manual como último recurso — para ese punto ya no hay nada
 * más que MSAL pueda hacer por nosotros.
 *
 * Este es un caso raro en la práctica (no es la causa típica de
 * `QuotaExceededError` que se ha visto en producción — ver
 * `organizationGraph.service.ts` para esa historia), pero queda como red
 * de seguridad barata por si ocurre.
 */
export async function logout(): Promise<void> {
  await initMSAL();
  const account = ensureActiveAccount();

  // Borrar cookies de sesión
  const expired = "path=/; max-age=0; samesite=lax";
  document.cookie = `edm_authed=; ${expired}`;
  document.cookie = `edm_access_level=; ${expired}`;
  document.cookie = `edm_user_email=; ${expired}`;
  document.cookie = `edm_last_page=; ${expired}`;

  const postLogoutRedirectUri = typeof window !== "undefined"
    ? `${window.location.origin}/login`
    : "/login";

  try {
    await msal.logoutRedirect({
      ...(account && { account }),
      postLogoutRedirectUri,
    });
  } catch (e) {
    if (isQuotaExceededError(e)) {
      console.warn("[MSAL] Storage lleno durante logout, limpiando entradas msal.* y reintentando...");
      clearMsalStorage();
      try {
        await msal.logoutRedirect({
          ...(account && { account }),
          postLogoutRedirectUri,
        });
        return;
      } catch (retryErr) {
        console.error(
          "[MSAL] logoutRedirect volvió a fallar tras limpiar storage, forzando redirect manual:",
          retryErr
        );
      }
    } else {
      console.error("[MSAL] logoutRedirect falló:", e);
    }

    // Último recurso: cookies (y, si aplicaba, el storage de MSAL) ya
    // quedaron limpios a mano, así que forzamos la navegación para no
    // dejar al usuario atascado en una sesión a medio cerrar.
    if (typeof window !== "undefined") {
      window.location.assign(postLogoutRedirectUri);
    }
  }
}
// -- Eventos MSAL --------------------------------------------------------------

/**
 * Registra los listeners de eventos de MSAL exactamente una vez.
 * @internal
 */
function wireEventsOnce(): void {
  if (eventsWired) return;

  msal.addEventCallback((ev: EventMessage) => {
    switch (ev.eventType as string) {
      case EventType.LOGIN_SUCCESS: {
        const acc = (ev.payload as { account?: AccountInfo })?.account;
        if (acc) msal.setActiveAccount(acc);
        break;
      }
      case "msal:loginFailure":
      case EventType.ACQUIRE_TOKEN_FAILURE:
      case EventType.LOGOUT_FAILURE:
        console.warn("[MSAL] Event error:", ev);
        break;
      default:
        break;
    }
  });

  eventsWired = true;
}

/**
 * Registra un callback adicional de eventos MSAL (util para auditoria).
 *
 * @param cb - Funcion que recibe cada {@link EventMessage} de MSAL.
 */
export function onMsalEvent(cb: (ev: EventMessage) => void): void {
  msal.addEventCallback(cb);
}