/**
 * @module quickLinksAccess
 * Helper central para filtrar y procesar Quick Links según el
 * {@link AccessLevel} del usuario autenticado.
 *
 * @remarks
 * Expone dos niveles de procesamiento sobre un array de
 * {@link QuickLinkConfig}:
 *
 * 1. **`filterQuickLinks`** _(no exportada; ver {@link processQuickLinks})_ —
 *    elimina completamente los links que el usuario no tiene derecho a ver.
 * 2. **{@link processQuickLinks}** — combina el filtrado anterior con la
 *    inhabilitación de links opcionales, devolviendo un array listo para
 *    renderizar en `<QuickLinksSection />`.
 *
 * @example
 * ```tsx
 * // En un Server Component:
 * const links = processQuickLinks(financeQuickLinks, accessLevel);
 * return <QuickLinksSection quickLinks={links} />;
 * ```
 */

import type { AccessLevel, Permission } from "./roles";
import { can }                          from "./roles";
import type { QuickLinkItem }           from "@/app/components/ui/QuickLinksSection";

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Configuración extendida de un Quick Link con control de acceso granular.
 *
 * Extiende {@link QuickLinkItem} con dos permisos opcionales e independientes
 * que controlan, respectivamente, la visibilidad y la habilitación del link.
 *
 * @remarks
 * La combinación de ambos permisos permite implementar el patrón
 * "visible pero bloqueado": el link aparece en la UI (p. ej. con un icono de
 * candado) pero no es accionable para usuarios sin el permiso de habilitación.
 * Esto es preferible a ocultarlo por completo cuando se quiere informar al
 * colaborador de que la funcionalidad existe pero requiere permisos adicionales.
 */
export type QuickLinkConfig = QuickLinkItem & {
  /**
   * Permiso mínimo requerido para que el link sea visible.
   *
   * Si el usuario autenticado no posee este permiso, {@link processQuickLinks}
   * elimina el link del array resultante — nunca llega al DOM.
   * Si se omite, el link es visible para cualquier nivel de acceso.
   */
  requiredPermission?: Permission;

  /**
   * Permiso requerido para que el link esté habilitado e interactuable.
   *
   * Solo se evalúa si el usuario ya supera la comprobación de
   * `requiredPermission`. Si el usuario no lo posee, el link se renderiza
   * en estado `disabled: true` junto con `disabledMsg` (ver {@link QuickLinkConfig}).
   * Si se omite, el link queda habilitado por defecto.
   */
  enabledPermission?: Permission;

  /**
   * Tooltip o mensaje de aviso que se muestra al hacer hover sobre el link
   * cuando está deshabilitado por falta de `enabledPermission`.
   *
   * Si no se especifica, se usa el literal
   * `"Necesitas permisos adicionales para acceder"`.
   */
  disabledMsg?: string;
};

// ── Función principal ─────────────────────────────────────────────────────────

/**
 * Procesa un array de {@link QuickLinkConfig} aplicando las reglas de acceso
 * del usuario y devuelve un array de {@link QuickLinkItem} listo para
 * renderizar.
 *
 * El procesamiento sigue este orden para cada link:
 * 1. **Visibilidad** (`requiredPermission`): si el usuario no tiene el permiso
 *    requerido, el link se descarta completamente.
 * 2. **Habilitación** (`enabledPermission`): si el usuario no tiene el permiso
 *    de habilitación, el link se incluye con `disabled: true` y el mensaje
 *    de `disabledMsg` (ver {@link QuickLinkConfig}).
 * 3. **Activo**: en cualquier otro caso, el link se incluye con
 *    `disabled: false`.
 *
 * @remarks
 * Las propiedades internas de control (`requiredPermission`,
 * `enabledPermission`, `disabledMsg`) se eliminan del objeto resultante
 * antes de pasarlo al componente de UI, manteniendo la interfaz de
 * {@link QuickLinkItem} limpia.
 *
 * @param links       - Array de links con su configuración de acceso.
 * @param accessLevel - Nivel de acceso del usuario autenticado, obtenido
 *   desde la sesión de NextAuth.
 * @returns Array de {@link QuickLinkItem} filtrado y con el estado
 *   `disabled` resuelto, listo para pasar a `<QuickLinksSection />`.
 *
 * @example
 * ```ts
 * const links: QuickLinkConfig[] = [
 *   {
 *     label: "Nómina",
 *     href: "/nomina",
 *     requiredPermission: "view:payroll",
 *     enabledPermission:  "download:payroll",
 *     disabledMsg:        "Solo el equipo de RRHH puede descargar nóminas",
 *   },
 *   {
 *     label: "Directorio",
 *     href: "/directorio",
 *   },
 * ];
 *
 * processQuickLinks(links, "hr");
 * // → [
 * //     { label: "Nómina",     href: "/nomina",     disabled: false },
 * //     { label: "Directorio", href: "/directorio", disabled: false },
 * //   ]
 *
 * processQuickLinks(links, "employee");
 * // → [
 * //     { label: "Directorio", href: "/directorio", disabled: false },
 * //   ]
 * // ("Nómina" se filtra porque "employee" no tiene "view:payroll")
 * ```
 */
export function processQuickLinks(
  links:       QuickLinkConfig[],
  accessLevel: AccessLevel,
): QuickLinkItem[] {
  return links
    .filter((link) => {
      if (link.requiredPermission && !can(accessLevel, link.requiredPermission)) {
        return false;
      }
      return true;
    })
    .map((link) => {
      const { requiredPermission, enabledPermission, ...rest } = link;

      if (enabledPermission && !can(accessLevel, enabledPermission)) {
        return {
          ...rest,
          disabled:    true,
          disabledMsg: link.disabledMsg ?? "Necesitas permisos adicionales para acceder",
        };
      }

      return { ...rest, disabled: false };
    });
}