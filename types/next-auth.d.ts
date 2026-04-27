/**
 * @module types/next-auth
 * Extensión de tipos de NextAuth para la intranet EDM.
 *
 * @remarks
 * Amplía las interfaces `Session` y `JWT` de NextAuth mediante
 * declaration merging para incluir los campos adicionales obtenidos
 * desde Microsoft Graph durante el login con Entra ID.
 *
 * Sin este archivo, TypeScript reportaría errores de tipo al acceder
 * a `session.user.accessLevel`, `session.accessToken` u otros campos
 * personalizados en Server Components, Client Components y el
 * middleware `proxy.ts`.
 *
 * **Relación con `auth.ts`:**
 * Los campos declarados aquí se asignan en los callbacks `jwt` y
 * `session` de `auth.ts`. Cualquier campo nuevo que se agregue a
 * esos callbacks debe declararse aquí también para mantener la
 * consistencia de tipos en todo el proyecto.
 *
* @see `auth` (`auth.ts`) — donde se asignan estos campos en los callbacks
 * @see `roles` (`lib/roles.ts`) — definición de `AccessLevel` */

import "next-auth";
import "next-auth/jwt";
import type { AccessLevel } from "@/lib/roles";

// ── Extensión de Session ──────────────────────────────────────────────────────

declare module "next-auth" {
  /**
   * Extensión de la interfaz `Session` de NextAuth con los campos
   * adicionales de la intranet EDM.
   *
   * @remarks
   * Accesible en Server Components mediante `auth()` y en Client
   * Components mediante `useSession()`.
   */
  interface Session {
    /**
     * Token de acceso delegado de Microsoft Graph.
     *
     * @remarks
     * Opcional porque no existe antes del primer login. Se usa en
     * `shared.service.ts` y otros services de Graph para autenticar
     * las llamadas a la API. Se verifica su existencia antes de usarlo.
     */
    accessToken?: string;

    /**
     * Perfil del colaborador autenticado extendido con campos de
     * Microsoft Graph y el nivel de acceso resuelto desde Azure AD.
     */
    user: {
      /** Object ID del usuario en Azure AD. */
      id: string;

      /** Nombre display del colaborador. */
      name?: string | null;

      /** Correo corporativo del colaborador. */
      email?: string | null;

      /** URL de la foto de perfil del colaborador. */
      image?: string | null;

      /**
       * Cargo del colaborador obtenido desde `jobTitle` en Graph.
       * `null` si no está configurado en Entra ID.
       */
      role?: string | null;

      /**
       * Departamento del colaborador obtenido desde Graph.
       * `null` si no está configurado en Entra ID.
       */
      department?: string | null;

      /**
       * ID de empleado del colaborador obtenido desde Graph.
       * `null` si no está configurado en Entra ID.
       */
      employeeId?: string | null;

      /**
       * Fecha de contratación formateada mediante `formatHireDate`
       * (ej. `"marzo de 2024"`).
       * `null` si no está disponible en el perfil de Entra ID.
       */
      joined?: string | null;

      /**
       * Teléfono de contacto del colaborador obtenido desde Graph.
       * Prioriza `mobilePhone` sobre `businessPhones[0]`.
       * `null` si no está configurado en Entra ID.
       */
      phone?: string | null;

      /**
       * Ubicación de oficina del colaborador obtenida desde Graph.
       * `null` si no está configurada en Entra ID.
       */
      location?: string | null;

      /**
       * Nivel de acceso resuelto desde los grupos de Azure AD del
       * colaborador mediante `resolveAccessLevelFromGroups`.
       * `undefined` si aún no se ha resuelto (antes del primer login).
       */
      accessLevel?: AccessLevel;
    };
  }
}

// ── Extensión de JWT ──────────────────────────────────────────────────────────

declare module "next-auth/jwt" {
  /**
   * Extensión de la interfaz `JWT` de NextAuth con los campos
   * adicionales cacheados en el token de la intranet EDM.
   *
   * @remarks
   * Los campos del JWT se calculan **una sola vez** en el callback
   * `jwt` de `auth.ts` durante el login inicial y se persisten en
   * la cookie de sesión cifrada. No se reconsultan en cada request
   * posterior, lo que evita llamadas innecesarias a Microsoft Graph.
   *
   * Cuando el `accessLevel` o los grupos del colaborador cambien en
   * Azure AD, el cambio se reflejará en la siguiente sesión tras
   * cerrar e iniciar sesión nuevamente.
   */
  interface JWT {
    /**
     * Token de acceso delegado de Microsoft Graph.
     * Se usa para autenticar las llamadas a Graph en los services
     * de departamento.
     */
    accessToken?: string;

    /**
     * Token de refresco para renovación de sesión.
     * Disponible para implementar renovación automática de token
     * cuando `accessToken` expire.
     */
    refreshToken?: string;

    /**
     * Timestamp Unix (en segundos) de expiración del `accessToken`.
     * Útil para implementar renovación proactiva antes de que expire.
     */
    expiresAt?: number;

    /**
     * Cargo del colaborador cacheado desde Graph (`jobTitle`).
     * `null` si no está configurado en Entra ID.
     */
    role?: string | null;

    /**
     * Departamento del colaborador cacheado desde Graph.
     * `null` si no está configurado en Entra ID.
     */
    department?: string | null;

    /**
     * ID de empleado cacheado desde Graph.
     * `null` si no está configurado en Entra ID.
     */
    employeeId?: string | null;

    /**
     * Fecha de contratación formateada y cacheada desde Graph.
     * `null` si no está disponible en el perfil de Entra ID.
     */
    joined?: string | null;

    /**
     * Teléfono de contacto cacheado desde Graph.
     * `null` si no está configurado en Entra ID.
     */
    phone?: string | null;

    /**
     * Ubicación de oficina cacheada desde Graph.
     * `null` si no está configurada en Entra ID.
     */
    location?: string | null;

    /**
     * Nivel de acceso resuelto desde los grupos de Azure AD y
     * cacheado en el token para no recalcularse en cada request.
     */
    accessLevel?: AccessLevel;

    /**
     * Array de Object IDs de los grupos de Azure AD a los que
     * pertenece el colaborador.
     * Cacheado para uso futuro en auditoría o features que requieran
     * conocer los grupos exactos sin consultar Graph nuevamente.
     */
    groupIds?: string[];
  }
}