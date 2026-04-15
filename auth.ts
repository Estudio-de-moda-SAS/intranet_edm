/**
 * @module auth
 * Configuración central de autenticación de la intranet EDM con
 * NextAuth y Microsoft Entra ID (Azure AD).
 *
 * @remarks
 * Exporta las cuatro primitivas de NextAuth — {@link auth}, {@link handlers},
 * {@link signIn} y {@link signOut} — configuradas con el proveedor de
 * Microsoft Entra ID y dos callbacks que enriquecen la sesión con datos
 * de Microsoft Graph:
 *
 * **Flujo de autenticación:**
 * 1. El colaborador inicia sesión con su cuenta corporativa de Microsoft.
 * 2. El callback `jwt` se ejecuta **solo en el login inicial** cuando
 *    `account.access_token` está disponible.
 * 3. Se consultan en paralelo el perfil extendido (`/me`) y los grupos
 *    de Azure AD (`/me/memberOf`) del usuario.
 * 4. `resolveAccessLevelFromGroups` determina el `AccessLevel`
 *    del colaborador y lo persiste en el JWT — no se recalcula en cada
 *    request posterior.
 * 5. El callback `session` proyecta los campos del JWT a `session.user`
 *    para que estén disponibles en Server y Client Components.
 *
 * Si `GroupMember.Read.All` no está concedido en Azure AD, la consulta
 * de grupos retorna un array vacío y `resolveAccessLevelFromGroups`
 * aplica el fallback por `department` y `jobTitle` automáticamente —
 * la autenticación no falla.
 *
 * **Variables de entorno requeridas:**
 * | Variable                            | Descripción                          |
 * |-------------------------------------|--------------------------------------|
 * | `AUTH_MICROSOFT_ENTRA_ID_ID`        | Client ID de la app en Azure AD      |
 * | `AUTH_MICROSOFT_ENTRA_ID_SECRET`    | Client Secret de la app en Azure AD  |
 * | `AUTH_MICROSOFT_ENTRA_ID_TENANT_ID` | Tenant ID del directorio corporativo |
 *
 * **Scopes de Microsoft solicitados:**
 * | Scope                  | Uso                                        |
 * |------------------------|--------------------------------------------|
 * | `openid profile email` | Autenticación básica de identidad          |
 * | `User.Read`            | Perfil extendido del usuario desde Graph   |
 * | `GroupMember.Read.All` | Grupos de Azure AD para resolver el rol    |
 *
 * @see `lib/microsoft-graph.ts` — helpers de consulta a Graph
 * @see `lib/roles.ts` — lógica de resolución de permisos
 *
 * @example
 * ```ts
 * // En un Server Component o Route Handler:
 * import { auth } from "@/auth";
 *
 * const session = await auth();
 * if (!session) redirect("/login");
 *
 * const { accessLevel, role, department } = session.user;
 * ```
 */

import NextAuth         from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import {
  getMicrosoftGraphProfile,
  getMicrosoftGraphGroups,
  resolveAccessLevelFromGroups,
  formatHireDate,
}                       from "@/lib/microsoft-graph";
import type { AccessLevel } from "@/lib/roles";

// ── Configuración de NextAuth ─────────────────────────────────────────────────

