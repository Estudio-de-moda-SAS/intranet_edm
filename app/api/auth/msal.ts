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

// -- Instancia MSAL ------------------------------------------------------------

/**
 * Instancia singleton de {@link PublicClientApplication} configurada
 * con las credenciales del tenant corporativo de EDM.
 *
 * @remarks
 * `redirectUri` apunta a `window.location.origin` para que Microsoft
 * redirija al origen de la app. `cacheLocation: "localStorage"` persiste
 * la sesión entre pestañas y recargas de página.
 */
export const msal = new PublicClientApplication({
  auth: {
    clientId:    CLIENT_ID,
    authority:   `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI ?? "https://intranet-edm.netlify.app/",  },
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
 */
export async function initMSAL(): Promise<void> {
  await initMSALCore();
  await msal.handleRedirectPromise().catch((e) => {
    console.error("[MSAL] handleRedirectPromise error:", e);
  });
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
    await msal.loginRedirect(loginRedirectRequest);
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

  await msal.logoutRedirect({
    ...(account && { account }),
    postLogoutRedirectUri: typeof window !== "undefined"
      ? `${window.location.origin}/login`
      : "/login",
  });
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