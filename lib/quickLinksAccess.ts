// lib/quickLinksAccess.ts
// ─────────────────────────────────────────────────────────────────────────────
// Helper central para procesar Quick Links según el AccessLevel del usuario.
//
// Dos operaciones:
//   - filterQuickLinks:   elimina links que el usuario nunca debería ver
//   - processQuickLinks:  filtra los secretos + deshabilita los opcionales
//
// Uso en Server Components:
//   const links = processQuickLinks(financeQuickLinks, accessLevel);
//   <QuickLinksSection quickLinks={links} />
// ─────────────────────────────────────────────────────────────────────────────

import type { AccessLevel, Permission } from "./roles";
import { can }                 from "./roles";
import type { QuickLinkItem }           from "@/app/components/ui/QuickLinksSection";

// ── Tipo extendido para la config de cada link ────────────────────────────────

export type QuickLinkConfig = QuickLinkItem & {
  /**
   * Permiso requerido para ver este link.
   * Si el usuario no lo tiene → el link se filtra completamente (no aparece).
   */
  requiredPermission?: Permission;

  /**
   * Permiso requerido para usar este link.
   * Si el usuario no lo tiene pero sí tiene `requiredPermission` →
   * el link aparece deshabilitado con candado.
   */
  enabledPermission?: Permission;

  /**
   * Mensaje que aparece al hacer hover sobre un link deshabilitado.
   */
  disabledMsg?: string;
};

// ── Función principal ─────────────────────────────────────────────────────────

/**
 * Procesa un array de QuickLinkConfig según el AccessLevel:
 *   1. Si tiene `requiredPermission` y el usuario NO la tiene → se filtra (no aparece)
 *   2. Si tiene `enabledPermission` y el usuario NO la tiene → aparece deshabilitado
 *   3. El resto → activo normal
 */
export function processQuickLinks(
  links:       QuickLinkConfig[],
  accessLevel: AccessLevel,
): QuickLinkItem[] {
  return links
    .filter((link) => {
      // Si requiere permiso y no lo tiene → filtrar
      if (link.requiredPermission && !can(accessLevel, link.requiredPermission)) {
        return false;
      }
      return true;
    })
    .map((link) => {
      const { requiredPermission, enabledPermission, ...rest } = link;

      // Si requiere permiso de habilitación y no lo tiene → deshabilitar
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
