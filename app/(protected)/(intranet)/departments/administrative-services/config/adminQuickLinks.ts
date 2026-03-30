import type { QuickLinkConfig } from "@/lib/quickLinksAccess";

export const adminQuickLinks: QuickLinkConfig[] = [
  // Nueva solicitud — todos
  { label: "Nueva solicitud",   href: "/administrative/requests/new",  icon: "FilePlus",   color: "amber",
    description: "Acceso, sala o servicio" },
  // Tarjeta de acceso — todos, habilitado solo admin_services+
  { label: "Tarjeta de acceso", href: "/administrative/access-cards",  icon: "CreditCard", color: "blue",
    description: "Solicitar o reportar tarjeta",
    enabledPermission: "admin_services:view_access_cards",
    disabledMsg: "Gestión de tarjetas restringida al equipo Administrativo" },
  // Reserva de salas — todos
  { label: "Reserva de salas",  href: "/departments/administrative-services/room-booking",         icon: "Calendar",   color: "teal",
    description: "Agendar sala de juntas" },
  // Registro de visita — todos, habilitado solo admin_services+
  { label: "Registro de visita", href: "/administrative/visitors",     icon: "UserCheck",  color: "green",
    description: "Pre-registrar un visitante",
    enabledPermission: "admin_services:view_visitors",
    disabledMsg: "Gestión de visitantes restringida al equipo Administrativo" },
  // Documentos — todos
  { label: "Documentos",        href: "/administrative/documents",     icon: "FolderOpen", color: "purple",
    description: "Políticas y formatos" },
  // Contacto — todos
  { label: "Contacto recepción", href: "/administrative/contact",      icon: "PhoneCall",  color: "coral",
    description: "Ext. 1100 · Lobby principal" },
];