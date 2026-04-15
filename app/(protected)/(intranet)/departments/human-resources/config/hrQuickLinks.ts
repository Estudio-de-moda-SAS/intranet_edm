/**
 * @module hrQuickLinks
 * Configuración de accesos rápidos para el módulo de Recursos Humanos.
 *
 * @remarks
 * Este archivo define los enlaces rápidos (quick links) disponibles dentro
 * del módulo de RRHH, incluyendo:
 * - Rutas de navegación
 * - Iconos y estilos visuales
 * - Reglas de permisos para acceso y habilitación
 *
 * Se utiliza como fuente de configuración para renderizar accesos dinámicos
 * en la UI, controlando visibilidad y estado según permisos del usuario.
 */

import type { QuickLinkConfig } from "@/lib/quickLinksAccess";

/**
 * Lista de accesos rápidos del módulo de Recursos Humanos.
 *
 * @remarks
 * Cada elemento define:
 * - `label`: Nombre visible del acceso
 * - `href`: Ruta de navegación
 * - `icon`: Icono representativo
 * - `color`: Color temático
 * - `description`: Descripción breve
 * - `requiredPermission`: Permiso necesario para visualizar el enlace
 * - `enabledPermission`: (Opcional) Permiso adicional para habilitar interacción
 * - `disabledMsg`: Mensaje mostrado si el acceso está restringido
 *
 * Lógica de permisos:
 * - Si no se cumple `requiredPermission` → el link no se muestra
 * - Si se cumple `requiredPermission` pero no `enabledPermission` → se muestra deshabilitado
 */
export const hrQuickLinks: QuickLinkConfig[] = [
  /**
   * Empleados
   *
   * @remarks
   * Visible para roles con permisos de KPIs (manager+),
   * pero solo habilitado para usuarios con permisos de headcount (HR).
   */
  {
    label: "Empleados",
    href: "/departments/human-resources/employees",
    icon: "Users",
    color: "purple",
    description: "Gestión de colaboradores",
    requiredPermission: "hr:view_kpis",
    enabledPermission: "hr:view_headcount",
    disabledMsg: "Solo el equipo de RRHH puede gestionar empleados",
  },

  /**
   * Nuevo empleado
   *
   * @remarks
   * Acceso restringido a RRHH y administradores.
   */
  {
    label: "Nuevo empleado",
    href: "/rrhh/empleados/nuevo",
    icon: "UserPlus",
    color: "purple",
    description: "Registrar colaborador",
    requiredPermission: "hr:view_recruitment",
    disabledMsg: "Solo el equipo de RRHH puede registrar empleados",
  },

  /**
   * Vacaciones
   *
   * @remarks
   * Disponible para roles con permisos de KPIs (manager+).
   */
  {
    label: "Vacaciones",
    href: "/rrhh/vacaciones",
    icon: "CalendarDays",
    color: "purple",
    description: "Solicitudes y aprobaciones",
    requiredPermission: "hr:view_kpis",
  },

  /**
   * Nómina
   *
   * @remarks
   * Acceso restringido a RRHH y administradores.
   */
  {
    label: "Nómina",
    href: "/rrhh/nomina",
    icon: "DollarSign",
    color: "purple",
    description: "Pagos y liquidaciones",
    requiredPermission: "hr:view_requests",
    disabledMsg: "Solo el equipo de RRHH puede acceder a nómina",
  },

  /**
   * Capacitaciones
   *
   * @remarks
   * Disponible para roles con permisos de formación.
   */
  {
    label: "Capacitaciones",
    href: "/rrhh/capacitaciones",
    icon: "GraduationCap",
    color: "purple",
    description: "Gestión de formación",
    requiredPermission: "hr:view_training",
  },

  /**
   * Reconocimientos
   *
   * @remarks
   * Disponible para roles con acceso a KPIs (manager+).
   */
  {
    label: "Reconocimientos",
    href: "/rrhh/reconocimientos",
    icon: "Award",
    color: "purple",
    description: "Logros del equipo",
    requiredPermission: "hr:view_kpis",
  },

  /**
   * Documentos
   *
   * @remarks
   * Visible para roles con acceso a KPIs,
   * pero habilitado únicamente para RRHH.
   */
  {
    label: "Documentos",
    href: "/rrhh/documentos",
    icon: "FileText",
    color: "purple",
    description: "Gestión documental",
    requiredPermission: "hr:view_kpis",
    enabledPermission: "hr:view_requests",
    disabledMsg: "Acceso restringido al equipo de RRHH",
  },

  /**
   * Configuración
   *
   * @remarks
   * Acceso exclusivo para RRHH y administradores.
   */
  {
    label: "Configuración",
    href: "/rrhh/configuracion",
    icon: "Settings",
    color: "purple",
    description: "Ajustes del sistema",
    requiredPermission: "hr:view_requests",
    disabledMsg: "Solo el equipo de RRHH puede configurar el sistema",
  },
];