const _nextAuth = NextAuth({
  providers: [
    /**
     * Proveedor de Microsoft Entra ID (Azure AD) para autenticación
     * corporativa con cuentas de Microsoft 365.
     *
     * @remarks
     * El `issuer` incluye el `tenantId` para restringir el login
     * exclusivamente a colaboradores del tenant corporativo de EDM,
     * rechazando cuentas de otros tenants o cuentas personales de
     * Microsoft.
     *
     * El scope `GroupMember.Read.All` requiere consentimiento del
     * administrador del tenant en Azure AD. Si no está concedido,
     * la autenticación funciona con el fallback por departamento y cargo.
     */
    MicrosoftEntraID({
      clientId:     process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`,
      authorization: {
        params: {
          scope: "openid profile email User.Read GroupMember.Read.All",
        },
      },
    }),
  ],

  pages: {
    /** Página de inicio de sesión personalizada de la intranet. */
    signIn: "/login",
  },

  callbacks: {
    /**
     * Callback JWT — enriquece el token con datos de Microsoft Graph
     * en el login inicial y lo devuelve sin cambios en requests
     * posteriores.
     *
     * @remarks
     * La comprobación `if (account?.access_token)` garantiza que las
     * consultas a Graph solo ocurren **una vez** — en el momento del
     * login. En requests posteriores el token ya tiene todos los campos
     * y se devuelve directamente sin llamadas adicionales a Graph.
     *
     * Las consultas a `/me` y `/me/memberOf` se ejecutan en paralelo
     * con `Promise.all` para minimizar la latencia del login.
     *
     * El `accessLevel` se persiste en el JWT para toda la duración de
     * la sesión. Si el nivel de acceso cambia en Azure AD, el cambio
     * se reflejará en la siguiente sesión.
     *
     * @param token   - JWT actual de la sesión.
     * @param account - Datos de la cuenta de Entra ID, disponibles
     *   solo en el login inicial. `undefined` en requests posteriores.
     * @returns JWT enriquecido con el perfil de Graph y el `accessLevel`
     *   resuelto, o el token sin cambios si no es el login inicial.
     */
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;

        const [graphProfile, graphGroups] = await Promise.all([
          getMicrosoftGraphProfile(account.access_token),
          getMicrosoftGraphGroups(account.access_token),
        ]);

        if (graphProfile) {
          token.role       = graphProfile.jobTitle       ?? null;
          token.department = graphProfile.department     ?? null;
          token.employeeId = graphProfile.employeeId     ?? null;
          token.joined     = formatHireDate(graphProfile.hireDate);
          token.phone      = graphProfile.mobilePhone
                             ?? graphProfile.businessPhones?.[0]
                             ?? null;
          token.location   = graphProfile.officeLocation ?? null;
        }

        token.accessLevel = resolveAccessLevelFromGroups(
          graphGroups,
          token.department as string | null,
          token.role       as string | null,
        ) satisfies AccessLevel;

        token.groupIds = graphGroups.map((g) => g.id);
      }
      return token;
    },

    /**
     * Callback de sesión — proyecta los campos del JWT a `session.user`
     * para que estén disponibles en Server Components, Client Components
     * y Route Handlers a través de `useSession()` y `auth()`.
     *
     * @remarks
     * Se ejecuta **en cada request** que consulta la sesión. Solo
     * transfiere datos ya calculados en el JWT — no realiza ninguna
     * llamada de red.
     *
     * Los campos proyectados extienden el tipo `User` de NextAuth
     * mediante la declaración de módulo en `types/next-auth.d.ts`.
     *
     * @param session - Sesión actual de NextAuth.
     * @param token   - JWT con los campos enriquecidos por el callback `jwt`.
     * @returns Sesión con `user` enriquecido con perfil de Graph y
     *   `accessLevel` resuelto.
     */
    async session({ session, token }) {
      if (token.accessToken) session.accessToken     = token.accessToken;
      session.user.role        = token.role        ?? null;
      session.user.department  = token.department  ?? null;
      session.user.employeeId  = token.employeeId  ?? null;
      session.user.joined      = token.joined      ?? null;
      session.user.phone       = token.phone       ?? null;
      session.user.location    = token.location    ?? null;
      if (token.accessLevel) session.user.accessLevel = token.accessLevel;
      return session;
    },
  },
});

// ── Exportaciones individuales ────────────────────────────────────────────────

/**
 * Función para obtener la sesión activa en Server Components,
 * Route Handlers y Middleware.
 *
 * @remarks
 * Equivalente a `getServerSession` en versiones anteriores de NextAuth.
 * Usa `await auth()` en cualquier Server Component para acceder a la
 * sesión del colaborador autenticado sin prop drilling.
 *
 * @example
 * ```ts
 * const session = await auth();
 * if (!session) redirect("/login");
 * const { accessLevel } = session.user;
 * ```
 */
export const auth = _nextAuth.auth;

/**
 * Handlers GET y POST para montar el endpoint de NextAuth en
 * `app/api/auth/[...nextauth]/route.ts`.
 *
 * @example
 * ```ts
 * // app/api/auth/[...nextauth]/route.ts
 * export { GET, POST } from "@/auth";
 * ```
 */
export const handlers = _nextAuth.handlers;

/**
 * Inicia el flujo de autenticación con Microsoft Entra ID desde
 * un Server Action o Route Handler.
 *
 * @example
 * ```ts
 * await signIn("microsoft-entra-id", { redirectTo: "/home" });
 * ```
 */
export const signIn = _nextAuth.signIn;

/**
 * Cierra la sesión del colaborador autenticado desde un Server Action
 * o Route Handler.
 *
 * @example
 * ```ts
 * await signOut({ redirectTo: "/login" });
 * ```
 */
export const signOut = _nextAuth.signOut;