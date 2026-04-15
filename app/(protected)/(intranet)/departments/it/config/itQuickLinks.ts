/**
 * @module itQuickLinks
 * Configuración de accesos rápidos del módulo de Tecnología (TI).
 *
 * @remarks
 * Este archivo define los enlaces rápidos (quick links) disponibles para los usuarios
 * dentro del módulo de TI, junto con sus reglas de acceso basadas en permisos.
 *
 * Cada enlace puede:
 * - Ser visible para todos los usuarios
 * - Requerir permisos específicos para mostrarse
 * - Estar visible pero deshabilitado si no cumple condiciones adicionales
 *
 * La lógica de evaluación de permisos se realiza mediante {@link processQuickLinks}.
 */

import type { QuickLinkConfig } from "@/lib/quickLinksAccess";

/**
 * Lista de accesos rápidos del módulo de TI.
 *
 * @remarks
 * Cada elemento de tipo {@link QuickLinkConfig} define:
 * - Navegación interna o externa (`href`)
 * - Ícono visual (`icon`)
 * - Color temático (`color`)
 * - Descripción opcional
 * - Reglas de acceso (`requiredPermission`, `enabledPermission`)
 *
 * Tipos de acceso:
 * - **Público (employee+)**: visible para todos
 * - **Manager+**: requiere permisos intermedios
 * - **IT/Admin**: acceso restringido a roles técnicos
 *
 * Campos de control:
 * - `requiredPermission`: determina si el link se muestra
 * - `enabledPermission`: determina si está activo o deshabilitado
 * - `disabledMsg`: mensaje cuando el acceso está restringido
 *
 * @example
 * ```ts
 * const links = processQuickLinks(itQuickLinks, accessLevel);
 * ```
 */
export const itQuickLinks: QuickLinkConfig[] = [
  /**
   * Crear ticket de soporte técnico.
   *
   * @remarks
   * Disponible para todos los usuarios (employee+).
   */
  {
    label: "Abrir ticket",
    href: "/it/tickets/nuevo",
    icon: "FilePlus",
    color: "blue",
    description: "Soporte técnico",
  },

  /**
   * Portal de activos tecnológicos.
   *
   * @remarks
   * - Visible para manager+
   * - Habilitado solo para roles IT
   */
  {
    label: "Portal de activos",
    href: "/it/activos",
    icon: "LayoutDashboard",
    color: "teal",
    description: "Gestión de equipos",
    requiredPermission: "it:view_kpis",
    enabledPermission: "it:view_dashboard",
    disabledMsg: "Solo el equipo de TI puede gestionar activos",
  },

  /**
   * Documentación técnica corporativa.
   *
   * @remarks
   * Disponible para todos los usuarios.
   */
  {
    label: "Documentación técnica",
    href: "https://confluence.corp.internal/it",
    icon: "BookOpen",
    color: "purple",
    description: "Confluence",
  },

  /**
   * Panel de monitoreo Zabbix.
   *
   * @remarks
   * Acceso restringido a equipo IT y administradores.
   */
  {
    label: "Panel Zabbix",
    href: "https://zabbix.corp.internal",
    icon: "Activity",
    color: "coral",
    description: "Monitoreo",
    requiredPermission: "it:view_server_monitor",
    disabledMsg: "Acceso restringido al equipo de TI",
  },

  /**
   * Gestión de identidades y accesos (IAM).
   *
   * @remarks
   * Acceso exclusivo para equipo IT.
   */
  {
    label: "Gestión de accesos",
    href: "/it/iam",
    icon: "KeyRound",
    color: "amber",
    description: "IAM",
    requiredPermission: "it:view_service_status",
    disabledMsg: "Solo el equipo de TI puede gestionar accesos",
  },

  /**
   * Repositorio de código y scripts.
   *
   * @remarks
   * Acceso restringido a roles técnicos.
   */
  {
    label: "Repositorio GitLab",
    href: "https://gitlab.corp.internal/it",
    icon: "GitBranch",
    color: "green",
    description: "Scripts y código",
    requiredPermission: "it:view_dashboard",
    disabledMsg: "Acceso restringido al equipo de TI",
  },

  /**
   * Políticas de seguridad tecnológica.
   *
   * @remarks
   * Disponible para usuarios con permisos manager+.
   */
  {
    label: "Políticas de seguridad",
    href: "/it/politicas-seguridad",
    icon: "ShieldCheck",
    color: "teal",
    requiredPermission: "it:view_kpis",
  },

  /**
   * Solicitud de equipos tecnológicos.
   *
   * @remarks
   * Disponible para todos los usuarios.
   */
  {
    label: "Solicitud de equipos",
    href: "/it/solicitud-hardware",
    icon: "Package",
    color: "blue",
    description: "Hardware",
  },
];