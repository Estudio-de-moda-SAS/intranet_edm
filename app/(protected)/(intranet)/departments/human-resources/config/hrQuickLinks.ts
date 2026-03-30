import type { QuickLinkConfig } from "@/lib/quickLinksAccess";

export const hrQuickLinks: QuickLinkConfig[] = [
  // Empleados — manager+, habilitado solo hr+
  { label: "Empleados",     href: "/departments/human-resources/employees",       icon: "Users",         color: "purple",
    description: "Gestión de colaboradores",
    requiredPermission: "hr:view_kpis",
    enabledPermission:  "hr:view_headcount",
    disabledMsg: "Solo el equipo de RRHH puede gestionar empleados" },
  // Nuevo empleado — solo hr + admin
  { label: "Nuevo empleado", href: "/rrhh/empleados/nuevo", icon: "UserPlus",     color: "purple",
    description: "Registrar colaborador",
    requiredPermission: "hr:view_recruitment",
    disabledMsg: "Solo el equipo de RRHH puede registrar empleados" },
  // Vacaciones — manager+
  { label: "Vacaciones",    href: "/rrhh/vacaciones",       icon: "CalendarDays", color: "purple",
    description: "Solicitudes y aprobaciones",
    requiredPermission: "hr:view_kpis" },
  // Nómina — solo hr + admin
  { label: "Nómina",        href: "/rrhh/nomina",           icon: "DollarSign",   color: "purple",
    description: "Pagos y liquidaciones",
    requiredPermission: "hr:view_requests",
    disabledMsg: "Solo el equipo de RRHH puede acceder a nómina" },
  // Capacitaciones — manager+
  { label: "Capacitaciones", href: "/rrhh/capacitaciones",  icon: "GraduationCap", color: "purple",
    description: "Gestión de formación",
    requiredPermission: "hr:view_training" },
  // Reconocimientos — manager+
  { label: "Reconocimientos", href: "/rrhh/reconocimientos", icon: "Award",       color: "purple",
    description: "Logros del equipo",
    requiredPermission: "hr:view_kpis" },
  // Documentos — manager+, habilitado solo hr+
  { label: "Documentos",    href: "/rrhh/documentos",       icon: "FileText",     color: "purple",
    description: "Gestión documental",
    requiredPermission: "hr:view_kpis",
    enabledPermission:  "hr:view_requests",
    disabledMsg: "Acceso restringido al equipo de RRHH" },
  // Configuración — solo hr + admin
  { label: "Configuración", href: "/rrhh/configuracion",    icon: "Settings",     color: "purple",
    description: "Ajustes del sistema",
    requiredPermission: "hr:view_requests",
    disabledMsg: "Solo el equipo de RRHH puede configurar el sistema" },
];