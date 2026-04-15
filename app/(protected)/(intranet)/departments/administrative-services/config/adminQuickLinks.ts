/**
 * @module AdminQuickLinksConfig
 * Configuración de accesos rápidos del módulo de Servicios Administrativos.
 *
 * Define las acciones principales disponibles para los usuarios dentro
 * del módulo, tales como creación de solicitudes, gestión de accesos,
 * reserva de espacios, consulta de documentos y contacto con el área.
 *
 * @remarks
 * Esta configuración es consumida por {@link AdminQuickLinksSection},
 * que se encarga de renderizar los accesos rápidos en la interfaz.
 *
 * Cada elemento sigue el contrato {@link QuickLinkConfig} y puede:
 * - Estar disponible para todos los usuarios.
 * - Restringirse mediante permisos específicos.
 * - Mostrar un mensaje cuando el acceso no está habilitado.
 *
 * Los permisos se evalúan dinámicamente a través del sistema de roles
 * utilizando la lógica definida en {@link processQuickLinks}.
 */

import type { QuickLinkConfig } from "@/lib/quickLinksAccess";

/**
 * Lista de accesos rápidos del módulo de Servicios Administrativos.
 *
 * @remarks
 * Cada acceso rápido representa una acción frecuente dentro del módulo.
 * La visibilidad y habilitación dependen del {@link AccessLevel} del usuario.
 *
 * Propiedades clave:
 * - `label`: nombre visible del acceso.
 * - `href`: ruta de navegación.
 * - `icon`: ícono representativo (renderizado dinámicamente).
 * - `color`: estilo visual del acceso.
 * - `description`: contexto funcional del acceso.
 * - `enabledPermission`: permiso requerido para habilitar la acción.
 * - `disabledMsg`: mensaje mostrado si el usuario no tiene acceso.
 */
export const adminQuickLinks: QuickLinkConfig[] = [

  /**
   * Permite crear una nueva solicitud administrativa.
   *
   * @remarks
   * Disponible para todos los usuarios del sistema.
   * Incluye solicitudes como acceso, reservas o servicios internos.
   */
  {
    label: "Nueva solicitud",
    href: "/administrative/requests/new",
    icon: "FilePlus",
    color: "amber",
    description: "Acceso, sala o servicio"
  },

  /**
   * Permite gestionar tarjetas de acceso físico o digital.
   *
   * @remarks
   * Visible para todos los usuarios, pero solo habilitado para perfiles
   * con permiso {@link AccessLevel} asociado a:
   * `admin_services:view_access_cards`.
   */
  {
    label: "Tarjeta de acceso",
    href: "/administrative/access-cards",
    icon: "CreditCard",
    color: "blue",
    description: "Solicitar o reportar tarjeta",
    enabledPermission: "admin_services:view_access_cards",
    disabledMsg: "Gestión de tarjetas restringida al equipo Administrativo"
  },

  /**
   * Permite reservar salas de reuniones dentro de la organización.
   *
   * @remarks
   * Disponible para todos los usuarios.
   * Facilita la planificación de espacios de trabajo colaborativo.
   */
  {
    label: "Reserva de salas",
    href: "/departments/administrative-services/room-booking",
    icon: "Calendar",
    color: "teal",
    description: "Agendar sala de juntas"
  },

  /**
   * Permite registrar visitantes en el sistema.
   *
   * @remarks
   * Visible para todos los usuarios, pero restringido a perfiles con
   * permiso `admin_services:view_visitors`.
   *
   * Este flujo simula o complementa el control de acceso físico.
   */
  {
    label: "Registro de visita",
    href: "/administrative/visitors",
    icon: "UserCheck",
    color: "green",
    description: "Pre-registrar un visitante",
    enabledPermission: "admin_services:view_visitors",
    disabledMsg: "Gestión de visitantes restringida al equipo Administrativo"
  },

  /**
   * Acceso al centro de documentos administrativos.
   *
   * @remarks
   * Disponible para todos los usuarios.
   * Incluye políticas, procedimientos y formatos oficiales.
   */
  {
    label: "Documentos",
    href: "/administrative/documents",
    icon: "FolderOpen",
    color: "purple",
    description: "Políticas y formatos"
  },

  /**
   * Información de contacto del área de recepción.
   *
   * @remarks
   * Disponible para todos los usuarios.
   * Permite comunicación directa con el equipo administrativo.
   */
  {
    label: "Contacto recepción",
    href: "/administrative/contact",
    icon: "PhoneCall",
    color: "coral",
    description: "Ext. 1100 · Lobby principal"
  },
];