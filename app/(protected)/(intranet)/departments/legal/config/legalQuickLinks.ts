/**
 * @module legalQuickLinks
 * Configuración de accesos rápidos del módulo jurídico.
 *
 * @remarks
 * Este módulo define los accesos rápidos visibles en la sección legal
 * de la intranet, incluyendo:
 *
 * - Rutas de navegación
 * - Íconos y estilos visuales
 * - Descripciones funcionales
 * - Reglas de permisos (visibilidad y habilitación)
 *
 * Estos accesos son procesados mediante {@link processQuickLinks},
 * que evalúa los permisos del usuario y determina si un enlace:
 * - se muestra
 * - se deshabilita
 * - se oculta completamente
 */

// app/(protected)/(intranet)/departments/legal/config/legalQuickLinks.ts

import type { QuickLinkConfig } from "@/lib/quickLinksAccess";

/**
 * Listado de accesos rápidos del área jurídica.
 *
 * @remarks
 * Cada elemento define:
 * - Navegación (`href`)
 * - Representación visual (`icon`, `color`)
 * - Descripción contextual (`description`)
 * - Reglas de acceso (`requiredPermission`, `enabledPermission`)
 *
 * Tipos de comportamiento:
 *
 * - Sin permisos:
 *   → visible para todos (employee+)
 *
 * - `requiredPermission`:
 *   → controla visibilidad (si no lo tiene, no aparece)
 *
 * - `enabledPermission`:
 *   → controla habilitación (visible pero deshabilitado)
 *
 * - `disabledMsg`:
 *   → mensaje mostrado cuando el acceso está restringido
 *
 * @example
 * ```ts
 * processQuickLinks(legalQuickLinks, accessLevel);
 * ```
 */
export const legalQuickLinks: QuickLinkConfig[] = [
  /**
   * Nueva solicitud legal.
   *
   * @remarks
   * Disponible para todos los usuarios (employee+).
   * Permite crear solicitudes o consultas legales.
   */
  {
    label: "Nueva solicitud",
    href: "/legal/requests/new",
    icon: "FilePlus",
    color: "blue",
    description: "Revisión o consulta legal",
  },

  /**
   * Módulo de contratos.
   *
   * @remarks
   * Visible únicamente para usuarios con permiso:
   * `legal:view_contracts`.
   */
  {
    label: "Contratos",
    href: "/legal/contracts",
    icon: "FileSignature",
    color: "purple",
    description: "Repositorio de contratos",
    requiredPermission: "legal:view_contracts",
    disabledMsg: "Acceso restringido al equipo Jurídico",
  },

  /**
   * Gestión de litigios.
   *
   * @remarks
   * Visible únicamente para usuarios con permiso:
   * `legal:view_litigation`.
   */
  {
    label: "Litigios",
    href: "/legal/litigations",
    icon: "Scale",
    color: "coral",
    description: "Casos y expedientes activos",
    requiredPermission: "legal:view_litigation",
    disabledMsg: "Acceso restringido al equipo Jurídico",
  },

  /**
   * Módulo de compliance.
   *
   * @remarks
   * Visible para usuarios con nivel manager+ mediante
   * el permiso `legal:view_regulatory`.
   */
  {
    label: "Compliance",
    href: "/legal/compliance",
    icon: "ShieldCheck",
    color: "teal",
    description: "Cumplimiento normativo",
    requiredPermission: "legal:view_regulatory",
  },

  /**
   * Repositorio de documentos legales.
   *
   * @remarks
   * - Visible para usuarios con `legal:view_kpis`
   * - Habilitado solo para usuarios con `legal:view_documents`
   *
   * Esto permite mostrar el acceso pero restringir su uso
   * a perfiles específicos del área jurídica.
   */
  {
    label: "Documentos",
    href: "/legal/documents",
    icon: "FolderOpen",
    color: "amber",
    description: "Plantillas y políticas",
    requiredPermission: "legal:view_kpis",
    enabledPermission: "legal:view_documents",
    disabledMsg: "Acceso restringido al equipo Jurídico",
  },

  /**
   * Contacto del área jurídica.
   *
   * @remarks
   * Disponible para todos los usuarios.
   * Proporciona información de contacto directo.
   */
  {
    label: "Contacto jurídico",
    href: "/legal/contact",
    icon: "PhoneCall",
    color: "green",
    description: "Ext. 1200 · Piso 8",
  },
];